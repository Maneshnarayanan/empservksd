const request = require('supertest');
const app = require('../src/app');

describe('Job Vacancies & Public/Admin Recruitment Desk APIs', () => {
  let agent;
  let csrfToken;

  beforeAll(async () => {
    agent = request.agent(app);
    const loginRes = await agent
      .post('/api/v1/admin/auth/login')
      .send({ username: 'admin', password: 'AdminKsd@2026!' });
    csrfToken = loginRes.body.csrfToken;
  });

  describe('Public Job Vacancies APIs', () => {
    it('should list seeded active job vacancies via GET /api/v1/jobs', async () => {
      const res = await request(app).get('/api/v1/jobs');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.vacancies)).toBe(true);
      expect(res.body.vacancies.length).toBeGreaterThanOrEqual(4);

      const slugs = res.body.vacancies.map(v => v.slug);
      expect(slugs).toContain('kerala-psc-ldc-bill-collector-kasaragod-2026');
      expect(slugs).toContain('nhm-kasaragod-staff-nurse-medical-officer-2026');

      const first = res.body.vacancies[0];
      expect(first).toHaveProperty('title');
      expect(first).toHaveProperty('department');
      expect(first).toHaveProperty('scale_of_pay');
      expect(first).toHaveProperty('view_count');
      expect(typeof first.view_count).toBe('number');
    });

    it('should retrieve sidebar vacancies list via GET /api/v1/jobs/sidebar', async () => {
      const res = await request(app).get('/api/v1/jobs/sidebar?limit=4');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeLessThanOrEqual(4);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should retrieve single job vacancy by slug and increment view count via GET /api/v1/jobs/:slug', async () => {
      const slug = 'kerala-psc-ldc-bill-collector-kasaragod-2026';
      const beforeRes = await request(app).get(`/api/v1/jobs/${slug}`);
      expect(beforeRes.status).toBe(200);
      expect(beforeRes.body.success).toBe(true);
      const initialViews = beforeRes.body.data.view_count;

      const afterRes = await request(app).get(`/api/v1/jobs/${slug}`);
      expect(afterRes.status).toBe(200);
      expect(afterRes.body.data.view_count).toBe(initialViews + 1);
      expect(afterRes.body.data.title).toContain('Lower Division Clerk');
      expect(afterRes.body.data.apply_url).toContain('thulasi.psc.kerala.gov.in');
    });

    it('should retrieve Malayalam job vacancy by slug', async () => {
      const slug = 'kseb-sub-engineer-meter-reader-malayalam-2026';
      const res = await request(app).get(`/api/v1/jobs/${slug}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toContain('കെ.എസ്.ഇ.ബി');
    });

    it('should return 404 for unknown job vacancy slug', async () => {
      const res = await request(app).get('/api/v1/jobs/non-existent-vacancy-999');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Frontend Pages & SSR Layout', () => {
    it('should render public job vacancies directory at /jobs with shared layout', async () => {
      const res = await request(app).get('/jobs');
      expect(res.status).toBe(200);
      expect(res.text).toContain('EMPLOYEES SERVICES');
      expect(res.text).toContain('Job Vacancies');
      expect(res.text).toContain('Privacy Policy');
    });

    it('should redirect /vacancies to /jobs', async () => {
      const res = await request(app).get('/vacancies');
      expect(res.status).toBe(302);
      expect(res.header.location).toBe('/jobs');
    });

    it('should render dedicated job vacancy detail page at /jobs/:slug with shared layout', async () => {
      const slug = 'kerala-psc-ldc-bill-collector-kasaragod-2026';
      const res = await request(app).get(`/jobs/${slug}`);
      expect(res.status).toBe(200);
      expect(res.text).toContain('EMPLOYEES SERVICES');
      expect(res.text).toContain('job-detail-card');
      expect(res.text).toContain('Privacy Policy');
    });

    it('should verify homepage includes Job Vacancy sidebar card below Popular Article', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.text).toContain('Popular Article');
      expect(res.text).toContain('Job Vacancy');
      expect(res.text).toContain('sidebar-job-vacancies-list');
      expect(res.text).toContain('Latest Download');

      // Check relative order in the sidebar: Popular Article appears before Job Vacancy, and Job Vacancy appears before Latest Download
      const popularIdx = res.text.indexOf('sidebar-popular-articles-list');
      const jobIdx = res.text.indexOf('sidebar-job-vacancies-list');
      const downloadIdx = res.text.indexOf('sidebar-latest-downloads-list');

      expect(popularIdx).toBeGreaterThan(-1);
      expect(jobIdx).toBeGreaterThan(popularIdx);
      expect(downloadIdx).toBeGreaterThan(jobIdx);
    });
  });

  describe('Admin Job Vacancies Management APIs', () => {
    let createdJobId;

    it('should reject unauthenticated admin jobs access', async () => {
      const res = await request(app).get('/api/v1/admin/jobs');
      expect(res.status).toBe(401);
    });

    it('should list all vacancies and stats for authenticated admin', async () => {
      const res = await agent.get('/api/v1/admin/jobs');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.vacancies)).toBe(true);
      expect(res.body.stats).toHaveProperty('total');
      expect(res.body.stats).toHaveProperty('active');
      expect(res.body.stats).toHaveProperty('total_views');
    });

    it('should create a new job vacancy via POST /api/v1/admin/jobs', async () => {
      const newJob = {
        title: 'District Soil Conservation Officer — Kasaragod Circle',
        department: 'Agriculture Development & Farmers Welfare Department',
        category_no: 'Cat. No. 605/2026',
        scale_of_pay: '₹39,500 - ₹83,000',
        qualification: 'Degree in Agricultural Engineering / Civil Engineering',
        age_limit: '18 - 36 years',
        last_date: '2026-12-28',
        vacancy_count: '03 Posts',
        job_type: 'Permanent / Regular State Service',
        location: 'Kasaragod District',
        application_fee: 'Free (Kerala PSC OTR)',
        apply_url: 'https://thulasi.psc.kerala.gov.in',
        description: 'Selection for District Soil Conservation Establishment.',
        is_featured: true,
        is_active: true,
        display_order: 10,
      };

      const res = await agent
        .post('/api/v1/admin/jobs')
        .set('X-CSRF-Token', csrfToken)
        .send(newJob);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.slug).toContain('district-soil-conservation-officer');
      createdJobId = res.body.data.id;
    });

    it('should retrieve created vacancy by ID via GET /api/v1/admin/jobs/:id', async () => {
      const res = await agent.get(`/api/v1/admin/jobs/${createdJobId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toContain('District Soil Conservation Officer');
      expect(res.body.data.is_featured).toBe(true);
    });

    it('should update vacancy details via PUT /api/v1/admin/jobs/:id', async () => {
      const res = await agent
        .put(`/api/v1/admin/jobs/${createdJobId}`)
        .set('X-CSRF-Token', csrfToken)
        .send({
          title: 'District Soil Conservation Officer (Revised Scale)',
          scale_of_pay: '₹41,300 - ₹87,000',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toContain('(Revised Scale)');
      expect(res.body.data.scale_of_pay).toBe('₹41,300 - ₹87,000');
    });

    it('should toggle vacancy active status via PATCH /api/v1/admin/jobs/:id/status', async () => {
      const res = await agent
        .patch(`/api/v1/admin/jobs/${createdJobId}/status`)
        .set('X-CSRF-Token', csrfToken)
        .send({ is_active: false });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.is_active).toBe(false);

      // Verify public list does not show inactive vacancy
      const publicRes = await request(app).get('/api/v1/jobs');
      const found = publicRes.body.vacancies.find(v => v.id === createdJobId);
      expect(found).toBeUndefined();
    });

    it('should include job vacancies in dashboard stats via GET /api/v1/admin/stats', async () => {
      const res = await agent.get('/api/v1/admin/stats');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('jobVacancies');
      expect(res.body.data).toHaveProperty('activeVacancies');
      expect(res.body.data).toHaveProperty('jobViews');
      expect(res.body.data.jobVacancies).toBeGreaterThanOrEqual(5);
    });

    it('should delete vacancy via DELETE /api/v1/admin/jobs/:id', async () => {
      const res = await agent
        .delete(`/api/v1/admin/jobs/${createdJobId}`)
        .set('X-CSRF-Token', csrfToken);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const checkRes = await agent.get(`/api/v1/admin/jobs/${createdJobId}`);
      expect(checkRes.status).toBe(404);
    });
  });
});
