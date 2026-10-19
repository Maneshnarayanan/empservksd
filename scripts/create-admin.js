require('dotenv').config();
const argon2 = require('argon2');
const db = require('../src/config/database');

async function createAdmin(username, email, password, fullName = 'Administrator') {
  if (!username || !email || !password) {
    throw new Error('Username, email, and password are required.');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }

  console.log('Hashing password with Argon2id...');
  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
  });

  const queryText = `
    INSERT INTO administrators (username, email, password_hash, full_name, role, is_active)
    VALUES ($1, $2, $3, $4, 'admin', true)
    ON CONFLICT (username) DO UPDATE SET
      password_hash = EXCLUDED.password_hash,
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      updated_at = CURRENT_TIMESTAMP
    RETURNING id, username, email, full_name, created_at;
  `;

  const res = await db.query(queryText, [username.trim().toLowerCase(), email.trim().toLowerCase(), passwordHash, fullName.trim()]);
  return res.rows[0];
}

async function main() {
  const args = process.argv.slice(2);
  let username = process.env.ADMIN_DEFAULT_USERNAME || 'admin';
  let email = process.env.ADMIN_DEFAULT_EMAIL || 'admin@employeeserviceksd.com';
  let password = process.env.ADMIN_DEFAULT_PASSWORD;
  let fullName = process.env.ADMIN_DEFAULT_FULLNAME || 'Administrator ESKSD';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--username' && args[i + 1]) username = args[++i];
    if (args[i] === '--email' && args[i + 1]) email = args[++i];
    if (args[i] === '--password' && args[i + 1]) password = args[++i];
    if (args[i] === '--fullname' && args[i + 1]) fullName = args[++i];
  }

  if (!password) {
    console.error('Error: Please provide a password using --password <password> or ADMIN_DEFAULT_PASSWORD env.');
    process.exit(1);
  }

  try {
    const admin = await createAdmin(username, email, password, fullName);
    console.log('Administrator provisioned successfully:');
    console.log(`- ID: ${admin.id}`);
    console.log(`- Username: ${admin.username}`);
    console.log(`- Email: ${admin.email}`);
    console.log(`- Full Name: ${admin.full_name}`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to create administrator:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { createAdmin };
