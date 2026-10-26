const multer = require('multer');
const path = require('path');
const {
  DOWNLOADS_DIR,
  BLOG_IMAGES_DIR,
  ALLOWED_DOWNLOAD_TYPES,
  ALLOWED_IMAGE_TYPES,
  generateSafeFilename,
} = require('../utils/storage');

// Configure disk storage for Downloads
const downloadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DOWNLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const safeName = generateSafeFilename(file.originalname);
    cb(null, safeName);
  },
});

function downloadFileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMime = ALLOWED_DOWNLOAD_TYPES[ext];

  if (!allowedMime) {
    return cb(new Error(`File extension "${ext}" is not permitted for upload. Allowed extensions: ${Object.keys(ALLOWED_DOWNLOAD_TYPES).join(', ')}`), false);
  }

  cb(null, true);
}

const uploadDownload = multer({
  storage: downloadStorage,
  limits: {
    fileSize: parseInt(process.env.MAX_UPLOAD_SIZE_BYTES || '15728640', 10), // 15MB
  },
  fileFilter: downloadFileFilter,
});

// Configure disk storage for Blog Images
const blogImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, BLOG_IMAGES_DIR);
  },
  filename: (req, file, cb) => {
    const safeName = generateSafeFilename(file.originalname);
    cb(null, safeName);
  },
});

function blogImageFileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMime = ALLOWED_IMAGE_TYPES[ext];

  if (!allowedMime || (!file.mimetype.startsWith('image/') && file.mimetype !== 'image/svg+xml')) {
    return cb(new Error('Only JPEG, PNG, WebP, and SVG images are permitted.'), false);
  }

  cb(null, true);
}

const uploadBlogImage = multer({
  storage: blogImageStorage,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB limit
  },
  fileFilter: blogImageFileFilter,
});

// Configure disk storage for News Posters
const newsPosterStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { NEWS_POSTERS_DIR } = require('../utils/storage');
    cb(null, NEWS_POSTERS_DIR);
  },
  filename: (req, file, cb) => {
    const safeName = generateSafeFilename(file.originalname);
    cb(null, safeName);
  },
});

const uploadNewsPoster = multer({
  storage: newsPosterStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for high-res posters
  },
  fileFilter: blogImageFileFilter,
});

module.exports = {
  uploadDownload,
  uploadBlogImage,
  uploadNewsPoster,
};
