const fs = require('fs');
const path = require('path');
const downloadRepo = require('../repositories/downloadRepository');
const { validateDownload } = require('../validators/downloadValidator');
const { getSafeFilePath, deleteStoredFile } = require('../utils/storage');

async function getPublicDownloads(req, res, next) {
  try {
    const { category, search } = req.query;
    const downloads = await downloadRepo.findAll({
      onlyActive: true,
      category,
      search,
    });
    return res.json({ success: true, data: downloads });
  } catch (err) {
    next(err);
  }
}

async function getAllDownloads(req, res, next) {
  try {
    const { category, search } = req.query;
    const downloads = await downloadRepo.findAll({
      onlyActive: false,
      category,
      search,
    });
    return res.json({ success: true, data: downloads });
  } catch (err) {
    next(err);
  }
}

async function getDownloadById(req, res, next) {
  try {
    const download = await downloadRepo.findById(req.params.id);
    if (!download) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }
    return res.json({ success: true, data: download });
  } catch (err) {
    next(err);
  }
}

async function downloadFile(req, res, next) {
  try {
    const download = await downloadRepo.findById(req.params.id);
    if (!download) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    // If resource is inactive and user is not an administrator
    const isAdmin = req.session && req.session.adminId;
    if (!download.is_active && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'This resource is currently unavailable for download.',
      });
    }

    const filePath = getSafeFilePath('download', download.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'The requested file could not be found on storage.',
      });
    }

    // Increment count asynchronously
    downloadRepo.incrementDownloadCount(download.id).catch(() => {});

    // Set appropriate headers and send file safely
    res.setHeader('Content-Type', download.mime_type || 'application/octet-stream');
    res.download(filePath, download.original_filename);
  } catch (err) {
    next(err);
  }
}

async function createDownload(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'A file is required for upload.' });
    }

    const errors = validateDownload(req.body, true);
    if (errors.length > 0) {
      // Clean up uploaded file if validation failed
      deleteStoredFile('download', req.file.filename);
      return res.status(400).json({ success: false, errors });
    }

    const record = await downloadRepo.create({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      filename: req.file.filename,
      original_filename: req.file.originalname,
      mime_type: req.file.mimetype,
      file_size: req.file.size,
      is_active: req.body.is_active !== undefined ? req.body.is_active === 'true' || req.body.is_active === true : true,
    });

    return res.status(201).json({
      success: true,
      message: 'Download resource uploaded and created successfully.',
      data: record,
    });
  } catch (err) {
    if (req.file) {
      deleteStoredFile('download', req.file.filename);
    }
    next(err);
  }
}

async function updateDownload(req, res, next) {
  try {
    const existing = await downloadRepo.findById(req.params.id);
    if (!existing) {
      if (req.file) deleteStoredFile('download', req.file.filename);
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    const errors = validateDownload(req.body, false);
    if (errors.length > 0) {
      if (req.file) deleteStoredFile('download', req.file.filename);
      return res.status(400).json({ success: false, errors });
    }

    const updatePayload = {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      is_active: req.body.is_active !== undefined ? (req.body.is_active === 'true' || req.body.is_active === true) : undefined,
    };

    // If new file is uploaded to replace existing
    if (req.file) {
      updatePayload.filename = req.file.filename;
      updatePayload.original_filename = req.file.originalname;
      updatePayload.mime_type = req.file.mimetype;
      updatePayload.file_size = req.file.size;
    }

    const updated = await downloadRepo.update(req.params.id, updatePayload);

    // If replacement succeeded, remove old file from disk
    if (req.file && existing.filename && existing.filename !== req.file.filename) {
      deleteStoredFile('download', existing.filename);
    }

    return res.json({
      success: true,
      message: 'Resource updated successfully.',
      data: updated,
    });
  } catch (err) {
    if (req.file) deleteStoredFile('download', req.file.filename);
    next(err);
  }
}

async function deleteDownload(req, res, next) {
  try {
    const deleted = await downloadRepo.deleteDownload(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Resource not found.' });
    }

    // Remove file from disk
    deleteStoredFile('download', deleted.filename);

    return res.json({ success: true, message: 'Resource removed successfully.' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPublicDownloads,
  getAllDownloads,
  getDownloadById,
  downloadFile,
  createDownload,
  updateDownload,
  deleteDownload,
};
