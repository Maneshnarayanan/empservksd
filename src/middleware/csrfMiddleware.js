const { verifyCsrfToken } = require('../utils/csrf');

function csrfMiddleware(req, res, next) {
  // Allow safe HTTP methods without verification
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Exempt public download endpoints or specific public paths if any (only safe methods there anyway)
  const isValid = verifyCsrfToken(req);
  if (!isValid) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or missing CSRF token. Please refresh the page and try again.',
    });
  }

  next();
}

module.exports = { csrfMiddleware };
