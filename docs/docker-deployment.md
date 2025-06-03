# Docker Deployment Guide for AegisX API Boilerplate

This guide covers Docker deployment options for the AegisX API boilerplate using optimized multi-stage builds and production-ready configurations.

## 🏗️ Docker Architecture

### Multi-Stage Dockerfile

The Dockerfile uses a 4-stage build process for optimal image size and security:

1. **Base Stage** - Common dependencies and user setup
2. **Dependencies Stage** - Install all npm dependencies
3. **Build Stage** - Compile TypeScript using SWC
4. **Production Stage** - Final optimized runtime image

### Key Features

- ✅ Multi-stage builds for smaller image size
- ✅ Non-root user for security
- ✅ Proper signal handling with dumb-init
- ✅ Health checks for all services
- ✅ Optimized layer caching
- ✅ Production-ready configurations

## 🚀 Quick Start

### Development Environment

```bash
# Build and start all services
./scripts/docker-deploy.sh development

# Or manually with docker-compose
docker-compose up -d

# Check service health
docker-compose ps
```

### Production Environment

```bash
# Build the production image
./scripts/docker-build.sh latest production

# Deploy to production
./scripts/docker-deploy.sh production

# Or manually
docker-compose -f docker-compose.prod.yml up -d
```

## 📁 Files Overview

```
├── Dockerfile                    # Multi-stage production Dockerfile
├── .dockerignore                # Excludes unnecessary files from build context
├── docker-compose.yml           # Development environment
├── docker-compose.prod.yml      # Production environment
└── scripts/
    ├── docker-build.sh          # Build script with optimization
    ├── docker-deploy.sh         # Deployment script
    ├── init-db.sql              # PostgreSQL initialization
    └── rabbitmq-definitions.json # RabbitMQ pre-configuration
```

## 🛠️ Available Scripts

### Build Script (`./scripts/docker-build.sh`)

```bash
# Build with default settings (latest tag, production target)
./scripts/docker-build.sh

# Build with specific version
./scripts/docker-build.sh v1.2.3

# Build with specific target
./scripts/docker-build.sh v1.2.3 development
```

### Deployment Script (`./scripts/docker-deploy.sh`)

```bash
# Deploy development environment
./scripts/docker-deploy.sh development

# Deploy production environment
./scripts/docker-deploy.sh production
```

## 🔧 Environment Configuration

### Single Environment File

The project now uses a single `.env` file for both development and production environments. This simplifies configuration management and reduces duplication.

### Setup Environment File

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` with your configuration:
```env
# Application
NODE_ENV=development
PORT=3000
LOG_LEVEL=debug

# Database
DB_HOST=db
DB_PORT=5432
DB_USER=user
DB_PASSWORD=password
DB_NAME=aegisx

# Redis
REDIS_URL=redis://redis:6379

# RabbitMQ
RABBITMQ_URL=amqp://admin:password@rabbitmq:5672
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=admin
RABBITMQ_PASSWORD=password

# Security
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here

# External APIs
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_email_password

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
```

### Production Configuration

For production deployment:

1. Set `NODE_ENV=production` in your `.env` file
2. Use strong, unique passwords for all services
3. Configure proper external database and Redis instances
4. Set secure JWT secrets (use long, random strings)
5. Configure production SMTP settings

### Environment Variable Overrides

Docker services automatically resolve container names, so database and message queue URLs use the service names defined in docker-compose files:
- `DB_HOST=db` (PostgreSQL container)
- `REDIS_URL=redis://redis:6379` (Redis container)
- `RABBITMQ_HOST=rabbitmq` (RabbitMQ container)

## 🌐 Service Access

After deployment, services are available at:

- **API**: http://localhost:3000
- **API Health**: http://localhost:3000/health
- **API Documentation**: http://localhost:3000/docs
- **RabbitMQ Management**: http://localhost:15672 (admin/password)
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## 📊 Resource Allocation

### Development

- No resource limits (uses available system resources)

### Production

- **API**: 0.5-1.0 CPU, 256MB-512MB RAM
- **PostgreSQL**: 1.0-2.0 CPU, 512MB-1GB RAM  
- **Redis**: 0.5-1.0 CPU, 256MB-512MB RAM
- **RabbitMQ**: 0.5-1.0 CPU, 256MB-512MB RAM

## 🔍 Monitoring & Health Checks

All services include health checks:

- **API**: HTTP health endpoint check
- **PostgreSQL**: `pg_isready` command
- **Redis**: `ping` command  
- **RabbitMQ**: `rabbitmq-diagnostics ping`

## 🗄️ Data Persistence

Persistent volumes are created for:

- **PostgreSQL**: Database data
- **Redis**: Cache data with persistence
- **RabbitMQ**: Queue definitions and messages

## 🔒 Security Features

- **Non-root user**: All processes run as `aegisx` user (UID 1001)
- **Minimal base image**: Alpine Linux for smaller attack surface
- **Read-only filesystems**: Where possible
- **Secret management**: Environment variable injection
- **Network isolation**: Custom Docker networks

## 🚀 Production Deployment

### Pre-deployment Checklist

- [ ] Update `.env.production` with secure credentials
- [ ] Configure SSL/TLS certificates for nginx
- [ ] Set up backup strategies for PostgreSQL
- [ ] Configure log aggregation
- [ ] Set up monitoring and alerting
- [ ] Test disaster recovery procedures

### Scaling

The production compose file supports scaling:

```bash
# Scale API instances
docker-compose -f docker-compose.prod.yml up -d --scale app=3

# Update deployment with zero downtime
docker-compose -f docker-compose.prod.yml up -d --no-deps app
```

## 🔧 Troubleshooting

### Common Issues

1. **Port conflicts**: Change port mappings in compose files
2. **Permission issues**: Ensure proper file ownership
3. **Memory issues**: Adjust resource limits
4. **Network issues**: Check Docker network configuration

### Useful Commands

```bash
# View logs
docker-compose logs -f app

# Execute shell in running container
docker-compose exec app sh

# Restart specific service
docker-compose restart app

# Clean up unused resources
docker system prune -a

# View resource usage
docker stats
```

## 📈 Performance Optimization

### Build Optimization

- Multi-stage builds reduce final image size by ~60%
- Layer caching optimizes rebuild times
- .dockerignore excludes unnecessary files

### Runtime Optimization

- Node.js process runs with appropriate memory limits
- PostgreSQL tuned for containerized environments
- Redis persistence configured for durability
- RabbitMQ configured with message TTL and limits

## 🔄 CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: Docker Build & Deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker image
        run: ./scripts/docker-build.sh ${{ github.sha }}
      - name: Push to registry
        run: docker push aegisx-api:${{ github.sha }}
```

This Docker setup provides a robust, scalable, and production-ready deployment solution for the AegisX API boilerplate.
