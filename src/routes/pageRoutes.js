const express = require('express');
const path = require('path');
const router = express.Router();
const { renderPage } = require('../utils/layout');
const customPageRepo = require('../repositories/customPageRepository');
const { escapeHtml } = require('../utils/pageRenderer');

const PUBLIC_DIR = path.join(__dirname, '../../public');

// Disable HTML caching on public page routes so changes reflect instantly in browsers
router.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

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
router.get('/admin/sliders', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin/sliders.html')));
router.get('/admin/quick-links', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin/quick-links.html')));
router.get('/admin/pages', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin/pages.html')));
router.get('/admin/blogs', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin/blogs.html')));
router.get('/admin/blog-categories', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin/blog-categories.html')));
router.get('/admin/announcements', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin/announcements.html')));
router.get('/admin/settings', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'admin/settings.html')));

function buildSidebarHtml() {
  return `
    <aside class="lg:col-span-1 space-y-5">
      <div class="bg-white rounded-xl shadow-md border border-slate-200 p-2.5">
        <form onsubmit="event.preventDefault(); const q = (this.querySelector('input').value || '').trim(); if(q) window.location.href='/services?search=' + encodeURIComponent(q);" class="flex items-center gap-1 border border-slate-300 rounded-lg overflow-hidden focus-within:border-blue-900 focus-within:ring-1 focus-within:ring-blue-900 bg-white">
          <input type="text" placeholder="Search ..." class="w-full px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none">
          <button type="submit" class="bg-red-700 hover:bg-red-800 text-white px-3 py-1.5 text-xs font-bold flex items-center gap-1 shrink-0 transition cursor-pointer">
            <span>Search</span>
          </button>
        </form>
      </div>

      <div class="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div class="bg-slate-50 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
          <h4 class="font-extrabold text-xs uppercase tracking-wide text-slate-900 font-heading flex items-center gap-1.5">
            <span class="text-amber-500">★</span>
            <span>Popular Article</span>
          </h4>
          <span class="text-[10px] text-slate-500 font-mono">Trending</span>
        </div>
        <div id="sidebar-popular-articles-list" class="divide-y divide-slate-100 text-xs">
          <div class="px-3.5 py-3 text-slate-400 text-center">Loading...</div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div class="bg-slate-50 px-3.5 py-2 border-b border-slate-200 flex items-center justify-between">
          <h4 class="font-extrabold text-xs uppercase tracking-wide text-slate-900 font-heading flex items-center gap-1.5">
            <span>📥</span>
            <span>Latest Download</span>
          </h4>
          <a href="/downloads" class="text-[10px] text-blue-900 hover:underline font-bold">All &rarr;</a>
        </div>
        <div id="sidebar-latest-downloads-list" class="p-3 space-y-2.5 text-xs">
          <div class="py-3 text-slate-400 text-center">Loading...</div>
        </div>
      </div>
    </aside>
  `;
}

async function handleDynamicPage(req, res, next) {
  try {
    const slug = String(req.params.slug || '').normalize('NFC').trim().toLowerCase();
    if (!slug || customPageRepo.isReservedSlug(slug)) {
      return next();
    }

    const page = await customPageRepo.findBySlug(slug, { onlyPublished: true });
    if (!page) {
      return next();
    }

    let html = renderPage('custom-page.html', '');
    const containerClass = page.layout_mode === 'standard' ? 'max-w-5xl' : 'max-w-7xl';
    const hasHeroFirst = Array.isArray(page.blocks) && page.blocks.length > 0 && page.blocks[0].type === 'hero';

    const pageTitleHeader = !hasHeroFirst ? `
      <header class="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-6">
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 font-heading tracking-tight">${escapeHtml(page.title)}</h1>
        ${page.subtitle ? `<p class="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">${escapeHtml(page.subtitle)}</p>` : ''}
      </header>
    ` : '';

    const mainContent = `
      ${pageTitleHeader}
      <div class="custom-page-blocks">
        ${page.content_html || '<div class="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-sm">This page currently has no content blocks.</div>'}
      </div>
    `;

    const bodySlot = page.layout_mode === 'sidebar'
      ? `<div class="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
           <div class="lg:col-span-3 min-w-0">${mainContent}</div>
           ${buildSidebarHtml()}
         </div>`
      : mainContent;

    html = html
      .replace(/{{PAGE_TITLE}}/g, escapeHtml(page.title))
      .replace(/{{PAGE_META_DESC}}/g, escapeHtml(page.meta_description || page.subtitle || page.title))
      .replace(/{{PAGE_BREADCRUMB_TITLE}}/g, escapeHtml(page.title))
      .replace(/{{PAGE_CONTAINER_CLASS}}/g, containerClass)
      .replace('{{PAGE_BODY_SLOT}}', bodySlot);

    return res.send(html);
  } catch (err) {
    return next(err);
  }
}

// Dynamic Page Routes (canonical /p/:slug and clean top-level /:slug)
router.get('/p/:slug', handleDynamicPage);
router.get('/:slug', handleDynamicPage);

module.exports = router;
