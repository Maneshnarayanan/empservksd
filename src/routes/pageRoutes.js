const express = require('express');
const path = require('path');
const router = express.Router();

const PUBLIC_DIR = path.join(__dirname, '../../public');

// Public Pages
router.get('/', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));
router.get('/services', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'services.html')));
router.get('/downloads', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'downloads.html')));
router.get('/blogs', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'blogs.html')));
router.get('/blogs/:slug', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'blog-detail.html')));
router.get('/about', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'about.html')));
router.get('/contact', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'contact.html')));
router.get('/privacy-policy', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'privacy-policy.html')));

// Admin Pages
router.get('/admin', (req, res) => res.redirect('/admin/dashboard'));
router.get('/admin/login', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin/login.html')));
router.get('/admin/dashboard', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin/dashboard.html')));
router.get('/admin/services', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin/services.html')));
router.get('/admin/service-categories', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin/service-categories.html')));
router.get('/admin/downloads', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin/downloads.html')));
router.get('/admin/blogs', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin/blogs.html')));
router.get('/admin/blog-categories', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin/blog-categories.html')));
router.get('/admin/settings', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin/settings.html')));

module.exports = router;
