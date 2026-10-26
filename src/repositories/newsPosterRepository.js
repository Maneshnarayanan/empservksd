const db = require('../config/database');

async function findAll({ onlyActive = false, search = null } = {}) {
  let query = `
    SELECT id, title, caption, image_filename, original_filename, display_order, is_active, published_date, created_at, updated_at
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
    query += ` AND (LOWER(title) LIKE $${params.length} OR LOWER(caption) LIKE $${params.length})`;
  }

  query += ' ORDER BY display_order ASC, published_date DESC, created_at DESC;';

  const res = await db.query(query, params);
  return res.rows;
}

async function getLatest() {
  const query = `
    SELECT id, title, caption, image_filename, original_filename, display_order, is_active, published_date, created_at, updated_at
    FROM news_posters
    WHERE is_active = true
    ORDER BY display_order ASC, published_date DESC, created_at DESC
    LIMIT 1;
  `;
  const res = await db.query(query);
  return res.rows[0] || null;
}

async function findById(id) {
  const query = `
    SELECT id, title, caption, image_filename, original_filename, display_order, is_active, published_date, created_at, updated_at
    FROM news_posters
    WHERE id = $1;
  `;
  const res = await db.query(query, [id]);
  return res.rows[0] || null;
}

async function create({ title, caption, image_filename, original_filename, display_order = 0, is_active = true, published_date = null }) {
  const query = `
    INSERT INTO news_posters (
      title, caption, image_filename, original_filename, display_order, is_active, published_date
    ) VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, CURRENT_DATE))
    RETURNING *;
  `;
  const res = await db.query(query, [
    title.trim(),
    caption ? caption.trim() : null,
    image_filename,
    original_filename,
    parseInt(display_order || 0, 10),
    is_active !== undefined ? Boolean(is_active) : true,
    published_date || null,
  ]);
  return res.rows[0];
}

async function update(id, { title, caption, image_filename, original_filename, display_order, is_active, published_date }) {
  const existing = await findById(id);
  if (!existing) return null;

  const finalTitle = title !== undefined ? title.trim() : existing.title;
  const finalCaption = caption !== undefined ? (caption ? caption.trim() : null) : existing.caption;
  const finalImage = image_filename !== undefined ? image_filename : existing.image_filename;
  const finalOriginal = original_filename !== undefined ? original_filename : existing.original_filename;
  const finalOrder = display_order !== undefined ? parseInt(display_order, 10) : existing.display_order;
  const finalActive = is_active !== undefined ? Boolean(is_active) : existing.is_active;
  const finalDate = published_date !== undefined ? published_date : existing.published_date;

  const query = `
    UPDATE news_posters
    SET title = $1, caption = $2, image_filename = $3, original_filename = $4,
        display_order = $5, is_active = $6, published_date = $7, updated_at = CURRENT_TIMESTAMP
    WHERE id = $8
    RETURNING *;
  `;

  const res = await db.query(query, [
    finalTitle,
    finalCaption,
    finalImage,
    finalOriginal,
    finalOrder,
    finalActive,
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
  getLatest,
  findById,
  create,
  update,
  deletePoster,
};
