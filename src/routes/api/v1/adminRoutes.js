const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../../middleware/authMiddleware');
const { csrfMiddleware } = require('../../../middleware/csrfMiddleware');
const { uploadDownload, uploadBlogImage, uploadNewsPoster, uploadSlider, uploadPageImage, uploadPageAttachment } = require('../../../middleware/uploadMiddleware');

const categoryController = require('../../../controllers/serviceCategoryController');
const linkController = require('../../../controllers/serviceLinkController');
const downloadController = require('../../../controllers/downloadController');
const blogCategoryController = require('../../../controllers/blogCategoryController');
const blogArticleController = require('../../../controllers/blogArticleController');
const settingsController = require('../../../controllers/settingsController');
const announcementController = require('../../../controllers/announcementController');
const newsPosterController = require('../../../controllers/newsPosterController');
const sliderController = require('../../../controllers/sliderController');
const quickLinkController = require('../../../controllers/quickLinkController');
const customPageController = require('../../../controllers/customPageController');

// All admin routes require authentication
router.use(requireAuth);

// All state-changing methods require CSRF validation
router.use(csrfMiddleware);

// Dashboard Statistics
router.get('/stats', settingsController.getDashboardStats);

// Service Categories CRUD
router.get('/service-categories', categoryController.getAllCategories);
router.get('/service-categories/:id', categoryController.getCategoryById);
router.post('/service-categories', categoryController.createCategory);
router.put('/service-categories/:id', categoryController.updateCategory);
router.delete('/service-categories/:id', categoryController.deleteCategory);

// Service Links CRUD
router.get('/services', linkController.getAllLinks);
router.get('/services/:id', linkController.getLinkById);
router.post('/services', linkController.createLink);
router.put('/services/:id', linkController.updateLink);
router.delete('/services/:id', linkController.deleteLink);

// Download Resources CRUD
router.get('/downloads', downloadController.getAllDownloads);
router.get('/downloads/:id', downloadController.getDownloadById);
router.post('/downloads', uploadDownload.single('file'), downloadController.createDownload);
router.put('/downloads/:id', uploadDownload.single('file'), downloadController.updateDownload);
router.delete('/downloads/:id', downloadController.deleteDownload);

// Blog Categories CRUD
router.get('/blog-categories', blogCategoryController.getAllBlogCategories);
router.get('/blog-categories/:id', blogCategoryController.getBlogCategoryById);
router.post('/blog-categories', blogCategoryController.createBlogCategory);
router.put('/blog-categories/:id', blogCategoryController.updateBlogCategory);
router.delete('/blog-categories/:id', blogCategoryController.deleteBlogCategory);

// Blog Articles CRUD
router.get('/blogs', blogArticleController.getAllArticles);
router.get('/blogs/:id', blogArticleController.getArticleById);
router.post('/blogs', uploadBlogImage.single('featured_image'), blogArticleController.createArticle);
router.put('/blogs/:id', uploadBlogImage.single('featured_image'), blogArticleController.updateArticle);
router.post('/blogs/:id/publish', blogArticleController.setPublication);
router.delete('/blogs/:id', blogArticleController.deleteArticle);
router.post('/blogs/upload-image', uploadBlogImage.single('image'), blogArticleController.uploadImageOnly);

// Website Settings
router.get('/settings', settingsController.getAllSettings);
router.put('/settings', settingsController.updateSettings);

// Announcements & Ticker CRUD
router.get('/announcements', announcementController.getAllAnnouncements);
router.get('/announcements/:id', announcementController.getAnnouncementById);
router.post('/announcements', announcementController.createAnnouncement);
router.put('/announcements/:id', announcementController.updateAnnouncement);
router.delete('/announcements/:id', announcementController.deleteAnnouncement);
router.post('/announcements/toggle-ticker', announcementController.toggleTickerStatus);

// News Posters CRUD
router.get('/news', newsPosterController.getAllNews);
router.get('/news/:id', newsPosterController.getNewsById);
router.post('/news', uploadNewsPoster.single('poster'), newsPosterController.createNews);
router.put('/news/:id', uploadNewsPoster.single('poster'), newsPosterController.updateNews);
router.delete('/news/:id', newsPosterController.deleteNews);

// Home Sliders CRUD
router.get('/sliders', sliderController.getAllSliders);
router.get('/sliders/:id', sliderController.getSliderById);
router.post('/sliders', uploadSlider.single('image'), sliderController.createSlider);
router.put('/sliders/:id', uploadSlider.single('image'), sliderController.updateSlider);
router.delete('/sliders/:id', sliderController.deleteSlider);

// Quick Links (Popular Articles / Trending Guidelines) CRUD
router.get('/quick-links', quickLinkController.getAllQuickLinks);
router.get('/quick-links/:id', quickLinkController.getQuickLinkById);
router.post('/quick-links', quickLinkController.createQuickLink);
router.put('/quick-links/:id', quickLinkController.updateQuickLink);
router.delete('/quick-links/:id', quickLinkController.deleteQuickLink);

// Dynamic Pages & Page Builder CRUD
router.get('/pages', customPageController.getAllPages);
router.get('/pages/:id', customPageController.getPageById);
router.post('/pages', customPageController.createPage);
router.post('/pages/preview', customPageController.previewBlocks);
router.post('/pages/upload-image', uploadPageImage.single('image'), customPageController.uploadPageAsset);
router.post('/pages/upload-attachment', uploadPageAttachment.single('file'), customPageController.uploadPageAsset);
router.put('/pages/:id', customPageController.updatePage);
router.delete('/pages/:id', customPageController.deletePage);

module.exports = router;
