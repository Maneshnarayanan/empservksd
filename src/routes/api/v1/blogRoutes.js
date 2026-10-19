const express = require('express');
const router = express.Router();
const blogArticleController = require('../../../controllers/blogArticleController');
const blogCategoryController = require('../../../controllers/blogCategoryController');

// Public endpoints
router.get('/', blogArticleController.getPublicArticles);
router.get('/categories', blogCategoryController.getPublicBlogCategories);
router.get('/:slug', blogArticleController.getPublicArticleBySlug);

module.exports = router;
