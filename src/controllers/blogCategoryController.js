const blogCatRepo = require('../repositories/blogCategoryRepository');
const { validateBlogCategory } = require('../validators/blogValidator');

async function getPublicBlogCategories(req, res, next) {
  try {
    const categories = await blogCatRepo.findAll();
    return res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}

async function getAllBlogCategories(req, res, next) {
  try {
    const categories = await blogCatRepo.findAll();
    return res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}

async function getBlogCategoryById(req, res, next) {
  try {
    const category = await blogCatRepo.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Blog category not found.' });
    }
    return res.json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

async function createBlogCategory(req, res, next) {
  try {
    const errors = validateBlogCategory(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const created = await blogCatRepo.create(req.body);
    return res.status(201).json({
      success: true,
      message: 'Blog category created successfully.',
      data: created,
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'A blog category with this name or slug already exists.' });
    }
    next(err);
  }
}

async function updateBlogCategory(req, res, next) {
  try {
    const errors = validateBlogCategory(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const updated = await blogCatRepo.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Blog category not found.' });
    }

    return res.json({
      success: true,
      message: 'Blog category updated successfully.',
      data: updated,
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'A blog category with this name or slug already exists.' });
    }
    next(err);
  }
}

async function deleteBlogCategory(req, res, next) {
  try {
    const deleted = await blogCatRepo.deleteBlogCategory(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Blog category not found.' });
    }
    return res.json({ success: true, message: 'Blog category deleted successfully.' });
  } catch (err) {
    if (err.message.includes('it still contains blog articles')) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
}

module.exports = {
  getPublicBlogCategories,
  getAllBlogCategories,
  getBlogCategoryById,
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
};
