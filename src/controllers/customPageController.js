const customPageRepo = require('../repositories/customPageRepository');
const { renderBlocksToHtml, sanitizePageHtml } = require('../utils/pageRenderer');

async function getPublicPages(req, res, next) {
  try {
    const pages = await customPageRepo.findAll({ onlyPublished: true });
    return res.json({
      success: true,
      data: pages.map(({ id, title, slug, subtitle, layout_mode, show_in_nav, updated_at }) => ({
        id,
        title,
        slug,
        subtitle,
        layout_mode,
        show_in_nav,
        updated_at,
      })),
    });
  } catch (err) {
    next(err);
  }
}

async function getNavPages(req, res, next) {
  try {
    const pages = await customPageRepo.findNavPages();
    return res.json({
      success: true,
      data: pages,
    });
  } catch (err) {
    next(err);
  }
}

async function getPublicPageBySlug(req, res, next) {
  try {
    const page = await customPageRepo.findBySlug(req.params.slug, { onlyPublished: true });
    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found.' });
    }
    return res.json({
      success: true,
      data: page,
    });
  } catch (err) {
    next(err);
  }
}

async function getAllPages(req, res, next) {
  try {
    const { search } = req.query;
    const pages = await customPageRepo.findAll({ onlyPublished: false, search });
    return res.json({
      success: true,
      data: pages,
    });
  } catch (err) {
    next(err);
  }
}

async function getPageById(req, res, next) {
  try {
    const page = await customPageRepo.findById(req.params.id);
    if (!page) {
      return res.status(404).json({ success: false, message: 'Custom page not found.' });
    }
    return res.json({
      success: true,
      data: page,
    });
  } catch (err) {
    next(err);
  }
}

async function createPage(req, res, next) {
  try {
    const {
      title,
      slug,
      subtitle,
      meta_description,
      layout_mode,
      blocks,
      content_html,
      show_in_nav,
      nav_order,
      is_published,
    } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({ success: false, message: 'Page title is required.' });
    }

    let parsedBlocks = blocks;
    if (typeof blocks === 'string') {
      try {
        parsedBlocks = JSON.parse(blocks);
      } catch {
        return res.status(400).json({ success: false, message: 'Invalid blocks JSON format.' });
      }
    }

    const created = await customPageRepo.create({
      title,
      slug,
      subtitle,
      meta_description,
      layout_mode,
      blocks: Array.isArray(parsedBlocks) ? parsedBlocks : [],
      content_html,
      show_in_nav,
      nav_order,
      is_published,
    });

    return res.status(201).json({
      success: true,
      message: 'Dynamic page created successfully.',
      data: created,
    });
  } catch (err) {
    next(err);
  }
}

async function updatePage(req, res, next) {
  try {
    const existing = await customPageRepo.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Custom page not found.' });
    }

    const {
      title,
      slug,
      subtitle,
      meta_description,
      layout_mode,
      blocks,
      content_html,
      show_in_nav,
      nav_order,
      is_published,
    } = req.body;

    if (title !== undefined && !String(title).trim()) {
      return res.status(400).json({ success: false, message: 'Page title cannot be empty.' });
    }

    let parsedBlocks = blocks;
    if (typeof blocks === 'string') {
      try {
        parsedBlocks = JSON.parse(blocks);
      } catch {
        return res.status(400).json({ success: false, message: 'Invalid blocks JSON format.' });
      }
    }

    const updated = await customPageRepo.update(req.params.id, {
      title,
      slug,
      subtitle,
      meta_description,
      layout_mode,
      blocks: parsedBlocks,
      content_html,
      show_in_nav,
      nav_order,
      is_published,
    });

    return res.json({
      success: true,
      message: 'Dynamic page updated successfully.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

async function deletePage(req, res, next) {
  try {
    const deleted = await customPageRepo.deleteById(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Custom page not found.' });
    }
    return res.json({
      success: true,
      message: 'Dynamic page deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
}

async function previewBlocks(req, res, next) {
  try {
    const { blocks, content_html } = req.body;
    const html = Array.isArray(blocks) && blocks.length > 0
      ? renderBlocksToHtml(blocks)
      : sanitizePageHtml(content_html || '');

    return res.json({
      success: true,
      html,
    });
  } catch (err) {
    next(err);
  }
}

async function uploadPageAsset(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided.' });
    }
    const assetUrl = `/storage/page-assets/${req.file.filename}`;
    return res.json({
      success: true,
      message: 'File uploaded successfully.',
      url: assetUrl,
      original_name: req.file.originalname,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPublicPages,
  getNavPages,
  getPublicPageBySlug,
  getAllPages,
  getPageById,
  createPage,
  updatePage,
  deletePage,
  previewBlocks,
  uploadPageAsset,
};

