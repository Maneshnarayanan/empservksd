const request = require('supertest');
const app = require('../src/app');

describe('News Posters API & Home Showcase Workflow', () => {
  let agent;
  let csrfToken;

  beforeAll(async () => {
    agent = request.agent(app);
    const loginRes = await agent
      .post('/api/v1/admin/auth/login')
      .send({ username: 'admin', password: 'AdminKsd@2026!' });
    csrfToken = loginRes.body.csrfToken;
  });

  it('should list public news posters ordered chronologically by published_date DESC', async () => {
    const res = await request(app).get('/api/v1/news');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(3);

    // Verify ordering: published_date of item 0 should be >= item 1
    for (let i = 0; i < res.body.data.length - 1; i++) {
      const d1 = new Date(res.body.data[i].published_date || res.body.data[i].created_at);
      const d2 = new Date(res.body.data[i + 1].published_date || res.body.data[i + 1].created_at);
      expect(d1.getTime()).toBeGreaterThanOrEqual(d2.getTime());
    }
  });

  it('should list home showcase posters ordered by display_order ASC (max 3)', async () => {
    const res = await request(app).get('/api/v1/news/home');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeLessThanOrEqual(3);

    res.body.data.forEach(item => {
      expect(item.is_home_published).toBe(true);
    });

    for (let i = 0; i < res.body.data.length - 1; i++) {
      expect(res.body.data[i].display_order).toBeLessThanOrEqual(res.body.data[i + 1].display_order);
    }
  });

  it('should reject creating a 4th home-published poster when 3 are already active', async () => {
    // Current seed in migration 009 has 3 posters with is_home_published = true
    const res = await agent
      .post('/api/v1/admin/news')
      .set('X-CSRF-Token', csrfToken)
      .field('title', 'Fourth Showcase Poster Attempt')
      .field('caption', 'This should fail because max limit is 3')
      .field('description', 'Exceeding the limit of 3 home showcase posters.')
      .field('published_date', '2026-10-29')
      .field('is_home_published', 'true')
      .field('display_order', '1')
      .attach('poster', Buffer.from('fake png image data'), 'test_poster.png');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Maximum 3 news posters/i);
  });

  it('should allow creating a poster with is_home_published = false without error', async () => {
    const res = await agent
      .post('/api/v1/admin/news')
      .set('X-CSRF-Token', csrfToken)
      .field('title', 'Regular News Poster Only')
      .field('caption', 'Not on homepage showcase')
      .field('description', 'Full explanatory article for public news section only.')
      .field('published_date', '2026-10-29')
      .field('is_home_published', 'false')
      .attach('poster', Buffer.from('fake png image data'), 'regular.png');

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.is_home_published).toBe(false);
    expect(res.body.data.display_order).toBe(0);
  });

  it('should allow admin to uncheck a poster from home, freeing up a showcase slot', async () => {
    // Get all news posters
    const listRes = await agent.get('/api/v1/admin/news');
    const homePosters = listRes.body.data.filter(p => p.is_home_published);
    expect(homePosters.length).toBe(3);

    const posterToUnpublish = homePosters[0];
    const updateRes = await agent
      .put(`/api/v1/admin/news/${posterToUnpublish.id}`)
      .set('X-CSRF-Token', csrfToken)
      .field('is_home_published', 'false');

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.is_home_published).toBe(false);
    expect(updateRes.body.data.display_order).toBe(0);

    // Verify home posters count is now 2
    const homeRes = await request(app).get('/api/v1/news/home');
    expect(homeRes.body.data.length).toBe(2);
  });
});
