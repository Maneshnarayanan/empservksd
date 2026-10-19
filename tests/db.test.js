const db = require('../src/config/database');

describe('Database Connectivity and Migrations', () => {
  it('should query the database successfully', async () => {
    const res = await db.query('SELECT 1 + 1 as sum;');
    expect(res.rows[0].sum).toBe(2);
  });

  it('should have initial service categories seeded from WEB DESIGN.xlsx', async () => {
    const res = await db.query('SELECT * FROM service_categories ORDER BY display_order ASC;');
    expect(res.rows.length).toBeGreaterThanOrEqual(11);

    const names = res.rows.map(r => r.name);
    expect(names).toContain('SPARK');
    expect(names).toContain('BIMS');
    expect(names).toContain('AGEES');
    expect(names).toContain('TREASURY');
    expect(names).toContain('TAX');
    expect(names).toContain('EDUCATION');
    expect(names).toContain('PF');
    expect(names).toContain('KITE');
    expect(names).toContain('INSURANCE');
    expect(names).toContain('PRISM');
    expect(names).toContain('MEDISEP');
  });

  it('should have initial blog categories seeded from WEB DESIGN.xlsx', async () => {
    const res = await db.query('SELECT * FROM blog_categories ORDER BY display_order ASC;');
    expect(res.rows.length).toBeGreaterThanOrEqual(5);

    const names = res.rows.map(r => r.name);
    expect(names).toContain('HM BLOG');
    expect(names).toContain('MUTTAM BLOG');
    expect(names).toContain('MATHS BLOG');
    expect(names).toContain('ALRAHMAN');
    expect(names).toContain('RENJITHKUMAR');
  });

  it('should have verified website settings loaded from WEB DESIGN.xlsx', async () => {
    const res = await db.query('SELECT * FROM website_settings;');
    const map = {};
    res.rows.forEach(r => map[r.key] = r.value);

    expect(map.site_title).toBe('EMPLOYEES SERVICE, KASARAGOD');
    expect(map.site_address).toBe('BANK ROAD, NEAR MALLIKARJUNA TEMPLE, KASARGOD');
    expect(map.contact_email).toBe('esksd31@gmail.com');
    expect(map.contact_mobile).toBe('9447396181');
    expect(map.contact_whatsapp).toBe('9447396181');
  });
});
