const request = require('supertest');
const app = require('../src/app');

describe('Blog Management & Publishing Workflow', () => {
  let agent;
  let csrfToken;
  let draftArticleId;
  let publishedArticleSlug;

  beforeAll(async () => {
    agent = request.agent(app);
    const loginRes = await agent
      .post('/api/v1/admin/auth/login')
      .send({ username: 'admin', password: 'AdminKsd@2026!' });
    csrfToken = loginRes.body.csrfToken;
  });

  it('should list blog categories including HM Blog, Muttam Blog, Maths Blog', async () => {
    const res = await request(app).get('/api/v1/blogs/categories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const names = res.body.data.map(c => c.name);
    expect(names).toContain('HM BLOG');
    expect(names).toContain('MUTTAM BLOG');
    expect(names).toContain('MATHS BLOG');
  });

  it('should create an article in draft status and sanitize malicious script tags (Stored XSS defense)', async () => {
    const dirtyContent = `
      <h2>Important Notice</h2>
      <p>Please read this update.</p>
      <script>alert('malicious xss attack')</script>
      <img src="x" onerror="alert(1)">
      <a href="https://example.com" onclick="stealCookies()">Safe Link</a>
    `;

    const res = await agent
      .post('/api/v1/admin/blogs')
      .set('X-CSRF-Token', csrfToken)
      .field('title', 'Draft Rule Update 2026')
      .field('category_id', 1) // HM Blog
      .field('summary', 'Summary of draft rules')
      .field('content', dirtyContent)
      .field('status', 'draft');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    draftArticleId = res.body.data.id;

    // Verify sanitized content
    expect(res.body.data.content).not.toContain('<script>');
    expect(res.body.data.content).not.toContain('onerror');
    expect(res.body.data.content).not.toContain('onclick');
    expect(res.body.data.content).toContain('Safe Link');
  });

  it('should NOT display draft article on public blog list', async () => {
    const res = await request(app).get('/api/v1/blogs');
    expect(res.status).toBe(200);
    expect(res.body.articles.some(a => a.id === draftArticleId)).toBe(false);
  });

  it('should NOT allow public visitor to view draft article by slug', async () => {
    const res = await request(app).get('/api/v1/blogs/draft-rule-update-2026');
    expect(res.status).toBe(404);
  });

  it('should allow admin to publish article and set publication timestamp', async () => {
    const res = await agent
      .post(`/api/v1/admin/blogs/${draftArticleId}/publish`)
      .set('X-CSRF-Token', csrfToken)
      .send({ publish: true });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('published');
    expect(res.body.data.published_at).toBeDefined();
    publishedArticleSlug = res.body.data.slug;
  });

  it('should now display published article on public blog list and single article view', async () => {
    const listRes = await request(app).get('/api/v1/blogs');
    expect(listRes.status).toBe(200);
    expect(listRes.body.articles.some(a => a.id === draftArticleId)).toBe(true);

    const singleRes = await request(app).get(`/api/v1/blogs/${publishedArticleSlug}`);
    expect(singleRes.status).toBe(200);
    expect(singleRes.body.success).toBe(true);
    expect(singleRes.body.data.title).toBe('Draft Rule Update 2026');
  });
});
