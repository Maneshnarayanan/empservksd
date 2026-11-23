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

function renderTableCell(cell, type = 'text') {
  const isLinkOrAttachment = type === 'link' || type === 'attachment' || type === 'file';

  // If cell is an object (e.g. { text, url, newTab })
  if (typeof cell === 'object' && cell !== null) {
    const text = cell.text || cell.url || (isLinkOrAttachment ? 'Download / View File' : 'Open Link');
    const url = cell.url || '#';
    const newTab = cell.newTab !== false;
    const isDoc = url.endsWith('.pdf') || url.endsWith('.docx') || url.endsWith('.xlsx') || url.includes('/storage/page-assets/') || url.includes('/downloads/');
    const icon = isDoc ? '📄' : '🔗';
    return `
      <td class="px-4 py-3 text-slate-700 font-medium">
        <a href="${safeUrl(url)}" ${newTab ? 'target="_blank" rel="noopener noreferrer"' : ''} class="inline-flex items-center gap-1.5 font-bold text-blue-800 hover:text-blue-950 hover:underline bg-blue-50/90 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-md text-xs transition">
          <span>${icon}</span>
          <span>${escapeHtml(text)}</span>
          <svg class="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
        </a>
      </td>
    `;
  }

  const str = String(cell ?? '');

  if (isLinkOrAttachment) {
    if (!str.trim()) {
      return '<td class="px-4 py-3 text-slate-400 italic text-xs">—</td>';
    }
    let label = str;
    let url = str;
    if (str.includes('|')) {
      const parts = str.split('|');
      label = parts[0].trim();
      url = parts.slice(1).join('|').trim();
    }
    const isDoc = url.endsWith('.pdf') || url.endsWith('.docx') || url.endsWith('.xlsx') || url.includes('/storage/page-assets/') || url.includes('/downloads/');
    const icon = isDoc ? '📄' : '🔗';
    return `
      <td class="px-4 py-3 text-slate-700 font-medium">
        <a href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 font-bold text-blue-800 hover:text-blue-950 hover:underline bg-blue-50/90 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-md text-xs transition">
          <span>${icon}</span>
          <span>${escapeHtml(label)}</span>
          <svg class="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
        </a>
      </td>
    `;
  }

  if (type === 'date') {
    if (!str.trim()) {
      return '<td class="px-4 py-3 text-slate-400 italic text-xs">—</td>';
    }
    return `
      <td class="px-4 py-3 whitespace-nowrap text-slate-700 font-mono text-xs">
        <span class="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200 font-medium">
          <span class="text-slate-400 text-[11px]">📅</span>
          <span>${escapeHtml(str)}</span>
        </span>
      </td>
    `;
  }

  if (type === 'badge') {
    if (!str.trim()) {
      return '<td class="px-4 py-3 text-slate-400 italic text-xs">—</td>';
    }
    const lower = str.toLowerCase();
    let badgeClass = 'bg-slate-100 text-slate-800 border-slate-300';
    if (lower.includes('active') || lower.includes('approved') || lower.includes('verified') || lower.includes('open') || lower.includes('enhanced') || lower.includes('yes')) {
      badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
    } else if (lower.includes('urgent') || lower.includes('closed') || lower.includes('expired') || lower.includes('no') || lower.includes('rejected')) {
      badgeClass = 'bg-rose-100 text-rose-800 border-rose-300';
    } else if (lower.includes('pending') || lower.includes('revision') || lower.includes('draft') || lower.includes('soon')) {
      badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
    } else {
      badgeClass = 'bg-blue-100 text-blue-800 border-blue-300';
    }
    return `
      <td class="px-4 py-3 whitespace-nowrap">
        <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold border ${badgeClass}">
          ${escapeHtml(str)}
        </span>
      </td>
    `;
  }

  // If text starts with http://, https://, or /api/v1/downloads/, render as a link
  if (str.startsWith('http://') || str.startsWith('https://') || str.startsWith('/api/v1/downloads/')) {
    return `
      <td class="px-4 py-3 text-slate-700 font-medium">
        <a href="${safeUrl(str)}" target="_blank" rel="noopener noreferrer" class="text-blue-700 hover:text-blue-900 underline font-semibold text-xs">
          ${escapeHtml(str)}
        </a>
      </td>
    `;
  }

  return `<td class="px-4 py-3 text-slate-700 font-medium">${escapeHtml(str)}</td>`;
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
      const rawBody = String(block.body || '')
        .replace(/\[([^\]]+)\]\(((?:https?:\/\/|\/)[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-900 underline font-semibold">$1</a>');
      const cleanBody = sanitizePageHtml(rawBody);
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
      const colTypes = Array.isArray(block.columnTypes) ? block.columnTypes : [];
      return `
        <section class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden mb-6">
          ${block.heading ? `<div class="bg-slate-50 px-5 py-3.5 border-b border-slate-200"><h3 class="text-sm sm:text-base font-extrabold text-slate-900 font-heading">${escapeHtml(block.heading)}</h3></div>` : ''}
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs sm:text-sm">
              ${headers.length > 0 ? `
                <thead>
                  <tr class="bg-blue-950 text-white">
                    ${headers.map((h, i) => `<th class="px-4 py-3 font-bold uppercase tracking-wider text-[11px] border-r border-blue-900 last:border-r-0">${escapeHtml(h)}</th>`).join('')}
                  </tr>
                </thead>
              ` : ''}
              <tbody class="divide-y divide-slate-100">
                ${rows.map((row, idx) => `
                  <tr class="${idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'} hover:bg-blue-50/50 transition">
                    ${(Array.isArray(row) ? row : []).map((cell, cIdx) => {
                      const type = colTypes[cIdx] || 'text';
                      return renderTableCell(cell, type);
                    }).join('')}
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
      const linkUrl = safeUrl(block.linkUrl || block.url || '');
      const hasLink = linkUrl && linkUrl !== '#';
      const isExternal = block.targetBlank !== false && (block.targetBlank || /^https?:\/\//i.test(block.linkUrl || block.url || ''));
      const targetAttr = isExternal ? 'target="_blank" rel="noopener noreferrer"' : '';

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

      const imgTag = `<img src="${src}" alt="${alt}" loading="lazy" class="w-full h-auto object-contain max-h-[640px] bg-slate-50 ${hasLink ? 'group-hover:scale-[1.01] transition-transform duration-200' : ''}">`;
      const imgContent = hasLink
        ? `<a href="${linkUrl}" ${targetAttr} class="block group overflow-hidden">${imgTag}</a>`
        : imgTag;

      return `
        <figure class="mb-6 ${widthClass} ${alignClass} bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          ${imgContent}
          ${caption ? `<figcaption class="px-4 py-2.5 text-xs text-slate-600 bg-slate-50/80 border-t border-slate-100 text-center font-medium">${caption}</figcaption>` : ''}
        </figure>
      `;
    }

    case 'links': {
      const heading = escapeHtml(block.heading || '');
      const description = escapeHtml(block.description || '');
      const layout = block.layout || 'buttons'; // 'buttons' | 'grid' | 'list'
      const items = Array.isArray(block.items) ? block.items : [];
      if (!items.length) return '';

      const renderedItems = items.map(item => {
        const title = escapeHtml(item.title || item.label || 'Link');
        const url = safeUrl(item.url || item.linkUrl || '#');
        const note = escapeHtml(item.description || item.note || '');
        const badge = escapeHtml(item.badge || '');
        const isExternal = item.targetBlank !== false && (item.targetBlank || /^https?:\/\//i.test(item.url || ''));
        const targetAttr = isExternal ? 'target="_blank" rel="noopener noreferrer"' : '';
        const variant = item.variant || 'primary';

        if (layout === 'buttons') {
          const btnThemes = {
            primary: 'gov-blue-btn text-white',
            emerald: 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs',
            amber: 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-xs',
            outline: 'bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-xs hover:border-blue-500',
            dark: 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs',
          };
          const btnClass = btnThemes[variant] || btnThemes.primary;
          return `
            <a href="${url}" ${targetAttr} class="${btnClass} px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 transition group shrink-0">
              <span>${title}</span>
              ${badge ? `<span class="bg-white/20 text-[10px] uppercase px-1.5 py-0.5 rounded font-extrabold tracking-wider">${badge}</span>` : ''}
              <svg class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </a>
          `;
        }

        if (layout === 'grid') {
          return `
            <a href="${url}" ${targetAttr} class="bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between group">
              <div>
                <div class="flex items-start justify-between gap-2 mb-1.5">
                  <h4 class="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-blue-900 transition-colors">${title}</h4>
                  ${badge ? `<span class="bg-blue-100 text-blue-800 text-[10px] font-black uppercase px-2 py-0.5 rounded shrink-0">${badge}</span>` : ''}
                </div>
                ${note ? `<p class="text-xs text-slate-600 line-clamp-2">${note}</p>` : ''}
              </div>
              <div class="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-blue-900 group-hover:text-blue-700">
                <span class="truncate font-mono text-[10px] text-slate-400">${item.url ? escapeHtml(item.url) : 'Open Link'}</span>
                <span class="flex items-center gap-1 shrink-0 group-hover:translate-x-0.5 transition-transform">Visit &rarr;</span>
              </div>
            </a>
          `;
        }

        // Default 'list' layout
        return `
          <a href="${url}" ${targetAttr} class="block px-4 py-3 bg-white hover:bg-blue-50/70 border border-slate-200 rounded-xl transition flex items-center justify-between gap-3 group">
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-900 transition-colors">${title}</span>
                ${badge ? `<span class="bg-blue-100 text-blue-800 text-[10px] font-black uppercase px-1.5 py-0.2 rounded">${badge}</span>` : ''}
              </div>
              ${note ? `<p class="text-xs text-slate-500 mt-0.5 truncate">${note}</p>` : ''}
            </div>
            <div class="flex items-center gap-1 text-xs font-bold text-blue-900 shrink-0">
              <span class="hidden sm:inline">Open</span>
              <span class="text-slate-400 group-hover:text-blue-900 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </div>
          </a>
        `;
      }).join('\n');

      let containerHtml = '';
      if (layout === 'buttons') {
        containerHtml = `<div class="flex flex-wrap items-center gap-2.5 sm:gap-3">${renderedItems}</div>`;
      } else if (layout === 'grid') {
        containerHtml = `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">${renderedItems}</div>`;
      } else {
        containerHtml = `<div class="space-y-2">${renderedItems}</div>`;
      }

      return `
        <section class="mb-6 bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
          ${heading ? `<h3 class="font-heading font-black text-sm sm:text-base text-slate-900 mb-1 flex items-center gap-1.5"><span class="text-blue-700">🔗</span> ${heading}</h3>` : ''}
          ${description ? `<p class="text-xs text-slate-600 mb-3.5 leading-relaxed">${description}</p>` : ''}
          ${containerHtml}
        </section>
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

