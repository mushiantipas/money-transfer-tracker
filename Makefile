.PHONY: up down logs db-shell reset build seed migrate

## Start Docker containers
up:
	docker-compose up -d

## Stop containers
down:
	docker-compose down

## View logs
logs:
	docker-compose logs -f

## Access database shell
db-shell:
	docker exec -it money-transfer-postgres psql -U admin -d makomu_exchange

## Reset everything (stop, remove volumes, rebuild, start)
reset:
	docker-compose down -v
	docker-compose up --build -d

## Rebuild images
build:
	docker-compose build

## Run database migrations
migrate:
	docker-compose exec backend node backend/db/migrate.js

## Seed sample data
seed:
	docker-compose exec backend node scripts/seed.js
