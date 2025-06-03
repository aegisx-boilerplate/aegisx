# AegisX API Boilerplate

Enterprise-grade API boilerplate built with Fastify, TypeScript, and Event-Driven Architecture

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

- Node.js 18+
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

# Run database migrations
npm run knex:migrate

# Seed initial data (roles, permissions, admin user)
npm run knex:seed

# Start development server
npm run dev
```

### Using Docker (Recommended for development)

```bash
# Start all services (PostgreSQL, Redis, RabbitMQ, API)
npm run setup:local

# Stop services
npm run stop:local
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
// Automatic audit logging (built-in)
import { auditEvents } from './core/audit/audit.events';

await auditEvents.recordLogin({ 
  userId: '123', 
  success: true, 
  ip: req.ip, 
  userAgent: req.headers['user-agent'] 
});

// Custom audit events
import { AuditEventBuilder } from './core/audit/audit.events';

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

### Documentation

- `GET /docs` - Swagger UI documentation
- `GET /health` - Health check endpoint

## 🛠️ Development

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

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

```
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

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.
