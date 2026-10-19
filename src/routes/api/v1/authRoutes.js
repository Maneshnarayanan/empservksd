const express = require('express');
const router = express.Router();
const authController = require('../../../controllers/authController');
const { loginLimiter } = require('../../../middleware/rateLimiter');
const { requireAuth } = require('../../../middleware/authMiddleware');

router.post('/login', loginLimiter, authController.login);
router.post('/logout', authController.logout);
router.get('/me', requireAuth, authController.getMe);

module.exports = router;
