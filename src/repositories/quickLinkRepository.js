const db = require('../config/database');

async function findAll({ onlyActive = false, search = null } = {}) {
  let baseWhere = ' WHERE 1=1';
  const params = [];

  if (onlyActive) {
    params.push(true);
    baseWhere += ` AND is_active = $${params.length}`;
  }

  if (search && search.trim()) {
    params.push(`%${search.trim().toLowerCase()}%`);
    baseWhere += ` AND (LOWER(title) LIKE $${params.length} OR LOWER(url) LIKE $${params.length})`;
  }

  const query = `
    SELECT id, title, url, badge_text, target_blank, display_order, is_active, created_at, updated_at
    FROM quick_links
    ${baseWhere}
    ORDER BY display_order ASC, id ASC;
  `;

  const res = await db.query(query, params);
  return res.rows;
}

async function findActive() {
  const query = `
    SELECT id, title, url, badge_text, target_blank, display_order, is_active, created_at, updated_at
    FROM quick_links
    WHERE is_active = true
    ORDER BY display_order ASC, id ASC;
  `;
  const res = await db.query(query);
  return res.rows;
}

async function findById(id) {
  const query = `
    SELECT id, title, url, badge_text, target_blank, display_order, is_active, created_at, updated_at
    FROM quick_links
    WHERE id = $1;
  `;
  const res = await db.query(query, [id]);
  return res.rows[0] || null;
}

async function create({
  title,
  url,
  badge_text = null,
  target_blank = false,
  display_order = 0,
  is_active = true,
}) {
  const query = `
    INSERT INTO quick_links (
      title, url, badge_text, target_blank, display_order, is_active, updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
    RETURNING id, title, url, badge_text, target_blank, display_order, is_active, created_at, updated_at;
  `;
  const values = [
    title.trim(),
    url.trim(),
    badge_text && badge_text.trim() ? badge_text.trim() : null,
    Boolean(target_blank),
    Number.parseInt(display_order, 10) || 0,
    is_active !== undefined ? Boolean(is_active) : true,
  ];

  const res = await db.query(query, values);
  return res.rows[0];
}

async function update(id, fields = {}) {
  const allowed = [
    'title',
    'url',
    'badge_text',
    'target_blank',
    'display_order',
    'is_active',
  ];

  const sets = [];
  const params = [];

  for (const key of allowed) {
    if (fields[key] !== undefined) {
      params.push(
        key === 'title' || key === 'url' || key === 'badge_text'
          ? (fields[key] ? String(fields[key]).trim() : null)
          : key === 'target_blank' || key === 'is_active'
            ? Boolean(fields[key])
            : Number.parseInt(fields[key], 10) || 0
      );
      sets.push(`${key} = $${params.length}`);
    }
  }

  if (sets.length === 0) {
    return findById(id);
  }

  sets.push('updated_at = CURRENT_TIMESTAMP');
  params.push(id);

  const query = `
    UPDATE quick_links
    SET ${sets.join(', ')}
    WHERE id = $${params.length}
    RETURNING id, title, url, badge_text, target_blank, display_order, is_active, created_at, updated_at;
  `;

  const res = await db.query(query, params);
  return res.rows[0] || null;
}

async function deleteById(id) {
  const query = 'DELETE FROM quick_links WHERE id = $1 RETURNING id;';
  const res = await db.query(query, [id]);
  return res.rowCount > 0;
}

async function count() {
  const res = await db.query('SELECT COUNT(*)::int AS count FROM quick_links;');
  return res.rows[0]?.count || 0;
}

module.exports = {
  findAll,
  findActive,
  findById,
  create,
  update,
  deleteById,
  count,
};

