'use strict';

/**
 * WhatsApp Service – wraps Twilio's WhatsApp API for all outbound notifications.
 *
 * Supported notification types:
 *   - Payment confirmation  (customer pays us; we acknowledge receipt)
 *   - Order completion      (we have paid the recipient in China)
 *   - Exchange-rate update  (broadcast current TZS/USD → USDT → RMB rates)
 *   - Debt reminder         (we owe the customer money)
 */

const twilio = require('twilio');

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN  = process.env.TWILIO_AUTH_TOKEN;
const FROM_NUMBER = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

/** Returns a Twilio client, or null when credentials are not configured. */
function getClient() {
  if (!ACCOUNT_SID || !AUTH_TOKEN ||
      ACCOUNT_SID.startsWith('ACxxxxxxx') ||
      AUTH_TOKEN === 'your_twilio_auth_token') {
    return null;
  }
  return twilio(ACCOUNT_SID, AUTH_TOKEN);
}

/**
 * Low-level send helper.
 * Returns the Twilio message object on success, or throws on error.
 * @param {string} to   – E.164 phone number, e.g. "+255712345678"
 * @param {string} body – Plain-text message body
 */
async function sendMessage(to, body) {
  const client = getClient();

  if (!client) {
    console.warn('[WhatsApp] Twilio credentials not configured – message NOT sent.');
    return { sid: null, status: 'skipped', to, body };
  }

  const toWhatsApp = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

  const message = await client.messages.create({
    from: FROM_NUMBER,
    to:   toWhatsApp,
    body,
  });

  console.info(`[WhatsApp] Sent to ${to} | SID: ${message.sid} | Status: ${message.status}`);
  return message;
}

// ---------------------------------------------------------------------------
// Notification builders
// ---------------------------------------------------------------------------

/**
 * Send a payment-confirmed WhatsApp message to the customer.
 *
 * @param {object} opts
 * @param {string} opts.customerPhone     – Customer's phone number
 * @param {string} opts.customerName      – Customer's display name
 * @param {string} opts.referenceNumber   – Transaction reference (e.g. TXN-001)
 * @param {number} opts.sourceAmount      – Amount sent by customer
 * @param {string} opts.sourceCurrency    – Currency of amount sent (TZS / USD)
 * @param {number} opts.destinationAmount – RMB amount to be paid
 */
async function sendPaymentConfirmation(opts) {
  const {
    customerPhone,
    customerName,
    referenceNumber,
    sourceAmount,
    sourceCurrency = 'TZS',
    destinationAmount,
  } = opts;

  const body =
    `Hello ${customerName}! 👋\n\n` +
    `We have received your payment of *${Number(sourceAmount).toLocaleString()} ${sourceCurrency}*.\n\n` +
    `Transaction reference: *${referenceNumber}*\n` +
    `Recipient will receive: *${Number(destinationAmount).toLocaleString()} RMB*\n` +
    `Status: ⏳ Processing\n\n` +
    `We will notify you once the RMB transfer is complete.\n\n` +
    `Thank you for using Makomu Exchange! 🙏`;

  const message = await sendMessage(customerPhone, body);
  return { ...message, body };
}

/**
 * Send an order-completed WhatsApp message to the customer.
 *
 * @param {object} opts
 * @param {string} opts.customerPhone     – Customer's phone number
 * @param {string} opts.customerName      – Customer's display name
 * @param {string} opts.referenceNumber   – Transaction reference
 * @param {number} opts.sourceAmount      – Amount originally sent
 * @param {string} opts.sourceCurrency    – Currency of amount sent
 * @param {number} opts.destinationAmount – RMB amount paid out
 * @param {string} opts.recipientName     – Name of the recipient in China
 * @param {string} opts.paymentMethod     – Payment channel (WeChat / Alipay / Bank)
 */
async function sendOrderCompletion(opts) {
  const {
    customerPhone,
    customerName,
    referenceNumber,
    sourceAmount,
    sourceCurrency = 'TZS',
    destinationAmount,
    recipientName,
    paymentMethod = 'WeChat',
  } = opts;

  const body =
    `Hello ${customerName}! ✅\n\n` +
    `Your transfer is *COMPLETE*!\n\n` +
    `• Sent: *${Number(sourceAmount).toLocaleString()} ${sourceCurrency}*\n` +
    `• Recipient received: *${Number(destinationAmount).toLocaleString()} RMB*\n` +
    `• Reference: ${referenceNumber}\n\n` +
    `Payment has been sent to *${recipientName}* via ${paymentMethod}.\n\n` +
    `Thank you for choosing Makomu Exchange! 😊`;

  const message = await sendMessage(customerPhone, body);
  return { ...message, body };
}

/**
 * Broadcast current exchange rates to a single phone number.
 *
 * @param {object} opts
 * @param {string} opts.customerPhone  – Recipient phone number
 * @param {number} opts.tzsUsdRate     – TZS per 1 USD
 * @param {number} opts.usdUsdtRate    – USD per 1 USDT
 * @param {number} opts.usdtRmbRate    – USDT per 1 RMB
 */
async function sendExchangeRateUpdate(opts) {
  const { customerPhone, tzsUsdRate, usdUsdtRate, usdtRmbRate } = opts;

  const timestamp = new Date().toLocaleString('en-GB', {
    day:    '2-digit',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Dar_es_Salaam',
  });

  const body =
    `📊 *Makomu Exchange – Rate Update*\n\n` +
    `Current rates:\n` +
    `💵 1 USD = ${Number(tzsUsdRate).toLocaleString()} TZS\n` +
    `💰 1 USD = ${Number(usdUsdtRate).toFixed(4)} USDT\n` +
    `🏮 1 USDT = ${Number(usdtRmbRate).toFixed(4)} RMB\n\n` +
    `Valid as of: ${timestamp} (EAT)\n\n` +
    `Send us a message to start your transfer! 🚀`;

  const message = await sendMessage(customerPhone, body);
  return { ...message, body };
}

/**
 * Send a debt-reminder WhatsApp message to a customer we owe money to.
 *
 * @param {object} opts
 * @param {string} opts.customerPhone – Customer's phone number
 * @param {string} opts.customerName  – Customer's display name
 * @param {number} opts.debtAmount    – Amount owed
 * @param {string} opts.debtCurrency  – Currency of the debt
 * @param {string} [opts.dueDate]     – Expected payment date (optional)
 */
async function sendDebtReminder(opts) {
  const {
    customerPhone,
    customerName,
    debtAmount,
    debtCurrency = 'TZS',
    dueDate,
  } = opts;

  const dueLine = dueDate
    ? `\nExpected payment by: *${dueDate}*`
    : '';

  const body =
    `Hello ${customerName},\n\n` +
    `We would like to remind you that we owe you *${Number(debtAmount).toLocaleString()} ${debtCurrency}*.${dueLine}\n\n` +
    `We are working to process your payment as soon as possible.\n\n` +
    `If you have any questions, please reply to this message.\n\n` +
    `Makomu Exchange 🙏`;

  const message = await sendMessage(customerPhone, body);
  return { ...message, body };
}

module.exports = {
  sendPaymentConfirmation,
  sendOrderCompletion,
  sendExchangeRateUpdate,
  sendDebtReminder,
  sendMessage,
};
