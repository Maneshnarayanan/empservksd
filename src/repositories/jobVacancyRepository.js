const db = require('../config/database');
const { slugify } = require('../utils/slugify');

/**
 * Normalizes and formats a vacancy database record.
 */
function hydrateJob(row) {
  if (!row) return null;
  let parsedBlocks = [];
  if (Array.isArray(row.blocks)) {
    parsedBlocks = row.blocks;
  } else if (typeof row.blocks === 'string') {
    try {
      parsedBlocks = JSON.parse(row.blocks);
    } catch (_) {
      parsedBlocks = [];
    }
  }
  return {
    ...row,
    blocks: parsedBlocks,
    view_count: Number(row.view_count) || 0,
    display_order: Number(row.display_order) || 0,
    is_featured: Boolean(row.is_featured),
    is_active: Boolean(row.is_active),
    last_date: row.last_date ? (row.last_date instanceof Date ? row.last_date.toISOString().split('T')[0] : String(row.last_date).split('T')[0]) : null,
  };
}

/**
 * Ensure a candidate slug is unique across job_vacancies.
 */
async function ensureUniqueSlug(desiredSlug, excludeId = null) {
  let candidate = slugify(desiredSlug);
  if (!candidate) candidate = 'job-vacancy';

  let suffix = 1;
  let current = candidate;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const query = excludeId
      ? 'SELECT id FROM job_vacancies WHERE slug = $1 AND id <> $2 LIMIT 1;'
      : 'SELECT id FROM job_vacancies WHERE slug = $1 LIMIT 1;';
    const params = excludeId ? [current, excludeId] : [current];
    const res = await db.query(query, params);
    if (res.rows.length === 0) {
      return current;
    }
    suffix += 1;
    current = `${candidate}-${suffix}`;
  }
}

/**
 * Retrieve paginated job vacancies with optional search and active filters.
 */
async function findAll({
  onlyActive = false,
  search = null,
  page = 1,
  limit = 20,
  isFeatured = null,
} = {}) {
  const whereClauses = [];
  const params = [];

  if (onlyActive) {
    params.push(true);
    whereClauses.push(`is_active = $${params.length}`);
  }

  if (isFeatured !== null && isFeatured !== undefined) {
    params.push(Boolean(isFeatured));
    whereClauses.push(`is_featured = $${params.length}`);
  }

  if (search && search.trim()) {
    params.push(`%${search.trim().toLowerCase()}%`);
    whereClauses.push(`(
      LOWER(title) LIKE $${params.length}
      OR LOWER(department) LIKE $${params.length}
      OR LOWER(COALESCE(category_no, '')) LIKE $${params.length}
      OR LOWER(COALESCE(location, '')) LIKE $${params.length}
      OR LOWER(COALESCE(qualification, '')) LIKE $${params.length}
    )`);
  }

  const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const countQuery = `SELECT COUNT(*)::int as total FROM job_vacancies ${whereStr};`;
  const countRes = await db.query(countQuery, params);
  const total = countRes.rows[0]?.total || 0;

  const safeLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const offset = (safePage - 1) * safeLimit;

  const dataParams = [...params, safeLimit, offset];
  const dataQuery = `
    SELECT id, title, slug, department, category_no, scale_of_pay, qualification, age_limit,
           last_date, vacancy_count, job_type, application_fee, location, description, how_to_apply,
           official_notification_url, apply_url, is_featured, is_active, display_order,
           COALESCE(view_count, 0) as view_count, blocks, created_at, updated_at
    FROM job_vacancies
    ${whereStr}
    ORDER BY display_order ASC, is_featured DESC, last_date ASC NULLS LAST, id DESC
    LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length};
  `;

  const res = await db.query(dataQuery, dataParams);
  return {
    vacancies: res.rows.map(hydrateJob),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1,
      hasMore: safePage * safeLimit < total,
    },
  };
}

/**
 * Retrieve vacancies tailored for the sidebar (active, sorted).
 */
async function findSidebarVacancies({ limit = 5 } = {}) {
  const safeLimit = Math.max(1, Math.min(20, parseInt(limit, 10) || 5));
  const query = `
    SELECT id, title, slug, department, category_no, scale_of_pay, last_date,
           vacancy_count, location, is_featured, is_active, COALESCE(view_count, 0) as view_count
    FROM job_vacancies
    WHERE is_active = true
    ORDER BY display_order ASC, is_featured DESC, last_date ASC NULLS LAST, id DESC
    LIMIT $1;
  `;
  const res = await db.query(query, [safeLimit]);
  return res.rows.map(hydrateJob);
}

/**
 * Find a single vacancy by its unique slug.
 */
async function findBySlug(slug, { onlyActive = false } = {}) {
  let query = `
    SELECT id, title, slug, department, category_no, scale_of_pay, qualification, age_limit,
           last_date, vacancy_count, job_type, application_fee, location, description, how_to_apply,
           official_notification_url, apply_url, is_featured, is_active, display_order,
           COALESCE(view_count, 0) as view_count, blocks, created_at, updated_at
    FROM job_vacancies
    WHERE slug = $1
  `;
  const params = [String(slug || '').trim().toLowerCase()];

  if (onlyActive) {
    params.push(true);
    query += ` AND is_active = $${params.length}`;
  }

  query += ' LIMIT 1;';
  const res = await db.query(query, params);
  return hydrateJob(res.rows[0] || null);
}

/**
 * Find a single vacancy by its primary key ID.
 */
async function findById(id) {
  const query = `
    SELECT id, title, slug, department, category_no, scale_of_pay, qualification, age_limit,
           last_date, vacancy_count, job_type, application_fee, location, description, how_to_apply,
           official_notification_url, apply_url, is_featured, is_active, display_order,
           COALESCE(view_count, 0) as view_count, blocks, created_at, updated_at
    FROM job_vacancies
    WHERE id = $1;
  `;
  const res = await db.query(query, [id]);
  return hydrateJob(res.rows[0] || null);
}

/**
 * Create a new job vacancy.
 */
async function create(data) {
  const finalSlug = await ensureUniqueSlug(data.slug || data.title);
  const blocksJson = data.blocks !== undefined ? JSON.stringify(data.blocks) : '[]';

  const query = `
    INSERT INTO job_vacancies (
      title, slug, department, category_no, scale_of_pay, qualification, age_limit,
      last_date, vacancy_count, job_type, application_fee, location, description, how_to_apply,
      official_notification_url, apply_url, is_featured, is_active, display_order, view_count, blocks
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11, $12, $13, $14,
      $15, $16, $17, $18, $19, 0, $20
    )
    RETURNING *;
  `;

  const values = [
    data.title.trim(),
    finalSlug,
    data.department.trim(),
    data.category_no ? data.category_no.trim() : null,
    data.scale_of_pay ? data.scale_of_pay.trim() : null,
    data.qualification ? data.qualification.trim() : null,
    data.age_limit ? data.age_limit.trim() : null,
    data.last_date || null,
    data.vacancy_count ? data.vacancy_count.trim() : null,
    data.job_type ? data.job_type.trim() : 'Permanent',
    data.application_fee ? data.application_fee.trim() : 'Free (Kerala PSC OTR)',
    data.location ? data.location.trim() : 'Kasaragod / Kerala',
    data.description || null,
    data.how_to_apply || null,
    data.official_notification_url ? data.official_notification_url.trim() : null,
    data.apply_url ? data.apply_url.trim() : null,
    Boolean(data.is_featured),
    data.is_active !== undefined ? Boolean(data.is_active) : true,
    parseInt(data.display_order, 10) || 0,
    blocksJson,
  ];

  const res = await db.query(query, values);
  return hydrateJob(res.rows[0]);
}

/**
 * Update an existing job vacancy.
 */
async function update(id, data) {
  let slug = data.slug;
  if (slug) {
    slug = await ensureUniqueSlug(slug, id);
  }

  const query = `
    UPDATE job_vacancies
    SET
      title = COALESCE($1, title),
      slug = COALESCE($2, slug),
      department = COALESCE($3, department),
      category_no = $4,
      scale_of_pay = $5,
      qualification = $6,
      age_limit = $7,
      last_date = $8,
      vacancy_count = $9,
      job_type = COALESCE($10, job_type),
      application_fee = $11,
      location = COALESCE($12, location),
      description = $13,
      how_to_apply = $14,
      official_notification_url = $15,
      apply_url = $16,
      is_featured = COALESCE($17, is_featured),
      is_active = COALESCE($18, is_active),
      display_order = COALESCE($19, display_order),
      blocks = CASE WHEN $20::text IS NOT NULL THEN $20::jsonb ELSE blocks END,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $21
    RETURNING *;
  `;

  const values = [
    data.title ? data.title.trim() : null,
    slug || null,
    data.department ? data.department.trim() : null,
    data.category_no !== undefined ? (data.category_no ? data.category_no.trim() : null) : null,
    data.scale_of_pay !== undefined ? (data.scale_of_pay ? data.scale_of_pay.trim() : null) : null,
    data.qualification !== undefined ? (data.qualification ? data.qualification.trim() : null) : null,
    data.age_limit !== undefined ? (data.age_limit ? data.age_limit.trim() : null) : null,
    data.last_date !== undefined ? data.last_date : null,
    data.vacancy_count !== undefined ? (data.vacancy_count ? data.vacancy_count.trim() : null) : null,
    data.job_type !== undefined ? (data.job_type ? data.job_type.trim() : 'Permanent') : null,
    data.application_fee !== undefined ? (data.application_fee ? data.application_fee.trim() : null) : null,
    data.location !== undefined ? (data.location ? data.location.trim() : null) : null,
    data.description !== undefined ? data.description : null,
    data.how_to_apply !== undefined ? data.how_to_apply : null,
    data.official_notification_url !== undefined ? (data.official_notification_url ? data.official_notification_url.trim() : null) : null,
    data.apply_url !== undefined ? (data.apply_url ? data.apply_url.trim() : null) : null,
    data.is_featured !== undefined ? Boolean(data.is_featured) : null,
    data.is_active !== undefined ? Boolean(data.is_active) : null,
    data.display_order !== undefined ? parseInt(data.display_order, 10) : null,
    data.blocks !== undefined ? JSON.stringify(data.blocks) : null,
    id,
  ];

  const res = await db.query(query, values);
  return hydrateJob(res.rows[0] || null);
}

/**
 * Delete a job vacancy.
 */
async function deleteJob(id) {
  const query = 'DELETE FROM job_vacancies WHERE id = $1 RETURNING *;';
  const res = await db.query(query, [id]);
  return hydrateJob(res.rows[0] || null);
}

/**
 * Toggle active status of a job vacancy.
 */
async function toggleStatus(id, isActive) {
  const query = `
    UPDATE job_vacancies
    SET is_active = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *;
  `;
  const res = await db.query(query, [Boolean(isActive), id]);
  return hydrateJob(res.rows[0] || null);
}

/**
 * Atomically increment view count of a job vacancy.
 */
async function incrementViewCount(id) {
  const query = `
    UPDATE job_vacancies
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE id = $1
    RETURNING view_count;
  `;
  const res = await db.query(query, [id]);
  return res.rows[0] ? Number(res.rows[0].view_count) : 0;
}

/**
 * Aggregate summary stats for vacancies.
 */
async function countVacancies() {
  const query = `
    SELECT
      COUNT(*)::int as total,
      COALESCE(SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END), 0)::int as active,
      COALESCE(SUM(view_count), 0)::int as total_views
    FROM job_vacancies;
  `;
  const res = await db.query(query);
  return res.rows[0] || { total: 0, active: 0, total_views: 0 };
}

module.exports = {
  findAll,
  findSidebarVacancies,
  findBySlug,
  findById,
  create,
  update,
  deleteJob,
  toggleStatus,
  incrementViewCount,
  countVacancies,
  ensureUniqueSlug,
};

