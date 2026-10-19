const crypto = require('crypto');

function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

function ensureCsrfToken(req) {
  if (!req.session) {
    throw new Error('Session is required for CSRF protection.');
  }
  if (!req.session.csrfToken) {
    req.session.csrfToken = generateCsrfToken();
  }
  return req.session.csrfToken;
}

function verifyCsrfToken(req) {
  // Safe methods do not require CSRF validation
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return true;
  }

  const expectedToken = req.session ? req.session.csrfToken : null;
  const providedToken = req.headers['x-csrf-token'] || (req.body && req.body._csrf);

  if (!expectedToken || !providedToken) {
    return false;
  }

  try {
    const expectedBuf = Buffer.from(expectedToken, 'utf8');
    const providedBuf = Buffer.from(providedToken, 'utf8');

    if (expectedBuf.length !== providedBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, providedBuf);
  } catch (err) {
    return false;
  }
}

module.exports = {
  generateCsrfToken,
  ensureCsrfToken,
  verifyCsrfToken,
};
