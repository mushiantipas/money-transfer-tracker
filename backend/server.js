'use strict';

require('dotenv').config({ path: '../.env.local' });

const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { Pool } = require('pg');
const whatsappService = require('./services/whatsappService');

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

// ---------------------------------------------------------------------------
// Notification helpers
// ---------------------------------------------------------------------------

/**
 * Persist a WhatsApp message log entry in the database.
 * Silently swallows DB errors so a failed log write never breaks the HTTP response.
 */
async function logWhatsAppMessage({ transactionId, customerId, toNumber, body, twilioSid, status, errorMessage }) {
  try {
    await pool.query(
      `INSERT INTO whatsapp_messages
         (transaction_id, customer_id, direction, from_number, to_number, body,
          twilio_sid, status, error_message, sent_at)
       VALUES ($1, $2, 'outbound', $3, $4, $5, $6, $7, $8, NOW())`,
      [
        transactionId || null,
        customerId || null,
        process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886',
        toNumber,
        body,
        twilioSid || null,
        status || 'sent',
        errorMessage || null,
      ]
    );
  } catch (logErr) {
    console.error('[WhatsApp] Failed to log message:', logErr.message);
  }
}

// --- Notifications ---

/**
 * POST /api/notifications/payment-confirmed
 * Send a WhatsApp message confirming receipt of a customer's payment.
 * Body: { customer_phone, customer_name, reference_number, source_amount,
 *         source_currency, destination_amount, transaction_id?, customer_id? }
 */
app.post('/api/notifications/payment-confirmed', async (req, res) => {
  const {
    customer_phone,
    customer_name,
    reference_number,
    source_amount,
    source_currency,
    destination_amount,
    transaction_id,
    customer_id,
  } = req.body;

  if (!customer_phone) return res.status(400).json({ error: 'customer_phone is required.' });
  if (!customer_name)  return res.status(400).json({ error: 'customer_name is required.' });
  if (!reference_number) return res.status(400).json({ error: 'reference_number is required.' });
  if (source_amount === undefined || source_amount === null) return res.status(400).json({ error: 'source_amount is required.' });

  try {
    const result = await whatsappService.sendPaymentConfirmation({
      customerPhone:    customer_phone,
      customerName:     customer_name,
      referenceNumber:  reference_number,
      sourceAmount:     source_amount,
      sourceCurrency:   source_currency,
      destinationAmount: destination_amount,
    });

    await logWhatsAppMessage({
      transactionId: transaction_id,
      customerId:    customer_id,
      toNumber:      customer_phone,
      body:          result.body || `Payment confirmation for ${reference_number}`,
      twilioSid:     result.sid,
      status:        result.status === 'skipped' ? 'sent' : result.status,
    });

    res.json({ success: true, message_sid: result.sid, status: result.status });
  } catch (err) {
    await logWhatsAppMessage({
      transactionId: transaction_id,
      customerId:    customer_id,
      toNumber:      customer_phone,
      body:          `Payment confirmation for ${reference_number}`,
      status:        'failed',
      errorMessage:  err.message,
    });
    handleError(res, err);
  }
});

/**
 * POST /api/notifications/order-completed
 * Send a WhatsApp message when the RMB payout has been completed.
 * Body: { customer_phone, customer_name, reference_number, source_amount,
 *         source_currency, destination_amount, recipient_name, payment_method,
 *         transaction_id?, customer_id? }
 */
app.post('/api/notifications/order-completed', async (req, res) => {
  const {
    customer_phone,
    customer_name,
    reference_number,
    source_amount,
    source_currency,
    destination_amount,
    recipient_name,
    payment_method,
    transaction_id,
    customer_id,
  } = req.body;

  if (!customer_phone)   return res.status(400).json({ error: 'customer_phone is required.' });
  if (!customer_name)    return res.status(400).json({ error: 'customer_name is required.' });
  if (!reference_number) return res.status(400).json({ error: 'reference_number is required.' });
  if (!recipient_name)   return res.status(400).json({ error: 'recipient_name is required.' });

  try {
    const result = await whatsappService.sendOrderCompletion({
      customerPhone:    customer_phone,
      customerName:     customer_name,
      referenceNumber:  reference_number,
      sourceAmount:     source_amount,
      sourceCurrency:   source_currency,
      destinationAmount: destination_amount,
      recipientName:    recipient_name,
      paymentMethod:    payment_method,
    });

    await logWhatsAppMessage({
      transactionId: transaction_id,
      customerId:    customer_id,
      toNumber:      customer_phone,
      body:          result.body || `Order completion for ${reference_number}`,
      twilioSid:     result.sid,
      status:        result.status === 'skipped' ? 'sent' : result.status,
    });

    res.json({ success: true, message_sid: result.sid, status: result.status });
  } catch (err) {
    await logWhatsAppMessage({
      transactionId: transaction_id,
      customerId:    customer_id,
      toNumber:      customer_phone,
      body:          `Order completion for ${reference_number}`,
      status:        'failed',
      errorMessage:  err.message,
    });
    handleError(res, err);
  }
});

/**
 * POST /api/notifications/exchange-rate
 * Broadcast current exchange rates to a list of phone numbers (or all active customers).
 * Body: { tzs_usd_rate, usd_usdt_rate, usdt_rmb_rate, phone_numbers? }
 * If phone_numbers is omitted, rates are sent to all active customers.
 */
app.post('/api/notifications/exchange-rate', async (req, res) => {
  const { tzs_usd_rate, usd_usdt_rate, usdt_rmb_rate, phone_numbers } = req.body;

  if (tzs_usd_rate === undefined || tzs_usd_rate === null)   return res.status(400).json({ error: 'tzs_usd_rate is required.' });
  if (usd_usdt_rate === undefined || usd_usdt_rate === null) return res.status(400).json({ error: 'usd_usdt_rate is required.' });
  if (usdt_rmb_rate === undefined || usdt_rmb_rate === null) return res.status(400).json({ error: 'usdt_rmb_rate is required.' });

  try {
    let recipients = phone_numbers;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      // Fall back to all active customers that have a whatsapp_phone
      const rows = await pool.query(
        `SELECT whatsapp_phone FROM customers WHERE is_active = TRUE AND whatsapp_phone IS NOT NULL`
      );
      recipients = rows.rows.map(r => r.whatsapp_phone);
    }

    const results = await Promise.allSettled(
      recipients.map(phone =>
        whatsappService.sendExchangeRateUpdate({
          customerPhone: phone,
          tzsUsdRate:    tzs_usd_rate,
          usdUsdtRate:   usd_usdt_rate,
          usdtRmbRate:   usdt_rmb_rate,
        }).then(async (msg) => {
          await logWhatsAppMessage({
            toNumber:  phone,
            body:      msg.body || `Exchange rate update: 1 USD = ${tzs_usd_rate} TZS, 1 USDT = ${usdt_rmb_rate} RMB`,
            twilioSid: msg.sid,
            status:    msg.status === 'skipped' ? 'sent' : msg.status,
          });
          return { phone, success: true, sid: msg.sid };
        })
      )
    );

    const summary = results.map((r, i) =>
      r.status === 'fulfilled'
        ? r.value
        : { phone: recipients[i], success: false, error: r.reason?.message }
    );

    res.json({ success: true, sent: summary.filter(s => s.success).length, total: recipients.length, results: summary });
  } catch (err) {
    handleError(res, err);
  }
});

/**
 * POST /api/notifications/debt-reminder
 * Send a debt-reminder WhatsApp message to a specific customer.
 * Body: { customer_phone, customer_name, debt_amount, debt_currency?, due_date?, customer_id? }
 */
app.post('/api/notifications/debt-reminder', async (req, res) => {
  const {
    customer_phone,
    customer_name,
    debt_amount,
    debt_currency,
    due_date,
    customer_id,
  } = req.body;

  if (!customer_phone) return res.status(400).json({ error: 'customer_phone is required.' });
  if (!customer_name)  return res.status(400).json({ error: 'customer_name is required.' });
  if (debt_amount === undefined || debt_amount === null) return res.status(400).json({ error: 'debt_amount is required.' });

  try {
    const result = await whatsappService.sendDebtReminder({
      customerPhone: customer_phone,
      customerName:  customer_name,
      debtAmount:    debt_amount,
      debtCurrency:  debt_currency,
      dueDate:       due_date,
    });

    // Update reminder tracking in debts table if customer_id provided
    if (customer_id) {
      await pool.query(
        `UPDATE debts
         SET reminder_count = reminder_count + 1, last_reminded_at = NOW()
         WHERE customer_id = $1 AND is_settled = FALSE`,
        [customer_id]
      ).catch(e => console.error('[WhatsApp] Failed to update debt reminder count:', e.message));
    }

    await logWhatsAppMessage({
      customerId:   customer_id,
      toNumber:     customer_phone,
      body:         result.body || `Debt reminder for ${debt_amount} ${debt_currency || 'TZS'}`,
      twilioSid:    result.sid,
      status:       result.status === 'skipped' ? 'sent' : result.status,
    });

    res.json({ success: true, message_sid: result.sid, status: result.status });
  } catch (err) {
    await logWhatsAppMessage({
      customerId:   customer_id,
      toNumber:     customer_phone,
      body:         `Debt reminder for ${debt_amount} ${debt_currency || 'TZS'}`,
      status:       'failed',
      errorMessage: err.message,
    });
    handleError(res, err);
  }
});

/**
 * GET /api/notifications/history
 * Return paginated WhatsApp message history.
 * Query params: limit (default 50), offset (default 0), customer_id
 */
app.get('/api/notifications/history', async (req, res) => {
  const limit  = Math.min(parseInt(req.query.limit)  || 50, 200);
  const offset = parseInt(req.query.offset) || 0;
  const { customer_id } = req.query;

  try {
    const conditions = ['1=1'];
    const params     = [];

    if (customer_id) {
      params.push(customer_id);
      conditions.push(`wm.customer_id = $${params.length}`);
    }

    params.push(limit, offset);
    const result = await pool.query(
      `SELECT wm.*, c.full_name AS customer_name
       FROM whatsapp_messages wm
       LEFT JOIN customers c ON wm.customer_id = c.id
       WHERE ${conditions.join(' AND ')}
       ORDER BY wm.created_at DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json(result.rows);
  } catch (err) {
    handleError(res, err);
  }
});

// --- Debts ---

/**
 * GET /api/debts
 * Return all unsettled debts (or all debts with ?include_settled=true).
 */
app.get('/api/debts', async (req, res) => {
  const includeSettled = req.query.include_settled === 'true';

  try {
    const result = await pool.query(
      `SELECT d.*, c.full_name AS customer_name, c.whatsapp_phone AS customer_phone
       FROM debts d
       LEFT JOIN customers c ON d.customer_id = c.id
       ${includeSettled ? '' : 'WHERE d.is_settled = FALSE'}
       ORDER BY d.due_date ASC NULLS LAST, d.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    handleError(res, err);
  }
});

/**
 * POST /api/debts
 * Create a new debt record.
 * Body: { customer_id, amount, currency?, transaction_id?, reason?, due_date?, notes? }
 */
app.post('/api/debts', async (req, res) => {
  const { customer_id, amount, currency, transaction_id, reason, due_date, notes } = req.body;

  if (!customer_id) return res.status(400).json({ error: 'customer_id is required.' });
  if (amount === undefined || amount === null || Number(amount) <= 0) {
    return res.status(400).json({ error: 'amount must be a positive number.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO debts (customer_id, amount, currency, transaction_id, reason, due_date, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [customer_id, amount, currency || 'TZS', transaction_id || null, reason || null, due_date || null, notes || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    handleError(res, err);
  }
});

/**
 * PATCH /api/debts/:id/settle
 * Mark a debt as settled.
 */
app.patch('/api/debts/:id/settle', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE debts SET is_settled = TRUE, settled_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Debt not found.' });
    res.json(result.rows[0]);
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
