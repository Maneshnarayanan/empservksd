const settingsRepo = require('../repositories/settingsRepository');
const categoryRepo = require('../repositories/serviceCategoryRepository');
const linkRepo = require('../repositories/serviceLinkRepository');
const downloadRepo = require('../repositories/downloadRepository');
const blogArticleRepo = require('../repositories/blogArticleRepository');
const customPageRepo = require('../repositories/customPageRepository');
const newsRepo = require('../repositories/newsPosterRepository');
const jobVacancyRepo = require('../repositories/jobVacancyRepository');

async function getPublicSettings(req, res, next) {
  try {
    const { map } = await settingsRepo.getAllSettings();
    // Return only safe public fields
    return res.json({
      success: true,
      data: {
        site_title: map.site_title || 'EMPLOYEES SERVICES, KASARAGOD',
        site_tagline: map.site_tagline || 'Employees Services & Community Resource Portal',
        site_address: map.site_address || 'BANK ROAD, NEAR MALLIKARJUNA TEMPLE, KASARGOD',
        contact_email: map.contact_email || 'esksd31@gmail.com',
        contact_mobile: map.contact_mobile || '9447396181',
        contact_whatsapp: map.contact_whatsapp || '9447396181',
      },
    });
  } catch (err) {
    next(err);
  }
}

async function getAllSettings(req, res, next) {
  try {
    const data = await settingsRepo.getAllSettings();
    return res.json({ success: true, data: data.raw, map: data.map });
  } catch (err) {
    next(err);
  }
}

async function updateSettings(req, res, next) {
  try {
    const settingsMap = req.body;
    if (!settingsMap || typeof settingsMap !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid settings payload.' });
    }

    const updated = await settingsRepo.updateMultiple(settingsMap);
    return res.json({
      success: true,
      message: 'Website settings updated successfully.',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

async function getDashboardStats(req, res, next) {
  try {
    const [
      catCount,
      linkCount,
      confLinkCount,
      downloadCount,
      activeDownloadCount,
      totalDownloads,
      blogStats,
      pageStats,
      posterStats,
      jobStats,
    ] = await Promise.all([
      categoryRepo.countCategories(),
      linkRepo.countLinks(false),
      linkRepo.countLinks(true),
      downloadRepo.countDownloads(false),
      downloadRepo.countDownloads(true),
      downloadRepo.getTotalDownloadCount(),
      blogArticleRepo.countArticles(),
      customPageRepo.countPages(),
      newsRepo.countPosters(),
      jobVacancyRepo.countVacancies(),
    ]);

    return res.json({
      success: true,
      data: {
        categories: catCount,
        serviceLinks: linkCount,
        configuredLinks: confLinkCount,
        unconfiguredLinks: linkCount - confLinkCount,
        downloads: downloadCount,
        activeDownloads: activeDownloadCount,
        totalDownloads,
        blogArticles: blogStats.total,
        publishedArticles: blogStats.published,
        draftArticles: blogStats.drafts,
        blogViews: blogStats.total_views || 0,
        customPages: pageStats.total,
        publishedPages: pageStats.published,
        pageViews: pageStats.totalViews || 0,
        newsPosters: posterStats.total,
        activePosters: posterStats.active,
        posterViews: posterStats.total_views || 0,
        jobVacancies: jobStats.total,
        activeVacancies: jobStats.active,
        jobViews: jobStats.total_views || 0,
      },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPublicSettings,
  getAllSettings,
  updateSettings,
  getDashboardStats,
};
