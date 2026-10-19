const db = require('../config/database');

async function findAll({ onlyActive = false, category = null, search = null } = {}) {
  let query = `
    SELECT id, title, description, category, filename, original_filename,
           mime_type, file_size, download_count, is_active, created_at, updated_at
    FROM download_resources
    WHERE 1=1
  `;
  const params = [];

  if (onlyActive) {
    params.push(true);
    query += ` AND is_active = $${params.length}`;
  }

  if (category) {
    params.push(category.trim());
    query += ` AND category = $${params.length}`;
  }

  if (search) {
    params.push(`%${search.trim().toLowerCase()}%`);
    query += ` AND (LOWER(title) LIKE $${params.length} OR LOWER(description) LIKE $${params.length})`;
  }

  query += ' ORDER BY created_at DESC;';

  const res = await db.query(query, params);
  return res.rows;
}

async function findById(id) {
  const query = `
    SELECT id, title, description, category, filename, original_filename,
           mime_type, file_size, download_count, is_active, created_at, updated_at
    FROM download_resources
    WHERE id = $1;
  `;
  const res = await db.query(query, [id]);
  return res.rows[0] || null;
}

async function create({ title, description, category, filename, original_filename, mime_type, file_size, is_active }) {
  const query = `
    INSERT INTO download_resources (
      title, description, category, filename, original_filename, mime_type, file_size, is_active
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;
  const res = await db.query(query, [
    title.trim(),
    description || null,
    category ? category.trim() : 'General',
    filename,
    original_filename,
    mime_type,
    parseInt(file_size || 0, 10),
    is_active !== undefined ? Boolean(is_active) : true,
  ]);
  return res.rows[0];
}

async function update(id, { title, description, category, filename, original_filename, mime_type, file_size, is_active }) {
  const existing = await findById(id);
  if (!existing) return null;

  const finalTitle = title !== undefined ? title.trim() : existing.title;
  const finalDesc = description !== undefined ? description : existing.description;
  const finalCat = category !== undefined ? category.trim() : existing.category;
  const finalFilename = filename !== undefined ? filename : existing.filename;
  const finalOrigName = original_filename !== undefined ? original_filename : existing.original_filename;
  const finalMime = mime_type !== undefined ? mime_type : existing.mime_type;
  const finalSize = file_size !== undefined ? parseInt(file_size, 10) : existing.file_size;
  const finalActive = is_active !== undefined ? Boolean(is_active) : existing.is_active;

  const query = `
    UPDATE download_resources
    SET title = $1, description = $2, category = $3, filename = $4, original_filename = $5,
        mime_type = $6, file_size = $7, is_active = $8, updated_at = CURRENT_TIMESTAMP
    WHERE id = $9
    RETURNING *;
  `;
  const res = await db.query(query, [
    finalTitle,
    finalDesc,
    finalCat,
    finalFilename,
    finalOrigName,
    finalMime,
    finalSize,
    finalActive,
    id,
  ]);
  return res.rows[0];
}

async function incrementDownloadCount(id) {
  const query = `
    UPDATE download_resources
    SET download_count = download_count + 1
    WHERE id = $1
    RETURNING download_count;
  `;
  const res = await db.query(query, [id]);
  return res.rows[0] ? res.rows[0].download_count : 0;
}

async function deleteDownload(id) {
  const query = 'DELETE FROM download_resources WHERE id = $1 RETURNING *;';
  const res = await db.query(query, [id]);
  return res.rows[0] || null;
}

async function countDownloads(onlyActive = false) {
  let query = 'SELECT COUNT(*)::int as count FROM download_resources';
  if (onlyActive) {
    query += ' WHERE is_active = true';
  }
  const res = await db.query(query);
  return res.rows[0].count;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  incrementDownloadCount,
  deleteDownload,
  countDownloads,
};
