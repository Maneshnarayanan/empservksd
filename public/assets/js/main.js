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

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
});
