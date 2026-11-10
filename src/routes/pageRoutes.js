const express = require('express');
const path = require('path');
const router = express.Router();
const { renderPage } = require('../utils/layout');

const PUBLIC_DIR = path.join(__dirname, '../../public');

// Public Pages with centralized Shared Layout
router.get('/', (req, res) => res.send(renderPage('index.html', 'home')));
router.get('/services', (req, res) => res.send(renderPage('services.html', 'services')));
router.get('/downloads', (req, res) => res.send(renderPage('downloads.html', 'downloads')));
router.get('/news', (req, res) => res.send(renderPage('news.html', 'news')));
router.get('/blogs', (req, res) => res.send(renderPage('blogs.html', 'blogs')));
router.get('/blogs/:slug', (req, res) => res.send(renderPage('blog-detail.html', 'blogs')));
router.get('/about', (req, res) => res.send(renderPage('about.html', 'about')));
router.get('/contact', (req, res) => res.send(renderPage('contact.html', 'contact')));
router.get('/privacy-policy', (req, res) => res.send(renderPage('privacy-policy.html', '')));

// Admin Pages
router.get('/admin', (req, res) => res.redirect('/admin/dashboard'));
router.get('/admin/login', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin/login.html')));
router.get('/admin/dashboard', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin/dashboard.html')));
router.get('/admin/services', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin/services.html')));
router.get('/admin/service-categories', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin/service-categories.html')));
router.get('/admin/downloads', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin/downloads.html')));
router.get('/admin/news', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin/news.html')));
router.get('/admin/blogs', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin/blogs.html')));
router.get('/admin/blog-categories', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin/blog-categories.html')));
router.get('/admin/announcements', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin/announcements.html')));
router.get('/admin/settings', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin/settings.html')));

module.exports = router;
