const request = require('supertest');
const path = require('path');
const fs = require('fs');
const app = require('../src/app');

describe('Home Sliders Management & API', () => {
  let agent;
  let csrfToken;

  beforeAll(async () => {
    agent = request.agent(app);
    const loginRes = await agent
      .post('/api/v1/admin/auth/login')
      .send({ username: 'admin', password: 'AdminKsd@2026!' });
    csrfToken = loginRes.body.csrfToken;
  });

  it('should list public active sliders without authentication', async () => {
    const res = await request(app).get('/api/v1/sliders');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty('title');
    expect(res.body.data[0]).toHaveProperty('link_url');
    expect(res.body.data[0]).toHaveProperty('image_url');
  });

  it('should reject slider creation without authentication', async () => {
    const res = await request(app)
      .post('/api/v1/admin/sliders')
      .field('title', 'Unauthorized Slider')
      .field('link_url', '/downloads');

    expect(res.status).toBe(401);
  });

  it('should reject slider creation if required fields or image are missing', async () => {
    const res = await agent
      .post('/api/v1/admin/sliders')
      .set('X-CSRF-Token', csrfToken)
      .field('title', '')
      .field('link_url', '/downloads');

    expect(res.status).toBe(400);
  });

  it('should allow admin to upload a new slider and manage it', async () => {
    // Create temporary image file for testing
    const testImagePath = path.join(__dirname, 'test-slide.png');
    fs.writeFileSync(testImagePath, 'fake-png-binary-content-12345');

    try {
      // 1. Create Slider
      const createRes = await agent
        .post('/api/v1/admin/sliders')
        .set('X-CSRF-Token', csrfToken)
        .field('title', 'Kerala PSC New Notification 2026')
        .field('description', 'Check latest vacancies, notifications and syllabus on PSC portal')
        .field('link_url', '/news')
        .field('button_text', 'View Notification')
        .field('display_order', 10)
        .field('is_active', 'true')
        .attach('image', testImagePath);

      expect(createRes.status).toBe(201);
      expect(createRes.body.success).toBe(true);
      expect(createRes.body.data.title).toBe('Kerala PSC New Notification 2026');
      expect(createRes.body.data.link_url).toBe('/news');
      expect(createRes.body.data.button_text).toBe('View Notification');

      const newSliderId = createRes.body.data.id;

      // 2. Get Single Slider
      const getRes = await agent.get(`/api/v1/admin/sliders/${newSliderId}`);
      expect(getRes.status).toBe(200);
      expect(getRes.body.data.id).toBe(newSliderId);

      // 3. Update Slider
      const updateRes = await agent
        .put(`/api/v1/admin/sliders/${newSliderId}`)
        .set('X-CSRF-Token', csrfToken)
        .field('title', 'Kerala PSC Notification 2026 (Updated)')
        .field('link_url', '/downloads');

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.success).toBe(true);
      expect(updateRes.body.data.title).toBe('Kerala PSC Notification 2026 (Updated)');
      expect(updateRes.body.data.link_url).toBe('/downloads');

      // 4. Delete Slider
      const deleteRes = await agent
        .delete(`/api/v1/admin/sliders/${newSliderId}`)
        .set('X-CSRF-Token', csrfToken);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);
    } finally {
      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
      }
    }
  });
});

