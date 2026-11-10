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
    baseWhere += ` AND (LOWER(title) LIKE $${params.length} OR LOWER(COALESCE(description, '')) LIKE $${params.length} OR LOWER(link_url) LIKE $${params.length})`;
  }

  const query = `
    SELECT id, title, description, image_filename, original_filename, link_url, button_text, target_blank, display_order, is_active, created_at, updated_at
    FROM home_sliders
    ${baseWhere}
    ORDER BY display_order ASC, id DESC;
  `;

  const res = await db.query(query, params);
  return res.rows;
}

async function findActive() {
  const query = `
    SELECT id, title, description, image_filename, original_filename, link_url, button_text, target_blank, display_order, is_active, created_at, updated_at
    FROM home_sliders
    WHERE is_active = true
    ORDER BY display_order ASC, id DESC;
  `;
  const res = await db.query(query);
  return res.rows;
}

async function findById(id) {
  const query = `
    SELECT id, title, description, image_filename, original_filename, link_url, button_text, target_blank, display_order, is_active, created_at, updated_at
    FROM home_sliders
    WHERE id = $1;
  `;
  const res = await db.query(query, [id]);
  return res.rows[0] || null;
}

async function create({
  title,
  description = null,
  image_filename,
  original_filename,
  link_url,
  button_text = 'View Details',
  target_blank = false,
  display_order = 0,
  is_active = true,
}) {
  const query = `
    INSERT INTO home_sliders (
      title, description, image_filename, original_filename, link_url, button_text, target_blank, display_order, is_active
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING id, title, description, image_filename, original_filename, link_url, button_text, target_blank, display_order, is_active, created_at, updated_at;
  `;

  const res = await db.query(query, [
    title,
    description,
    image_filename,
    original_filename,
    link_url,
    button_text || 'View Details',
    Boolean(target_blank),
    parseInt(display_order || '0', 10),
    is_active !== undefined ? Boolean(is_active) : true,
  ]);

  return res.rows[0];
}

async function update(id, fields) {
  const current = await findById(id);
  if (!current) return null;

  const title = fields.title !== undefined ? fields.title : current.title;
  const description = fields.description !== undefined ? fields.description : current.description;
  const image_filename = fields.image_filename !== undefined ? fields.image_filename : current.image_filename;
  const original_filename = fields.original_filename !== undefined ? fields.original_filename : current.original_filename;
  const link_url = fields.link_url !== undefined ? fields.link_url : current.link_url;
  const button_text = fields.button_text !== undefined ? fields.button_text : current.button_text;
  const target_blank = fields.target_blank !== undefined ? Boolean(fields.target_blank) : current.target_blank;
  const display_order = fields.display_order !== undefined ? parseInt(fields.display_order, 10) : current.display_order;
  const is_active = fields.is_active !== undefined ? Boolean(fields.is_active) : current.is_active;

  const query = `
    UPDATE home_sliders
    SET title = $1,
        description = $2,
        image_filename = $3,
        original_filename = $4,
        link_url = $5,
        button_text = $6,
        target_blank = $7,
        display_order = $8,
        is_active = $9,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $10
    RETURNING id, title, description, image_filename, original_filename, link_url, button_text, target_blank, display_order, is_active, created_at, updated_at;
  `;

  const res = await db.query(query, [
    title,
    description,
    image_filename,
    original_filename,
    link_url,
    button_text,
    target_blank,
    display_order,
    is_active,
    id,
  ]);

  return res.rows[0] || null;
}

async function deleteById(id) {
  const query = `
    DELETE FROM home_sliders
    WHERE id = $1
    RETURNING id, image_filename;
  `;
  const res = await db.query(query, [id]);
  return res.rows[0] || null;
}

async function count() {
  const res = await db.query('SELECT COUNT(*)::int AS count FROM home_sliders;');
  return res.rows[0] ? parseInt(res.rows[0].count, 10) : 0;
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

