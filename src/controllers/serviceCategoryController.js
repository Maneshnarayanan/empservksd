const categoryRepo = require('../repositories/serviceCategoryRepository');
const { validateCategory } = require('../validators/serviceValidator');

async function getPublicCategories(req, res, next) {
  try {
    const categories = await categoryRepo.findAll(true);
    return res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}

async function getAllCategories(req, res, next) {
  try {
    const categories = await categoryRepo.findAll(false);
    return res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}

async function getCategoryById(req, res, next) {
  try {
    const category = await categoryRepo.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Service category not found.' });
    }
    return res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const errors = validateCategory(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const created = await categoryRepo.create(req.body);
    return res.status(201).json({
      success: true,
      message: 'Service category created successfully.',
      data: created,
    });
  } catch (err) {
    if (err.code === '23505') { // Unique constraint violation (slug)
      return res.status(409).json({ success: false, message: 'A category with this name or slug already exists.' });
    }
    next(err);
  }
}

async function updateCategory(req, res, next) {
  try {
    const errors = validateCategory(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const updated = await categoryRepo.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Service category not found.' });
    }

    return res.json({
      success: true,
      message: 'Service category updated successfully.',
      data: updated,
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'A category with this name or slug already exists.' });
    }
    next(err);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const deleted = await categoryRepo.deleteCategory(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Service category not found.' });
    }
    return res.json({ success: true, message: 'Service category deleted successfully.' });
  } catch (err) {
    if (err.message.includes('it still contains service links')) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
}

module.exports = {
  getPublicCategories,
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
