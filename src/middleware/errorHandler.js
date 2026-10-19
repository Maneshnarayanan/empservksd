const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  const isDev = process.env.NODE_ENV !== 'production';

  logger.error(err.message || 'Internal Server Error', {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  });

  // Handle Multer upload errors and file filter errors
  if (err.name === 'MulterError' || (err.message && err.message.includes('not permitted'))) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Uploaded file exceeds the maximum allowed size.',
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Handle CSRF errors
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      success: false,
      message: 'Invalid or missing CSRF token. Please refresh the page and try again.',
    });
  }

  const statusCode = err.statusCode || (res.statusCode >= 400 ? res.statusCode : 500);

  res.status(statusCode).json({
    success: false,
    message: statusCode === 500 && !isDev
      ? 'An unexpected internal server error occurred. Please contact the administrator.'
      : err.message || 'An unexpected error occurred.',
    ...(isDev && { stack: err.stack }),
  });
}

function notFoundHandler(req, res, next) {
  if (req.path.startsWith('/api/') || !req.accepts('html')) {
    return res.status(404).json({
      success: false,
      message: `Endpoint ${req.method} ${req.originalUrl} not found.`,
    });
  }
  res.status(404).sendFile(require('path').join(__dirname, '../../public/404.html'));
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
