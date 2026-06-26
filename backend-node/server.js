const logger = require('./utils/logger');
require('dotenv').config();

// ── Sentry (must init before any other require that might throw) ──────────────
if (process.env.SENTRY_DSN) {
  const Sentry = require('@sentry/node');
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 0.1,
  });
}

// ── Upload directory bootstrap (must exist before multer runs) ────────────────
// This runs at startup so the dirs survive Docker volume mounts that replace
// the image-layer directories created by the Dockerfile RUN mkdir commands.
const fs   = require('fs');
const path = require('path');
[
  'public/uploads/images/stories',
  'public/uploads/images/settings',
  'public/uploads/images/cases',
  'public/uploads/images/team',
  'public/uploads/documents/stories',
  'public/uploads/documents/grants',
  'public/uploads/documents/resources',
].forEach((dir) => fs.mkdirSync(path.join(__dirname, dir), { recursive: true }));

// ── Startup validation ────────────────────────────────────────────────────────
const REQUIRED_ENV = ['MONGO_URL', 'JWT_SECRET', 'CORS_ORIGINS'];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  logger.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'same-site' }
}));

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.CORS_ORIGINS.split(',').map((o) => o.trim());
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (curl, mobile apps, same-origin)
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true
}));

// ── Rate limiting ─────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { detail: 'Too many attempts, please try again later' }
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false
});

// ── Request timeout (30 s) ────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setTimeout(30000, () => {
    res.status(503).json({ detail: 'Request timed out' });
  });
  next();
});

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use('/api', apiLimiter);

// ── DB-ready guard — reject API requests instantly if DB not yet connected ────
app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ detail: 'Service starting up, please retry in a moment' });
  }
  next();
});

// ── Static files ──────────────────────────────────────────────────────────────
// Images and non-sensitive documents served publicly
app.use('/uploads/images',              express.static(path.join(__dirname, 'public', 'uploads', 'images')));
app.use('/uploads/documents/stories',   express.static(path.join(__dirname, 'public', 'uploads', 'documents', 'stories')));
app.use('/uploads/documents/resources', express.static(path.join(__dirname, 'public', 'uploads', 'documents', 'resources')));
// Grant documents are NOT served statically — access goes through auth route below

// ── MongoDB connection ────────────────────────────────────────────────────────
const mongoUrl = process.env.MONGO_URL;
const dbName = process.env.DB_NAME || 'legal_guardian';

mongoose.connect(`${mongoUrl}/${dbName}`, {
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
  maxPoolSize: 20
}).catch((err) => {
  logger.error('❌ MongoDB connection failed:', err.message);
  process.exit(1);
});

mongoose.connection.on('connected', () => {
  logger.info('✅ MongoDB connected');
  createDefaultSettings().catch((e) => logger.error({ err: e }, 'Settings init error:'));
});

mongoose.connection.on('error', (err) => {
  logger.error('❌ MongoDB error:', err.message);
});

// ── Routes ────────────────────────────────────────────────────────────────────
const authRoutes      = require('./routes/auth');
const storyRoutes     = require('./routes/stories');
const adminRoutes     = require('./routes/admin');
const advocateRoutes  = require('./routes/advocates');
const grantRoutes     = require('./routes/grants');
const contactRoutes   = require('./routes/contact');
const merchandiseRoutes = require('./routes/merchandise');
const orderRoutes     = require('./routes/orders');
const settingsRoutes  = require('./routes/settings');
const publicRoutes    = require('./routes/public');
const casesRoutes     = require('./routes/cases');
const teamMembersRoutes = require('./routes/teamMembers');
const resourcesRoutes   = require('./routes/resources');
const volunteerRoutes     = require('./routes/volunteers');
const opportunityRoutes   = require('./routes/opportunities');
const doctorRoutes        = require('./routes/doctors');
const journalistRoutes    = require('./routes/journalists');
const researcherRoutes    = require('./routes/researchers');
const eventRoutes         = require('./routes/events');

app.use('/api/auth', authLimiter);

app.use('/api', authRoutes);
app.use('/api', storyRoutes);
app.use('/api', adminRoutes);
app.use('/api', advocateRoutes);
app.use('/api', grantRoutes);
app.use('/api', contactRoutes);
app.use('/api', merchandiseRoutes);
app.use('/api', orderRoutes);
app.use('/api', settingsRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api', publicRoutes);
app.use('/api', casesRoutes);
app.use('/api', teamMembersRoutes);
app.use('/api', volunteerRoutes);
app.use('/api', opportunityRoutes);
app.use('/api', doctorRoutes);
app.use('/api', journalistRoutes);
app.use('/api', researcherRoutes);
app.use('/api', eventRoutes);

// ── Root ──────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: "VOICE API" });
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', async (req, res) => {
  const checks = { db: 'disconnected', uploads: 'unknown', env: 'ok' };
  let healthy = true;

  // DB ping
  try {
    await mongoose.connection.db.admin().ping();
    checks.db = 'connected';
  } catch {
    healthy = false;
  }

  // Uploads folder writable
  try {
    const testPath = path.join(__dirname, 'public', 'uploads', '.healthcheck');
    fs.writeFileSync(testPath, '1');
    fs.unlinkSync(testPath);
    checks.uploads = 'writable';
  } catch {
    checks.uploads = 'not writable';
    healthy = false;
  }

  // Required env vars present
  const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
  if (missing.length) {
    checks.env = `missing: ${missing.join(', ')}`;
    healthy = false;
  }

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    ...checks,
    uptime: Math.floor(process.uptime()),
    memory_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),
  });
});

// ── Default settings (no admin creation — use scripts/create-admin.js) ────────
const Settings = require('./models/Settings');

async function createDefaultSettings() {
  const existing = await Settings.findOne({ _id: 'site_settings' });
  if (!existing) {
    await Settings.create({
      _id: 'site_settings',
      site_name: "VOICE-Victims' Outreach & Initiative for Crime of Medical Negligence",
      tagline: '',
      contact_email: '',
      contact_phone: '',
      address: '',
      upi_id: '',
      upi_payee_name: '',
      hero_title: '',
      hero_subtitle: '',
      about_mission: '',
      about_vision: '',
      stats_years_of_service: 1,
      stats_cases_resolved: 0,
      resources_hero_title: '',
      resources_hero_description: '',
      resources_content: ''
    });
    logger.info('✅ Default site settings created');
  }
}

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
const shutdown = async (signal) => {
  logger.info(`${signal} received — shutting down`);
  server.close(async () => {
    await mongoose.connection.close();
    logger.info('✅ Graceful shutdown complete');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

// Capture uncaught exceptions in Sentry if configured
process.on('uncaughtException', (err) => {
  if (process.env.SENTRY_DSN) require('@sentry/node').captureException(err);
  logger.error({ err: err }, 'Uncaught exception:');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  if (process.env.SENTRY_DSN) require('@sentry/node').captureException(reason);
  logger.error({ err: reason }, 'Unhandled rejection:');
});

module.exports = app;
