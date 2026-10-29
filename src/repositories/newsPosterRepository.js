const db = require('../config/database');

async function findAll({ onlyActive = false, search = null } = {}) {
  let query = `
    SELECT id, title, caption, description, image_filename, original_filename, display_order, is_active, is_home_published, published_date, created_at, updated_at
    FROM news_posters
    WHERE 1=1
  `;
  const params = [];

  if (onlyActive) {
    params.push(true);
    query += ` AND is_active = $${params.length}`;
  }

  if (search) {
    params.push(`%${search.trim().toLowerCase()}%`);
    query += ` AND (LOWER(title) LIKE $${params.length} OR LOWER(COALESCE(caption, '')) LIKE $${params.length} OR LOWER(COALESCE(description, '')) LIKE $${params.length})`;
  }

  // Ordered purely by published date descending, then created_at descending
  query += ' ORDER BY published_date DESC, created_at DESC;';

  const res = await db.query(query, params);
  return res.rows;
}

async function getHomePosters({ limit = 3 } = {}) {
  const query = `
    SELECT id, title, caption, description, image_filename, original_filename, display_order, is_active, is_home_published, published_date, created_at, updated_at
    FROM news_posters
    WHERE is_active = true AND is_home_published = true
    ORDER BY display_order ASC, published_date DESC, created_at DESC
    LIMIT $1;
  `;
  const res = await db.query(query, [limit]);
  return res.rows;
}

async function getLatest() {
  const query = `
    SELECT id, title, caption, description, image_filename, original_filename, display_order, is_active, is_home_published, published_date, created_at, updated_at
    FROM news_posters
    WHERE is_active = true AND is_home_published = true
    ORDER BY display_order ASC, published_date DESC, created_at DESC
    LIMIT 1;
  `;
  const res = await db.query(query);
  return res.rows[0] || null;
}

async function countHomePublished(excludeId = null) {
  let query = 'SELECT COUNT(*)::int AS count FROM news_posters WHERE is_home_published = true';
  const params = [];
  if (excludeId) {
    params.push(excludeId);
    query += ` AND id != $${params.length}`;
  }
  const res = await db.query(query, params);
  return res.rows[0] ? parseInt(res.rows[0].count, 10) : 0;
}

async function findById(id) {
  const query = `
    SELECT id, title, caption, description, image_filename, original_filename, display_order, is_active, is_home_published, published_date, created_at, updated_at
    FROM news_posters
    WHERE id = $1;
  `;
  const res = await db.query(query, [id]);
  return res.rows[0] || null;
}

async function create({
  title,
  caption,
  description,
  image_filename,
  original_filename,
  display_order = 0,
  is_active = true,
  is_home_published = false,
  published_date = null,
}) {
  const isHome = Boolean(is_home_published);
  const order = isHome ? parseInt(display_order || 1, 10) : 0;

  const query = `
    INSERT INTO news_posters (
      title, caption, description, image_filename, original_filename, display_order, is_active, is_home_published, published_date
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, COALESCE($9, CURRENT_DATE))
    RETURNING *;
  `;
  const res = await db.query(query, [
    title.trim(),
    caption ? caption.trim() : null,
    description ? description.trim() : null,
    image_filename,
    original_filename,
    order,
    is_active !== undefined ? Boolean(is_active) : true,
    isHome,
    published_date || null,
  ]);
  return res.rows[0];
}

async function update(id, {
  title,
  caption,
  description,
  image_filename,
  original_filename,
  display_order,
  is_active,
  is_home_published,
  published_date,
}) {
  const existing = await findById(id);
  if (!existing) return null;

  const finalTitle = title !== undefined ? title.trim() : existing.title;
  const finalCaption = caption !== undefined ? (caption ? caption.trim() : null) : existing.caption;
  const finalDescription = description !== undefined ? (description ? description.trim() : null) : existing.description;
  const finalImage = image_filename !== undefined ? image_filename : existing.image_filename;
  const finalOriginal = original_filename !== undefined ? original_filename : existing.original_filename;
  const finalActive = is_active !== undefined ? Boolean(is_active) : existing.is_active;
  const finalHome = is_home_published !== undefined ? Boolean(is_home_published) : existing.is_home_published;
  const finalOrder = finalHome ? (display_order !== undefined ? parseInt(display_order, 10) : existing.display_order) : 0;
  const finalDate = published_date !== undefined ? published_date : existing.published_date;

  const query = `
    UPDATE news_posters
    SET title = $1, caption = $2, description = $3, image_filename = $4, original_filename = $5,
        display_order = $6, is_active = $7, is_home_published = $8, published_date = $9, updated_at = CURRENT_TIMESTAMP
    WHERE id = $10
    RETURNING *;
  `;

  const res = await db.query(query, [
    finalTitle,
    finalCaption,
    finalDescription,
    finalImage,
    finalOriginal,
    finalOrder,
    finalActive,
    finalHome,
    finalDate,
    id,
  ]);

  return res.rows[0] || null;
}

async function deletePoster(id) {
  const res = await db.query('DELETE FROM news_posters WHERE id = $1 RETURNING *;', [id]);
  return res.rows[0] || null;
}

module.exports = {
  findAll,
  getHomePosters,
  getLatest,
  countHomePublished,
  findById,
  create,
  update,
  deletePoster,
};
