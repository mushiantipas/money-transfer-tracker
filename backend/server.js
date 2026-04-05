'use strict';

require('dotenv').config({ path: '../.env.local' });

const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting — applied to all routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// Helper: log error and return a generic message to the client
function handleError(res, err, status) {
  console.error(err);
  res.status(status || 500).json({ error: 'An internal server error occurred.' });
}

// Generate a collision-safe transaction reference
function generateReference() {
  return `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    console.error(err);
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

// --- Customers ---
app.get('/api/customers', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM customers WHERE is_active = TRUE ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    handleError(res, err);
  }
});

app.post('/api/customers', async (req, res) => {
  const { name, phone_number, email, id_number, country } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'name is required.' });
  }
  if (!phone_number || typeof phone_number !== 'string' || phone_number.trim() === '') {
    return res.status(400).json({ error: 'phone_number is required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO customers (name, phone_number, email, id_number, country)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name.trim(), phone_number.trim(), email || null, id_number || null, country || 'Kenya']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    handleError(res, err);
  }
});

// --- Transactions ---
app.get('/api/transactions', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, c.name AS sender_name, c.phone_number AS sender_phone
       FROM transactions t
       LEFT JOIN customers c ON t.sender_id = c.id
       ORDER BY t.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    handleError(res, err);
  }
});

app.post('/api/transactions', async (req, res) => {
  const {
    sender_id,
    receiver_name,
    receiver_phone,
    receiver_country,
    amount_sent,
    currency_sent,
    amount_received,
    currency_received,
    exchange_rate,
    fee,
    agent_id,
    notes,
  } = req.body;

  // Validate required fields
  const missing = [];
  if (!receiver_name) missing.push('receiver_name');
  if (!receiver_phone) missing.push('receiver_phone');
  if (!receiver_country) missing.push('receiver_country');
  if (amount_sent === undefined || amount_sent === null) missing.push('amount_sent');
  if (amount_received === undefined || amount_received === null) missing.push('amount_received');
  if (exchange_rate === undefined || exchange_rate === null) missing.push('exchange_rate');
  if (!currency_received) missing.push('currency_received');

  if (missing.length > 0) {
    return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}.` });
  }

  if (Number(amount_sent) <= 0) {
    return res.status(400).json({ error: 'amount_sent must be a positive number.' });
  }
  if (Number(amount_received) <= 0) {
    return res.status(400).json({ error: 'amount_received must be a positive number.' });
  }
  if (Number(exchange_rate) <= 0) {
    return res.status(400).json({ error: 'exchange_rate must be a positive number.' });
  }

  const reference_number = generateReference();

  try {
    const result = await pool.query(
      `INSERT INTO transactions
        (reference_number, sender_id, receiver_name, receiver_phone, receiver_country,
         amount_sent, currency_sent, amount_received, currency_received,
         exchange_rate, fee, agent_id, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [
        reference_number,
        sender_id || null,
        receiver_name,
        receiver_phone,
        receiver_country,
        amount_sent,
        currency_sent || 'KES',
        amount_received,
        currency_received,
        exchange_rate,
        fee || 0,
        agent_id || null,
        notes || null,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    handleError(res, err);
  }
});

// --- Exchange Rates ---
app.get('/api/exchange-rates', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM exchange_rates
       ORDER BY effective_date DESC, from_currency, to_currency`
    );
    res.json(result.rows);
  } catch (err) {
    handleError(res, err);
  }
});

app.post('/api/exchange-rates', async (req, res) => {
  const { from_currency, to_currency, rate, effective_date } = req.body;

  if (!from_currency || typeof from_currency !== 'string' || from_currency.trim() === '') {
    return res.status(400).json({ error: 'from_currency is required.' });
  }
  if (!to_currency || typeof to_currency !== 'string' || to_currency.trim() === '') {
    return res.status(400).json({ error: 'to_currency is required.' });
  }
  if (rate === undefined || rate === null || Number(rate) <= 0) {
    return res.status(400).json({ error: 'rate must be a positive number.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO exchange_rates (from_currency, to_currency, rate, effective_date)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (from_currency, to_currency, effective_date)
       DO UPDATE SET rate = EXCLUDED.rate
       RETURNING *`,
      [
        from_currency.trim().toUpperCase(),
        to_currency.trim().toUpperCase(),
        rate,
        effective_date || new Date().toISOString().split('T')[0],
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    handleError(res, err);
  }
});

// --- Agents ---
app.get('/api/agents', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM agents WHERE is_active = TRUE ORDER BY name'
    );
    res.json(result.rows);
  } catch (err) {
    handleError(res, err);
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Money Transfer Tracker API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
