const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const BASE_STORAGE_DIR = path.resolve(process.env.STORAGE_DIR || './storage');
const DOWNLOADS_DIR = path.join(BASE_STORAGE_DIR, 'downloads');
const BLOG_IMAGES_DIR = path.join(BASE_STORAGE_DIR, 'blog-images');
const NEWS_POSTERS_DIR = path.join(BASE_STORAGE_DIR, 'news-posters');

// Ensure storage subdirectories exist
[BASE_STORAGE_DIR, DOWNLOADS_DIR, BLOG_IMAGES_DIR, NEWS_POSTERS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Allowed file configurations
const ALLOWED_DOWNLOAD_TYPES = {
  '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.zip': 'application/zip',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.txt': 'text/plain',
};

const ALLOWED_IMAGE_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

function generateSafeFilename(originalName) {
  const ext = path.extname(originalName).toLowerCase();
  const uuid = crypto.randomUUID();
  return `${uuid}${ext}`;
}

function getSafeFilePath(type, filename) {
  let dir = DOWNLOADS_DIR;
  if (type === 'blog-image') dir = BLOG_IMAGES_DIR;
  else if (type === 'news-poster') dir = NEWS_POSTERS_DIR;

  // Prevent path traversal
  const safeName = path.basename(filename);
  const fullPath = path.resolve(dir, safeName);

  if (!fullPath.startsWith(dir)) {
    throw new Error('Security Error: Path traversal attempt detected.');
  }

  return fullPath;
}

function deleteStoredFile(type, filename) {
  if (!filename) return;
  try {
    const fullPath = getSafeFilePath(type, filename);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (err) {
    console.warn(`Warning: Could not remove stored file ${filename}:`, err.message);
  }
}

module.exports = {
  BASE_STORAGE_DIR,
  DOWNLOADS_DIR,
  BLOG_IMAGES_DIR,
  NEWS_POSTERS_DIR,
  ALLOWED_DOWNLOAD_TYPES,
  ALLOWED_IMAGE_TYPES,
  generateSafeFilename,
  getSafeFilePath,
  deleteStoredFile,
};
