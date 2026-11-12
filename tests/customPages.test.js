const request = require('supertest');
const app = require('../src/app');

describe('Dynamic Pages & Admin Visual Page Builder API', () => {
  let agent;
  let csrfToken;

  beforeAll(async () => {
    agent = request.agent(app);
    const loginRes = await agent
      .post('/api/v1/admin/auth/login')
      .send({ username: 'admin', password: 'AdminKsd@2026!' });
    csrfToken = loginRes.body.csrfToken;
  });

  it('should list seeded published dynamic pages without authentication', async () => {
    const res = await request(app).get('/api/v1/pages');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    const slugs = res.body.data.map(p => p.slug);
    expect(slugs).toContain('da-pay-fixation');
    expect(slugs).toContain('ksr-leave-rules');
  });

  it('should render dynamic SSR page at /p/:slug and clean /:slug inheriting shared header and footer', async () => {
    const res = await request(app).get('/p/da-pay-fixation');
    expect(res.status).toBe(200);
    expect(res.text).toContain('EMPLOYEES SERVICES');
    expect(res.text).toContain('Dearness Allowance (DA) Revision &amp; Arrears 2026');
    expect(res.text).toContain('Recent DA Revision Rate Chart');
    expect(res.text).toContain('sidebar-popular-articles-list'); // Sidebar mode
    expect(res.text).toContain('Privacy Policy'); // Shared footer

    const cleanRes = await request(app).get('/ksr-leave-rules');
    expect(cleanRes.status).toBe(200);
    expect(cleanRes.text).toContain('Kerala Service Rules (KSR)');
    expect(cleanRes.text).toContain('Privacy Policy');
  });

  it('should return 404 for unknown dynamic page slug', async () => {
    const res = await request(app).get('/p/non-existent-custom-page-999');
    expect(res.status).toBe(404);
  });

  it('should reject dynamic page creation without authentication or CSRF token', async () => {
    const unauthRes = await request(app)
      .post('/api/v1/admin/pages')
      .send({ title: 'Unauthorized Page' });
    expect(unauthRes.status).toBe(401);

    const noCsrfRes = await agent
      .post('/api/v1/admin/pages')
      .send({ title: 'Missing CSRF Page' });
    expect(noCsrfRes.status).toBe(403);
  });

  it('should reject creation if page title is empty', async () => {
    const res = await agent
      .post('/api/v1/admin/pages')
      .set('X-CSRF-Token', csrfToken)
      .send({ title: '   ' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should preview blocks safely and sanitize malicious XSS in Page Builder', async () => {
    const blocks = [
      { type: 'hero', badge: 'TEST', title: 'Pension Rules 2026', subtitle: 'Guide', theme: 'blue' },
      { type: 'richtext', heading: 'Details', body: '<p>Safe content</p><script>alert("xss")</script><img src="x" onerror="alert(1)">' },
      { type: 'table', heading: 'Rates', headers: ['Col1', 'Col2'], rows: [['A', '100']] },
      { type: 'html', code: '<div class="p-4">Safe HTML</div><script>steal()</script>' }
    ];

    const previewRes = await agent
      .post('/api/v1/admin/pages/preview')
      .set('X-CSRF-Token', csrfToken)
      .send({ blocks });

    expect(previewRes.status).toBe(200);
    expect(previewRes.body.success).toBe(true);
    expect(previewRes.body.html).toContain('Pension Rules 2026');
    expect(previewRes.body.html).toContain('Safe content');
    expect(previewRes.body.html).not.toContain('<script>');
    expect(previewRes.body.html).not.toContain('onerror');
  });

  it('should support full CRUD lifecycle, draft gating, dynamic nav listing, and slug collision safety', async () => {
    const blocks = [
      { type: 'hero', badge: 'NEW', title: 'NPS & PRAN Manual', subtitle: 'Employee onboarding steps', theme: 'emerald' },
      { type: 'faq', heading: 'FAQ', items: [{ question: 'How to apply?', answer: 'Submit Form S1.' }] }
    ];

    // 1. Create as draft
    const createRes = await agent
      .post('/api/v1/admin/pages')
      .set('X-CSRF-Token', csrfToken)
      .send({
        title: 'NPS & PRAN Manual',
        slug: 'nps-pran-manual',
        subtitle: 'NPS contribution guide',
        layout_mode: 'standard',
        show_in_nav: true,
        nav_order: 5,
        is_published: false,
        blocks
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.data.slug).toBe('nps-pran-manual');
    expect(createRes.body.data.content_html).toContain('Submit Form S1.');
    const pageId = createRes.body.data.id;

    // 2. Draft should NOT be visible publicly or in /nav
    const draftPublicRes = await request(app).get('/p/nps-pran-manual');
    expect(draftPublicRes.status).toBe(404);

    const draftNavRes = await request(app).get('/api/v1/pages/nav');
    expect(draftNavRes.body.data.some(p => p.slug === 'nps-pran-manual')).toBe(false);

    // 3. Publish via PUT
    const updateRes = await agent
      .put(`/api/v1/admin/pages/${pageId}`)
      .set('X-CSRF-Token', csrfToken)
      .send({ is_published: true });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.is_published).toBe(true);

    // 4. Published page should appear in /api/v1/pages/nav and render at /p/nps-pran-manual
    const pubNavRes = await request(app).get('/api/v1/pages/nav');
    expect(pubNavRes.body.data.some(p => p.slug === 'nps-pran-manual')).toBe(true);

    const pubHtmlRes = await request(app).get('/p/nps-pran-manual');
    expect(pubHtmlRes.status).toBe(200);
    expect(pubHtmlRes.text).toContain('NPS &amp; PRAN Manual');
    expect(pubHtmlRes.text).toContain('Submit Form S1.');

    // 5. Delete page
    const delRes = await agent
      .delete(`/api/v1/admin/pages/${pageId}`)
      .set('X-CSRF-Token', csrfToken);
    expect(delRes.status).toBe(200);

    // 6. Verify deleted
    const afterDelRes = await request(app).get('/p/nps-pran-manual');
    expect(afterDelRes.status).toBe(404);
  });

  it('should fully support Malayalam Unicode titles, auto-slugs, content blocks, and SSR routing', async () => {
    const mlTitle = 'പങ്കാളിത്ത പെൻഷൻ വിവരങ്ങൾ 2026';
    const mlBlocks = [
      {
        type: 'hero',
        badge: 'ധനകാര്യ ഉത്തരവ്',
        title: 'സംസ്ഥാന ജീവനക്കാർക്കുള്ള എൻ.പി.എസ് ഉത്തരവ്',
        subtitle: 'പ്രാൻ (PRAN) അക്കൗണ്ട് പുതുക്കൽ മാർഗ്ഗനിർദ്ദേശങ്ങൾ.',
        theme: 'blue'
      },
      {
        type: 'richtext',
        heading: 'പ്രധാന വിവരങ്ങൾ',
        body: '<p>എല്ലാ സർക്കാർ ജീവനക്കാർക്കും അധ്യാപകർക്കും ഈ ആനുകൂല്യം ലഭിക്കുന്നതാണ്.</p>'
      },
      {
        type: 'table',
        heading: 'നിരക്കുകൾ',
        headers: ['തീയതി', 'നിലവിലെ നിരക്ക്', 'പുതിയ നിരക്ക്'],
        rows: [['01-01-2026', '10%', '14%']]
      }
    ];

    const createRes = await agent
      .post('/api/v1/admin/pages')
      .set('X-CSRF-Token', csrfToken)
      .send({
        title: mlTitle,
        subtitle: 'കേരള സർക്കാർ ജീവനക്കാരുടെ പെൻഷൻ വിവരങ്ങൾ',
        layout_mode: 'standard',
        show_in_nav: true,
        is_published: true,
        blocks: mlBlocks
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.data.slug).toBe('പങ്കാളിത്ത-പെൻഷൻ-വിവരങ്ങൾ-2026');
    expect(createRes.body.data.content_html).toContain('സംസ്ഥാന ജീവനക്കാർക്കുള്ള എൻ.പി.എസ് ഉത്തരവ്');
    expect(createRes.body.data.content_html).toContain('എല്ലാ സർക്കാർ ജീവനക്കാർക്കും അധ്യാപകർക്കും');

    const pageId = createRes.body.data.id;
    const encodedSlug = encodeURIComponent(createRes.body.data.slug);

    // Fetch SSR page via percent-encoded Malayalam URL
    const ssrRes = await request(app).get(`/p/${encodedSlug}`);
    expect(ssrRes.status).toBe(200);
    expect(ssrRes.text).toContain('പങ്കാളിത്ത പെൻഷൻ വിവരങ്ങൾ 2026');
    expect(ssrRes.text).toContain('സംസ്ഥാന ജീവനക്കാർക്കുള്ള എൻ.പി.എസ് ഉത്തരവ്');

    // Verify nav endpoint returns Malayalam title and slug
    const navRes = await request(app).get('/api/v1/pages/nav');
    expect(navRes.body.data.some(p => p.title === mlTitle && p.slug === 'പങ്കാളിത്ത-പെൻഷൻ-വിവരങ്ങൾ-2026')).toBe(true);

    // Also verify seeded Malayalam page renders cleanly
    const seededMlRes = await request(app).get(`/p/${encodeURIComponent('ക്ഷാമബത്ത-വർദ്ധനവ്-2026')}`);
    expect(seededMlRes.status).toBe(200);
    expect(seededMlRes.text).toContain('ക്ഷാമബത്ത (DA) വർദ്ധനവ് 2026');

    // Clean up
    await agent
      .delete(`/api/v1/admin/pages/${pageId}`)
      .set('X-CSRF-Token', csrfToken);
  });

  it('should upload page images and attachments and render image blocks in preview', async () => {
    const fs = require('fs');
    const path = require('path');
    const { PAGE_ASSETS_DIR } = require('../src/utils/storage');

    // 1x1 transparent PNG buffer
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      'base64'
    );

    const imgUploadRes = await agent
      .post('/api/v1/admin/pages/upload-image')
      .set('X-CSRF-Token', csrfToken)
      .attach('image', pngBuffer, { filename: 'test-graphic.png', contentType: 'image/png' });

    expect(imgUploadRes.status).toBe(200);
    expect(imgUploadRes.body.success).toBe(true);
    expect(imgUploadRes.body.url).toMatch(/^\/storage\/page-assets\/.+\.png$/);

    const pdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF\n');
    const fileUploadRes = await agent
      .post('/api/v1/admin/pages/upload-attachment')
      .set('X-CSRF-Token', csrfToken)
      .attach('file', pdfBuffer, { filename: 'circular.pdf', contentType: 'application/pdf' });

    expect(fileUploadRes.status).toBe(200);
    expect(fileUploadRes.body.success).toBe(true);
    expect(fileUploadRes.body.url).toMatch(/^\/storage\/page-assets\/.+\.pdf$/);

    const previewRes = await agent
      .post('/api/v1/admin/pages/preview')
      .set('X-CSRF-Token', csrfToken)
      .send({
        blocks: [
          {
            type: 'image',
            src: imgUploadRes.body.url,
            alt: 'Test Graphic',
            caption: 'Sample Order Graphic',
            align: 'center',
            maxWidth: 'md'
          }
        ]
      });

    expect(previewRes.status).toBe(200);
    expect(previewRes.body.html).toContain(imgUploadRes.body.url);
    expect(previewRes.body.html).toContain('Sample Order Graphic');
    expect(previewRes.body.html).toContain('<figure');

    // Clean up uploaded test files
    for (const url of [imgUploadRes.body.url, fileUploadRes.body.url]) {
      const filePath = path.join(PAGE_ASSETS_DIR, path.basename(url));
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  });
});

