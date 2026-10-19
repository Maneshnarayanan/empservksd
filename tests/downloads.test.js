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

  it('should stream file through controlled download route and increment count', async () => {
    const res = await request(app).get(`/api/v1/downloads/${createdDownloadId}/file`);
    expect(res.status).toBe(200);
    expect(res.headers['content-disposition']).toContain('attachment');

    // Verify download count incremented
    const detailRes = await request(app).get('/api/v1/downloads');
    const dl = detailRes.body.data.find(d => d.id === createdDownloadId);
    expect(dl.download_count).toBeGreaterThanOrEqual(1);
  });

  it('should return 404 for non-existent download file', async () => {
    const res = await request(app).get('/api/v1/downloads/99999/file');
    expect(res.status).toBe(404);
  });
});
