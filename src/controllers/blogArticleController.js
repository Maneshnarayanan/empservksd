const path = require('path');
const blogArticleRepo = require('../repositories/blogArticleRepository');
const { validateBlogArticle } = require('../validators/blogValidator');
const { deleteStoredFile } = require('../utils/storage');

async function getPublicArticles(req, res, next) {
  try {
    const { category, categoryId, search, page, limit } = req.query;
    const result = await blogArticleRepo.findAll({
      onlyPublished: true,
      categorySlug: category,
      categoryId,
      search,
      page: page || 1,
      limit: limit || 10,
    });
    return res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

async function getPublicArticleBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const article = await blogArticleRepo.findBySlug(slug, true);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found or not yet published.',
      });
    }
    return res.json({ success: true, data: article });
  } catch (err) {
    next(err);
  }
}

async function getAllArticles(req, res, next) {
  try {
    const { categoryId, search, page, limit } = req.query;
    const result = await blogArticleRepo.findAll({
      onlyPublished: false,
      categoryId,
      search,
      page: page || 1,
      limit: limit || 20,
    });
    return res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

async function getArticleById(req, res, next) {
  try {
    const article = await blogArticleRepo.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }
    return res.json({ success: true, data: article });
  } catch (err) {
    next(err);
  }
}

async function createArticle(req, res, next) {
  try {
    const payload = { ...req.body };
    if (req.file) {
      payload.featured_image = `/storage/blog-images/${req.file.filename}`;
    }

    const errors = validateBlogArticle(payload, true);
    if (errors.length > 0) {
      if (req.file) deleteStoredFile('blog-image', req.file.filename);
      return res.status(400).json({ success: false, errors });
    }

    payload.created_by = req.session ? req.session.adminId : null;

    const created = await blogArticleRepo.create(payload);
    return res.status(201).json({
      success: true,
      message: 'Blog article created successfully.',
      data: created,
    });
  } catch (err) {
    if (req.file) deleteStoredFile('blog-image', req.file.filename);
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'An article with this title or slug already exists.' });
    }
    next(err);
  }
}

async function updateArticle(req, res, next) {
  try {
    const existing = await blogArticleRepo.findById(req.params.id);
    if (!existing) {
      if (req.file) deleteStoredFile('blog-image', req.file.filename);
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }

    const payload = { ...req.body };
    if (req.file) {
      payload.featured_image = `/storage/blog-images/${req.file.filename}`;
    }

    const errors = validateBlogArticle(payload, false);
    if (errors.length > 0) {
      if (req.file) deleteStoredFile('blog-image', req.file.filename);
      return res.status(400).json({ success: false, errors });
    }

    const updated = await blogArticleRepo.update(req.params.id, payload);

    // Clean up old image if replaced
    if (req.file && existing.featured_image) {
      const oldFilename = path.basename(existing.featured_image);
      deleteStoredFile('blog-image', oldFilename);
    }

    return res.json({
      success: true,
      message: 'Blog article updated successfully.',
      data: updated,
    });
  } catch (err) {
    if (req.file) deleteStoredFile('blog-image', req.file.filename);
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'An article with this title or slug already exists.' });
    }
    next(err);
  }
}

async function setPublication(req, res, next) {
  try {
    const { publish } = req.body;
    const isPublish = publish === true || publish === 'true';
    const updated = await blogArticleRepo.setPublicationStatus(req.params.id, isPublish);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }
    return res.json({
      success: true,
      message: isPublish ? 'Article published successfully.' : 'Article set to draft.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

async function deleteArticle(req, res, next) {
  try {
    const deleted = await blogArticleRepo.deleteBlogArticle(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Article not found.' });
    }

    if (deleted.featured_image) {
      const filename = path.basename(deleted.featured_image);
      deleteStoredFile('blog-image', filename);
    }

    return res.json({ success: true, message: 'Article deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

async function uploadImageOnly(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }
    const imageUrl = `/storage/blog-images/${req.file.filename}`;
    return res.json({
      success: true,
      message: 'Image uploaded successfully.',
      url: imageUrl,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPublicArticles,
  getPublicArticleBySlug,
  getAllArticles,
  getArticleById,
  createArticle,
  updateArticle,
  setPublication,
  deleteArticle,
  uploadImageOnly,
};
