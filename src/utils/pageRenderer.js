const sanitizeHtml = require('sanitize-html');

const PAGE_SANITIZE_OPTIONS = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
    'nl', 'li', 'b', 'i', 'u', 'strong', 'em', 'strike', 's', 'code', 'hr',
    'br', 'div', 'span', 'section', 'article', 'header', 'details', 'summary',
    'table', 'thead', 'caption', 'tbody', 'tfoot', 'tr', 'th', 'td', 'pre', 'img',
    'svg', 'path'
  ],
  allowedAttributes: {
    '*': ['class', 'id', 'title', 'aria-label', 'role'],
    a: ['href', 'name', 'target', 'rel', 'class'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'class'],
    th: ['colspan', 'rowspan', 'class', 'scope'],
    td: ['colspan', 'rowspan', 'class'],
    details: ['open', 'class'],
    svg: ['class', 'fill', 'stroke', 'viewBox', 'viewbox'],
    path: ['stroke-linecap', 'stroke-linejoin', 'stroke-width', 'd', 'fill']
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowProtocolRelative: false,
  transformTags: {
    a: (tagName, attribs) => {
      const href = attribs.href || '#';
      const isExternal = /^https?:\/\//i.test(href);
      return {
        tagName: 'a',
        attribs: {
          ...attribs,
          href,
          ...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})
        }
      };
    }
  }
};

function sanitizePageHtml(html) {
  if (!html) return '';
  return sanitizeHtml(String(html), PAGE_SANITIZE_OPTIONS);
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function safeUrl(url) {
  if (!url) return '#';
  const trimmed = String(url).trim();
  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return '#';
  }
  return escapeHtml(trimmed);
}

function renderSingleBlock(block) {
  if (!block || typeof block !== 'object') return '';
  const type = String(block.type || '').toLowerCase();

  switch (type) {
    case 'hero': {
      const themes = {
        blue: 'gov-hero-gradient text-white border-blue-900/40',
        emerald: 'bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white border-emerald-700/40',
        amber: 'bg-gradient-to-br from-amber-500 via-amber-400 to-yellow-400 text-slate-950 border-amber-600/30',
        slate: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white border-slate-700/50'
      };
      const themeClass = themes[block.theme] || themes.blue;
      const isLight = block.theme === 'amber';
      const subClass = isLight ? 'text-slate-900/90' : 'text-blue-100';
      const badgeClass = isLight
        ? 'bg-slate-900 text-amber-300'
        : 'bg-amber-400 text-slate-950';

      return `
        <section class="${themeClass} rounded-2xl p-6 sm:p-8 shadow-lg border mb-6">
          ${block.badge ? `<span class="inline-block ${badgeClass} font-black text-[10px] uppercase px-2.5 py-1 rounded tracking-wider mb-3 shadow-xs">${escapeHtml(block.badge)}</span>` : ''}
          <h2 class="text-xl sm:text-3xl font-black tracking-tight leading-tight font-heading mb-2">${escapeHtml(block.title || '')}</h2>
          ${block.subtitle ? `<p class="text-sm sm:text-base ${subClass} leading-relaxed max-w-3xl mb-4">${escapeHtml(block.subtitle)}</p>` : ''}
          ${block.buttonText && block.buttonUrl ? `
            <div class="pt-1">
              <a href="${safeUrl(block.buttonUrl)}" class="gov-gold-btn px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 shadow-md">
                <span>${escapeHtml(block.buttonText)}</span>
                <span>&rarr;</span>
              </a>
            </div>
          ` : ''}
        </section>
      `;
    }

    case 'richtext': {
      const cleanBody = sanitizePageHtml(block.body || '');
      return `
        <section class="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs mb-6">
          ${block.heading ? `<h3 class="text-lg sm:text-xl font-extrabold text-slate-900 font-heading mb-4 pb-2.5 border-b border-slate-100">${escapeHtml(block.heading)}</h3>` : ''}
          <div class="prose prose-slate max-w-none text-sm sm:text-base text-slate-700 leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-blue-900 [&_a]:underline [&_a]:font-semibold">
            ${cleanBody}
          </div>
        </section>
      `;
    }

    case 'alert': {
      const variants = {
        info: {
          wrap: 'bg-blue-50 border-blue-300 text-blue-950',
          badge: 'bg-blue-700 text-white',
          icon: 'ℹ️'
        },
        warning: {
          wrap: 'bg-amber-50 border-amber-300 text-amber-950',
          badge: 'bg-amber-500 text-slate-950',
          icon: '⚠️'
        },
        urgent: {
          wrap: 'bg-rose-50 border-rose-300 text-rose-950',
          badge: 'bg-rose-700 text-white',
          icon: '🚨'
        },
        success: {
          wrap: 'bg-emerald-50 border-emerald-300 text-emerald-950',
          badge: 'bg-emerald-700 text-white',
          icon: '✅'
        }
      };
      const v = variants[block.variant] || variants.info;
      return `
        <section class="rounded-xl border-l-4 border ${v.wrap} p-4 sm:p-5 shadow-2xs mb-6">
          <div class="flex items-start gap-3">
            <span class="text-xl shrink-0 leading-none mt-0.5">${v.icon}</span>
            <div class="min-w-0 flex-1">
              ${block.title ? `<h4 class="font-extrabold text-sm sm:text-base font-heading mb-1">${escapeHtml(block.title)}</h4>` : ''}
              ${block.message ? `<p class="text-xs sm:text-sm leading-relaxed opacity-90">${escapeHtml(block.message)}</p>` : ''}
            </div>
          </div>
        </section>
      `;
    }

    case 'cards': {
      const items = Array.isArray(block.items) ? block.items : [];
      const cols = Number(block.columns) === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3';
      return `
        <section class="mb-6">
          ${block.heading ? `<h3 class="text-lg font-extrabold text-slate-900 font-heading mb-4 flex items-center gap-2"><span class="w-1.5 h-5 bg-blue-900 rounded-full inline-block"></span><span>${escapeHtml(block.heading)}</span></h3>` : ''}
          <div class="grid grid-cols-1 ${cols} gap-4">
            ${items.map(card => `
              <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-blue-300 transition flex flex-col justify-between">
                <div>
                  <div class="flex items-center gap-2.5 mb-2.5">
                    <span class="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-lg shrink-0">${escapeHtml(card.icon || '📄')}</span>
                    <h4 class="font-extrabold text-sm sm:text-base text-slate-900 font-heading leading-snug">${escapeHtml(card.title || '')}</h4>
                  </div>
                  ${card.description ? `<p class="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">${escapeHtml(card.description)}</p>` : ''}
                </div>
                ${card.linkUrl ? `
                  <a href="${safeUrl(card.linkUrl)}" class="inline-flex items-center gap-1.5 text-xs font-extrabold text-blue-900 hover:text-blue-700 hover:underline pt-2 border-t border-slate-100">
                    <span>${escapeHtml(card.linkText || 'Open Resource')}</span>
                    <span>&rarr;</span>
                  </a>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </section>
      `;
    }

    case 'table': {
      const headers = Array.isArray(block.headers) ? block.headers : [];
      const rows = Array.isArray(block.rows) ? block.rows : [];
      return `
        <section class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden mb-6">
          ${block.heading ? `<div class="bg-slate-50 px-5 py-3.5 border-b border-slate-200"><h3 class="text-sm sm:text-base font-extrabold text-slate-900 font-heading">${escapeHtml(block.heading)}</h3></div>` : ''}
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs sm:text-sm">
              ${headers.length > 0 ? `
                <thead>
                  <tr class="bg-blue-950 text-white">
                    ${headers.map(h => `<th class="px-4 py-3 font-bold uppercase tracking-wider text-[11px] border-r border-blue-900 last:border-r-0">${escapeHtml(h)}</th>`).join('')}
                  </tr>
                </thead>
              ` : ''}
              <tbody class="divide-y divide-slate-100">
                ${rows.map((row, idx) => `
                  <tr class="${idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'} hover:bg-blue-50/50 transition">
                    ${(Array.isArray(row) ? row : []).map(cell => `<td class="px-4 py-3 text-slate-700 font-medium">${escapeHtml(cell)}</td>`).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </section>
      `;
    }

    case 'download_cta': {
      return `
        <section class="bg-gradient-to-r from-blue-50 via-white to-amber-50 rounded-2xl border-2 border-blue-200 p-5 sm:p-6 shadow-xs mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-start gap-3.5">
            <div class="w-11 h-11 rounded-xl bg-blue-900 text-amber-300 flex items-center justify-center text-xl shrink-0 shadow-sm">
              📥
            </div>
            <div>
              <h4 class="font-extrabold text-sm sm:text-base text-slate-900 font-heading">${escapeHtml(block.title || 'Related Official Document')}</h4>
              ${block.description ? `<p class="text-xs sm:text-sm text-slate-600 mt-0.5">${escapeHtml(block.description)}</p>` : ''}
            </div>
          </div>
          ${block.buttonUrl ? `
            <a href="${safeUrl(block.buttonUrl)}" ${block.newTab ? 'target="_blank" rel="noopener noreferrer"' : ''} class="gov-blue-btn px-5 py-2.5 rounded-xl text-xs font-extrabold inline-flex items-center gap-2 shrink-0 shadow-sm">
              <span>${escapeHtml(block.buttonText || 'Download / View')}</span>
              <span>&rarr;</span>
            </a>
          ` : ''}
        </section>
      `;
    }

    case 'faq': {
      const items = Array.isArray(block.items) ? block.items : [];
      return `
        <section class="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mb-6">
          ${block.heading ? `<h3 class="text-lg font-extrabold text-slate-900 font-heading mb-4">${escapeHtml(block.heading)}</h3>` : ''}
          <div class="space-y-2.5">
            ${items.map(faq => `
              <details class="group border border-slate-200 rounded-xl bg-slate-50/50 open:bg-white open:border-blue-300 transition">
                <summary class="px-4 py-3 text-xs sm:text-sm font-bold text-slate-900 cursor-pointer flex items-center justify-between select-none list-none">
                  <span>${escapeHtml(faq.question || '')}</span>
                  <span class="text-blue-900 font-black group-open:rotate-180 transition-transform">&darr;</span>
                </summary>
                <div class="px-4 pb-3.5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                  ${escapeHtml(faq.answer || '')}
                </div>
              </details>
            `).join('')}
          </div>
        </section>
      `;
    }

    case 'divider':
      return `<hr class="my-6 border-t border-slate-300/80">`;

    case 'image': {
      const src = safeUrl(block.src || '');
      if (!src || src === '#') return '';
      const alt = escapeHtml(block.alt || 'Page image');
      const caption = escapeHtml(block.caption || '');
      const widthMap = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
        full: 'w-full',
      };
      const alignMap = {
        left: 'mr-auto',
        center: 'mx-auto',
        right: 'ml-auto',
        full: 'w-full',
      };
      const widthClass = widthMap[block.maxWidth] || widthMap.lg;
      const alignClass = alignMap[block.align] || alignMap.center;

      return `
        <figure class="mb-6 ${widthClass} ${alignClass} bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <img src="${src}" alt="${alt}" loading="lazy" class="w-full h-auto object-contain max-h-[640px] bg-slate-50">
          ${caption ? `<figcaption class="px-4 py-2.5 text-xs text-slate-600 bg-slate-50/80 border-t border-slate-100 text-center font-medium">${caption}</figcaption>` : ''}
        </figure>
      `;
    }

    case 'html': {
      return `
        <section class="mb-6">
          ${sanitizePageHtml(block.code || '')}
        </section>
      `;
    }

    default:
      return '';
  }
}

/**
 * Converts an array of Page Builder blocks into clean, XSS-safe HTML.
 * @param {Array|string} blocks
 * @returns {string}
 */
function renderBlocksToHtml(blocks) {
  let parsed = [];
  if (typeof blocks === 'string') {
    try {
      parsed = JSON.parse(blocks);
    } catch {
      return sanitizePageHtml(blocks);
    }
  } else if (Array.isArray(blocks)) {
    parsed = blocks;
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return '';
  }

  return parsed.map(renderSingleBlock).join('\n');
}

module.exports = {
  sanitizePageHtml,
  renderBlocksToHtml,
  escapeHtml,
};

