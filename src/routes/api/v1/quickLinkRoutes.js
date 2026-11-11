const express = require('express');
const router = express.Router();
const quickLinkCtrl = require('../../../controllers/quickLinkController');

router.get('/', quickLinkCtrl.getPublicQuickLinks);

module.exports = router;

