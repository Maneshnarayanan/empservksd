const argon2 = require('argon2');
const adminRepo = require('../repositories/adminRepository');
const { validateLogin } = require('../validators/authValidator');
const { ensureCsrfToken } = require('../utils/csrf');
const logger = require('../utils/logger');

async function login(req, res, next) {
  try {
    const errors = validateLogin(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const { username, password } = req.body;
    const admin = await adminRepo.findByUsername(username);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username/email or password.',
      });
    }

    if (!admin.is_active) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact the administrator.',
      });
    }

    const isValidPassword = await argon2.verify(admin.password_hash, password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username/email or password.',
      });
    }

    // Regenerate session to prevent session fixation attacks
    req.session.regenerate((err) => {
      if (err) return next(err);

      req.session.adminId = admin.id;
      req.session.adminUsername = admin.username;
      const csrfToken = ensureCsrfToken(req);

      // Async update of last login timestamp
      adminRepo.updateLastLogin(admin.id).catch((e) => logger.error('Failed to update last login:', e));

      logger.info(`Administrator logged in: ${admin.username} (ID: ${admin.id})`, { ip: req.ip });

      return res.json({
        success: true,
        message: 'Login successful.',
        csrfToken,
        admin: {
          id: admin.id,
          username: admin.username,
          email: admin.email,
          fullName: admin.full_name,
          role: admin.role,
        },
      });
    });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    const username = req.session ? req.session.adminUsername : 'unknown';
    if (req.session) {
      req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie(process.env.SESSION_NAME || 'esksd_sid');
        logger.info(`Administrator logged out: ${username}`);
        return res.json({ success: true, message: 'Logged out successfully.' });
      });
    } else {
      return res.json({ success: true, message: 'Already logged out.' });
    }
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    if (!req.session || !req.session.adminId) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    const admin = await adminRepo.findById(req.session.adminId);
    if (!admin || !admin.is_active) {
      return res.status(401).json({ success: false, message: 'Account is no longer active.' });
    }

    const csrfToken = ensureCsrfToken(req);

    return res.json({
      success: true,
      csrfToken,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        fullName: admin.full_name,
        role: admin.role,
        lastLoginAt: admin.last_login_at,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  login,
  logout,
  getMe,
};
