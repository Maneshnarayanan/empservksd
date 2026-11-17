const express = require('express');
const router = express.Router();
const newsController = require('../../../controllers/newsPosterController');

router.get('/', newsController.getPublicNews);
router.get('/home', newsController.getHomeNews);
router.get('/latest', newsController.getLatestNews);
router.get('/:id', newsController.getNewsById);
router.post('/:id/view', newsController.recordNewsView);

module.exports = router;
