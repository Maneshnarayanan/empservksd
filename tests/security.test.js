const request = require('supertest');
const app = require('../src/app');
const { getSafeFilePath } = require('../src/utils/storage');

describe('Security & Vulnerability Defenses', () => {
  it('should block unauthorized mutating requests without authentication', async () => {
    const res = await request(app)
      .post('/api/v1/admin/services')
      .send({ name: 'Unauthorized Hack' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should block mutating requests when CSRF token is missing', async () => {
    const agent = request.agent(app);
    await agent
      .post('/api/v1/admin/auth/login')
      .send({ username: 'admin', password: 'AdminKsd@2026!' });

    // Request without X-CSRF-Token header
    const res = await agent
      .post('/api/v1/admin/services')
      .send({ name: 'CSRF Attack', category_id: 1 });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('CSRF token');
  });

  it('should prevent path traversal attempts in file storage utilities', () => {
    const safePath = getSafeFilePath('download', '../../../boot.ini');
    expect(safePath).toContain('storage');
    expect(safePath).not.toContain('..');
  });

  it('should resist SQL injection attacks on search parameters', async () => {
    const sqlInjectionPayload = "SPARK' OR '1'='1";
    const res = await request(app).get(`/api/v1/services?search=${encodeURIComponent(sqlInjectionPayload)}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should reject non-existent endpoints with standard JSON 404 error', async () => {
    const res = await request(app).get('/api/v1/non-existent-endpoint');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
