const db = require('../config/database');
const { slugify } = require('../utils/slugify');

async function findAll() {
  const query = `
    SELECT c.id, c.name, c.slug, c.description, c.display_order, c.created_at, c.updated_at,
           COUNT(a.id)::int as articles_count,
           COUNT(CASE WHEN a.status = 'published' THEN 1 END)::int as published_count
    FROM blog_categories c
    LEFT JOIN blog_articles a ON a.category_id = c.id
    GROUP BY c.id, c.name, c.slug, c.description, c.display_order, c.created_at, c.updated_at
    ORDER BY c.display_order ASC, c.name ASC;
  `;
  const res = await db.query(query);
  return res.rows;
}

async function findById(id) {
  const query = `
    SELECT id, name, slug, description, display_order, created_at, updated_at
    FROM blog_categories
    WHERE id = $1;
  `;
  const res = await db.query(query, [id]);
  return res.rows[0] || null;
}

async function findBySlug(slug) {
  const query = `
    SELECT id, name, slug, description, display_order, created_at, updated_at
    FROM blog_categories
    WHERE slug = $1;
  `;
  const res = await db.query(query, [slug]);
  return res.rows[0] || null;
}

async function create({ name, slug, description, display_order }) {
  const finalSlug = slug ? slugify(slug) : slugify(name);
  const query = `
    INSERT INTO blog_categories (name, slug, description, display_order)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const res = await db.query(query, [
    name.trim(),
    finalSlug,
    description || null,
    parseInt(display_order || 0, 10),
  ]);
  return res.rows[0];
}

async function update(id, { name, slug, description, display_order }) {
  const existing = await findById(id);
  if (!existing) return null;

  const finalName = name !== undefined ? name.trim() : existing.name;
  const finalSlug = slug !== undefined ? slugify(slug) : (name ? slugify(name) : existing.slug);
  const finalDesc = description !== undefined ? description : existing.description;
  const finalOrder = display_order !== undefined ? parseInt(display_order, 10) : existing.display_order;

  const query = `
    UPDATE blog_categories
    SET name = $1, slug = $2, description = $3, display_order = $4, updated_at = CURRENT_TIMESTAMP
    WHERE id = $5
    RETURNING *;
  `;
  const res = await db.query(query, [finalName, finalSlug, finalDesc, finalOrder, id]);
  return res.rows[0];
}

async function deleteBlogCategory(id) {
  const check = await db.query('SELECT COUNT(*)::int as count FROM blog_articles WHERE category_id = $1;', [id]);
  if (check.rows[0].count > 0) {
    throw new Error('Cannot delete category: it still contains blog articles. Please reassign or delete them first.');
  }

  const query = 'DELETE FROM blog_categories WHERE id = $1 RETURNING id;';
  const res = await db.query(query, [id]);
  return res.rows[0] || null;
}

module.exports = {
  findAll,
  findById,
  findBySlug,
  create,
  update,
  deleteBlogCategory,
};
