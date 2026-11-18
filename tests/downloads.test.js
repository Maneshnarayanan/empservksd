const request = require('supertest');
const app = require('../src/app');

describe('Downloads Management & Secure File Delivery', () => {
  let agent;
  let csrfToken;
  let createdDownloadId;

  beforeAll(async () => {
    agent = request.agent(app);
    const loginRes = await agent
      .post('/api/v1/admin/auth/login')
      .send({ username: 'admin', password: 'AdminKsd@2026!' });
    csrfToken = loginRes.body.csrfToken;
  });

  it('should reject file upload without file attachment', async () => {
    const res = await agent
      .post('/api/v1/admin/downloads')
      .set('X-CSRF-Token', csrfToken)
      .field('title', 'Circular 2026')
      .field('category', 'Circulars');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject file upload with disallowed extension (.exe)', async () => {
    const res = await agent
      .post('/api/v1/admin/downloads')
      .set('X-CSRF-Token', csrfToken)
      .field('title', 'Executable Test')
      .attach('file', Buffer.from('fake exe content'), 'malicious.exe');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should upload a valid PDF document resource', async () => {
    const res = await agent
      .post('/api/v1/admin/downloads')
      .set('X-CSRF-Token', csrfToken)
      .field('title', 'Annual Leave Rules Circular 2026')
      .field('category', 'Circulars')
      .field('description', 'Official rules regarding annual leave')
      .attach('file', Buffer.from('%PDF-1.4 test pdf content'), 'leave_rules.pdf');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.title).toBe('Annual Leave Rules Circular 2026');
    expect(res.body.data.original_filename).toBe('leave_rules.pdf');
    createdDownloadId = res.body.data.id;
  });

  it('should list active downloads publicly', async () => {
    const res = await request(app).get('/api/v1/downloads');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.some(d => d.id === createdDownloadId)).toBe(true);
  });

  it('should support pagination with page, limit and pagination metadata', async () => {
    const res = await request(app).get('/api/v1/downloads?page=1&limit=2');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeLessThanOrEqual(2);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(2);
    expect(res.body.pagination.total).toBeGreaterThanOrEqual(1);
  });

  it('should stream file through controlled download route and increment count', async () => {
    const res = await request(app).get(`/api/v1/downloads/${createdDownloadId}/file`);
    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toContain('inline');

    const forceRes = await request(app).get(`/api/v1/downloads/${createdDownloadId}/file?download=true`);
    expect(forceRes.status).toBe(200);
    expect(forceRes.headers['content-disposition']).toContain('attachment');

    // Verify download count incremented
    const detailRes = await request(app).get('/api/v1/downloads');
    const dl = detailRes.body.data.find(d => d.id === createdDownloadId);
    expect(dl.download_count).toBeGreaterThanOrEqual(1);
  });

  it('should support show_in_downloads toggle to hide from public downloads portal while keeping direct link active', async () => {
    // 1. Upload a resource with show_in_downloads = false (e.g. for custom page or external link)
    const hiddenUploadRes = await agent
      .post('/api/v1/admin/downloads')
      .set('X-CSRF-Token', csrfToken)
      .field('title', 'Internal Table Attachment')
      .field('category', 'Forms')
      .field('description', 'Resource for custom page embed only')
      .field('show_in_downloads', 'false')
      .attach('file', Buffer.from('%PDF-1.4 internal attachment'), 'internal_doc.pdf');

    expect(hiddenUploadRes.status).toBe(201);
    const hiddenId = hiddenUploadRes.body.data.id;
    expect(hiddenUploadRes.body.data.show_in_downloads).toBe(false);

    // 2. Public /api/v1/downloads should NOT include this resource
    const publicListRes = await request(app).get('/api/v1/downloads');
    expect(publicListRes.status).toBe(200);
    expect(publicListRes.body.data.some(d => d.id === hiddenId)).toBe(false);

    // 3. Admin /api/v1/admin/downloads SHOULD include this resource
    const adminListRes = await agent.get('/api/v1/admin/downloads');
    expect(adminListRes.status).toBe(200);
    const foundAdminItem = adminListRes.body.data.find(d => d.id === hiddenId);
    expect(foundAdminItem).toBeDefined();
    expect(foundAdminItem.show_in_downloads).toBe(false);

    // 4. Direct file link /api/v1/downloads/:id/file should still work perfectly
    const fileRes = await request(app).get(`/api/v1/downloads/${hiddenId}/file`);
    expect(fileRes.status).toBe(200);
    expect(fileRes.headers['content-disposition']).toContain('inline');

    // 5. Update show_in_downloads to true
    const updateRes = await agent
      .put(`/api/v1/admin/downloads/${hiddenId}`)
      .set('X-CSRF-Token', csrfToken)
      .send({
        title: 'Internal Table Attachment (Now Public)',
        category: 'Forms',
        show_in_downloads: true,
        is_active: true
      });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.show_in_downloads).toBe(true);

    // 6. Public /api/v1/downloads should now include it
    const publicListAfterRes = await request(app).get('/api/v1/downloads');
    expect(publicListAfterRes.body.data.some(d => d.id === hiddenId)).toBe(true);
  });

  it('should return 404 for non-existent download file', async () => {
    const res = await request(app).get('/api/v1/downloads/99999/file');
    expect(res.status).toBe(404);
  });
});
