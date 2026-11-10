const fs = require('fs');
const path = require('path');

const PARTIALS_DIR = path.join(__dirname, '../views/partials');
const PUBLIC_DIR = path.join(__dirname, '../../public');

const NAV_KEYS = ['home', 'services', 'downloads', 'news', 'blogs', 'about', 'contact'];

/**
 * Returns compiled header HTML with the given navigation tab marked active.
 * @param {string} activeKey e.g. 'home', 'services', 'downloads', 'news', 'blogs', 'about', 'contact'
 * @returns {string}
 */
function getHeader(activeKey = '') {
  const headerPath = path.join(PARTIALS_DIR, 'header.html');
  let header = fs.readFileSync(headerPath, 'utf8');

  for (const key of NAV_KEYS) {
    const isAct = key === activeKey.toLowerCase();
    const desktopClass = isAct ? 'active font-bold' : '';
    const mobileClass = isAct ? 'text-white bg-blue-900/60 font-bold' : 'text-blue-100 hover:bg-white/10';

    header = header.replace(new RegExp(`{{NAV_ACTIVE_${key.toUpperCase()}}}`, 'g'), desktopClass);
    header = header.replace(new RegExp(`{{MOB_ACTIVE_${key.toUpperCase()}}}`, 'g'), mobileClass);
  }

  return header;
}

/**
 * Returns compiled footer HTML.
 * @returns {string}
 */
function getFooter() {
  const footerPath = path.join(PARTIALS_DIR, 'footer.html');
  return fs.readFileSync(footerPath, 'utf8');
}

/**
 * Renders an HTML page from public/ by injecting the shared header and footer.
 * If SHARED_HEADER / SHARED_FOOTER placeholders are not found (e.g. legacy),
 * it returns the original file contents safely.
 * 
 * @param {string} filename Name of file in public directory (e.g. 'index.html')
 * @param {string} activeKey Navigation tab to mark active (e.g. 'home')
 * @returns {string}
 */
function renderPage(filename, activeKey = '') {
  const filePath = path.join(PUBLIC_DIR, filename);
  let html = fs.readFileSync(filePath, 'utf8');

  if (html.includes('<!-- SHARED_HEADER -->')) {
    html = html.replace('<!-- SHARED_HEADER -->', getHeader(activeKey));
  }

  if (html.includes('<!-- SHARED_FOOTER -->')) {
    html = html.replace('<!-- SHARED_FOOTER -->', getFooter());
  }

  return html;
}

module.exports = {
  getHeader,
  getFooter,
  renderPage,
};

