const express = require('express');
const router = express.Router();
const categoryController = require('../../../controllers/serviceCategoryController');
const linkController = require('../../../controllers/serviceLinkController');

// Public endpoints
router.get('/categories', categoryController.getPublicCategories);
router.get('/', linkController.getPublicLinks);

module.exports = router;
