'use strict';

/**
 * Central application configuration.
 *
 * All settings are derived from environment variables so that nothing
 * sensitive is hard-coded. Call `validateConfig()` during application
 * startup to fail fast if required variables are missing.
 */

require('dotenv').config();

const config = {
  // ── Application ────────────────────────────────────────────────────────
  app: {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3000,
    apiPrefix: process.env.API_PREFIX || '/api/v1',
    isProduction: process.env.NODE_ENV === 'production',
    isDevelopment: process.env.NODE_ENV === 'development',
    isTest: process.env.NODE_ENV === 'test',
  },

  // ── Security ───────────────────────────────────────────────────────────
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // ── Database ───────────────────────────────────────────────────────────
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'makomu_exchange',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL !== 'false',
    pool: {
      min: parseInt(process.env.DB_POOL_MIN, 10) || 2,
      max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
      idleTimeoutMs: parseInt(process.env.DB_IDLE_TIMEOUT_MS, 10) || 30000,
      connectionTimeoutMs: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS, 10) || 2000,
    },
  },

  // ── Google Cloud ───────────────────────────────────────────────────────
  googleCloud: {
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    cloudSqlInstance: process.env.CLOUD_SQL_INSTANCE,
  },

  // ── Twilio WhatsApp ────────────────────────────────────────────────────
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    whatsappFrom: process.env.TWILIO_WHATSAPP_FROM,
  },

  // ── CORS ───────────────────────────────────────────────────────────────
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  },

  // ── Logging ────────────────────────────────────────────────────────────
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

// ── Validation ─────────────────────────────────────────────────────────────

/**
 * Validate that all required environment variables are present.
 * Throws an error with a clear message if any are missing.
 *
 * Call this once at application startup (e.g. in server.js or app.js).
 */
function validateConfig() {
  const required = [
    ['auth.jwtSecret', config.auth.jwtSecret],
  ];

  // In production, also require database credentials
  if (config.app.isProduction) {
    required.push(
      ['database.url or database.password', config.database.url || config.database.password],
      ['googleCloud.projectId', config.googleCloud.projectId],
    );
  }

  const missing = required
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variable(s): ${missing.join(', ')}\n` +
      'Check backend/.env.example for the full list of required variables.'
    );
  }
}

module.exports = { config, validateConfig };
