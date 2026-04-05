# 🐳 Docker Setup Guide — Money Transfer Tracker

Local Docker testing environment for the Money Transfer Tracker system with PostgreSQL.

## Prerequisites

- **Docker**: https://www.docker.com/products/docker-desktop
- **Docker Compose**: Included with Docker Desktop (or install separately for Linux: https://docs.docker.com/compose/install/)

Verify your installation:
```bash
docker --version
docker compose version
```

---

## Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/mushiantipas/money-transfer-tracker.git
cd money-transfer-tracker
```

### 2. Start all containers
```bash
docker-compose up
```

This single command will:
- Pull the PostgreSQL 14 image
- Build the Node.js backend image
- Create the `makomu_exchange` database
- Run the schema SQL to create all tables
- Start the backend server on port 5000

To run in detached (background) mode:
```bash
docker-compose up -d
```

---

## Stopping Containers

```bash
docker-compose down
```

To also remove the database volume (full reset):
```bash
docker-compose down -v
```

---

## Viewing Logs

View logs from all services:
```bash
docker-compose logs -f
```

View logs from a specific service:
```bash
docker-compose logs -f backend
docker-compose logs -f postgres
```

---

## Accessing the PostgreSQL Shell

```bash
docker exec -it money-transfer-postgres psql -U admin -d makomu_exchange
```

Useful psql commands:
```sql
\dt            -- list all tables
\d customers   -- describe the customers table
SELECT * FROM customers LIMIT 5;
\q             -- quit
```

---

## Running Database Migrations

The schema is automatically applied on first startup via `backend/db/schema.sql`.

To run migrations manually:
```bash
docker-compose exec backend node backend/db/migrate.js
```

---

## Seeding Sample Data

Load sample customers, transactions, exchange rates, and agents:
```bash
docker-compose exec backend node scripts/seed.js
```

Or using Make:
```bash
make seed
```

---

## Testing the API

Once the containers are running, the API is available at `http://localhost:5000`.

### Health check
```bash
curl http://localhost:5000/health
```

### Example API calls
```bash
# Get all customers
curl http://localhost:5000/api/customers

# Get all transactions
curl http://localhost:5000/api/transactions

# Get exchange rates
curl http://localhost:5000/api/exchange-rates
```

---

## Common Docker Commands

| Command | Description |
|---|---|
| `docker-compose up` | Start all containers |
| `docker-compose up -d` | Start in background |
| `docker-compose down` | Stop containers |
| `docker-compose down -v` | Stop and remove volumes |
| `docker-compose build` | Rebuild images |
| `docker-compose logs -f` | Stream logs |
| `docker-compose ps` | List running containers |
| `docker-compose exec backend sh` | Shell into backend container |
| `docker-compose restart backend` | Restart backend only |

---

## Environment Variables

The `.env.local` file contains all local configuration. Key variables:

| Variable | Value | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://admin:admin123@postgres:5432/makomu_exchange` | PostgreSQL connection string |
| `NODE_ENV` | `development` | Application environment |
| `JWT_SECRET` | *(set your own)* | JWT signing secret |
| `PORT` | `5000` | Backend server port |
| `TWILIO_ACCOUNT_SID` | *(set your own)* | Twilio account SID |
| `TWILIO_AUTH_TOKEN` | *(set your own)* | Twilio auth token |
| `TWILIO_WHATSAPP_NUMBER` | `+1234567890` | WhatsApp sender number |

> ⚠️ **Never commit real secrets to source control.** Update `.env.local` with your actual credentials locally.

---

## Troubleshooting

**Port 5432 already in use:**
```bash
# Stop local PostgreSQL
sudo service postgresql stop   # Linux
brew services stop postgresql  # macOS
```

**Container fails to start:**
```bash
docker-compose down -v
docker-compose up --build
```

**Database not initializing:**
```bash
docker-compose logs postgres
```

---

## Deploying to Google Cloud

After testing locally with Docker, follow the Google Cloud SQL setup guide to deploy your database to production. The same `DATABASE_URL` format is used — simply replace the host, credentials, and database name with your Cloud SQL values.
