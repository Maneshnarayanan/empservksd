/**
 * admin.js - Administrative panel controller and layout logic
 */

let currentAdminUser = null;

async function checkAdminAuth() {
  try {
    const res = await fetch('/api/v1/admin/auth/me');
    if (!res.ok) {
      window.location.href = '/admin/login';
      return null;
    }
    const data = await res.json();
    currentAdminUser = data.admin;

    // Update admin username displays
    document.querySelectorAll('.admin-username-display').forEach((el) => {
      el.textContent = currentAdminUser.fullName || currentAdminUser.username;
    });

    return currentAdminUser;
  } catch (err) {
    console.error('Auth verification failed:', err);
    window.location.href = '/admin/login';
    return null;
  }
}

async function handleAdminLogout() {
  try {
    const res = await apiFetch('/api/v1/admin/auth/logout', { method: 'POST' });
    if (res.ok) {
      window.location.href = '/admin/login';
    } else {
      showToast('Logout failed. Please try again.', 'error');
    }
  } catch (err) {
    console.error('Logout error:', err);
    window.location.href = '/admin/login';
  }
}

// Modal open/close utility
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.classList.add('overflow-hidden');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.classList.remove('overflow-hidden');
  }
}

// Global Confirmation Modal
function confirmAction(title, message, callback) {
  let modal = document.getElementById('global-confirm-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'global-confirm-modal';
    modal.className = 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 text-slate-800">
        <h3 id="confirm-title" class="text-lg font-bold text-slate-900 mb-2"></h3>
        <p id="confirm-message" class="text-sm text-slate-600 mb-6 leading-relaxed"></p>
        <div class="flex justify-end gap-3">
          <button id="confirm-cancel-btn" class="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition">Cancel</button>
          <button id="confirm-ok-btn" class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium transition shadow-sm">Confirm</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-message').textContent = message;

  const cancelBtn = document.getElementById('confirm-cancel-btn');
  const okBtn = document.getElementById('confirm-ok-btn');

  // Clear previous event listeners
  const newCancel = cancelBtn.cloneNode(true);
  cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);
  const newOk = okBtn.cloneNode(true);
  okBtn.parentNode.replaceChild(newOk, okBtn);

  newCancel.addEventListener('click', () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  });

  newOk.addEventListener('click', () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    if (callback) callback();
  });

  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

// Highlight active sidebar navigation
function highlightActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('nav a').forEach((link) => {
    const href = link.getAttribute('href');
    if (href === path || (href !== '/admin/dashboard' && path.startsWith(href))) {
      link.classList.add('bg-emerald-800', 'text-white', 'font-semibold');
      link.classList.remove('text-slate-300', 'hover:bg-slate-800');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname !== '/admin/login') {
    checkAdminAuth();
    highlightActiveNav();

    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleAdminLogout();
      });
    }
  }
});
