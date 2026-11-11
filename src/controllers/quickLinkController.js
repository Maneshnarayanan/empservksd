const quickLinkRepo = require('../repositories/quickLinkRepository');

async function getPublicQuickLinks(req, res, next) {
  try {
    const links = await quickLinkRepo.findActive();
    return res.json({
      success: true,
      data: links,
    });
  } catch (err) {
    next(err);
  }
}

async function getAllQuickLinks(req, res, next) {
  try {
    const { search } = req.query;
    const links = await quickLinkRepo.findAll({ onlyActive: false, search });
    return res.json({
      success: true,
      data: links,
    });
  } catch (err) {
    next(err);
  }
}

async function getQuickLinkById(req, res, next) {
  try {
    const link = await quickLinkRepo.findById(req.params.id);
    if (!link) {
      return res.status(404).json({ success: false, message: 'Quick link not found.' });
    }
    return res.json({
      success: true,
      data: link,
    });
  } catch (err) {
    next(err);
  }
}

async function createQuickLink(req, res, next) {
  try {
    const { title, url, badge_text, target_blank, display_order, is_active } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Title is required.' });
    }

    if (!url || !url.trim()) {
      return res.status(400).json({ success: false, message: 'Destination URL is required.' });
    }

    const created = await quickLinkRepo.create({
      title: title.trim(),
      url: url.trim(),
      badge_text: badge_text ? badge_text.trim() : null,
      target_blank: target_blank === 'true' || target_blank === true,
      display_order: Number.parseInt(display_order, 10) || 0,
      is_active: is_active === undefined ? true : is_active === 'true' || is_active === true,
    });

    return res.status(201).json({
      success: true,
      message: 'Quick link created successfully.',
      data: created,
    });
  } catch (err) {
    next(err);
  }
}

async function updateQuickLink(req, res, next) {
  try {
    const existing = await quickLinkRepo.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Quick link not found.' });
    }

    const { title, url, badge_text, target_blank, display_order, is_active } = req.body;

    const fields = {};
    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ success: false, message: 'Title cannot be empty.' });
      }
      fields.title = title.trim();
    }

    if (url !== undefined) {
      if (!url.trim()) {
        return res.status(400).json({ success: false, message: 'Destination URL cannot be empty.' });
      }
      fields.url = url.trim();
    }

    if (badge_text !== undefined) {
      fields.badge_text = badge_text ? badge_text.trim() : null;
    }

    if (target_blank !== undefined) {
      fields.target_blank = target_blank === 'true' || target_blank === true;
    }

    if (display_order !== undefined) {
      fields.display_order = Number.parseInt(display_order, 10) || 0;
    }

    if (is_active !== undefined) {
      fields.is_active = is_active === 'true' || is_active === true;
    }

    const updated = await quickLinkRepo.update(req.params.id, fields);

    return res.json({
      success: true,
      message: 'Quick link updated successfully.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

async function deleteQuickLink(req, res, next) {
  try {
    const existing = await quickLinkRepo.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Quick link not found.' });
    }

    await quickLinkRepo.deleteById(req.params.id);

    return res.json({
      success: true,
      message: 'Quick link deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPublicQuickLinks,
  getAllQuickLinks,
  getQuickLinkById,
  createQuickLink,
  updateQuickLink,
  deleteQuickLink,
};

