process.env.NODE_ENV = 'test';
process.env.USE_PG_MEM = 'true';
process.env.SESSION_SECRET = 'test_session_secret_for_vitest_runner_2026';
process.env.CSRF_SECRET = 'test_csrf_secret_for_vitest_runner_2026';

const { runMigrations } = require('../scripts/migrate');
const { createAdmin } = require('../scripts/create-admin');

beforeAll(async () => {
  await runMigrations();
  await createAdmin('admin', 'admin@employeeserviceksd.com', 'AdminKsd@2026!', 'Administrator');
});
