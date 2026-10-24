require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

const db = require('./config/database');
const { ensureCsrfToken } = require('./utils/csrf');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Route handlers
const authRoutes = require('./routes/api/v1/authRoutes');
const serviceRoutes = require('./routes/api/v1/serviceRoutes');
const downloadRoutes = require('./routes/api/v1/downloadRoutes');
const blogRoutes = require('./routes/api/v1/blogRoutes');
const settingsRoutes = require('./routes/api/v1/settingsRoutes');
const announcementRoutes = require('./routes/api/v1/announcementRoutes');
const adminRoutes = require('./routes/api/v1/adminRoutes');
const pageRoutes = require('./routes/pageRoutes');

const app = express();
app.set('trust proxy', 1);

// Security Headers with Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        scriptSrcAttr: ["'unsafe-inline'"], // Enable inline event handlers (onclick, onchange, etc.)
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        styleSrcAttr: ["'unsafe-inline'"],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: process.env.APP_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser(process.env.SESSION_SECRET || 'fallback_cookie_secret_esksd'));

// Session store setup
let sessionStore;
try {
  if (!db.isDbInMemory() && process.env.NODE_ENV !== 'test') {
    sessionStore = new pgSession({
      pool: db.getPool(),
      tableName: 'session',
      createTableIfMissing: false,
    });
    sessionStore.on('error', (err) => {
      console.warn('PostgreSQL session store error:', err.message);
    });
  }
} catch (err) {
  console.warn('PostgreSQL session store initialization deferred to memory store:', err.message);
}

const isProduction = process.env.NODE_ENV === 'production';

app.use(
  session({
    store: sessionStore,
    name: process.env.SESSION_NAME || 'esksd_sid',
    secret: process.env.SESSION_SECRET || 'default_super_secret_for_sessions_2026',
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: isProduction, // Set true in production with HTTPS
      sameSite: 'lax',
      maxAge: parseInt(process.env.SESSION_MAX_AGE_MS || '86400000', 10), // 24 hours
    },
  })
);

// Static assets
app.use('/assets', express.static(path.join(__dirname, '../public/assets')));
// Publicly serve only safe blog images (controlled downloads go through /api/v1/downloads/:id/file)
app.use('/storage/blog-images', express.static(path.join(__dirname, '../storage/blog-images')));

// CSRF Token Provider Endpoint
app.get('/api/v1/csrf-token', (req, res) => {
  const token = ensureCsrfToken(req);
  res.json({ success: true, csrfToken: token });
});

// API v1 Routes
app.use('/api/v1/admin/auth', authRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/downloads', downloadRoutes);
app.use('/api/v1/blogs', blogRoutes);
app.use('/api/v1/settings', settingsRoutes);
app.use('/api/v1/announcements', announcementRoutes);
app.use('/api/v1/admin', adminRoutes);

// Frontend Page Routes
app.use('/', pageRoutes);

// 404 & Centralized Error Handler
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
