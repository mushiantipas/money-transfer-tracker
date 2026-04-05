'use strict';

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const migrations = [
  {
    name: '001_initial_schema',
    sql: `
      CREATE TABLE IF NOT EXISTS agents (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone_number VARCHAR(20) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE,
        location VARCHAR(255),
        commission_rate DECIMAL(5, 2) DEFAULT 2.50,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone_number VARCHAR(20) UNIQUE NOT NULL,
        email VARCHAR(255),
        id_number VARCHAR(100),
        country VARCHAR(100) DEFAULT 'Kenya',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS exchange_rates (
        id SERIAL PRIMARY KEY,
        from_currency VARCHAR(10) NOT NULL,
        to_currency VARCHAR(10) NOT NULL,
        rate DECIMAL(15, 6) NOT NULL,
        effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (from_currency, to_currency, effective_date)
      );

      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        reference_number VARCHAR(50) UNIQUE NOT NULL,
        sender_id INTEGER REFERENCES customers(id),
        receiver_name VARCHAR(255) NOT NULL,
        receiver_phone VARCHAR(20) NOT NULL,
        receiver_country VARCHAR(100) NOT NULL,
        amount_sent DECIMAL(15, 2) NOT NULL,
        currency_sent VARCHAR(10) NOT NULL DEFAULT 'KES',
        amount_received DECIMAL(15, 2) NOT NULL,
        currency_received VARCHAR(10) NOT NULL,
        exchange_rate DECIMAL(15, 6) NOT NULL,
        fee DECIMAL(15, 2) DEFAULT 0.00,
        status VARCHAR(50) DEFAULT 'pending',
        agent_id INTEGER REFERENCES agents(id),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_transactions_sender_id ON transactions(sender_id);
      CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
      CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
      CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions(reference_number);
      CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone_number);
    `,
  },
];

async function runMigrations() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    for (const migration of migrations) {
      const result = await client.query(
        'SELECT id FROM migrations WHERE name = $1',
        [migration.name]
      );

      if (result.rows.length === 0) {
        console.log(`Applying migration: ${migration.name}`);
        await client.query('BEGIN');
        await client.query(migration.sql);
        await client.query(
          'INSERT INTO migrations (name) VALUES ($1)',
          [migration.name]
        );
        await client.query('COMMIT');
        console.log(`Migration applied: ${migration.name}`);
      } else {
        console.log(`Skipping migration (already applied): ${migration.name}`);
      }
    }

    console.log('All migrations complete.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
