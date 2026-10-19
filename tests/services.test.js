const request = require('supertest');
const app = require('../src/app');

describe('Services & Categories Management', () => {
  let agent;
  let csrfToken;

  beforeAll(async () => {
    agent = request.agent(app);
    const loginRes = await agent
      .post('/api/v1/admin/auth/login')
      .send({ username: 'admin', password: 'AdminKsd@2026!' });
    csrfToken = loginRes.body.csrfToken;
  });

  it('should list public categories without authentication', async () => {
    const res = await request(app).get('/api/v1/services/categories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should list public services with search filtering', async () => {
    const res = await request(app).get('/api/v1/services?search=spark');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.some(l => l.name.toLowerCase().includes('spark'))).toBe(true);
  });

  it('should allow admin to create a new service category', async () => {
    const uniqueName = 'Welfare Schemes ' + Date.now();
    const res = await agent
      .post('/api/v1/admin/service-categories')
      .set('X-CSRF-Token', csrfToken)
      .send({
        name: uniqueName,
        description: 'Employee welfare and community schemes',
        display_order: 25,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe(uniqueName);
  });

  it('should allow admin to create a service link with unconfigured destination URL (placeholder)', async () => {
    const res = await agent
      .post('/api/v1/admin/services')
      .set('X-CSRF-Token', csrfToken)
      .send({
        name: 'Sample Portal',
        category_id: 1, // SPARK
        destination_url: '', // Empty unconfigured placeholder
        description: 'Portal under configuration',
        display_order: 1,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.destination_url).toBeNull();
  });

  it('should validate destination URL and reject malformed protocols', async () => {
    const res = await agent
      .post('/api/v1/admin/services')
      .set('X-CSRF-Token', csrfToken)
      .send({
        name: 'Invalid Link',
        category_id: 1,
        destination_url: 'javascript:alert(1)',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should prevent deleting category that still has linked services', async () => {
    // Category 1 (SPARK) has links
    const res = await agent
      .delete('/api/v1/admin/service-categories/1')
      .set('X-CSRF-Token', csrfToken);

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('still contains service links');
  });
});
