'use strict';

/**
 * Database connection configuration for Google Cloud SQL (PostgreSQL).
 *
 * The connection is built from environment variables so that the same
 * code works locally (via Cloud SQL Proxy or Docker) and in production.
 *
 * Required env vars (set in .env or your runtime environment):
 *   DATABASE_URL  – full connection string (preferred), OR
 *   DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, DB_SSL
 */

const { Pool } = require('pg');

// ─── Build connection options ──────────────────────────────────────────────

function buildPoolConfig() {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: resolveSsl(),
      max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
      min: parseInt(process.env.DB_POOL_MIN, 10) || 2,
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS, 10) || 30000,
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS, 10) || 2000,
    };
  }

  return {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    database: process.env.DB_NAME || 'makomu_exchange',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD,
    ssl: resolveSsl(),
    max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
    min: parseInt(process.env.DB_POOL_MIN, 10) || 2,
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS, 10) || 30000,
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT_MS, 10) || 2000,
  };
}

/**
 * Resolve SSL settings.
 *
 * - In production the Cloud SQL Proxy handles encryption, so we set
 *   rejectUnauthorized to false when connecting through it
 *   (host is 127.0.0.1).
 * - For direct connections to Cloud SQL we require SSL.
 * - In development/test (NODE_ENV !== 'production') SSL can be disabled
 *   to keep local Docker-based setups simple.
 */
function resolveSsl() {
  if (process.env.NODE_ENV !== 'production') {
    const sslEnv = process.env.DB_SSL;
    if (!sslEnv || sslEnv === 'false') return false;
  }

  // When using Cloud SQL Proxy, the proxy itself handles SSL; disable
  // certificate verification for 127.0.0.1 connections.
  const host = process.env.DB_HOST || '127.0.0.1';
  if (host === '127.0.0.1' || host === 'localhost') {
    return { rejectUnauthorized: false };
  }

  return { rejectUnauthorized: true };
}

// ─── Create pool ───────────────────────────────────────────────────────────

const pool = new Pool(buildPoolConfig());

// Log successful connections in development
pool.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[DB] New client connected to PostgreSQL');
  }
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err.message);
});

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Execute a query using a client from the pool.
 *
 * @param {string} text    SQL query string (supports $1, $2 … placeholders)
 * @param {Array}  params  Query parameters
 * @returns {Promise<import('pg').QueryResult>}
 */
async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DB] query executed in ${duration}ms – rows: ${result.rowCount}`);
  }

  return result;
}

/**
 * Acquire a dedicated client from the pool for use in transactions.
 * Remember to call client.release() when done.
 *
 * @returns {Promise<import('pg').PoolClient>}
 */
async function getClient() {
  return pool.connect();
}

/**
 * Verify that the database connection is alive.
 * Useful for health-check endpoints.
 *
 * @returns {Promise<boolean>}
 */
async function testConnection() {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
    return true;
  } finally {
    client.release();
  }
}

module.exports = { pool, query, getClient, testConnection };
