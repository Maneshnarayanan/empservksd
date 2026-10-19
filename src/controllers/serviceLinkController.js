const linkRepo = require('../repositories/serviceLinkRepository');
const { validateServiceLink } = require('../validators/serviceValidator');

async function getPublicLinks(req, res, next) {
  try {
    const { categoryId, search } = req.query;
    const links = await linkRepo.findAll({
      categoryId,
      search,
      onlyActive: true,
    });
    return res.json({ success: true, data: links });
  } catch (err) {
    next(err);
  }
}

async function getAllLinks(req, res, next) {
  try {
    const { categoryId, search } = req.query;
    const links = await linkRepo.findAll({
      categoryId,
      search,
      onlyActive: false,
    });
    return res.json({ success: true, data: links });
  } catch (err) {
    next(err);
  }
}

async function getLinkById(req, res, next) {
  try {
    const link = await linkRepo.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ success: false, message: 'Service link not found.' });
    }
    return res.json({ success: true, data: link });
  } catch (err) {
    next(err);
  }
}

async function createLink(req, res, next) {
  try {
    const errors = validateServiceLink(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const created = await linkRepo.create(req.body);
    return res.status(201).json({
      success: true,
      message: 'Service link created successfully.',
      data: created,
    });
  } catch (err) {
    next(err);
  }
}

async function updateLink(req, res, next) {
  try {
    const errors = validateServiceLink(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ success: false, errors });
    }

    const updated = await linkRepo.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Service link not found.' });
    }

    return res.json({
      success: true,
      message: 'Service link updated successfully.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

async function deleteLink(req, res, next) {
  try {
    const deleted = await linkRepo.deleteServiceLink(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Service link not found.' });
    }
    return res.json({ success: true, message: 'Service link deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPublicLinks,
  getAllLinks,
  getLinkById,
  createLink,
  updateLink,
  deleteLink,
};
