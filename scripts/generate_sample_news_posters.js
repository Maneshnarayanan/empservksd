const fs = require('fs');
const path = require('path');

const postersDir = path.resolve(__dirname, '../storage/news-posters');
if (!fs.existsSync(postersDir)) {
  fs.mkdirSync(postersDir, { recursive: true });
}

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function makePosterSvg(theme) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <defs>
    <linearGradient id="headerGrad-${theme.id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${theme.primaryDark}" />
      <stop offset="100%" stop-color="${theme.primaryLight}" />
    </linearGradient>
    <linearGradient id="goldGrad-${theme.id}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#D97706" />
      <stop offset="100%" stop-color="#FBBF24" />
    </linearGradient>
    <filter id="shadow-${theme.id}" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#000000" flood-opacity="0.15" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="800" fill="#F8FAFC" />
  
  <!-- Outer Decorative Border -->
  <rect x="24" y="24" width="1152" height="752" rx="20" fill="#FFFFFF" stroke="${theme.primaryDark}" stroke-width="4" filter="url(#shadow-${theme.id})" />

  <!-- Top Header Banner -->
  <rect x="24" y="24" width="1152" height="150" rx="20" fill="url(#headerGrad-${theme.id})" />
  <!-- Rect cover rounded bottom corners of header -->
  <rect x="24" y="140" width="1152" height="34" fill="url(#headerGrad-${theme.id})" />
  
  <!-- Gold accent stripe below header -->
  <rect x="24" y="174" width="1152" height="8" fill="url(#goldGrad-${theme.id})" />

  <!-- Emblem / Icon placeholder -->
  <circle cx="100" cy="99" r="46" fill="#FFFFFF" stroke="#FBBF24" stroke-width="4" />
  <text x="100" y="112" font-family="'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="900" text-anchor="middle" fill="${theme.primaryDark}">🏛️</text>

  <!-- Header text -->
  <text x="170" y="80" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" letter-spacing="3" fill="#FDE68A">GOVERNMENT OF KERALA — EMPLOYEES SERVICES RESOURCE HUB</text>
  <text x="170" y="115" font-family="'Segoe UI', Roboto, sans-serif" font-size="32" font-weight="900" fill="#FFFFFF">EMPLOYEES SERVICES, KASARAGOD</text>
  <text x="170" y="142" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="600" fill="#E2E8F0">Special Administrative News Bulletin &amp; Circular Poster</text>

  <!-- Release Tag on Right -->
  <rect x="960" y="70" width="180" height="40" rx="20" fill="${theme.accentBadgeBg}" />
  <text x="1050" y="96" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="900" letter-spacing="1.5" text-anchor="middle" fill="${theme.accentBadgeText}">${escapeXml(theme.badge)}</text>

  <!-- Main Body Content -->
  <!-- Category Pill -->
  <rect x="70" y="220" width="${theme.categoryWidth}" height="32" rx="16" fill="${theme.catBg}" stroke="${theme.catBorder}" stroke-width="1.5" />
  <text x="${70 + theme.categoryWidth/2}" y="242" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="800" text-anchor="middle" fill="${theme.catText}">${escapeXml(theme.category)}</text>

  <!-- Published Date -->
  <text x="1120" y="242" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" text-anchor="end" fill="#64748B">📅 ${escapeXml(theme.date)}</text>

  <!-- Main Headline Title -->
  <text x="70" y="295" font-family="'Segoe UI', Roboto, sans-serif" font-size="30" font-weight="900" fill="#0F172A">${escapeXml(theme.titleLine1)}</text>
  <text x="70" y="340" font-family="'Segoe UI', Roboto, sans-serif" font-size="30" font-weight="900" fill="${theme.primaryDark}">${escapeXml(theme.titleLine2)}</text>

  <!-- Divider -->
  <line x1="70" y1="375" x2="1130" y2="375" stroke="#E2E8F0" stroke-width="2" />

  <!-- 3 Highlights Cards -->
  <!-- Card 1 -->
  <rect x="70" y="405" width="330" height="210" rx="12" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5" />
  <rect x="90" y="425" width="38" height="38" rx="8" fill="${theme.card1Bg}" />
  <text x="109" y="450" font-family="'Segoe UI', Roboto, sans-serif" font-size="20" text-anchor="middle" fill="${theme.primaryDark}">📌</text>
  <text x="140" y="450" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#0F172A">${escapeXml(theme.card1Title)}</text>
  <text x="90" y="495" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="#475569">${escapeXml(theme.card1Text1)}</text>
  <text x="90" y="525" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="#475569">${escapeXml(theme.card1Text2)}</text>
  <text x="90" y="555" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="#475569">${escapeXml(theme.card1Text3)}</text>

  <!-- Card 2 -->
  <rect x="435" y="405" width="330" height="210" rx="12" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5" />
  <rect x="455" y="425" width="38" height="38" rx="8" fill="${theme.card2Bg}" />
  <text x="474" y="450" font-family="'Segoe UI', Roboto, sans-serif" font-size="20" text-anchor="middle" fill="${theme.primaryDark}">⚙️</text>
  <text x="505" y="450" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#0F172A">${escapeXml(theme.card2Title)}</text>
  <text x="455" y="495" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="#475569">${escapeXml(theme.card2Text1)}</text>
  <text x="455" y="525" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="#475569">${escapeXml(theme.card2Text2)}</text>
  <text x="455" y="555" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="#475569">${escapeXml(theme.card2Text3)}</text>

  <!-- Card 3 -->
  <rect x="800" y="405" width="330" height="210" rx="12" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1.5" />
  <rect x="820" y="425" width="38" height="38" rx="8" fill="${theme.card3Bg}" />
  <text x="839" y="450" font-family="'Segoe UI', Roboto, sans-serif" font-size="20" text-anchor="middle" fill="${theme.primaryDark}">📞</text>
  <text x="870" y="450" font-family="'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#0F172A">${escapeXml(theme.card3Title)}</text>
  <text x="820" y="495" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="#475569">${escapeXml(theme.card3Text1)}</text>
  <text x="820" y="525" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="#475569">${escapeXml(theme.card3Text2)}</text>
  <text x="820" y="555" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="#475569">${escapeXml(theme.card3Text3)}</text>

  <!-- Official Footer Band -->
  <rect x="24" y="650" width="1152" height="126" rx="0" fill="#0F172A" />
  <rect x="24" y="650" width="1152" height="4" fill="url(#goldGrad-${theme.id})" />
  
  <text x="70" y="695" font-family="'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" fill="#FBBF24">EMPLOYEES SERVICES KASARAGOD — RESOURCE DIRECTORY</text>
  <text x="70" y="725" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="500" fill="#94A3B8">Nodal Office: Bank Road, Near Mallikarjuna Temple, Kasaragod — 671121 | Email: esksd31@gmail.com</text>
  <text x="70" y="750" font-family="'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="500" fill="#94A3B8">Helpline Number: 9447396181 (WhatsApp Desk) | Portal: https://employeeserviceksd.gov.in</text>

  <rect x="940" y="685" width="190" height="46" rx="8" fill="#1E293B" stroke="#475569" stroke-width="1" />
  <text x="1035" y="713" font-family="'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="800" text-anchor="middle" fill="#38BDF8">OFFICIAL BULLETIN</text>
</svg>`;
}

const posterThemes = [
  {
    id: 1,
    fileName: 'news_poster_da_arrears_2026.svg',
    primaryDark: '#002B49',
    primaryLight: '#0A4A7A',
    badge: 'LATEST BULLET',
    accentBadgeBg: '#DC2626',
    accentBadgeText: '#FFFFFF',
    category: 'FINANCE & SALARY DESK',
    categoryWidth: 180,
    catBg: '#FEF3C7',
    catBorder: '#F59E0B',
    catText: '#92400E',
    date: '26 OCTOBER 2026',
    titleLine1: 'Dearness Allowance (DA) Rate Hike & Arrears',
    titleLine2: 'Settlement Schedule Announced for Kerala Staff',
    card1Bg: '#DBEAFE',
    card1Title: 'Rate Revision',
    card1Text1: '• Sanctioned DA rate hike',
    card1Text2: '• Applies to all state cadres',
    card1Text3: '• Order GO(P) No. 42/2026/Fin',
    card2Bg: '#E0E7FF',
    card2Title: 'SPARK Processing',
    card2Text1: '• Arrears automated bill run',
    card2Text2: '• Outer bill generation active',
    card2Text3: '• DDO token verification ready',
    card3Bg: '#DCFCE7',
    card3Title: 'Support Desk',
    card3Text1: '• Nodal Office Helpdesk',
    card3Text2: '• Call: 9447396181',
    card3Text3: '• WhatsApp assistance open',
  },
  {
    id: 2,
    fileName: 'news_poster_medisep_camp_2026.svg',
    primaryDark: '#064E3B',
    primaryLight: '#047857',
    badge: 'HEALTH CIRCULAR',
    accentBadgeBg: '#059669',
    accentBadgeText: '#FFFFFF',
    category: 'MEDISEP PHASE II',
    categoryWidth: 150,
    catBg: '#D1FAE5',
    catBorder: '#10B981',
    catText: '#065F46',
    date: '25 OCTOBER 2026',
    titleLine1: 'MEDISEP Phase II Empanelled Hospital Network',
    titleLine2: '& Cashless Claim Pre-Authorization Guidelines',
    card1Bg: '#D1FAE5',
    card1Title: 'Hospital Network',
    card1Text1: '• 18 Hospitals in Kasaragod',
    card1Text2: '• Cashless surgical coverage',
    card1Text3: '• Inter-state hospital access',
    card2Bg: '#FEF3C7',
    card2Title: 'Card & PEN Verification',
    card2Text1: '• Download QR Medi-Card',
    card2Text2: '• Biometric seed verification',
    card2Text3: '• Dependant update window',
    card3Bg: '#FEE2E2',
    card3Title: '24x7 Helpline',
    card3Text1: '• Grievance toll-free desk',
    card3Text2: '• District nodal officer assist',
    card3Text3: '• Email: esksd31@gmail.com',
  },
  {
    id: 3,
    fileName: 'news_poster_spark_apr_2026.svg',
    primaryDark: '#1E1B4B',
    primaryLight: '#312E81',
    badge: 'URGENT NOTICE',
    accentBadgeBg: '#B91C1C',
    accentBadgeText: '#FFFFFF',
    category: 'DDO & SERVICE DESK',
    categoryWidth: 170,
    catBg: '#EDE9FE',
    catBorder: '#8B5CF6',
    catText: '#5B21B6',
    date: '24 OCTOBER 2026',
    titleLine1: 'Annual Property Return (APR) 2026 Submission:',
    titleLine2: 'Mandatory Electronic Filing on SPARK Portal',
    card1Bg: '#EDE9FE',
    card1Title: 'Mandatory Filing',
    card1Text1: '• Gazetted & non-gazetted staff',
    card1Text2: '• Electronic submission only',
    card1Text3: '• SPARK PEN login direct',
    card2Bg: '#FEF9C3',
    card2Title: 'DDO Verification',
    card2Text1: '• Verify asset declarations',
    card2Text2: '• Forward to counter-sign',
    card2Text3: '• Cutoff compliance check',
    card3Bg: '#E0F2FE',
    card3Title: 'Technical Support',
    card3Text1: '• System error resolution',
    card3Text2: '• Kasaragod PMU coordinator',
    card3Text3: '• Contact: 9447396181',
  }
];

posterThemes.forEach(theme => {
  const svg = makePosterSvg(theme);
  const filePath = path.join(postersDir, theme.fileName);
  fs.writeFileSync(filePath, svg, 'utf8');
  console.log(`Generated SVG News Poster: ${theme.fileName}`);
});
