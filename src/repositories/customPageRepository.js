const db = require('../config/database');
const { slugify } = require('../utils/slugify');
const { renderBlocksToHtml, sanitizePageHtml } = require('../utils/pageRenderer');

const RESERVED_SLUGS = new Set([
  'api',
  'admin',
  'assets',
  'storage',
  'services',
  'downloads',
  'news',
  'blogs',
  'about',
  'contact',
  'privacy-policy',
  'p',
  'page',
  'pages',
  'favicon.ico',
]);

function hydratePage(row) {
  if (!row) return null;
  let blocks = [];
  if (row.blocks_json) {
    try {
      const parsed = JSON.parse(row.blocks_json);
      blocks = Array.isArray(parsed) ? parsed : [];
    } catch {
      blocks = [];
    }
  }
  const renderedHtml = row.content_html && row.content_html.trim()
    ? row.content_html
    : renderBlocksToHtml(blocks);

  return {
    ...row,
    blocks,
    content_html: renderedHtml,
  };
}

function isReservedSlug(slug) {
  return RESERVED_SLUGS.has(String(slug || '').trim().toLowerCase());
}

async function ensureUniqueSlug(desiredSlug, excludeId = null) {
  let candidate = slugify(desiredSlug);
  if (!candidate) {
    candidate = 'custom-page';
  }
  if (isReservedSlug(candidate)) {
    candidate = `${candidate}-page`;
  }

  let suffix = 1;
  let current = candidate;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const query = excludeId
      ? 'SELECT id FROM custom_pages WHERE slug = $1 AND id <> $2 LIMIT 1;'
      : 'SELECT id FROM custom_pages WHERE slug = $1 LIMIT 1;';
    const params = excludeId ? [current, excludeId] : [current];
    const res = await db.query(query, params);
    if (res.rows.length === 0) {
      return current;
    }
    suffix += 1;
    current = `${candidate}-${suffix}`;
  }
}

async function findAll({ onlyPublished = false, search = null } = {}) {
  let whereClause = 'WHERE 1=1';
  const params = [];

  if (onlyPublished) {
    params.push(true);
    whereClause += ` AND is_published = $${params.length}`;
  }

  if (search && search.trim()) {
    params.push(`%${search.trim().toLowerCase()}%`);
    whereClause += ` AND (LOWER(title) LIKE $${params.length} OR LOWER(slug) LIKE $${params.length} OR LOWER(COALESCE(subtitle, '')) LIKE $${params.length})`;
  }

  const query = `
    SELECT id, title, slug, subtitle, meta_description, layout_mode, blocks_json, content_html, show_in_nav, nav_order, is_published, created_at, updated_at
    FROM custom_pages
    ${whereClause}
    ORDER BY nav_order ASC, id DESC;
  `;

  const res = await db.query(query, params);
  return res.rows.map(hydratePage);
}

async function findNavPages() {
  const query = `
    SELECT id, title, slug, nav_order
    FROM custom_pages
    WHERE is_published = true AND show_in_nav = true
    ORDER BY nav_order ASC, id ASC;
  `;
  const res = await db.query(query);
  return res.rows;
}

async function findById(id) {
  const query = `
    SELECT id, title, slug, subtitle, meta_description, layout_mode, blocks_json, content_html, show_in_nav, nav_order, is_published, created_at, updated_at
    FROM custom_pages
    WHERE id = $1;
  `;
  const res = await db.query(query, [id]);
  return hydratePage(res.rows[0] || null);
}

async function findBySlug(slug, { onlyPublished = false } = {}) {
  let query = `
    SELECT id, title, slug, subtitle, meta_description, layout_mode, blocks_json, content_html, show_in_nav, nav_order, is_published, created_at, updated_at
    FROM custom_pages
    WHERE slug = $1
  `;
  const params = [String(slug || '').normalize('NFC').trim().toLowerCase()];

  if (onlyPublished) {
    params.push(true);
    query += ` AND is_published = $${params.length}`;
  }

  const res = await db.query(`${query} LIMIT 1;`, params);
  return hydratePage(res.rows[0] || null);
}

async function create({
  title,
  slug,
  subtitle = null,
  meta_description = null,
  layout_mode = 'standard',
  blocks = [],
  content_html = null,
  show_in_nav = false,
  nav_order = 0,
  is_published = true,
}) {
  const rawSlug = slug && slug.trim() ? slug.trim() : title;
  const finalSlug = await ensureUniqueSlug(rawSlug);

  const normalizedBlocks = Array.isArray(blocks) ? blocks : [];
  const blocksJsonStr = JSON.stringify(normalizedBlocks);
  const finalHtml = normalizedBlocks.length > 0
    ? renderBlocksToHtml(normalizedBlocks)
    : sanitizePageHtml(content_html || '');

  const validLayout = ['standard', 'wide', 'sidebar'].includes(layout_mode) ? layout_mode : 'standard';

  const query = `
    INSERT INTO custom_pages (
      title, slug, subtitle, meta_description, layout_mode, blocks_json, content_html, show_in_nav, nav_order, is_published, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
    RETURNING *;
  `;

  const values = [
    title.trim(),
    finalSlug,
    subtitle && subtitle.trim() ? subtitle.trim() : null,
    meta_description && meta_description.trim() ? meta_description.trim() : null,
    validLayout,
    blocksJsonStr,
    finalHtml,
    Boolean(show_in_nav),
    Number.parseInt(nav_order, 10) || 0,
    is_published !== undefined ? Boolean(is_published) : true,
  ];

  const res = await db.query(query, values);
  return hydratePage(res.rows[0]);
}

async function update(id, fields = {}) {
  const existing = await findById(id);
  if (!existing) return null;

  let finalSlug = existing.slug;
  if (fields.slug !== undefined && fields.slug.trim()) {
    finalSlug = await ensureUniqueSlug(fields.slug, id);
  }

  const nextBlocks = fields.blocks !== undefined
    ? (Array.isArray(fields.blocks) ? fields.blocks : [])
    : existing.blocks;

  const blocksJsonStr = JSON.stringify(nextBlocks);
  const nextHtml = nextBlocks.length > 0
    ? renderBlocksToHtml(nextBlocks)
    : sanitizePageHtml(fields.content_html !== undefined ? fields.content_html : existing.content_html);

  const nextLayout = fields.layout_mode !== undefined
    ? (['standard', 'wide', 'sidebar'].includes(fields.layout_mode) ? fields.layout_mode : 'standard')
    : existing.layout_mode;

  const query = `
    UPDATE custom_pages
    SET
      title = $1,
      slug = $2,
      subtitle = $3,
      meta_description = $4,
      layout_mode = $5,
      blocks_json = $6,
      content_html = $7,
      show_in_nav = $8,
      nav_order = $9,
      is_published = $10,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $11
    RETURNING *;
  `;

  const values = [
    fields.title !== undefined ? String(fields.title).trim() : existing.title,
    finalSlug,
    fields.subtitle !== undefined ? (fields.subtitle ? String(fields.subtitle).trim() : null) : existing.subtitle,
    fields.meta_description !== undefined ? (fields.meta_description ? String(fields.meta_description).trim() : null) : existing.meta_description,
    nextLayout,
    blocksJsonStr,
    nextHtml,
    fields.show_in_nav !== undefined ? Boolean(fields.show_in_nav) : existing.show_in_nav,
    fields.nav_order !== undefined ? (Number.parseInt(fields.nav_order, 10) || 0) : existing.nav_order,
    fields.is_published !== undefined ? Boolean(fields.is_published) : existing.is_published,
    id,
  ];

  const res = await db.query(query, values);
  return hydratePage(res.rows[0] || null);
}

async function deleteById(id) {
  const query = 'DELETE FROM custom_pages WHERE id = $1 RETURNING id;';
  const res = await db.query(query, [id]);
  return res.rows[0] || null;
}

async function count() {
  const query = 'SELECT COUNT(*) AS total FROM custom_pages;';
  const res = await db.query(query);
  return parseInt(res.rows[0].total, 10);
}

module.exports = {
  findAll,
  findNavPages,
  findById,
  findBySlug,
  create,
  update,
  deleteById,
  count,
  isReservedSlug,
};

