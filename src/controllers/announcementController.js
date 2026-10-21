const announcementRepo = require('../repositories/announcementRepository');
const settingsRepo = require('../repositories/settingsRepository');

async function getPublicAnnouncements(req, res, next) {
  try {
    const isTickerEnabled = await settingsRepo.getSetting('ticker_enabled');
    if (isTickerEnabled === 'false') {
      return res.json({ success: true, enabled: false, data: [] });
    }
    const announcements = await announcementRepo.findAll(true);
    return res.json({ success: true, enabled: true, data: announcements });
  } catch (err) {
    next(err);
  }
}

async function getAllAnnouncements(req, res, next) {
  try {
    const announcements = await announcementRepo.findAll(false);
    const isTickerEnabled = await settingsRepo.getSetting('ticker_enabled');
    return res.json({ success: true, enabled: isTickerEnabled !== 'false', data: announcements });
  } catch (err) {
    next(err);
  }
}

async function getAnnouncementById(req, res, next) {
  try {
    const item = await announcementRepo.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }
    return res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

async function createAnnouncement(req, res, next) {
  try {
    const { title, message, link_url, type, display_order, is_active } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Announcement title is required.' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Announcement message is required.' });
    }

    const created = await announcementRepo.create({
      title,
      message,
      link_url,
      type,
      display_order,
      is_active,
    });

    return res.status(201).json({
      success: true,
      message: 'Announcement created successfully.',
      data: created,
    });
  } catch (err) {
    next(err);
  }
}

async function updateAnnouncement(req, res, next) {
  try {
    const { title, message, link_url, type, display_order, is_active } = req.body;
    if (title !== undefined && !title.trim()) {
      return res.status(400).json({ success: false, message: 'Announcement title cannot be empty.' });
    }
    if (message !== undefined && !message.trim()) {
      return res.status(400).json({ success: false, message: 'Announcement message cannot be empty.' });
    }

    const updated = await announcementRepo.update(req.params.id, {
      title,
      message,
      link_url,
      type,
      display_order,
      is_active,
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    return res.json({
      success: true,
      message: 'Announcement updated successfully.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

async function deleteAnnouncement(req, res, next) {
  try {
    const deleted = await announcementRepo.deleteAnnouncement(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }
    return res.json({ success: true, message: 'Announcement deleted successfully.' });
  } catch (err) {
    next(err);
  }
}

async function toggleTickerStatus(req, res, next) {
  try {
    const { enabled } = req.body;
    const value = enabled === true || enabled === 'true' ? 'true' : 'false';
    await settingsRepo.updateSetting('ticker_enabled', value, 'Enable or disable the top announcement ticker banner');
    return res.json({ success: true, message: `Announcement ticker banner ${value === 'true' ? 'enabled' : 'disabled'}.` });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPublicAnnouncements,
  getAllAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleTickerStatus,
};
