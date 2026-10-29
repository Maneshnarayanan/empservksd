const newsRepo = require('../repositories/newsPosterRepository');
const { deleteStoredFile } = require('../utils/storage');

async function getPublicNews(req, res, next) {
  try {
    const { search } = req.query;
    const posters = await newsRepo.findAll({ onlyActive: true, search });
    const formatted = posters.map(p => ({
      ...p,
      image_url: `/storage/news-posters/${p.image_filename}`,
    }));
    return res.json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
}

async function getHomeNews(req, res, next) {
  try {
    const posters = await newsRepo.getHomePosters({ limit: 3 });
    const formatted = posters.map(p => ({
      ...p,
      image_url: `/storage/news-posters/${p.image_filename}`,
    }));
    return res.json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
}

async function getLatestNews(req, res, next) {
  try {
    const latest = await newsRepo.getLatest();
    if (!latest) {
      return res.json({ success: true, data: null });
    }
    return res.json({
      success: true,
      data: {
        ...latest,
        image_url: `/storage/news-posters/${latest.image_filename}`,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getAllNews(req, res, next) {
  try {
    const { search } = req.query;
    const posters = await newsRepo.findAll({ onlyActive: false, search });
    const formatted = posters.map(p => ({
      ...p,
      image_url: `/storage/news-posters/${p.image_filename}`,
    }));
    return res.json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
}

async function getNewsById(req, res, next) {
  try {
    const poster = await newsRepo.findById(req.params.id);
    if (!poster) {
      return res.status(404).json({ success: false, message: 'News poster not found.' });
    }
    return res.json({
      success: true,
      data: {
        ...poster,
        image_url: `/storage/news-posters/${poster.image_filename}`,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function createNews(req, res, next) {
  try {
    const { title, caption, description, display_order, is_active, is_home_published, published_date } = req.body;

    if (!title || !title.trim()) {
      if (req.file) deleteStoredFile('news-poster', req.file.filename);
      return res.status(400).json({ success: false, message: 'News title is required.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'News poster image file is required.' });
    }

    const isHome = is_home_published !== undefined ? String(is_home_published) === 'true' : false;

    if (isHome) {
      const homeCount = await newsRepo.countHomePublished();
      if (homeCount >= 3) {
        if (req.file) deleteStoredFile('news-poster', req.file.filename);
        return res.status(400).json({
          success: false,
          message: 'Maximum 3 news posters can be published on the Home Page at a time. Please uncheck another poster first.',
        });
      }
    }

    const created = await newsRepo.create({
      title: title.trim(),
      caption: caption ? caption.trim() : null,
      description: description ? description.trim() : null,
      image_filename: req.file.filename,
      original_filename: req.file.originalname,
      display_order: isHome ? parseInt(display_order || 1, 10) : 0,
      is_active: is_active !== undefined ? String(is_active) === 'true' : true,
      is_home_published: isHome,
      published_date: published_date || null,
    });

    return res.status(201).json({
      success: true,
      message: 'News poster uploaded successfully.',
      data: {
        ...created,
        image_url: `/storage/news-posters/${created.image_filename}`,
      },
    });
  } catch (err) {
    if (req.file) deleteStoredFile('news-poster', req.file.filename);
    next(err);
  }
}

async function updateNews(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await newsRepo.findById(id);
    if (!existing) {
      if (req.file) deleteStoredFile('news-poster', req.file.filename);
      return res.status(404).json({ success: false, message: 'News poster not found.' });
    }

    const { title, caption, description, display_order, is_active, is_home_published, published_date } = req.body;

    const willBeHome = is_home_published !== undefined ? String(is_home_published) === 'true' : existing.is_home_published;

    if (willBeHome && !existing.is_home_published) {
      const homeCount = await newsRepo.countHomePublished(id);
      if (homeCount >= 3) {
        if (req.file) deleteStoredFile('news-poster', req.file.filename);
        return res.status(400).json({
          success: false,
          message: 'Maximum 3 news posters can be published on the Home Page at a time. Please uncheck another poster first.',
        });
      }
    }

    let image_filename = existing.image_filename;
    let original_filename = existing.original_filename;

    if (req.file) {
      image_filename = req.file.filename;
      original_filename = req.file.originalname;
      deleteStoredFile('news-poster', existing.image_filename);
    }

    const updated = await newsRepo.update(id, {
      title: title !== undefined ? title.trim() : existing.title,
      caption: caption !== undefined ? (caption ? caption.trim() : null) : existing.caption,
      description: description !== undefined ? (description ? description.trim() : null) : existing.description,
      image_filename,
      original_filename,
      display_order: willBeHome ? (display_order !== undefined ? parseInt(display_order, 10) : existing.display_order || 1) : 0,
      is_active: is_active !== undefined ? String(is_active) === 'true' : existing.is_active,
      is_home_published: willBeHome,
      published_date: published_date || existing.published_date,
    });

    return res.json({
      success: true,
      message: 'News poster updated successfully.',
      data: {
        ...updated,
        image_url: `/storage/news-posters/${updated.image_filename}`,
      },
    });
  } catch (err) {
    if (req.file) deleteStoredFile('news-poster', req.file.filename);
    next(err);
  }
}

async function deleteNews(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await newsRepo.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'News poster not found.' });
    }

    deleteStoredFile('news-poster', existing.image_filename);
    await newsRepo.deletePoster(id);

    return res.json({
      success: true,
      message: 'News poster deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPublicNews,
  getHomeNews,
  getLatestNews,
  getAllNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
};
