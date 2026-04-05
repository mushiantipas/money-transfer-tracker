-- =============================================================================
-- Money Transfer Tracker – Database Initialisation
-- Database : makomu_exchange
-- Engine   : PostgreSQL 14+
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "citext";     -- case-insensitive text

-- ---------------------------------------------------------------------------
-- Enum types
-- ---------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('admin', 'agent', 'accountant', 'customer');

CREATE TYPE transaction_status AS ENUM (
    'pending',          -- TZS/USD received, waiting to process
    'processing',       -- Being converted
    'completed',        -- RMB sent to recipient
    'failed',           -- Transaction failed
    'cancelled'         -- Cancelled by agent or customer
);

CREATE TYPE currency_code AS ENUM ('TZS', 'USD', 'USDT', 'RMB', 'CNY');

CREATE TYPE message_status AS ENUM ('queued', 'sent', 'delivered', 'read', 'failed');

CREATE TYPE payment_status AS ENUM ('pending', 'confirmed', 'rejected');

-- ---------------------------------------------------------------------------
-- Table: users
-- System users – admins, agents, accountants
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    username        CITEXT      NOT NULL UNIQUE,
    email           CITEXT      NOT NULL UNIQUE,
    password_hash   TEXT        NOT NULL,
    full_name       TEXT        NOT NULL,
    role            user_role   NOT NULL DEFAULT 'agent',
    phone           TEXT,
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_role      ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- ---------------------------------------------------------------------------
-- Table: customers
-- Client records with WhatsApp contact information
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name       TEXT        NOT NULL,
    whatsapp_phone  TEXT        NOT NULL UNIQUE, -- e.g. +255712345678
    email           CITEXT,
    country         TEXT        NOT NULL DEFAULT 'TZ',
    notes           TEXT,
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    created_by      UUID        REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_whatsapp ON customers(whatsapp_phone);
CREATE INDEX IF NOT EXISTS idx_customers_active   ON customers(is_active);

-- ---------------------------------------------------------------------------
-- Table: agents
-- Agent and accountant profile information (extends users)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS agents (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    agent_code      TEXT        NOT NULL UNIQUE,          -- e.g. AGT-001
    commission_rate NUMERIC(5,4) NOT NULL DEFAULT 0.0050, -- 0.50 %
    bank_name       TEXT,
    bank_account    TEXT,
    is_verified     BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agents_agent_code ON agents(agent_code);

-- ---------------------------------------------------------------------------
-- Table: exchange_rates
-- Historical exchange rates used for conversions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS exchange_rates (
    id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    from_currency   currency_code NOT NULL,
    to_currency     currency_code NOT NULL,
    rate            NUMERIC(20,8) NOT NULL,   -- 1 from_currency = rate to_currency
    source          TEXT          NOT NULL DEFAULT 'manual', -- 'manual', 'api', etc.
    recorded_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    created_by      UUID          REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exchange_rates_pair ON exchange_rates(from_currency, to_currency, recorded_at DESC);

-- Convenience view: latest rate per currency pair
CREATE OR REPLACE VIEW latest_exchange_rates AS
SELECT DISTINCT ON (from_currency, to_currency)
    id,
    from_currency,
    to_currency,
    rate,
    source,
    recorded_at
FROM exchange_rates
ORDER BY from_currency, to_currency, recorded_at DESC;

-- ---------------------------------------------------------------------------
-- Table: transactions
-- Core transaction records: TZS/USD in → USDT → RMB out
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
    id                  UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_number    TEXT               NOT NULL UNIQUE, -- e.g. TXN-20240101-001
    customer_id         UUID               NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    agent_id            UUID               REFERENCES agents(id) ON DELETE SET NULL,

    -- Source amount (what customer sends)
    source_amount       NUMERIC(20,2)      NOT NULL,
    source_currency     currency_code      NOT NULL, -- TZS or USD

    -- Intermediate conversion
    usdt_amount         NUMERIC(20,8),

    -- Destination amount (RMB sent to China)
    destination_amount  NUMERIC(20,2),
    destination_currency currency_code     NOT NULL DEFAULT 'RMB',

    -- Rates used at time of transaction
    tzs_usd_rate        NUMERIC(20,8),     -- TZS per 1 USD
    usd_usdt_rate       NUMERIC(20,8),     -- USD per 1 USDT
    usdt_rmb_rate       NUMERIC(20,8),     -- USDT per 1 RMB

    -- Fee & profit tracking
    fee_amount          NUMERIC(20,2)      NOT NULL DEFAULT 0,
    fee_currency        currency_code      NOT NULL DEFAULT 'USD',
    profit_amount       NUMERIC(20,2)      NOT NULL DEFAULT 0,
    profit_currency     currency_code      NOT NULL DEFAULT 'USD',

    -- Recipient details in China
    recipient_name      TEXT               NOT NULL,
    recipient_wechat    TEXT,
    recipient_alipay    TEXT,
    recipient_bank      TEXT,

    -- Status
    status              transaction_status NOT NULL DEFAULT 'pending',
    notes               TEXT,

    -- Timestamps
    initiated_at        TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    processed_at        TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    created_by          UUID               REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_customer   ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_agent      ON transactions(agent_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status     ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_initiated  ON transactions(initiated_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_reference  ON transactions(reference_number);

-- ---------------------------------------------------------------------------
-- Table: payments
-- RMB payments received / confirmed in China
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
    id              UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id  UUID           NOT NULL REFERENCES transactions(id) ON DELETE RESTRICT,
    amount          NUMERIC(20,2)  NOT NULL,
    currency        currency_code  NOT NULL DEFAULT 'RMB',
    payment_method  TEXT           NOT NULL DEFAULT 'wechat', -- 'wechat', 'alipay', 'bank'
    reference       TEXT,          -- Payment reference / screenshot ID
    status          payment_status NOT NULL DEFAULT 'pending',
    confirmed_by    UUID           REFERENCES users(id) ON DELETE SET NULL,
    confirmed_at    TIMESTAMPTZ,
    notes           TEXT,
    created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_transaction ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_status      ON payments(status);

-- ---------------------------------------------------------------------------
-- Table: whatsapp_messages
-- WhatsApp message logs and delivery status
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id              UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id  UUID           REFERENCES transactions(id) ON DELETE SET NULL,
    customer_id     UUID           REFERENCES customers(id) ON DELETE SET NULL,
    direction       TEXT           NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    from_number     TEXT           NOT NULL,
    to_number       TEXT           NOT NULL,
    body            TEXT           NOT NULL,
    media_url       TEXT,          -- Optional media attachment URL
    twilio_sid      TEXT,          -- Twilio message SID
    status          message_status NOT NULL DEFAULT 'queued',
    error_message   TEXT,
    sent_at         TIMESTAMPTZ,
    delivered_at    TIMESTAMPTZ,
    read_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_transaction ON whatsapp_messages(transaction_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_customer    ON whatsapp_messages(customer_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_status      ON whatsapp_messages(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_to_number   ON whatsapp_messages(to_number);

-- ---------------------------------------------------------------------------
-- Table: message_templates
-- Pre-built WhatsApp message templates
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS message_templates (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT        NOT NULL UNIQUE,
    description TEXT,
    body        TEXT        NOT NULL,  -- Supports {{variable}} placeholders
    language    TEXT        NOT NULL DEFAULT 'en',
    category    TEXT        NOT NULL DEFAULT 'transactional',
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    created_by  UUID        REFERENCES users(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Trigger: auto-update updated_at columns
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'users', 'customers', 'agents', 'exchange_rates',
        'transactions', 'payments', 'whatsapp_messages', 'message_templates'
    ]
    LOOP
        EXECUTE format(
            'DROP TRIGGER IF EXISTS set_updated_at ON %I;
             CREATE TRIGGER set_updated_at
             BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();',
            t, t
        );
    END LOOP;
END;
$$;

-- ---------------------------------------------------------------------------
-- Seed data: default message templates
-- ---------------------------------------------------------------------------
INSERT INTO message_templates (name, description, body, language, category) VALUES
(
    'transaction_received',
    'Sent when TZS/USD payment is received from customer',
    'Hello {{customer_name}}! 👋

We have received your payment of *{{source_amount}} {{source_currency}}*.

Transaction reference: *{{reference_number}}*
Status: ⏳ Processing

We will notify you once the RMB transfer is complete.

Thank you for using Makomu Exchange! 🙏',
    'en',
    'transactional'
),
(
    'transaction_completed',
    'Sent when RMB payment has been sent to the recipient',
    'Hello {{customer_name}}! ✅

Your transfer is *COMPLETE*!

- Sent: *{{source_amount}} {{source_currency}}*
- Recipient received: *{{destination_amount}} RMB*
- Reference: {{reference_number}}

Payment has been sent to *{{recipient_name}}* via {{payment_method}}.

Thank you for choosing Makomu Exchange! 😊',
    'en',
    'transactional'
),
(
    'exchange_rate_update',
    'Broadcast to customers when exchange rates change',
    '📊 *Makomu Exchange – Rate Update*

Current rates:
💵 1 USD = {{tzs_usd_rate}} TZS
💰 1 USD = {{usd_usdt_rate}} USDT
🏮 1 USDT = {{usdt_rmb_rate}} RMB

Valid as of: {{timestamp}}

Send us a message to start your transfer! 🚀',
    'en',
    'marketing'
),
(
    'transaction_failed',
    'Sent when a transaction cannot be completed',
    'Hello {{customer_name}},

Unfortunately, your transfer ({{reference_number}}) could not be completed.

Reason: {{failure_reason}}

Please contact us immediately so we can resolve this.

📞 We apologise for the inconvenience.',
    'en',
    'transactional'
)
ON CONFLICT (name) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Seed data: default exchange rates (approximate – update before using)
-- ---------------------------------------------------------------------------
INSERT INTO exchange_rates (from_currency, to_currency, rate, source) VALUES
('TZS', 'USD',  0.00038600, 'seed'),  -- 1 TZS ≈ 0.000386 USD  (1 USD ≈ 2590 TZS)
('USD', 'USDT', 0.99800000, 'seed'),  -- 1 USD ≈ 0.998 USDT
('USDT','RMB',  7.24000000, 'seed')   -- 1 USDT ≈ 7.24 RMB
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- Done
-- ---------------------------------------------------------------------------
-- Tables created:
--   users, customers, agents, exchange_rates, transactions,
--   payments, whatsapp_messages, message_templates
-- Views created: latest_exchange_rates
-- Seed data: message_templates, exchange_rates
-- ---------------------------------------------------------------------------
