const adminRepo = require('../repositories/adminRepository');

async function requireAuth(req, res, next) {
  if (!req.session || !req.session.adminId) {
    if (req.accepts('json') || req.path.startsWith('/api/')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in to proceed.',
      });
    }
    return res.redirect('/admin/login');
  }

  try {
    const admin = await adminRepo.findById(req.session.adminId);
    if (!admin || !admin.is_active) {
      req.session.destroy();
      if (req.accepts('json') || req.path.startsWith('/api/')) {
        return res.status(401).json({
          success: false,
          message: 'Account is inactive or no longer exists.',
        });
      }
      return res.redirect('/admin/login');
    }

    req.admin = admin;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireAuth };
