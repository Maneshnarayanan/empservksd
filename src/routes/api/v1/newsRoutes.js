const express = require('express');
const router = express.Router();
const newsController = require('../../../controllers/newsPosterController');

router.get('/', newsController.getPublicNews);
router.get('/latest', newsController.getLatestNews);
router.get('/:id', newsController.getNewsById);

module.exports = router;
