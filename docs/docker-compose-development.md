# 🚀 Docker Compose Development Guide

Complete guide for AegisX development setup using Docker Compose and Makefile commands.

## 🎯 Quick Start (TL;DR)

```bash
# First time setup
make setup-full

# Daily development
make dev

# When problems occur
make fresh-start
```

## 📋 Table of Contents

- [Available Setup Methods](#available-setup-methods)
- [Docker Compose Files Overview](#docker-compose-files-overview)
- [Commands Reference](#commands-reference)
- [Development Workflows](#development-workflows)
- [Troubleshooting](#troubleshooting)
- [Migration from Legacy Setup](#migration-from-legacy-setup)
- [Advanced Configuration](#advanced-configuration)

## 🛠️ Available Setup Methods

### 🎯 Option 1: Makefile (Recommended)

```bash
# Show all available commands
make help

# Complete setup with migrations & seeds
make setup-full

# Start development server
make dev

# Clean restart everything
make fresh-start
```

**Pros:**
- ✅ Simple commands, easy to remember
- ✅ Built-in help system
- ✅ Comprehensive workflow automation
- ✅ Batch operations support

### 🐳 Option 2: Docker Compose Scripts

```bash
# Complete setup
npm run setup:local:full

# Services only
npm run setup:local:compose

# Stop services
npm run services:down

# View logs
npm run services:logs
```

**Pros:**
- ✅ Standard industry practice
- ✅ Health checks and dependency management
- ✅ Easy to scale and customize
- ✅ Persistent volumes

### 🔧 Option 3: Legacy Manual Setup

```bash
# Use existing scripts (backward compatibility)
npm run setup:local
npm run stop:local
```

**Pros:**
- ✅ Works with existing setup
- ❌ Manual container management required
- ❌ No health checks
- ❌ No dependency management

## 🗂️ Docker Compose Files Overview

### File Structure

```
├── docker-compose.services.yml     # ⭐ RECOMMENDED: Services only
├── docker-compose.yml              # Full stack with app
├── docker-compose.prod.yml         # Production configuration
├── docker-compose.dev.yml          # 🗑️ DEPRECATED
└── docker-compose.override.yml     # 🗑️ DEPRECATED
```

### `docker-compose.services.yml` (Primary)

**Purpose:** Development services only (PostgreSQL, Redis, RabbitMQ)

**Features:**
- Health checks for all services
- Persistent volumes for data retention
- Network isolation (`aegisx-network`)
- Automatic service readiness verification
- Centralized logging configuration

**Container Names:**
- `aegisx-postgres`
- `aegisx-redis`
- `aegisx-rabbitmq`

### `docker-compose.yml` (Full Stack)

**Purpose:** Complete application stack including the API server

**Features:**
- All services + AegisX API application
- Service dependencies with health check conditions
- Production-like environment testing
- Container name: `aegisx-api`

### `docker-compose.prod.yml` (Production)

**Purpose:** Production deployment configuration

**Features:**
- Multiple app replicas for scaling
- Resource limits and constraints
- Production environment variables
- Restart policies
- Network: `aegisx-prod-network`

## 📋 Commands Reference

### 🚀 Quick Start Commands

| Command | Description |
|---------|-------------|
| `make help` | Show all available Makefile commands |
| `make setup-full` | Complete setup (services + db + event bus) |
| `make dev` | Start development server |
| `make clean` | Stop and clean up everything |
| `make fresh-start` | Clean + setup-full (full reset) |

### 🐳 Services Management

| Command | Description |
|---------|-------------|
| `make services-up` | Start services (PostgreSQL, Redis, RabbitMQ) |
| `make services-down` | Stop services |
| `make services-logs` | View service logs |
| `make services-restart` | Restart all services |
| `make status` | Check service status |

### 🗄️ Database Operations

| Command | Description |
|---------|-------------|
| `make db-setup` | Run migrations + seeds |
| `make db-reset` | Reset database completely |
| `make db-migrate` | Run migrations only |
| `make db-seed` | Run seeds only |

### 🔗 Full Stack Operations

| Command | Description |
|---------|-------------|
| `make stack-up` | Start full stack including app |
| `make stack-down` | Stop full stack |
| `make stack-logs` | View full stack logs |

### 🧹 Cleanup Operations

| Command | Description |
|---------|-------------|
| `make clean` | Stop services and remove volumes |
| `make clean-all` | Full cleanup including Docker system |

## 🎯 Development Workflows

### First Time Setup

```bash
# Complete setup in one command
make setup-full

# This will:
# 1. Start all services (PostgreSQL, Redis, RabbitMQ)
# 2. Wait for services to be healthy
# 3. Run database migrations
# 4. Run database seeds
# 5. Setup RabbitMQ event bus

# Start development
make dev
```

### Daily Development

```bash
# If services are already running
make dev

# If services are stopped
make setup     # Start services only
make dev      # Start development server
```

### When Something Goes Wrong

```bash
# Nuclear option - reset everything
make fresh-start

# Or step by step
make clean        # Stop and clean
make setup-full   # Setup everything again

# Database issues only
make db-reset
```

### Testing Different Environments

```bash
# Test with services only (recommended)
make setup
make dev

# Test full stack in containers
make stack-up

# Production-like testing
docker-compose -f docker-compose.prod.yml up -d
```

## 🌐 Service URLs & Access

After running `make setup` or `make setup-full`:

- **API**: <http://localhost:3000>
- **API Docs**: <http://localhost:3000/docs>
- **Health Check**: <http://localhost:3000/health>
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **RabbitMQ**: localhost:5672
- **RabbitMQ Management**: <http://localhost:15672> (admin/password)

## 🔍 Troubleshooting

### Check Service Status

```bash
# Quick status check
make status

# Detailed container information
docker ps

# View service logs
make services-logs

# View specific service logs
docker logs aegisx-postgres
docker logs aegisx-redis
docker logs aegisx-rabbitmq
```

### Common Issues & Solutions

#### Port Conflicts

```bash
# Stop conflicting services
make clean

# Or kill processes using the ports
lsof -ti:5432 | xargs kill -9  # PostgreSQL
lsof -ti:6379 | xargs kill -9  # Redis
lsof -ti:5672 | xargs kill -9  # RabbitMQ
```

#### Database Connection Issues

```bash
# Reset database completely
make db-reset

# Or restart just PostgreSQL
docker restart aegisx-postgres
sleep 5
make db-setup
```

#### Services Not Starting

```bash
# Full cleanup and restart
make clean-all
make setup-full
```

#### Health Check Failures

```bash
# Wait longer for services to be ready
./scripts/wait-for-services.sh

# Check individual service health
docker exec aegisx-postgres pg_isready
docker exec aegisx-redis redis-cli ping
docker exec aegisx-rabbitmq rabbitmq-diagnostics ping
```

## 🔄 Migration from Legacy Setup

### What Changed

#### Before (Legacy)

```bash
npm run setup:local     # Manual Docker commands
npm run stop:local      # Manual cleanup
# Issues:
# - No health checks
# - No dependency management
# - Manual container management
# - No persistent volumes
```

#### After (New System)

```bash
make setup-full         # Docker Compose with health checks
make clean             # Proper cleanup with volumes
# Benefits:
# ✅ Health checks
# ✅ Dependency management
# ✅ Persistent volumes
# ✅ Easy cleanup
# ✅ Service discovery
```

### Migration Commands Comparison

| Task | Old Way | New Way |
|------|---------|---------|
| Start services | `npm run setup:local` | `make setup` |
| Complete setup | `npm run dev:full` | `make setup-full` |
| Stop services | `npm run stop:local` | `make clean` |
| View logs | Manual `docker logs` | `make services-logs` |
| Check status | Manual `docker ps` | `make status` |
| Reset everything | Manual cleanup | `make fresh-start` |

### Files to Clean Up

When ready, you can remove these deprecated files:

```bash
# Remove deprecated compose files
rm docker-compose.dev.yml
rm docker-compose.override.yml

# Update .gitignore
echo "docker-compose.dev.yml" >> .gitignore
echo "docker-compose.override.yml" >> .gitignore
```

### Scripts Status

- ✅ **Keep**: `scripts/start-local-services.sh` (backward compatibility)
- ✅ **Keep**: `scripts/stop-local-services.sh` (backward compatibility)
- ✅ **New**: `scripts/wait-for-services.sh` (health checks)
- ✅ **New**: `scripts/test-setup-methods.sh` (testing)

## ⚙️ Advanced Configuration

### Environment Variables

Create or update `.env` file:

```bash
# Database
DATABASE_URL=postgresql://aegisx:password@localhost:5432/aegisx_dev

# Redis
REDIS_URL=redis://localhost:6379

# RabbitMQ
RABBITMQ_URL=amqp://admin:password@localhost:5672

# Application
NODE_ENV=development
PORT=3000
JWT_SECRET=your-jwt-secret
```

### Custom Docker Compose Override

Create `docker-compose.local.yml` for personal customizations:

```yaml
version: '3.8'

services:
  postgres:
    ports:
      - "5433:5432"  # Use different port
    
  redis:
    ports:
      - "6380:6379"  # Use different port
```

Use with:

```bash
docker-compose -f docker-compose.services.yml -f docker-compose.local.yml up -d
```

### Health Check Customization

Edit `scripts/wait-for-services.sh` to adjust:

- Timeout values (default: 30 attempts)
- Wait intervals (default: 2 seconds)
- Health check commands

### Volume Management

View volumes:

```bash
docker volume ls | grep aegisx
```

Backup data:

```bash
# Backup PostgreSQL
docker exec aegisx-postgres pg_dump -U aegisx aegisx_dev > backup.sql

# Backup Redis
docker exec aegisx-redis redis-cli save
```

## 💡 Best Practices

### Development Workflow

1. **Start of day**: `make setup` (if services stopped) → `make dev`
2. **End of day**: `make services-down` (optional, keeps data)
3. **Weekly cleanup**: `make clean` (removes volumes for fresh start)
4. **When stuck**: `make fresh-start` (nuclear option)

### Performance Tips

1. **Use persistent volumes**: Data survives container restarts
2. **Don't run `make clean` daily**: Preserves database data
3. **Use `make services-restart`**: Faster than down/up cycle
4. **Monitor resources**: `docker stats` to check usage

### Team Collaboration

1. **Standardize on Makefile**: Everyone uses same commands
2. **Document customizations**: Share any local modifications
3. **Version control compose files**: Keep them in git
4. **Regular cleanup**: Weekly `make clean-all` to free space

## 🆘 Getting Help

### Quick Reference

```bash
make help              # All available commands
make status           # Current service status
make services-logs    # Debug service issues
```

### Common Commands Summary

```bash
# 🚀 Daily workflow
make setup-full       # First time
make dev             # Start coding

# 🔧 When issues occur
make fresh-start     # Reset everything
make status          # Check what's wrong
make services-logs   # See error details

# 🧹 Cleanup
make clean           # Stop + remove volumes
make clean-all       # Nuclear cleanup
```

---

## 📚 Additional Resources

- [Development Workflow Guide](./development-workflow.md)
- [Event Bus Documentation](./event-bus.md)
- [Docker Deployment Guide](./docker-deployment.md)
- [Testing Guide](./testing-guide.md)

---

🎯 **Recommended**: Start with `make setup-full` for first-time setup, then use `make dev` for daily development!
