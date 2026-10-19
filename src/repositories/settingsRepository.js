const db = require('../config/database');

async function getAllSettings() {
  const query = 'SELECT key, value, description, updated_at FROM website_settings;';
  const res = await db.query(query);
  const settingsObj = {};
  res.rows.forEach((row) => {
    settingsObj[row.key] = row.value;
  });
  return { raw: res.rows, map: settingsObj };
}

async function getSetting(key) {
  const query = 'SELECT key, value, description, updated_at FROM website_settings WHERE key = $1;';
  const res = await db.query(query, [key]);
  return res.rows[0] ? res.rows[0].value : null;
}

async function updateSetting(key, value, description) {
  const query = `
    INSERT INTO website_settings (key, value, description, updated_at)
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
    ON CONFLICT (key) DO UPDATE SET
      value = EXCLUDED.value,
      description = COALESCE(EXCLUDED.description, website_settings.description),
      updated_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;
  const res = await db.query(query, [key, value, description || null]);
  return res.rows[0];
}

async function updateMultiple(settingsMap) {
  const updated = [];
  for (const [key, value] of Object.entries(settingsMap)) {
    if (typeof value === 'string') {
      const row = await updateSetting(key, value.trim());
      updated.push(row);
    }
  }
  return updated;
}

module.exports = {
  getAllSettings,
  getSetting,
  updateSetting,
  updateMultiple,
};
