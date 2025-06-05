# ==============================================================================
# AegisX Development Makefile
# ==============================================================================

.PHONY: help dev setup setup-full clean services-up services-down services-logs

# Default target
help: ## Show this help message
	@echo "AegisX Development Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'
	@echo ""

# Development
dev: ## Start development server (requires services to be running)
	npm run dev

setup: ## Start only services (DB, Redis, RabbitMQ) for local development
	@echo "🚀 Starting local development services..."
	docker-compose -f docker-compose.services.yml up -d
	@echo "⏳ Waiting for services to be ready..."
	./scripts/wait-for-services.sh

setup-full: ## Start services and run full setup (migrations, seeds, event bus)
	@echo "🚀 Setting up complete development environment..."
	docker-compose -f docker-compose.services.yml up -d
	./scripts/wait-for-services.sh
	npm run db:setup
	npm run setup:eventbus
	@echo "✅ Development environment ready! Run 'make dev' to start the server."

# Services Management
services-up: ## Start only the services (DB, Redis, RabbitMQ)
	docker-compose -f docker-compose.services.yml up -d

services-down: ## Stop the services
	docker-compose -f docker-compose.services.yml down

services-logs: ## Show services logs
	docker-compose -f docker-compose.services.yml logs -f

services-restart: ## Restart services
	docker-compose -f docker-compose.services.yml restart

# Full Stack (with App)
stack-up: ## Start full stack including the app
	docker-compose up -d

stack-down: ## Stop full stack
	docker-compose down

stack-logs: ## Show full stack logs
	docker-compose logs -f

# Database
db-migrate: ## Run database migrations
	npm run knex:migrate

db-seed: ## Run database seeds
	npm run knex:seed

db-setup: ## Setup database (migrate + seed)
	npm run db:setup

db-reset: ## Reset database (down, up, migrate, seed)
	docker-compose -f docker-compose.services.yml restart postgres
	sleep 5
	npm run db:setup

# Testing
test: ## Run tests
	npm test

test-events: ## Test event system
	npm run test:events

# Cleanup
clean: ## Stop services and remove volumes
	docker-compose -f docker-compose.services.yml down -v --remove-orphans

clean-all: ## Stop everything and clean up Docker
	docker-compose down -v --remove-orphans
	docker-compose -f docker-compose.services.yml down -v --remove-orphans
	docker system prune -f --volumes

# Development Workflow
fresh-start: clean setup-full ## Clean everything and start fresh

# Docker Build
build: ## Build the application Docker image
	npm run docker:build

# Check services status
status: ## Check status of all services
	@echo "🔍 Checking services status..."
	@docker-compose -f docker-compose.services.yml ps
	@echo ""
	@echo "🌐 Service URLs:"
	@echo "  PostgreSQL: localhost:5432"
	@echo "  Redis: localhost:6379"  
	@echo "  RabbitMQ: localhost:5672"
	@echo "  RabbitMQ Management: http://localhost:15672"
	@echo ""
	@echo "💡 Use 'make dev' to start the application server"
