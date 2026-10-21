const db = require('../config/database');

async function findAll(onlyActive = false) {
  let query = `
    SELECT id, title, message, link_url, type, display_order, is_active, created_at, updated_at
    FROM announcements
  `;
  const params = [];
  if (onlyActive) {
    query += ' WHERE is_active = true';
  }
  query += ' ORDER BY display_order ASC, created_at DESC;';

  const res = await db.query(query, params);
  return res.rows;
}

async function findById(id) {
  const query = `
    SELECT id, title, message, link_url, type, display_order, is_active, created_at, updated_at
    FROM announcements
    WHERE id = $1;
  `;
  const res = await db.query(query, [id]);
  return res.rows[0] || null;
}

async function create({ title, message, link_url, type = 'urgent', display_order = 0, is_active = true }) {
  const query = `
    INSERT INTO announcements (title, message, link_url, type, display_order, is_active)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const res = await db.query(query, [
    title.trim(),
    message.trim(),
    link_url ? link_url.trim() : null,
    type || 'urgent',
    parseInt(display_order || 0, 10),
    is_active !== undefined ? Boolean(is_active) : true,
  ]);
  return res.rows[0];
}

async function update(id, { title, message, link_url, type, display_order, is_active }) {
  const existing = await findById(id);
  if (!existing) return null;

  const finalTitle = title !== undefined ? title.trim() : existing.title;
  const finalMessage = message !== undefined ? message.trim() : existing.message;
  const finalLink = link_url !== undefined ? (link_url ? link_url.trim() : null) : existing.link_url;
  const finalType = type !== undefined ? type : existing.type;
  const finalOrder = display_order !== undefined ? parseInt(display_order, 10) : existing.display_order;
  const finalActive = is_active !== undefined ? Boolean(is_active) : existing.is_active;

  const query = `
    UPDATE announcements
    SET title = $1, message = $2, link_url = $3, type = $4, display_order = $5, is_active = $6, updated_at = CURRENT_TIMESTAMP
    WHERE id = $7
    RETURNING *;
  `;
  const res = await db.query(query, [finalTitle, finalMessage, finalLink, finalType, finalOrder, finalActive, id]);
  return res.rows[0];
}

async function deleteAnnouncement(id) {
  const query = 'DELETE FROM announcements WHERE id = $1 RETURNING id;';
  const res = await db.query(query, [id]);
  return res.rows[0] || null;
}

async function countAnnouncements(onlyActive = false) {
  let query = 'SELECT COUNT(*)::int as count FROM announcements';
  if (onlyActive) {
    query += ' WHERE is_active = true';
  }
  query += ';';
  const res = await db.query(query);
  return res.rows[0].count;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  deleteAnnouncement,
  countAnnouncements,
};
