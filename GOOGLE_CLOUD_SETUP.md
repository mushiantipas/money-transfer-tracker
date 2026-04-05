# Google Cloud SQL – PostgreSQL Setup Guide

This guide walks you through creating a Google Cloud SQL PostgreSQL instance and connecting it to the Money Transfer Tracker backend.

---

## Table of Contents

1. [Create a Google Cloud Project](#1-create-a-google-cloud-project)
2. [Enable the Cloud SQL API](#2-enable-the-cloud-sql-api)
3. [Create the PostgreSQL Instance](#3-create-the-postgresql-instance)
4. [Create the Database](#4-create-the-database)
5. [Create the Admin User](#5-create-the-admin-user)
6. [Configure Network Access](#6-configure-network-access)
7. [Get the Connection String](#7-get-the-connection-string)
8. [Set Up Cloud SQL Proxy (Recommended)](#8-set-up-cloud-sql-proxy-recommended)
9. [Run Migrations](#9-run-migrations)
10. [Environment Variables](#10-environment-variables)
11. [Verify the Connection](#11-verify-the-connection)
12. [Security Best Practices](#12-security-best-practices)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. Create a Google Cloud Project

```bash
# Install and initialise the Google Cloud SDK if you haven't already
gcloud init

# Create a new project (choose your own project ID)
gcloud projects create your-project-id --name="Money Transfer Tracker"

# Set it as the active project
gcloud config set project your-project-id
```

Alternatively, use the [Google Cloud Console](https://console.cloud.google.com):

1. Go to **Navigation menu → IAM & Admin → Manage Resources**.
2. Click **Create Project**.
3. Enter a project name and note the **Project ID**.

---

## 2. Enable the Cloud SQL API

```bash
gcloud services enable sqladmin.googleapis.com
```

Or in the Console: **APIs & Services → Library → Cloud SQL Admin API → Enable**.

---

## 3. Create the PostgreSQL Instance

```bash
gcloud sql instances create money-transfer-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --storage-type=SSD \
  --storage-size=10GB \
  --backup-start-time=02:00 \
  --maintenance-window-day=SUN \
  --maintenance-window-hour=3
```

**Parameters explained:**

| Parameter | Value | Description |
|-----------|-------|-------------|
| `--database-version` | `POSTGRES_14` | PostgreSQL 14 |
| `--tier` | `db-f1-micro` | Smallest tier (suitable for development) |
| `--region` | `us-central1` | Change to the region closest to you |
| `--storage-type` | `SSD` | SSD storage for better performance |
| `--storage-size` | `10GB` | Starting size (auto-grows as needed) |

> **For production** use at least `db-n1-standard-1` and enable high availability:
> ```bash
> --tier=db-n1-standard-1 --availability-type=REGIONAL
> ```

Wait for the instance to be created (2–5 minutes), then verify:

```bash
gcloud sql instances describe money-transfer-db
```

---

## 4. Create the Database

```bash
gcloud sql databases create makomu_exchange \
  --instance=money-transfer-db
```

Verify:

```bash
gcloud sql databases list --instance=money-transfer-db
```

---

## 5. Create the Admin User

```bash
# Set a strong password (replace <STRONG_PASSWORD>)
gcloud sql users create admin \
  --instance=money-transfer-db \
  --password=<STRONG_PASSWORD>
```

> Store this password securely (e.g., in Google Secret Manager).

---

## 6. Configure Network Access

### Option A – Authorise a specific IP (simplest for testing)

```bash
# Find your current public IP
curl -s https://ifconfig.me

# Authorise that IP
gcloud sql instances patch money-transfer-db \
  --authorized-networks=<YOUR_IP>/32
```

### Option B – Use Cloud SQL Proxy (recommended for production)

See [Section 8](#8-set-up-cloud-sql-proxy-recommended).

### Option C – Private IP (most secure)

For VPC-based deployments, configure **Private IP** in the Console:

1. Go to **SQL → money-transfer-db → Connections**.
2. Enable **Private IP** and select your VPC network.
3. Disable **Public IP** once Private IP is configured.

---

## 7. Get the Connection String

### Public IP (after authorising your IP)

```bash
# Get the public IP address
gcloud sql instances describe money-transfer-db \
  --format="value(ipAddresses[0].ipAddress)"
```

Your connection string:

```
postgresql://admin:<PASSWORD>@<PUBLIC_IP>:5432/makomu_exchange
```

### Cloud SQL Proxy connection string

```
postgresql://admin:<PASSWORD>@127.0.0.1:5432/makomu_exchange
```

### Instance connection name (needed for Cloud SQL Proxy)

```bash
gcloud sql instances describe money-transfer-db \
  --format="value(connectionName)"
# Output: your-project-id:us-central1:money-transfer-db
```

---

## 8. Set Up Cloud SQL Proxy (Recommended)

The Cloud SQL Proxy encrypts all traffic and authenticates using IAM, making it the safest way to connect.

### Install the proxy

```bash
# Linux / macOS (x86-64)
curl -o cloud-sql-proxy \
  https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.10.1/cloud-sql-proxy.linux.amd64

chmod +x cloud-sql-proxy

# macOS (Apple Silicon)
curl -o cloud-sql-proxy \
  https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.10.1/cloud-sql-proxy.darwin.arm64
chmod +x cloud-sql-proxy

# Windows – download from
# https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.10.1/cloud-sql-proxy.x64.exe
```

### Authenticate

```bash
gcloud auth application-default login
```

### Start the proxy

```bash
# Replace with your actual instance connection name
./cloud-sql-proxy your-project-id:us-central1:money-transfer-db \
  --port=5432 &
```

The proxy now listens on `127.0.0.1:5432` and forwards connections to Cloud SQL.

### Grant the required IAM role

The account you authenticated with (or the service account used in production) needs the **Cloud SQL Client** role:

```bash
gcloud projects add-iam-policy-binding your-project-id \
  --member="user:your-email@example.com" \
  --role="roles/cloudsql.client"
```

---

## 9. Run Migrations

```bash
# Via Cloud SQL Proxy (recommended)
psql "postgresql://admin:<PASSWORD>@127.0.0.1:5432/makomu_exchange" \
  -f migrations/init.sql

# Via Public IP (if authorised)
psql "postgresql://admin:<PASSWORD>@<PUBLIC_IP>:5432/makomu_exchange" \
  -f migrations/init.sql
```

Verify tables were created:

```bash
psql "postgresql://admin:<PASSWORD>@127.0.0.1:5432/makomu_exchange" \
  -c "\dt"
```

Expected output:

```
              List of relations
 Schema |        Name         | Type  | Owner
--------+---------------------+-------+-------
 public | agents              | table | admin
 public | customers           | table | admin
 public | exchange_rates      | table | admin
 public | message_templates   | table | admin
 public | payments            | table | admin
 public | transactions        | table | admin
 public | users               | table | admin
 public | whatsapp_messages   | table | admin
```

---

## 10. Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in the values:

```env
# ── Database ────────────────────────────────────────────────────────────────
DATABASE_URL=postgresql://admin:<PASSWORD>@<CLOUD_SQL_IP>:5432/makomu_exchange

# ── Google Cloud ─────────────────────────────────────────────────────────────
GOOGLE_CLOUD_PROJECT_ID=your-project-id
CLOUD_SQL_INSTANCE=your-project-id:us-central1:money-transfer-db

# ── Application ──────────────────────────────────────────────────────────────
NODE_ENV=production
PORT=3000
JWT_SECRET=<a-very-long-random-secret>
```

> Never commit `backend/.env` to version control.

---

## 11. Verify the Connection

```bash
cd backend
npm install
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()', (err, res) => {
  if (err) { console.error('Connection failed:', err.message); process.exit(1); }
  console.log('Connected! Server time:', res.rows[0].now);
  pool.end();
});
" DATABASE_URL="postgresql://admin:<PASSWORD>@<HOST>:5432/makomu_exchange"
```

---

## 12. Security Best Practices

| Practice | Details |
|----------|---------|
| **Use Cloud SQL Proxy** | Avoids exposing the database to the public internet |
| **Use Secret Manager** | Store `DATABASE_URL` and `JWT_SECRET` in Google Secret Manager instead of `.env` files |
| **Rotate passwords regularly** | Use `gcloud sql users set-password` to rotate the `admin` password |
| **Restrict authorised networks** | Only add specific IP ranges, or use Cloud SQL Proxy exclusively |
| **Enable SSL** | Cloud SQL Proxy uses SSL by default; if connecting directly, enforce SSL in the instance settings |
| **Use least-privilege IAM** | Create a dedicated service account with only the `roles/cloudsql.client` role |
| **Enable audit logging** | In the Console: **SQL → Logs → Data Access logs** |
| **Enable automated backups** | Already enabled by the `--backup-start-time` flag in Step 3 |
| **Keep PostgreSQL updated** | Use Cloud SQL maintenance windows and apply minor version updates |

---

## 13. Troubleshooting

### Connection refused

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

- Make sure the Cloud SQL Proxy is running (`./cloud-sql-proxy … &`).
- Check the instance connection name is correct.

### SSL required

```
Error: no pg_hba.conf entry for host "…", SSL off
```

- Append `?sslmode=require` to `DATABASE_URL`:
  ```
  DATABASE_URL=postgresql://admin:<PASSWORD>@<HOST>:5432/makomu_exchange?sslmode=require
  ```

### Authentication failed

```
Error: password authentication failed for user "admin"
```

- Reset the password:
  ```bash
  gcloud sql users set-password admin \
    --instance=money-transfer-db \
    --password=<NEW_PASSWORD>
  ```

### Database does not exist

```
Error: database "makomu_exchange" does not exist
```

- Re-run Step 4 to create the database.

### IAM permission denied

```
Error: Request had insufficient authentication scopes
```

- Re-authenticate:
  ```bash
  gcloud auth application-default login
  ```
- Ensure your account has `roles/cloudsql.client`.

### Cloud SQL instance not found

- Verify the instance exists:
  ```bash
  gcloud sql instances list
  ```
- Check the project is set correctly:
  ```bash
  gcloud config get-value project
  ```
