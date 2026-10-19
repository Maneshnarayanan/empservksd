const db = require('../config/database');

async function findAll({ categoryId, onlyActive = false, search = null } = {}) {
  let query = `
    SELECT l.id, l.category_id, l.name, l.destination_url, l.description, l.icon,
           l.display_order, l.is_active, l.created_at, l.updated_at,
           c.name as category_name, c.slug as category_slug
    FROM service_links l
    JOIN service_categories c ON l.category_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (onlyActive) {
    params.push(true);
    query += ` AND l.is_active = $${params.length} AND c.is_active = $${params.length}`;
  }

  if (categoryId) {
    params.push(parseInt(categoryId, 10));
    query += ` AND l.category_id = $${params.length}`;
  }

  if (search) {
    params.push(`%${search.trim().toLowerCase()}%`);
    query += ` AND (LOWER(l.name) LIKE $${params.length} OR LOWER(l.description) LIKE $${params.length})`;
  }

  query += ' ORDER BY c.display_order ASC, l.display_order ASC, l.name ASC;';

  const res = await db.query(query, params);
  return res.rows;
}

async function findById(id) {
  const query = `
    SELECT l.id, l.category_id, l.name, l.destination_url, l.description, l.icon,
           l.display_order, l.is_active, l.created_at, l.updated_at,
           c.name as category_name, c.slug as category_slug
    FROM service_links l
    JOIN service_categories c ON l.category_id = c.id
    WHERE l.id = $1;
  `;
  const res = await db.query(query, [id]);
  return res.rows[0] || null;
}

async function create({ category_id, name, destination_url, description, icon, display_order, is_active }) {
  const query = `
    INSERT INTO service_links (category_id, name, destination_url, description, icon, display_order, is_active)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const cleanUrl = destination_url && destination_url.trim() !== '' ? destination_url.trim() : null;
  const res = await db.query(query, [
    parseInt(category_id, 10),
    name.trim(),
    cleanUrl,
    description || null,
    icon || null,
    parseInt(display_order || 0, 10),
    is_active !== undefined ? Boolean(is_active) : true,
  ]);
  return res.rows[0];
}

async function update(id, { category_id, name, destination_url, description, icon, display_order, is_active }) {
  const existing = await findById(id);
  if (!existing) return null;

  const finalCatId = category_id !== undefined ? parseInt(category_id, 10) : existing.category_id;
  const finalName = name !== undefined ? name.trim() : existing.name;
  const finalUrl = destination_url !== undefined
    ? (destination_url && destination_url.trim() !== '' ? destination_url.trim() : null)
    : existing.destination_url;
  const finalDesc = description !== undefined ? description : existing.description;
  const finalIcon = icon !== undefined ? icon : existing.icon;
  const finalOrder = display_order !== undefined ? parseInt(display_order, 10) : existing.display_order;
  const finalActive = is_active !== undefined ? Boolean(is_active) : existing.is_active;

  const query = `
    UPDATE service_links
    SET category_id = $1, name = $2, destination_url = $3, description = $4, icon = $5,
        display_order = $6, is_active = $7, updated_at = CURRENT_TIMESTAMP
    WHERE id = $8
    RETURNING *;
  `;
  const res = await db.query(query, [
    finalCatId,
    finalName,
    finalUrl,
    finalDesc,
    finalIcon,
    finalOrder,
    finalActive,
    id,
  ]);
  return res.rows[0];
}

async function deleteServiceLink(id) {
  const query = 'DELETE FROM service_links WHERE id = $1 RETURNING id;';
  const res = await db.query(query, [id]);
  return res.rows[0] || null;
}

async function countLinks(onlyConfigured = false) {
  let query = 'SELECT COUNT(*)::int as count FROM service_links';
  if (onlyConfigured) {
    query += " WHERE destination_url IS NOT NULL AND destination_url != ''";
  }
  const res = await db.query(query);
  return res.rows[0].count;
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  deleteServiceLink,
  countLinks,
};
