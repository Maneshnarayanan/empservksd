/**
 * main.js - Core frontend client logic for employeeserviceksd.com
 */

// CSRF Token Cache
let cachedCsrfToken = null;

async function getCsrfToken() {
  if (cachedCsrfToken) return cachedCsrfToken;
  try {
    const res = await fetch('/api/v1/csrf-token');
    if (res.ok) {
      const data = await res.json();
      cachedCsrfToken = data.csrfToken;
      return cachedCsrfToken;
    }
  } catch (err) {
    console.error('Failed to retrieve CSRF token:', err);
  }
  return null;
}

// Fetch with automatic CSRF token inclusion for mutating methods
async function apiFetch(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const headers = options.headers ? { ...options.headers } : {};

  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const token = await getCsrfToken();
    if (token) {
      headers['X-CSRF-Token'] = token;
    }
  }

  const response = await fetch(url, { ...options, headers });
  return response;
}

// Global Toast Notification Helper
function showToast(message, type = 'info') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm';
    document.body.appendChild(toastContainer);
  }

  const colors = {
    success: 'bg-emerald-700 text-white border-emerald-800',
    error: 'bg-rose-700 text-white border-rose-800',
    warning: 'bg-amber-600 text-white border-amber-700',
    info: 'bg-slate-800 text-white border-slate-900',
  };

  const toast = document.createElement('div');
  toast.className = `p-4 rounded-lg shadow-lg border text-sm font-medium transition-all transform duration-300 translate-y-2 opacity-0 flex items-center justify-between gap-3 ${colors[type] || colors.info}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button class="text-white hover:text-slate-200 text-lg font-bold leading-none" onclick="this.parentElement.remove()">&times;</button>
  `;

  toastContainer.appendChild(toast);
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Mobile Navigation Toggle
function initMobileNav() {
  const toggleBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (toggleBtn && mobileMenu) {
    toggleBtn.addEventListener('click', () => {
      const isHidden = mobileMenu.classList.contains('hidden');
      if (isHidden) {
        mobileMenu.classList.remove('hidden');
        toggleBtn.setAttribute('aria-expanded', 'true');
      } else {
        mobileMenu.classList.add('hidden');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

// Utility: format byte size to KB/MB
function formatBytes(bytes, decimals = 2) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Utility: format ISO date to readable string
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Announcement Banner & Ticker Controller
async function initAnnouncementTicker() {
  if (window.location.pathname.startsWith('/admin')) return;
  if (sessionStorage.getItem('esksd_ticker_dismissed') === 'true') return;

  try {
    const res = await fetch('/api/v1/announcements');
    if (!res.ok) return;
    const result = await res.json();
    if (!result.success || !result.enabled || !Array.isArray(result.data) || result.data.length === 0) {
      return;
    }

    const announcements = result.data;
    renderAnnouncementBanner(announcements);
  } catch (err) {
    console.error('Failed to load announcements ticker:', err);
  }
}

function renderAnnouncementBanner(items) {
  if (document.getElementById('site-announcement-banner')) return;

  const banner = document.createElement('div');
  banner.id = 'site-announcement-banner';
  banner.className = 'bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-950 text-white border-b border-emerald-500/30 shadow-md relative z-30 transition-all duration-300';

  const badgeHtml = `
    <div class="flex items-center gap-2 shrink-0">
      <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-600 text-white shadow-sm uppercase tracking-wider animate-pulse">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
        Updates
      </span>
    </div>
  `;

  banner.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3 text-xs">
      ${badgeHtml}
      <div class="flex-grow overflow-hidden relative min-h-[24px] flex items-center mx-2" id="ticker-slider-container">
        <div id="ticker-slide-content" class="w-full flex items-center transition-all duration-300"></div>
      </div>
      <div class="flex items-center gap-1.5 shrink-0 text-slate-400">
        <button id="ticker-prev-btn" title="Previous update" class="p-1 hover:text-white hover:bg-white/10 rounded transition">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <span id="ticker-counter" class="text-[10px] font-mono text-slate-400 px-1 select-none">1/${items.length}</span>
        <button id="ticker-next-btn" title="Next update" class="p-1 hover:text-white hover:bg-white/10 rounded transition">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
        <button id="ticker-close-btn" title="Dismiss banner" class="ml-1 p-1 hover:text-rose-400 hover:bg-white/10 rounded transition">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
    </div>
  `;

  const nav = document.querySelector('nav');
  if (nav && nav.parentNode) {
    nav.parentNode.insertBefore(banner, nav);
  } else {
    document.body.insertBefore(banner, document.body.firstChild);
  }

  let currentIndex = 0;
  let tickerTimer = null;
  const slideContent = document.getElementById('ticker-slide-content');
  const counterEl = document.getElementById('ticker-counter');

  function getTypeStyle(type) {
    switch (type) {
      case 'urgent':
        return { tag: 'URGENT', cls: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
      case 'warning':
        return { tag: 'NOTICE', cls: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
      case 'info':
        return { tag: 'INFO', cls: 'bg-sky-500/20 text-sky-300 border-sky-500/40' };
      case 'success':
        return { tag: 'UPDATE', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' };
      default:
        return { tag: 'CIRCULAR', cls: 'bg-slate-500/20 text-slate-300 border-slate-500/40' };
    }
  }

  function showSlide(index) {
    const item = items[index];
    if (!item) return;

    slideContent.style.opacity = '0';
    slideContent.style.transform = 'translateY(4px)';

    setTimeout(() => {
      const typeStyle = getTypeStyle(item.type);
      const linkHtml = item.link_url
        ? `<a href="${item.link_url}" ${item.link_url.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''} class="text-emerald-300 hover:text-white font-semibold underline underline-offset-2 ml-2 transition inline-flex items-center gap-0.5">View &rarr;</a>`
        : '';

      slideContent.innerHTML = `
        <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap overflow-hidden">
          <span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border ${typeStyle.cls} uppercase tracking-wider shrink-0">${typeStyle.tag}</span>
          <span class="font-bold text-white shrink-0">${item.title}:</span>
          <span class="text-slate-200 truncate font-light">${item.message}</span>
          ${linkHtml}
        </div>
      `;

      counterEl.textContent = `${index + 1}/${items.length}`;
      slideContent.style.opacity = '1';
      slideContent.style.transform = 'translateY(0)';
    }, 150);
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % items.length;
    showSlide(currentIndex);
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + items.length) % items.length;
    showSlide(currentIndex);
  }

  function startTimer() {
    if (items.length > 1) {
      clearInterval(tickerTimer);
      tickerTimer = setInterval(nextSlide, 6000);
    }
  }

  showSlide(0);
  startTimer();

  document.getElementById('ticker-prev-btn').addEventListener('click', () => {
    prevSlide();
    startTimer();
  });

  document.getElementById('ticker-next-btn').addEventListener('click', () => {
    nextSlide();
    startTimer();
  });

  banner.addEventListener('mouseenter', () => clearInterval(tickerTimer));
  banner.addEventListener('mouseleave', () => startTimer());

  document.getElementById('ticker-close-btn').addEventListener('click', () => {
    clearInterval(tickerTimer);
    banner.style.maxHeight = banner.scrollHeight + 'px';
    banner.style.transition = 'max-height 0.3s ease-out, opacity 0.3s ease-out';
    requestAnimationFrame(() => {
      banner.style.maxHeight = '0';
      banner.style.opacity = '0';
      banner.style.overflow = 'hidden';
      setTimeout(() => banner.remove(), 300);
    });
    sessionStorage.setItem('esksd_ticker_dismissed', 'true');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initAnnouncementTicker();
});
