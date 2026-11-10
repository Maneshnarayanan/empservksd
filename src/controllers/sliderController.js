const sliderRepo = require('../repositories/sliderRepository');
const { deleteStoredFile } = require('../utils/storage');

async function getPublicSliders(req, res, next) {
  try {
    const sliders = await sliderRepo.findActive();
    const formatted = sliders.map((s) => ({
      ...s,
      image_url: `/storage/sliders/${s.image_filename}`,
    }));
    return res.json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    next(err);
  }
}

async function getAllSliders(req, res, next) {
  try {
    const { search } = req.query;
    const sliders = await sliderRepo.findAll({ onlyActive: false, search });
    const formatted = sliders.map((s) => ({
      ...s,
      image_url: `/storage/sliders/${s.image_filename}`,
    }));
    return res.json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    next(err);
  }
}

async function getSliderById(req, res, next) {
  try {
    const slider = await sliderRepo.findById(req.params.id);
    if (!slider) {
      return res.status(404).json({ success: false, message: 'Home slider not found.' });
    }
    return res.json({
      success: true,
      data: {
        ...slider,
        image_url: `/storage/sliders/${slider.image_filename}`,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function createSlider(req, res, next) {
  try {
    const { title, description, link_url, button_text, target_blank, display_order, is_active } = req.body;

    if (!title || !title.trim()) {
      if (req.file) deleteStoredFile('slider', req.file.filename);
      return res.status(400).json({ success: false, message: 'Slide title is required.' });
    }

    if (!link_url || !link_url.trim()) {
      if (req.file) deleteStoredFile('slider', req.file.filename);
      return res.status(400).json({ success: false, message: 'Destination link URL is required (e.g. /downloads, /news, /services).' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Slide banner image file is required.' });
    }

    const created = await sliderRepo.create({
      title: title.trim(),
      description: description ? description.trim() : null,
      image_filename: req.file.filename,
      original_filename: req.file.originalname,
      link_url: link_url.trim(),
      button_text: button_text ? button_text.trim() : 'View Details',
      target_blank: target_blank !== undefined ? String(target_blank) === 'true' : false,
      display_order: parseInt(display_order || '0', 10),
      is_active: is_active !== undefined ? String(is_active) === 'true' : true,
    });

    return res.status(201).json({
      success: true,
      message: 'Home slider created successfully.',
      data: {
        ...created,
        image_url: `/storage/sliders/${created.image_filename}`,
      },
    });
  } catch (err) {
    if (req.file) deleteStoredFile('slider', req.file.filename);
    next(err);
  }
}

async function updateSlider(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await sliderRepo.findById(id);
    if (!existing) {
      if (req.file) deleteStoredFile('slider', req.file.filename);
      return res.status(404).json({ success: false, message: 'Home slider not found.' });
    }

    const { title, description, link_url, button_text, target_blank, display_order, is_active } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (link_url !== undefined) updateData.link_url = link_url.trim();
    if (button_text !== undefined) updateData.button_text = button_text.trim();
    if (target_blank !== undefined) updateData.target_blank = String(target_blank) === 'true';
    if (display_order !== undefined) updateData.display_order = parseInt(display_order, 10);
    if (is_active !== undefined) updateData.is_active = String(is_active) === 'true';

    if (req.file) {
      updateData.image_filename = req.file.filename;
      updateData.original_filename = req.file.originalname;

      // Delete old stored image file if replaced
      if (existing.image_filename && existing.image_filename !== req.file.filename) {
        deleteStoredFile('slider', existing.image_filename);
      }
    }

    const updated = await sliderRepo.update(id, updateData);

    return res.json({
      success: true,
      message: 'Home slider updated successfully.',
      data: {
        ...updated,
        image_url: `/storage/sliders/${updated.image_filename}`,
      },
    });
  } catch (err) {
    if (req.file) deleteStoredFile('slider', req.file.filename);
    next(err);
  }
}

async function deleteSlider(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await sliderRepo.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Home slider not found.' });
    }

    await sliderRepo.deleteById(id);

    if (existing.image_filename) {
      deleteStoredFile('slider', existing.image_filename);
    }

    return res.json({
      success: true,
      message: 'Home slider deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPublicSliders,
  getAllSliders,
  getSliderById,
  createSlider,
  updateSlider,
  deleteSlider,
};

