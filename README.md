# 🛡️ AegisX Universal Core API

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-22_LTS-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Fastify](https://img.shields.io/badge/Fastify-4.x-000000.svg)](https://www.fastify.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791.svg)](https://www.postgresql.org/)

> **Enterprise-grade Central Identity Management & Authentication Hub**  
> A production-ready API boilerplate for modern applications with flexible multi-tenancy, advanced security, and scalable architecture.

---

## 🎯 **Core Concept**

AegisX serves as the **central authentication and authorization hub** for your entire application ecosystem. Instead of building authentication from scratch in each application, integrate with AegisX Core API to get enterprise-grade identity management instantly.

```mermaid
graph TD
    A[AegisX Core API] --> B[Todo Application]
    A --> C[CRM Application] 
    A --> D[E-commerce Platform]
    A --> E[Mobile Apps]
    
    A --> F[🔐 Authentication]
    A --> G[👥 User Management]
    A --> H[🛡️ RBAC Authorization]
    A --> I[🏢 Multi-tenant Support]
```

---

## ✨ **Key Features**

### 🔐 **Enterprise Authentication**
- **OAuth 2.0 + JWT** with RS256 signatures
- **Multi-factor Authentication** (TOTP, SMS, Email)
- **Social Login** (Google, GitHub, Microsoft, Apple)
- **Session Management** with automatic token rotation
- **Passwordless Authentication** options

### 🛡️ **Advanced Authorization**  
- **Role-Based Access Control (RBAC)** with hierarchical roles
- **Permission-Based Access Control (PBAC)** for granular permissions
- **Resource-level Authorization** with ownership validation
- **Dynamic Permission Evaluation** with custom rules
- **API-level Rate Limiting** per user/role

### 🏢 **Flexible Multi-Tenancy**
- **Single-tenant Mode** (default) - Simple, no complexity
- **Multi-tenant Mode** (enterprise) - Full organizational isolation
- **Seamless Migration** - Start simple, scale when needed
- **Tenant-specific Customization** - Branding, configurations, policies

### 🚀 **Production-Ready Architecture**
- **Event-Driven Design** with RabbitMQ message queues
- **Microservices-Ready** with API Gateway integration  
- **High Performance** with Redis caching and connection pooling
- **Auto-scaling** with Kubernetes support
- **Zero-downtime Deployments** with health checks

### 📊 **Enterprise Observability**
- **Distributed Tracing** with OpenTelemetry
- **Comprehensive Metrics** with Prometheus integration
- **Structured Logging** with correlation IDs
- **Real-time Monitoring** dashboards
- **Automated Alerting** for critical issues

---

## 🏗️ **Architecture Overview**

### **Central Hub Model**
```mermaid
sequenceDiagram
    participant User as 👤 User
    participant App as 📱 Todo App  
    participant Gateway as 🌐 API Gateway
    participant Core as 🔐 AegisX Core
    participant TodoAPI as 📝 Todo Service
    
    User->>App: 1. Access Application
    App->>Gateway: 2. API Request
    Gateway->>Core: 3. Validate JWT & Permissions
    Core-->>Gateway: 4. User Context + Permissions
    Gateway->>TodoAPI: 5. Forward Request + Context
    TodoAPI-->>User: 6. Authorized Response
```

### **Tech Stack**
- **Runtime**: Node.js 22 LTS
- **Framework**: Fastify 4.x + TypeScript 5.x
- **Database**: PostgreSQL 15+ (primary), Redis 7+ (cache)  
- **Message Queue**: RabbitMQ for event-driven communication
- **Testing**: Vitest + Playwright + Testcontainers
- **Build**: SWC compiler (20x faster than TypeScript)
- **DI Container**: TSyringe for dependency injection

---

## 📋 **Quick Start**

### **Prerequisites**
```bash
# Required
node >= 22.0.0
npm >= 10.0.0
docker >= 24.0.0
docker-compose >= 2.0.0

# Optional (for production)
kubernetes >= 1.28
```

### **Installation**
```bash
# Clone repository
git clone https://github.com/your-org/aegisx.git
cd aegisx

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configurations

# Start development services
docker-compose up -d postgres redis rabbitmq

# Run database migrations
npm run db:migrate

# Seed initial data
npm run db:seed

# Start development server
npm run dev
```

### **Environment Configuration**
```bash
# Core Settings
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Multi-tenancy (start simple!)
ENABLE_MULTI_TENANT=false  # Set to true for enterprise mode

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/aegisx
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost:5672

# JWT Configuration  
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## 🎯 **Integration Examples**

### **Basic Authentication Check**
```typescript
// In your application
const response = await fetch('/api/todos', {
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'Content-Type': 'application/json'
  }
});

// API Gateway automatically validates with AegisX Core
// Your service receives user context in headers:
// x-user-id: "user-123"
// x-user-roles: "user,premium"  
// x-tenant-id: "tenant-456" (if multi-tenant enabled)
```

### **Permission-Based Protection**
```typescript
// Check specific permissions
const hasPermission = await checkPermission(userId, 'todo:create');
if (!hasPermission) {
  return res.status(403).json({ error: 'Permission denied' });
}

// Resource-level authorization
const todo = await Todo.findById(todoId);
if (todo.userId !== currentUserId && !isAdmin(currentUser)) {
  return res.status(403).json({ error: 'Access denied' });
}
```

---

## 📊 **Visual Documentation**

### **Comprehensive Flow Diagrams**
พร้อมใช้งาน 18 flow diagrams ครอบคลุมทุกส่วนของระบบ:

📁 **[Flow Diagrams Collection](./aegisx-flow-diagrams.md)**
- 🔐 Authentication & JWT flows
- 👤 User management workflows  
- 🛡️ RBAC permission flows
- 🏢 Multi-tenant operations
- 📝 Application integration examples
- 🏗️ System architecture flows
- 🚀 Deployment & scaling workflows
- 📊 Monitoring & error handling

### **Architecture Blueprints**
📁 **[Complete Architecture Specification](./aegisx-core-architecture.yaml)**
- Database schemas and relationships
- API endpoint specifications
- Security implementation details  
- Multi-tenant design patterns
- Performance optimization strategies

---

## 🚀 **Development Roadmap**

### **Phase 1: Core Foundation** (Week 1-2)
- [x] Project structure and documentation
- [x] Architecture blueprints and flow diagrams
- [ ] Core API framework setup
- [ ] Database design and migrations
- [ ] Authentication system (JWT + OAuth)
- [ ] Basic RBAC implementation

### **Phase 2: Advanced Features** (Week 3-4)  
- [ ] Multi-tenant architecture (optional mode)
- [ ] Advanced permission system
- [ ] Event-driven communication
- [ ] API Gateway integration
- [ ] Comprehensive testing suite

### **Phase 3: Production Ready** (Week 5-6)
- [ ] Security hardening and audit
- [ ] Performance optimization  
- [ ] Monitoring and observability
- [ ] CI/CD pipeline setup
- [ ] Docker containerization
- [ ] Kubernetes deployment manifests

### **Phase 4: Integration & Polish** (Week 7-8)
- [ ] Example Todo application
- [ ] Frontend integration examples
- [ ] API documentation (OpenAPI)
- [ ] Performance benchmarks
- [ ] Security penetration testing

---

## 📈 **Performance Benchmarks**

**Target Performance (Production)**
```
📊 Throughput:     10,000+ req/sec
⚡ Response Time:   < 50ms (p95)
🛡️ Security:       A+ rating (Mozilla Observatory)  
📈 Uptime:         99.9% SLA
🔄 Scalability:    Auto-scale 2-100 instances
```

**Authentication Performance**
```
🔐 JWT Validation:     < 5ms
👤 Permission Check:   < 10ms  
🏢 Multi-tenant Query: < 15ms
📝 CRUD Operations:    < 25ms
```

---

## 🧪 **Testing Strategy**

### **Comprehensive Test Coverage**
```bash
# Unit tests (business logic)
npm run test:unit

# Integration tests (API endpoints)  
npm run test:integration

# End-to-end tests (full workflows)
npm run test:e2e

# Performance tests (load testing)
npm run test:performance

# Security tests (vulnerability scanning)
npm run test:security

# All tests with coverage
npm run test:all
```

### **Test-Driven Development**
- **Unit Tests**: 90%+ coverage for business logic
- **Integration Tests**: All API endpoints tested
- **E2E Tests**: Critical user journeys automated
- **Contract Tests**: API compatibility validation
- **Security Tests**: Automated vulnerability scanning

---

## 🔒 **Security Features**

### **Industry-Standard Security**
- **OWASP Top 10** protection built-in
- **Rate Limiting** with Redis-backed sliding windows
- **Input Validation** with comprehensive schemas  
- **SQL Injection** prevention with parameterized queries
- **XSS Protection** with content security policies
- **CSRF Protection** with double-submit cookies

### **Advanced Security Options**
- **Zero-Trust Architecture** with continuous verification
- **Threat Detection** with ML-based anomaly detection
- **Secrets Management** with HashiCorp Vault integration
- **Audit Logging** with immutable trail records
- **Compliance Ready** (GDPR, SOC 2, ISO 27001)

---

## 📚 **Documentation**

### **Complete Documentation Suite**
- 📖 **[Project Summary](./aegisx-project-summary.md)** - Complete project context and decisions
- 🎯 **[Architecture Blueprint](./aegisx-core-architecture.yaml)** - Technical specifications  
- 📊 **[Flow Diagrams](./aegisx-flow-diagrams.md)** - Visual workflows and processes
- 🚀 **[API Documentation](./docs/api/)** - OpenAPI specifications (coming soon)
- 🔧 **[Deployment Guide](./docs/deployment/)** - Production deployment instructions (coming soon)

### **Quick Links**
- [Development Setup](./docs/development.md) (coming soon)
- [Configuration Guide](./docs/configuration.md) (coming soon)  
- [Integration Examples](./docs/integration.md) (coming soon)
- [Troubleshooting](./docs/troubleshooting.md) (coming soon)

---

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### **Development Workflow**
```bash
# Fork and clone
git clone https://github.com/your-username/aegisx.git

# Create feature branch
git checkout -b feature/amazing-feature

# Make changes and test
npm run test:all
npm run lint

# Commit with conventional commits
git commit -m "feat: add amazing feature"

# Push and create PR
git push origin feature/amazing-feature
```

---

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

- **Fastify Team** for the outstanding framework
- **PostgreSQL Community** for the robust database
- **TypeScript Team** for type safety
- **Open Source Community** for inspiration and tools

---

<div align="center">

**Built with ❤️ for the developer community**

[Documentation](./docs/) • [API Reference](./docs/api/) • [Examples](./examples/) • [Support](./docs/support.md)

</div> 