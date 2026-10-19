const db = require('../config/database');
const { slugify } = require('../utils/slugify');

async function findAll(onlyActive = false) {
  let query = `
    SELECT c.id, c.name, c.slug, c.description, c.display_order, c.is_active, c.created_at, c.updated_at,
           COUNT(l.id)::int as links_count
    FROM service_categories c
    LEFT JOIN service_links l ON l.category_id = c.id
  `;
  const params = [];
  if (onlyActive) {
    query += ' WHERE c.is_active = true';
  }
  query += ' GROUP BY c.id, c.name, c.slug, c.description, c.display_order, c.is_active, c.created_at, c.updated_at ORDER BY c.display_order ASC, c.name ASC;';

  const res = await db.query(query, params);
  return res.rows;
}

async function findById(id) {
  const query = `
    SELECT id, name, slug, description, display_order, is_active, created_at, updated_at
    FROM service_categories
    WHERE id = $1;
  `;
  const res = await db.query(query, [id]);
  return res.rows[0] || null;
}

async function findBySlug(slug) {
  const query = `
    SELECT id, name, slug, description, display_order, is_active, created_at, updated_at
    FROM service_categories
    WHERE slug = $1;
  `;
  const res = await db.query(query, [slug]);
  return res.rows[0] || null;
}

async function create({ name, slug, description, display_order, is_active }) {
  const finalSlug = slug ? slugify(slug) : slugify(name);
  const query = `
    INSERT INTO service_categories (name, slug, description, display_order, is_active)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const res = await db.query(query, [
    name.trim(),
    finalSlug,
    description || null,
    parseInt(display_order || 0, 10),
    is_active !== undefined ? Boolean(is_active) : true,
  ]);
  return res.rows[0];
}

async function update(id, { name, slug, description, display_order, is_active }) {
  const existing = await findById(id);
  if (!existing) return null;

  const finalName = name !== undefined ? name.trim() : existing.name;
  const finalSlug = slug !== undefined ? slugify(slug) : (name ? slugify(name) : existing.slug);
  const finalDesc = description !== undefined ? description : existing.description;
  const finalOrder = display_order !== undefined ? parseInt(display_order, 10) : existing.display_order;
  const finalActive = is_active !== undefined ? Boolean(is_active) : existing.is_active;

  const query = `
    UPDATE service_categories
    SET name = $1, slug = $2, description = $3, display_order = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP
    WHERE id = $6
    RETURNING *;
  `;
  const res = await db.query(query, [finalName, finalSlug, finalDesc, finalOrder, finalActive, id]);
  return res.rows[0];
}

async function deleteCategory(id) {
  // Check if any service links are assigned
  const checkQuery = 'SELECT COUNT(*)::int as count FROM service_links WHERE category_id = $1;';
  const checkRes = await db.query(checkQuery, [id]);
  if (checkRes.rows[0].count > 0) {
    throw new Error('Cannot delete category: it still contains service links. Please reassign or delete them first.');
  }

  const query = 'DELETE FROM service_categories WHERE id = $1 RETURNING id;';
  const res = await db.query(query, [id]);
  return res.rows[0] || null;
}

async function countCategories() {
  const res = await db.query('SELECT COUNT(*)::int as count FROM service_categories;');
  return res.rows[0].count;
}

module.exports = {
  findAll,
  findById,
  findBySlug,
  create,
  update,
  deleteCategory,
  countCategories,
};
