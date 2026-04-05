'use strict';

require('dotenv').config({ path: './.env.local' });

const crypto = require('crypto');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Seeding database...');

    // Seed agents
    await client.query(`
      INSERT INTO agents (name, phone_number, email, location, commission_rate)
      VALUES
        ('Alice Wanjiku', '+254701000001', 'alice@makomu.com', 'Nairobi CBD', 2.50),
        ('Brian Otieno',  '+254701000002', 'brian@makomu.com', 'Mombasa',     2.00),
        ('Carol Muthoni', '+254701000003', 'carol@makomu.com', 'Kisumu',      2.75)
      ON CONFLICT (phone_number) DO NOTHING
    `);
    console.log('✓ Agents seeded');

    // Seed customers
    await client.query(`
      INSERT INTO customers (name, phone_number, email, id_number, country)
      VALUES
        ('John Kamau',   '+254712000001', 'john@example.com',  'ID001', 'Kenya'),
        ('Mary Achieng', '+254712000002', 'mary@example.com',  'ID002', 'Kenya'),
        ('Peter Njoroge','+254712000003', 'peter@example.com', 'ID003', 'Kenya'),
        ('Grace Waweru', '+254712000004', 'grace@example.com', 'ID004', 'Kenya')
      ON CONFLICT (phone_number) DO NOTHING
    `);
    console.log('✓ Customers seeded');

    // Seed exchange rates
    const today = new Date().toISOString().split('T')[0];
    await client.query(
      `INSERT INTO exchange_rates (from_currency, to_currency, rate, effective_date)
       VALUES
         ('KES', 'USD', 0.007634, $1),
         ('KES', 'EUR', 0.007021, $1),
         ('KES', 'GBP', 0.006012, $1),
         ('KES', 'TZS', 17.2500,  $1),
         ('KES', 'UGX', 28.4500,  $1),
         ('USD', 'KES', 131.0000, $1),
         ('EUR', 'KES', 142.5000, $1)
       ON CONFLICT (from_currency, to_currency, effective_date) DO NOTHING`,
      [today]
    );
    console.log('✓ Exchange rates seeded');

    // Seed sample transactions
    const customerResult = await client.query('SELECT id FROM customers LIMIT 4');
    const agentResult    = await client.query('SELECT id FROM agents    LIMIT 3');

    if (customerResult.rows.length > 0 && agentResult.rows.length > 0) {
      const sampleTransactions = [
        {
          sender_id:         customerResult.rows[0].id,
          receiver_name:     'James Oduya',
          receiver_phone:    '+255712345678',
          receiver_country:  'Tanzania',
          amount_sent:       10000,
          currency_sent:     'KES',
          amount_received:   172500,
          currency_received: 'TZS',
          exchange_rate:     17.25,
          fee:               100,
          status:            'completed',
          agent_id:          agentResult.rows[0].id,
        },
        {
          sender_id:         customerResult.rows[1].id,
          receiver_name:     'Sarah Nakato',
          receiver_phone:    '+256712345678',
          receiver_country:  'Uganda',
          amount_sent:       5000,
          currency_sent:     'KES',
          amount_received:   142250,
          currency_received: 'UGX',
          exchange_rate:     28.45,
          fee:               50,
          status:            'pending',
          agent_id:          agentResult.rows[1].id,
        },
        {
          sender_id:         customerResult.rows[2].id,
          receiver_name:     'David Smith',
          receiver_phone:    '+447712345678',
          receiver_country:  'United Kingdom',
          amount_sent:       20000,
          currency_sent:     'KES',
          amount_received:   120.24,
          currency_received: 'GBP',
          exchange_rate:     0.006012,
          fee:               200,
          status:            'completed',
          agent_id:          agentResult.rows[2].id,
        },
      ];

      for (const txn of sampleTransactions) {
        const ref = `TXN-SEED-${crypto.randomUUID()}`;
        await client.query(
          `INSERT INTO transactions
            (reference_number, sender_id, receiver_name, receiver_phone, receiver_country,
             amount_sent, currency_sent, amount_received, currency_received,
             exchange_rate, fee, status, agent_id)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
           ON CONFLICT (reference_number) DO NOTHING`,
          [
            ref,
            txn.sender_id,
            txn.receiver_name,
            txn.receiver_phone,
            txn.receiver_country,
            txn.amount_sent,
            txn.currency_sent,
            txn.amount_received,
            txn.currency_received,
            txn.exchange_rate,
            txn.fee,
            txn.status,
            txn.agent_id,
          ]
        );
      }
      console.log('✓ Transactions seeded');
    }

    console.log('\nDatabase seeding complete! ✅');
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
