const request = require('supertest');
const app = require('../src/app');

describe('Administrator Authentication APIs', () => {
  it('should reject login with missing credentials', async () => {
    const res = await request(app)
      .post('/api/v1/admin/auth/login')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should reject login with incorrect password', async () => {
    const res = await request(app)
      .post('/api/v1/admin/auth/login')
      .send({ username: 'admin', password: 'WrongPassword123!' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should authenticate successfully with correct credentials', async () => {
    const res = await request(app)
      .post('/api/v1/admin/auth/login')
      .send({ username: 'admin', password: 'AdminKsd@2026!' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.admin).toBeDefined();
    expect(res.body.admin.username).toBe('admin');
    expect(res.body.csrfToken).toBeDefined();
  });

  it('should prevent unauthenticated access to /api/v1/admin/auth/me', async () => {
    const res = await request(app).get('/api/v1/admin/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should allow authenticated administrator to fetch /api/v1/admin/auth/me', async () => {
    const agent = request.agent(app);
    const loginRes = await agent
      .post('/api/v1/admin/auth/login')
      .send({ username: 'admin', password: 'AdminKsd@2026!' });
    expect(loginRes.status).toBe(200);

    const meRes = await agent.get('/api/v1/admin/auth/me');
    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.admin.username).toBe('admin');
  });

  it('should logout successfully and clear session', async () => {
    const agent = request.agent(app);
    await agent
      .post('/api/v1/admin/auth/login')
      .send({ username: 'admin', password: 'AdminKsd@2026!' });

    const logoutRes = await agent.post('/api/v1/admin/auth/logout');
    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);

    const checkRes = await agent.get('/api/v1/admin/auth/me');
    expect(checkRes.status).toBe(401);
  });
});
