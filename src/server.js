require('dotenv').config();
const app = require('./app');
const logger = require('./utils/logger');
const db = require('./config/database');

const PORT = parseInt(process.env.PORT || '3000', 10);

const server = app.listen(PORT, () => {
  logger.info(`Employees Service Kasaragod portal running at http://localhost:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

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
