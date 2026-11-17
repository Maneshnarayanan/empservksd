const jobVacancyRepo = require('../repositories/jobVacancyRepository');

/**
 * Public listing of active job vacancies.
 */
async function getPublicJobs(req, res, next) {
  try {
    const { search, page, limit, featured } = req.query;
    const isFeatured = featured === 'true' ? true : featured === 'false' ? false : null;
    const result = await jobVacancyRepo.findAll({
      onlyActive: true,
      search,
      page: page || 1,
      limit: limit || 12,
      isFeatured,
    });
    return res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

/**
 * Public endpoint for sidebar job vacancies widget.
 */
async function getSidebarJobs(req, res, next) {
  try {
    const limit = parseInt(req.query.limit, 10) || 5;
    const vacancies = await jobVacancyRepo.findSidebarVacancies({ limit });
    return res.json({ success: true, data: vacancies });
  } catch (err) {
    next(err);
  }
}

/**
 * Public single vacancy details view by slug (increments view count).
 */
async function getPublicJobBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const job = await jobVacancyRepo.findBySlug(slug, { onlyActive: true });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job vacancy not found or no longer active.',
      });
    }

    // Atomically increment view count
    await jobVacancyRepo.incrementViewCount(job.id);
    job.view_count = (job.view_count || 0) + 1;

    return res.json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin listing of all vacancies with stats.
 */
async function getAllJobs(req, res, next) {
  try {
    const { search, page, limit, onlyActive } = req.query;
    const result = await jobVacancyRepo.findAll({
      onlyActive: onlyActive === 'true',
      search,
      page: page || 1,
      limit: limit || 20,
    });
    const stats = await jobVacancyRepo.countVacancies();
    return res.json({ success: true, ...result, stats });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin fetch single vacancy by ID.
 */
async function getJobById(req, res, next) {
  try {
    const { id } = req.params;
    const job = await jobVacancyRepo.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job vacancy not found.',
      });
    }
    return res.json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin create new job vacancy.
 */
async function createJob(req, res, next) {
  try {
    const { title, department } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Job title is required.' });
    }
    if (!department || !department.trim()) {
      return res.status(400).json({ success: false, message: 'Department/Organization name is required.' });
    }

    const job = await jobVacancyRepo.create(req.body);
    return res.status(201).json({
      success: true,
      message: 'Job vacancy created successfully.',
      data: job,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin update existing job vacancy.
 */
async function updateJob(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await jobVacancyRepo.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Job vacancy not found.' });
    }

    const { title, department } = req.body;
    if (title !== undefined && !title.trim()) {
      return res.status(400).json({ success: false, message: 'Job title cannot be empty.' });
    }
    if (department !== undefined && !department.trim()) {
      return res.status(400).json({ success: false, message: 'Department cannot be empty.' });
    }

    const updated = await jobVacancyRepo.update(id, req.body);
    return res.json({
      success: true,
      message: 'Job vacancy updated successfully.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin delete job vacancy.
 */
async function deleteJob(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await jobVacancyRepo.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Job vacancy not found.' });
    }

    await jobVacancyRepo.deleteJob(id);
    return res.json({
      success: true,
      message: 'Job vacancy deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin toggle job vacancy active status.
 */
async function toggleJobStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    const existing = await jobVacancyRepo.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Job vacancy not found.' });
    }

    const updated = await jobVacancyRepo.toggleStatus(id, Boolean(is_active));
    return res.json({
      success: true,
      message: `Job vacancy is now ${updated.is_active ? 'active' : 'inactive'}.`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPublicJobs,
  getSidebarJobs,
  getPublicJobBySlug,
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  toggleJobStatus,
};

