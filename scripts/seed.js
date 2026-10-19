require('dotenv').config();
const { runMigrations } = require('./migrate');
const { createAdmin } = require('./create-admin');

async function seed() {
  console.log('--- Starting Database Seed Workflow ---');
  await runMigrations();

  const adminUser = process.env.ADMIN_DEFAULT_USERNAME || 'admin';
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@employeeserviceksd.com';
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'AdminKsd@2026!';
  const adminFullName = process.env.ADMIN_DEFAULT_FULLNAME || 'Administrator ESKSD';

  console.log(`Provisioning default administrator account: ${adminUser}...`);
  await createAdmin(adminUser, adminEmail, adminPassword, adminFullName);
  console.log('--- Database Seeding Completed Successfully ---');
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seed workflow failed:', err);
      process.exit(1);
    });
}

module.exports = { seed };
