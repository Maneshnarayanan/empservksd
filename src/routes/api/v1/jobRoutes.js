const express = require('express');
const router = express.Router();
const jobVacancyController = require('../../../controllers/jobVacancyController');

// Public job vacancy endpoints
router.get('/', jobVacancyController.getPublicJobs);
router.get('/sidebar', jobVacancyController.getSidebarJobs);
router.get('/:slug', jobVacancyController.getPublicJobBySlug);

module.exports = router;

