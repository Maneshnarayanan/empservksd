const express = require('express');
const router = express.Router();
const sliderController = require('../../../controllers/sliderController');

router.get('/', sliderController.getPublicSliders);
router.get('/:id', sliderController.getSliderById);

module.exports = router;

