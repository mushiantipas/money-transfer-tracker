# Money Transfer Tracker – Complete Setup Guide

This guide covers everything you need to get the **Money Transfer Tracker** system running from scratch, including the Google Cloud SQL PostgreSQL database, the Node.js backend, and optional Docker-based local testing.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Google Cloud SQL Setup](#google-cloud-sql-setup)
3. [Database Schema (Migrations)](#database-schema-migrations)
4. [Backend Configuration](#backend-configuration)
5. [Running Locally with Docker](#running-locally-with-docker)
6. [Running the Backend](#running-the-backend)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you start, make sure you have the following installed:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18 or later | https://nodejs.org |
| npm | 9 or later | (bundled with Node.js) |
| PostgreSQL client (`psql`) | 14 or later | https://www.postgresql.org/download |
| Google Cloud SDK (`gcloud`) | Latest | https://cloud.google.com/sdk/docs/install |
| Docker & Docker Compose | Latest | https://docs.docker.com/get-docker |

---

## Google Cloud SQL Setup

See [GOOGLE_CLOUD_SETUP.md](./GOOGLE_CLOUD_SETUP.md) for the full step-by-step guide.

**Quick summary:**

1. Create a Google Cloud project.
2. Enable the Cloud SQL API.
3. Create a PostgreSQL 14 instance named `money-transfer-db`.
4. Create the database `makomu_exchange`.
5. Create the user `admin` with a strong password.
6. Authorise your IP (or use Cloud SQL Proxy for production).
7. Note your instance **Public IP address**.

---

## Database Schema (Migrations)

After connecting to the database, run the initialisation script:

```bash
# Direct connection (replace <CLOUD_SQL_IP> and <PASSWORD>)
psql "postgresql://admin:<PASSWORD>@<CLOUD_SQL_IP>:5432/makomu_exchange" \
  -f migrations/init.sql

# Via Cloud SQL Proxy (see GOOGLE_CLOUD_SETUP.md)
psql "postgresql://admin:<PASSWORD>@127.0.0.1:5432/makomu_exchange" \
  -f migrations/init.sql
```

The file `migrations/init.sql` creates all tables:

- `users` – system users (admins, agents, accountants)
- `customers` – client records with WhatsApp numbers
- `transactions` – TZS/USD amounts, status, timestamps
- `exchange_rates` – historical TZS→USD, USD→USDT, USDT→RMB rates
- `agents` – agent and accountant information
- `payments` – RMB payments received
- `whatsapp_messages` – message logs and delivery status
- `message_templates` – pre-built WhatsApp message templates

---

## Backend Configuration

1. Copy the environment template and fill in your values:

   ```bash
   cd backend
   cp .env.example .env
   ```

2. Edit `backend/.env` and set at minimum:

   ```
   DATABASE_URL=postgresql://admin:<PASSWORD>@<CLOUD_SQL_IP>:5432/makomu_exchange
   JWT_SECRET=<a-long-random-string>
   ```

3. Install dependencies:

   ```bash
   cd backend
   npm install
   ```

---

## Running Locally with Docker

For local development you can spin up a PostgreSQL container instead of connecting to Cloud SQL:

```bash
# From the repository root
docker-compose up -d

# Check that containers are running
docker-compose ps
```

The `docker-compose.yml` starts:

- **postgres** – PostgreSQL 14 on port `5432` with database `makomu_exchange`
- **backend** – Node.js API on port `3000`

Connect to the local database:

```bash
psql "postgresql://admin:localpassword@localhost:5432/makomu_exchange"
```

Run migrations against the local database:

```bash
psql "postgresql://admin:localpassword@localhost:5432/makomu_exchange" \
  -f migrations/init.sql
```

---

## Running the Backend

### Development mode (auto-reload)

```bash
cd backend
npm run dev
```

### Production mode

```bash
cd backend
npm start
```

The API will be available at `http://localhost:3000` (or the port set in `.env`).

### Health check

```bash
curl http://localhost:3000/health
# {"status":"ok","timestamp":"..."}
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `ECONNREFUSED` connecting to DB | Check `DATABASE_URL`, ensure the DB is running and the IP is whitelisted in Cloud SQL |
| `password authentication failed` | Verify the `admin` password in Cloud SQL Console → Users |
| `database "makomu_exchange" does not exist` | Run the CREATE DATABASE step in [GOOGLE_CLOUD_SETUP.md](./GOOGLE_CLOUD_SETUP.md) |
| Cloud SQL Proxy not connecting | Ensure the service account has the **Cloud SQL Client** role |
| Docker containers not starting | Run `docker-compose logs` to inspect errors |
| Port 3000 in use | Change `PORT` in `backend/.env` |

For Google Cloud-specific issues see [GOOGLE_CLOUD_SETUP.md](./GOOGLE_CLOUD_SETUP.md#troubleshooting).
