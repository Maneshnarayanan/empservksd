const express = require('express');
const router = express.Router();
const downloadController = require('../../../controllers/downloadController');

// Public listing
router.get('/', downloadController.getPublicDownloads);

// Controlled secure file download
router.get('/:id/file', downloadController.downloadFile);

module.exports = router;
