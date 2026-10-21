require('dotenv').config();
const logger = require('./utils/logger');
const db = require('./config/database');

const { runMigrations } = require('../scripts/migrate');
const { createAdmin } = require('../scripts/create-admin');

const PORT = parseInt(process.env.PORT || '3000', 10);
let server;

async function startServer() {
  try {
    await db.testOrFallback();

    if (db.isDbInMemory()) {
      logger.info('In-memory database active. Applying schema migrations & seed data...');
      await runMigrations();
      await createAdmin(
        process.env.ADMIN_DEFAULT_USERNAME || 'admin',
        process.env.ADMIN_DEFAULT_EMAIL || 'admin@employeeserviceksd.com',
        process.env.ADMIN_DEFAULT_PASSWORD || 'AdminKsd@2026!',
        process.env.ADMIN_DEFAULT_FULLNAME || 'Administrator ESKSD'
      );
      logger.info('In-memory database ready with default administrator credentials (admin / AdminKsd@2026!).');
    }

    const app = require('./app');

    server = app.listen(PORT, () => {
      logger.info(`Employees Service Kasaragod portal running at http://localhost:${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

function handleShutdown(signal) {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    try {
      const pool = db.getPool();
      if (pool && pool.end) {
        await pool.end();
      }
      logger.info('Database pool closed. Exiting process.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during shutdown:', err);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds if graceful shutdown takes too long
  setTimeout(() => {
    logger.error('Forced shutdown due to timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
