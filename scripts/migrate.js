require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('../src/config/database');

async function runMigrations() {
  const pool = db.initDatabase();
  const client = await pool.connect();

  try {
    console.log('Running database migrations...');
    await client.query('BEGIN');

    // Create schema_migrations table if not exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const migrationsDir = path.join(__dirname, '..', 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const res = await client.query('SELECT version FROM schema_migrations WHERE version = $1', [file]);
      if (res.rows.length === 0) {
        console.log(`Applying migration: ${file}...`);
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');

        // Execute statements
        await client.query(sql);

        // Record migration
        await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file]);
        console.log(`Applied: ${file}`);
      } else {
        console.log(`Skipping already applied migration: ${file}`);
      }
    }

    await client.query('COMMIT');
    console.log('All migrations completed successfully.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { runMigrations };
