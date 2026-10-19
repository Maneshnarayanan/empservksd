const db = require('../config/database');
const { slugify } = require('../utils/slugify');
const { sanitizeContent } = require('../utils/htmlSanitizer');

async function findAll({
  onlyPublished = true,
  categoryId = null,
  categorySlug = null,
  search = null,
  page = 1,
  limit = 10,
} = {}) {
  const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
  const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10)));

  const whereClauses = [];
  const params = [];

  if (onlyPublished) {
    params.push('published');
    whereClauses.push(`a.status = $${params.length}`);
  }

  if (categoryId) {
    params.push(parseInt(categoryId, 10));
    whereClauses.push(`a.category_id = $${params.length}`);
  }

  if (categorySlug) {
    params.push(categorySlug.trim().toLowerCase());
    whereClauses.push(`c.slug = $${params.length}`);
  }

  if (search) {
    params.push(`%${search.trim().toLowerCase()}%`);
    whereClauses.push(`(LOWER(a.title) LIKE $${params.length} OR LOWER(a.summary) LIKE $${params.length})`);
  }

  const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countQuery = `
    SELECT COUNT(*)::int as total
    FROM blog_articles a
    JOIN blog_categories c ON a.category_id = c.id
    ${whereStr};
  `;

  const countRes = await db.query(countQuery, params);
  const total = countRes.rows[0].total;

  const dataParams = [...params, safeLimit, offset];
  const dataQuery = `
    SELECT a.id, a.title, a.slug, a.summary, a.category_id, a.featured_image, a.author_name,
           a.status, a.published_at, a.created_at, a.updated_at,
           c.name as category_name, c.slug as category_slug
    FROM blog_articles a
    JOIN blog_categories c ON a.category_id = c.id
    ${whereStr}
    ORDER BY ${onlyPublished ? 'a.published_at DESC' : 'a.created_at DESC'}
    LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length};
  `;

  const dataRes = await db.query(dataQuery, dataParams);

  return {
    articles: dataRes.rows,
    pagination: {
      page: parseInt(page, 10),
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1,
    },
  };
}

async function findById(id) {
  const query = `
    SELECT a.id, a.title, a.slug, a.summary, a.content, a.category_id, a.featured_image,
           a.author_name, a.status, a.published_at, a.created_by, a.created_at, a.updated_at,
           c.name as category_name, c.slug as category_slug,
           adm.username as admin_username
    FROM blog_articles a
    JOIN blog_categories c ON a.category_id = c.id
    LEFT JOIN administrators adm ON a.created_by = adm.id
    WHERE a.id = $1;
  `;
  const res = await db.query(query, [id]);
  return res.rows[0] || null;
}

async function findBySlug(slug, onlyPublished = true) {
  let query = `
    SELECT a.id, a.title, a.slug, a.summary, a.content, a.category_id, a.featured_image,
           a.author_name, a.status, a.published_at, a.created_by, a.created_at, a.updated_at,
           c.name as category_name, c.slug as category_slug,
           adm.username as admin_username
    FROM blog_articles a
    JOIN blog_categories c ON a.category_id = c.id
    LEFT JOIN administrators adm ON a.created_by = adm.id
    WHERE a.slug = $1
  `;
  const params = [slug.trim().toLowerCase()];

  if (onlyPublished) {
    params.push('published');
    query += ` AND a.status = $${params.length}`;
  }

  const res = await db.query(query, params);
  return res.rows[0] || null;
}

async function create({
  title,
  slug,
  summary,
  content,
  category_id,
  featured_image,
  author_name,
  status = 'draft',
  created_by,
}) {
  const finalSlug = slug ? slugify(slug) : slugify(title);
  const cleanContent = sanitizeContent(content);
  const isPublished = status === 'published';
  const publishedAt = isPublished ? new Date() : null;

  const query = `
    INSERT INTO blog_articles (
      title, slug, summary, content, category_id, featured_image, author_name, status, published_at, created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *;
  `;

  const res = await db.query(query, [
    title.trim(),
    finalSlug,
    summary ? summary.trim() : null,
    cleanContent,
    parseInt(category_id, 10),
    featured_image || null,
    author_name ? author_name.trim() : 'Administrator',
    status,
    publishedAt,
    created_by || null,
  ]);
  return res.rows[0];
}

async function update(id, {
  title,
  slug,
  summary,
  content,
  category_id,
  featured_image,
  author_name,
  status,
}) {
  const existing = await findById(id);
  if (!existing) return null;

  const finalTitle = title !== undefined ? title.trim() : existing.title;
  const finalSlug = slug !== undefined ? slugify(slug) : (title ? slugify(title) : existing.slug);
  const finalSummary = summary !== undefined ? summary.trim() : existing.summary;
  const finalContent = content !== undefined ? sanitizeContent(content) : existing.content;
  const finalCatId = category_id !== undefined ? parseInt(category_id, 10) : existing.category_id;
  const finalImg = featured_image !== undefined ? featured_image : existing.featured_image;
  const finalAuthor = author_name !== undefined ? author_name.trim() : existing.author_name;
  const finalStatus = status !== undefined ? status : existing.status;

  let publishedAt = existing.published_at;
  if (finalStatus === 'published' && !existing.published_at) {
    publishedAt = new Date();
  } else if (finalStatus === 'draft') {
    // Retain or clear based on policy
    publishedAt = null;
  }

  const query = `
    UPDATE blog_articles
    SET title = $1, slug = $2, summary = $3, content = $4, category_id = $5,
        featured_image = $6, author_name = $7, status = $8, published_at = $9, updated_at = CURRENT_TIMESTAMP
    WHERE id = $10
    RETURNING *;
  `;

  const res = await db.query(query, [
    finalTitle,
    finalSlug,
    finalSummary,
    finalContent,
    finalCatId,
    finalImg,
    finalAuthor,
    finalStatus,
    publishedAt,
    id,
  ]);
  return res.rows[0];
}

async function setPublicationStatus(id, publish = true) {
  const status = publish ? 'published' : 'draft';
  const publishedAt = publish ? new Date() : null;

  const query = `
    UPDATE blog_articles
    SET status = $1, published_at = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING *;
  `;
  const res = await db.query(query, [status, publishedAt, id]);
  return res.rows[0] || null;
}

async function deleteBlogArticle(id) {
  const query = 'DELETE FROM blog_articles WHERE id = $1 RETURNING *;';
  const res = await db.query(query, [id]);
  return res.rows[0] || null;
}

async function countArticles() {
  const res = await db.query(`
    SELECT
      COUNT(*)::int as total,
      COUNT(CASE WHEN status = 'published' THEN 1 END)::int as published,
      COUNT(CASE WHEN status = 'draft' THEN 1 END)::int as drafts
    FROM blog_articles;
  `);
  return res.rows[0];
}

module.exports = {
  findAll,
  findById,
  findBySlug,
  create,
  update,
  setPublicationStatus,
  deleteBlogArticle,
  countArticles,
};
