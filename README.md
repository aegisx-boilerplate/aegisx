# AegisX API Boilerplate

Enterprise-grade API boilerplate built with Fastify, TypeScript, and Event-Driven Architecture

## 📋 Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Core Modules](#core-modules)
- [Usage Examples](#usage-examples)
- [Development](#development)
- [Production Build](#production-build)
- [Tech Stack](#tech-stack)
- [Security Features](#security-features)
- [Monitoring & Analytics](#monitoring--analytics)
- [Project Structure](#project-structure)
- [Production Deployment](#production-deployment)
- [Contributing](#contributing)

## ✨ Features

### 🔐 Authentication & Security

- **JWT Authentication** - Stateless authentication with refresh tokens
- **RBAC (Role-Based Access Control)** - Granular permission system
- **API Key Management** - Secure API key generation and validation
- **Rate Limiting** - Request throttling and abuse prevention
- **Security Headers** - Helmet.js integration for secure headers

### 📊 Audit & Analytics

- **Comprehensive Audit Logging** - Track all user actions and system events
- **Event-Driven Architecture** - RabbitMQ-based message queue system
- **Real-time Analytics** - Event tracking and analytics dashboard
- **Audit Trail** - Complete activity history for compliance

### 🏗️ Architecture & Developer Experience

- **Modular Design** - Organized core and feature modules
- **TypeScript** - Full type safety and better developer experience
- **Auto-generated API Docs** - OpenAPI/Swagger documentation
- **Docker Support** - Containerized development and deployment
- **Database Migrations** - Knex.js for database schema management

## 🚀 Quick Start

### Prerequisites

- Node.js 20.8.1+
- PostgreSQL 14+
- Redis 6+
- RabbitMQ 3.8+ (for event bus)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd aegisx

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database and service configurations

# Complete development setup (recommended)
make setup-full

# Start development server
make dev
```

> 📚 **For detailed setup instructions**: See [Docker Compose Development Guide](./docs/docker-compose-development.md)

### Quick Development Workflow

```bash
# 🎯 Option 1: Makefile (Recommended)
make setup-full      # Complete setup with migrations & seeds
make dev            # Start development server

# 🐳 Option 2: Docker Compose (Modern approach)
npm run setup:local:full    # Start services + migrate + seed + event bus
npm run dev                # Start development server

# ⚡ Option 3: Step by step
make setup               # Start services only
make db-setup           # Migrate + seed
npm run setup:eventbus  # Setup event bus
make dev               # Start development server

# 🔧 Option 4: Legacy method
npm run dev:setup      # Legacy complete setup
npm run dev           # Start development server

# Stop services when done
make clean              # Clean stop with volume removal
npm run services:down   # Stop services only
```

### Development Scripts

```bash
# 🎯 Quick Start Commands
make help                   # Show all available Makefile commands
make setup-full            # Complete setup (services + db + event bus)
make dev                   # Start development server
make clean                 # Stop and clean up everything
make fresh-start           # Clean + setup-full (full reset)

# 🐳 Services Management  
make services-up           # Start services (PostgreSQL, Redis, RabbitMQ)
make services-down         # Stop services
make services-logs         # View service logs
make status               # Check service status

# 🗄️ Database Operations
make db-setup             # Run migrations + seeds
make db-reset             # Reset database completely
make db-migrate           # Run migrations only
make db-seed              # Run seeds only

# 📊 Event System
npm run setup:eventbus    # Setup RabbitMQ queues
npm run test:events       # Test event system

# 🔍 Monitoring & Debug
make services-logs        # View all service logs
npm run services:status   # Check Docker container status

# 🗄️ Database Operations
make db-setup              # Migrate + seed with Makefile
npm run db:setup          # Build + migrate + seed with npm

# 🧹 Cleanup
make clean                 # Stop services and remove volumes
make clean-all            # Full cleanup including Docker system
npm run services:down      # Stop services only
```

## 📚 Core Modules

### 🔐 Authentication (`/core/auth`)

- User login/logout with JWT tokens
- Password validation and security
- Session management
- Authentication middleware

### 👥 User Management (`/core/user`)

- User CRUD operations
- Profile management
- Role assignment
- User activity tracking

### 🔑 API Key Management (`/core/api-key`)

- Generate secure API keys
- Scope-based permissions
- Key rotation and revocation
- Usage tracking


### 📝 Audit System (`/core/audit`)

- Automatic event logging
- Custom audit events
- Query and filtering
- Export capabilities
- **Durable audit log**: If RabbitMQ is unavailable, audit events are written to `logs/audit-offline.jsonl` (or per-pod/per-container log file)
- **Safe replay**: Use `scripts/replay-audit-offline.ts` to replay offline logs to RabbitMQ when it is healthy again
- **Per-pod/per-container support**: For Kubernetes or Compose scaling, each pod/container can write its own log file (e.g. `audit-offline-<pod>.jsonl`)

### 🛡️ RBAC (`/core/rbac`)

- Role and permission management
- Dynamic permission checking
- Hierarchical roles
- Resource-based permissions

## 🎯 Usage Examples

### Authentication

```typescript
// Login
POST /auth/login
{
  "username": "admin",
  "password": "your-password"
}

// Response
{
  "success": true,
  "token": "jwt-token-here"
}
```

### API Key Usage

```typescript
// Create API key
POST /api-keys
Authorization: Bearer <jwt-token>
{
  "name": "My API Key",
  "scopes": ["read:users", "write:audit"]
}

// Use API key
GET /users
Authorization: Api-Key <api-key>
```

### Audit Events

```typescript
// Use unified AuditLogger for all audit events
import { AuditLogger, AuditEventBuilder } from './utils/audit-logger';

// Convenience methods for common events
await AuditLogger.logAuth({ 
  userId: '123', 
  action: 'login',
  ip: req.ip, 
  userAgent: req.headers['user-agent'] 
});

await AuditLogger.logUserManagement({
  actorId: req.user.id,
  action: 'created',
  targetUserId: 'new-user-123',
  details: { username: 'john.doe' },
  ip: req.ip,
  userAgent: req.headers['user-agent'],
});

// Complex audit events using builder pattern
await AuditEventBuilder.create()
  .actor('user123')
  .action('document.approved')
  .resource('document', 'doc456')
  .details({ status: 'approved', amount: 50000 })
  .metadata(req.ip, req.headers['user-agent'])
  .publish();
```


### Analytics

- `GET /api/events/analytics` - Real-time event analytics
- `GET /api/events/analytics/dashboard` - Event dashboard

### Audit Log Durability & Replay

- If RabbitMQ is down, audit events are written to `logs/audit-offline.jsonl` (or per-pod log file)
- To replay offline logs, run:

  ```bash
  npx ts-node scripts/replay-audit-offline.ts
  # or for per-pod: npx ts-node scripts/replay-audit-offline.ts /path/to/audit-offline-<pod>.jsonl
  ```

- The script will only remove the offline log if all events are successfully replayed and RabbitMQ is healthy
- See [docs/audit-log-replay-automation.md](./docs/audit-log-replay-automation.md) for deployment patterns (Kubernetes, Docker Compose, per-pod log, etc)

### Documentation

- `GET /docs` - Swagger UI documentation
- `GET /health` - Health check endpoint

## 🛠️ Development

### Quick Start Development

```bash
# 🎯 Recommended approach (complete setup in one command)
make setup-full     # Start services + migrate + seed + event bus
make dev           # Start development server

# 🐳 Alternative with Docker Compose
npm run setup:local:full  # Complete setup with npm scripts
npm run dev              # Start development server

# ⚡ Step by step approach
make setup          # Start services only
make db-setup      # Run migrations + seeds  
npm run setup:eventbus  # Setup event bus
make dev          # Start development server

# 📊 Daily development (when services are already running)
make dev          # Just start the development server
```

### Advanced Development

```bash
# Database operations
npm run knex:migrate    # Run migrations
npm run knex:seed      # Run seeds
npm run db:setup       # Build + migrate + seed

# Service management
npm run setup:local    # Start Docker services
npm run stop:local     # Stop Docker services

# Code quality
npm run lint           # Lint code
npm run format         # Format code
npm run type-check     # Type checking
npm run check          # Lint + type-check + build

# Testing
npm run test:events    # Test event system
```

### Development Environment

- **Development Environment**: <http://localhost:3000/docs>
- **Health Check**: <http://localhost:3000/health>
- **Event Status**: <http://localhost:3000/events/status>
- **RabbitMQ Management**: <http://localhost:15672> (admin/password)

> 🔧 **For detailed troubleshooting**: See [Docker Compose Development Guide](./docs/docker-compose-development.md#troubleshooting)

## 📚 Documentation

### 🚀 Getting Started
- **[Docker Compose Development Guide](./docs/docker-compose-development.md)** - Complete setup and development guide
- **[Development Workflow](./docs/development-workflow.md)** - Daily development practices
- **[Testing Guide](./docs/testing-guide.md)** - Testing approaches and best practices

### 🏗️ Architecture

- **[Event-Driven Architecture](./docs/event-driven-architecture.md)** - System architecture overview
- **[Event Bus Documentation](./docs/event-bus.md)** - RabbitMQ integration details
- **[Audit Logging](./docs/audit-logging.md)** - Comprehensive audit system

### 🔐 Authentication & Testing

- **[Auth Enhancement Summary](./docs/auth/AUTH_ENHANCEMENT_SUMMARY.md)** - Complete auth module enhancement details
- **[Auth Routes Testing Guide](./docs/auth/AUTH_ROUTES_TESTING.md)** - Testing authentication endpoints
- **[Auth Testing Guide](./docs/auth-testing-guide.md)** - Comprehensive auth testing guide

### 🚀 Deployment

- **[Docker Deployment](./docs/docker-deployment.md)** - Production deployment guide
- **[Semantic Release](./docs/semantic-release.md)** - Automated versioning and releases

### 📊 Analytics & Monitoring

- **[Event Analytics](./docs/event-analytics.md)** - Analytics system overview
- **[Event Analytics Quickstart](./docs/event-analytics-quickstart.md)** - Quick setup guide

> 📖 **Full Documentation Index**: See [docs/README.md](./docs/README.md) for complete documentation catalog

## Production Build Scripts

```bash
# Build for production (using SWC - super fast!)
npm run build

# Type checking (required with SWC)
npm run type-check

# Complete check (lint + type-check + build)
npm run check

# Linting
npm run lint

# Format code
npm run format

# Commit with conventional commits
npm run commit
```

## Build System

This project uses SWC for fast compilation instead of TypeScript's tsc compiler. **Important**: SWC only handles transpilation and does not perform type checking.

### Type Checking vs Building

- **Building** (`npm run build`): Uses SWC for fast transpilation
- **Type Checking** (`npm run type-check`): Uses TypeScript compiler for type validation
- **Combined Check** (`npm run check`): Runs linting, type checking, and building

### Build & Development Scripts

- `npm run dev` - Start development server with ts-node-dev
- `npm run build` - Compile TypeScript to JavaScript using SWC
- `npm run start` - Run production server
- `npm run type-check` - Run TypeScript type checking only
- `npm run check` - Run full code quality checks (lint + type-check + build)

### Pre-commit Hooks

Git pre-commit hooks automatically run:

1. ESLint for code linting
2. TypeScript type checking

This ensures code quality before commits are made.

### Why SWC?

- ⚡ **20x faster** than TypeScript compiler
- 🔧 **Zero configuration** for most TypeScript projects
- 📦 **Smaller bundle size** with better optimizations
- 🎯 **Same output** - fully compatible  
- 🔧 **Better DX** - faster feedback loop

**Note**: SWC only transpiles code, so we run TypeScript separately for type checking.

## Git Workflow & Release Management

This project uses [Conventional Commits](https://www.conventionalcommits.org/) with Husky hooks and [Semantic Release](https://semantic-release.gitbook.io/):

```bash
# Use commitizen for interactive commit
npm run commit

# Or commit directly with conventional format
git commit -m "feat: add new authentication feature"
git commit -m "fix: resolve Redis connection issue"
git commit -m "docs: update API documentation"

# Test release locally (dry run)
npm run release:dry

# Automated releases happen on push to main branch
```

**Available commit types:**

- `feat`: New features → Minor version bump
- `fix`: Bug fixes → Patch version bump  
- `perf`: Performance improvements → Patch version bump
- `docs`: Documentation updates
- `style`: Code style changes
- `refactor`: Code refactoring → Patch version bump
- `test`: Adding tests
- `chore`: Maintenance tasks
- `build`: Build system changes
- `ci`: CI/CD changes

**Breaking Changes:** Add `BREAKING CHANGE:` in commit body → Major version bump

### Automated Releases

Releases are automated using semantic-release:

- **Push to `main`** → Automatic release to production
- **Push to `beta`** → Beta pre-release  
- **Push to `alpha`** → Alpha pre-release
- **Dry run locally**: `npm run release:dry`

## 🐳 Docker Support

```bash
# Start with Docker Compose (includes PostgreSQL, Redis, RabbitMQ)
docker-compose up -d

# Build Docker image
docker build -t aegisx-api .
```

## 📦 Tech Stack

- **Runtime**: Node.js + TypeScript
- **Framework**: Fastify
- **Database**: PostgreSQL + Knex.js
- **Cache**: Redis
- **Message Queue**: RabbitMQ
- **Validation**: TypeBox
- **Authentication**: JWT
- **Documentation**: Swagger/OpenAPI

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- API key authentication
- Rate limiting
- Request validation
- Audit logging
- IP tracking
- CORS protection

## 📈 Monitoring & Analytics

- Real-time event tracking
- Audit log analytics
- User activity monitoring
- API usage statistics
- Performance metrics

## 🗂️ Project Structure

```text
src/
├── core/                 # Core modules
│   ├── auth/            # Authentication system
│   ├── user/            # User management
│   ├── rbac/            # Role-based access control
│   ├── audit/           # Audit logging
│   └── api-key/         # API key management
├── features/            # Feature modules
├── config/              # Configuration
├── database/            # Database migrations & seeds
└── shared/              # Shared utilities
```

## 🚀 Production Deployment

### Environment Setup Checklist

- [ ] Set strong `JWT_SECRET` and `JWT_REFRESH_SECRET` in production
- [ ] Configure production database connection with connection pooling
- [ ] Setup Redis cluster for high availability
- [ ] Configure RabbitMQ cluster with proper queues
- [ ] Setup monitoring and logging (PM2, Docker logs, etc.)
- [ ] Configure environment-specific variables

### Security Review

- [ ] Review and rotate API keys regularly
- [ ] Setup proper CORS origins for your domains
- [ ] Configure rate limiting based on expected usage
- [ ] Review RBAC permissions and roles
- [ ] Setup SSL/TLS certificates
- [ ] Configure security headers appropriately

### Performance Optimization

- [ ] Database connection pooling tuning
- [ ] Redis memory optimization and persistence settings
- [ ] RabbitMQ queue management and monitoring
- [ ] Enable gzip compression
- [ ] Setup CDN for static assets (if applicable)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.
