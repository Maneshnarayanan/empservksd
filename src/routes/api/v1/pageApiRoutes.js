const express = require('express');
const router = express.Router();
const customPageController = require('../../../controllers/customPageController');

router.get('/', customPageController.getPublicPages);
router.get('/nav', customPageController.getNavPages);
router.get('/:slug', customPageController.getPublicPageBySlug);

module.exports = router;

