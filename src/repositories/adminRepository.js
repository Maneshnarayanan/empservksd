const db = require('../config/database');

async function findByUsername(username) {
  const query = `
    SELECT id, username, email, password_hash, full_name, role, is_active, last_login_at
    FROM administrators
    WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1)
    LIMIT 1;
  `;
  const res = await db.query(query, [username.trim()]);
  return res.rows[0] || null;
}

async function findById(id) {
  const query = `
    SELECT id, username, email, full_name, role, is_active, last_login_at, created_at
    FROM administrators
    WHERE id = $1
    LIMIT 1;
  `;
  const res = await db.query(query, [id]);
  return res.rows[0] || null;
}

async function updateLastLogin(id) {
  const query = `
    UPDATE administrators
    SET last_login_at = CURRENT_TIMESTAMP
    WHERE id = $1;
  `;
  await db.query(query, [id]);
}

async function countAdmins() {
  const res = await db.query('SELECT COUNT(*) as count FROM administrators;');
  return parseInt(res.rows[0].count, 10);
}

module.exports = {
  findByUsername,
  findById,
  updateLastLogin,
  countAdmins,
};
