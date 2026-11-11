const request = require('supertest');
const app = require('../src/app');

describe('Quick Links (Popular Articles / Trending Guidelines) API', () => {
  let agent;
  let csrfToken;

  beforeAll(async () => {
    agent = request.agent(app);
    const loginRes = await agent
      .post('/api/v1/admin/auth/login')
      .send({ username: 'admin', password: 'AdminKsd@2026!' });
    csrfToken = loginRes.body.csrfToken;
  });

  it('should fetch public active quick links without authentication', async () => {
    const res = await request(app).get('/api/v1/quick-links');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('title');
    expect(res.body.data[0]).toHaveProperty('url');
    expect(res.body.data[0]).toHaveProperty('display_order');
    expect(res.body.data[0].is_active).toBe(true);
  });

  it('should reject quick link creation without authentication', async () => {
    const res = await request(app)
      .post('/api/v1/admin/quick-links')
      .send({
        title: 'Unauthorized Quick Link',
        url: '/downloads'
      });

    expect(res.status).toBe(401);
  });

  it('should reject quick link creation without CSRF token', async () => {
    const res = await agent
      .post('/api/v1/admin/quick-links')
      .send({
        title: 'CSRF Missing Quick Link',
        url: '/downloads'
      });

    expect(res.status).toBe(403);
  });

  it('should reject quick link creation when title or url is missing', async () => {
    const res = await agent
      .post('/api/v1/admin/quick-links')
      .set('X-CSRF-Token', csrfToken)
      .send({
        title: '',
        url: ''
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should allow admin to create, get, update, and delete a quick link', async () => {
    // 1. Create Quick Link
    const createRes = await agent
      .post('/api/v1/admin/quick-links')
      .set('X-CSRF-Token', csrfToken)
      .send({
        title: 'Kerala PSC Assistant Syllabus 2026',
        url: 'https://keralapsc.gov.in',
        badge_text: 'NEW',
        target_blank: true,
        display_order: 15,
        is_active: true
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.data.title).toBe('Kerala PSC Assistant Syllabus 2026');
    expect(createRes.body.data.badge_text).toBe('NEW');
    expect(createRes.body.data.target_blank).toBe(true);

    const newId = createRes.body.data.id;

    // 2. Read single quick link
    const getRes = await agent.get(`/api/v1/admin/quick-links/${newId}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.success).toBe(true);
    expect(getRes.body.data.id).toBe(newId);
    expect(getRes.body.data.title).toBe('Kerala PSC Assistant Syllabus 2026');

    // 3. Update quick link
    const updateRes = await agent
      .put(`/api/v1/admin/quick-links/${newId}`)
      .set('X-CSRF-Token', csrfToken)
      .send({
        title: 'Kerala PSC Assistant Exam Pattern & Hall Tickets',
        badge_text: 'UPDATED',
        display_order: 2
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.title).toBe('Kerala PSC Assistant Exam Pattern & Hall Tickets');
    expect(updateRes.body.data.badge_text).toBe('UPDATED');
    expect(updateRes.body.data.display_order).toBe(2);

    // 4. Delete quick link
    const deleteRes = await agent
      .delete(`/api/v1/admin/quick-links/${newId}`)
      .set('X-CSRF-Token', csrfToken);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    // 5. Verify deleted
    const verifyRes = await agent.get(`/api/v1/admin/quick-links/${newId}`);
    expect(verifyRes.status).toBe(404);
  });
});

