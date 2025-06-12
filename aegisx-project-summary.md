# AegisX Universal Core API - Project Summary

## 📋 Project Overview

**Project Name:** AegisX Universal Core API  
**Purpose:** Enterprise-grade Central Identity & Access Management Hub  
**Architecture:** Multi-Tenant Ready Modular Monolith  
**Last Updated:** December 2024  

### 🎯 Core Concept
AegisX serves as a **Central Core API** that manages authentication, user management, and RBAC for multiple applications. Each new application connects to AegisX for identity services while focusing only on their specific business features.

### 🏗️ Architecture Pattern
- **Central Hub Model**: Core API manages all user/auth operations
- **Application Ecosystem**: Multiple apps integrate with Core API
- **Flexible Multi-tenancy**: Start single-tenant, scale to multi-tenant
- **Event-Driven**: RabbitMQ for cross-application communication

## 🛠️ Technical Stack

### Core Technologies
- **Runtime**: Node.js 22 LTS
- **Framework**: Fastify 4.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 15+ (Primary), Redis 7+ (Cache)
- **Message Queue**: RabbitMQ 3.12+
- **Testing**: Vitest + Playwright + Testcontainers + Artillery + k6
- **Build**: SWC compiler (20x faster than tsc)
- **DI**: TSyringe for dependency injection
- **ORM**: Knex.js for database operations
- **Linting**: ESLint 8.x + Prettier 3.x
- **Security Testing**: OWASP ZAP + Snyk

### Security & Auth
- **Authentication**: JWT RS256 + OAuth 2.0
- **Authorization**: RBAC + PBAC with resource-level permissions
- **API Security**: API keys, Rate limiting, Input validation
- **Encryption**: bcrypt (passwords), AES-256-GCM (sensitive data)

## 🏢 Multi-Tenant Design

### Flexible Configuration
```env
# Single-tenant mode (default)
ENABLE_MULTI_TENANT=false
DEFAULT_TENANT_ID=00000000-0000-0000-0000-000000000001

# Multi-tenant mode (enterprise)
ENABLE_MULTI_TENANT=true
REQUIRE_TENANT_SELECTION=true
```

### Key Benefits
- **Start Simple**: Begin with single-tenant, zero complexity
- **Scale When Ready**: Enable multi-tenancy without code rewrite
- **Configuration-Driven**: Switch modes via environment variables
- **Backward Compatible**: Existing apps continue working

### Migration Path
1. **Phase 1**: Develop in single-tenant mode
2. **Phase 2**: Add tenant_id columns with DEFAULT values
3. **Phase 3**: Enable ENABLE_MULTI_TENANT=true
4. **Phase 4**: Add tenant management UI

## 📁 Project Structure

```
aegisx-ecosystem/
├── aegisx-core/                 # Core Identity API
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/           # JWT + OAuth 2.0
│   │   │   ├── user/           # User management
│   │   │   ├── rbac/           # Roles & Permissions
│   │   │   ├── tenant/         # Multi-tenant support
│   │   │   └── audit/          # Audit logging
│   │   ├── shared/             # Common utilities
│   │   ├── database/           # Migrations & seeds
│   │   └── app.ts             # Main server
│   └── tests/                  # Test suites
│
├── todo-api/                    # Example Application
│   ├── src/
│   │   ├── controllers/        # Todo CRUD operations
│   │   ├── services/           # Business logic
│   │   ├── middleware/         # Core API integration
│   │   └── models/             # Todo data models
│   └── database/               # Todo-specific tables
│
└── frontend-apps/               # Frontend Applications
    ├── todo-web/               # React/Vue web app
    ├── todo-mobile/            # React Native app
    └── admin-dashboard/        # Admin management UI
```

## 🔄 User Flow Example (Todo App)

### Authentication Flow
1. **User opens Todo App** → Redirects to Core API login
2. **User enters credentials** → Core API validates & returns JWT
3. **JWT stored in frontend** → All API calls include JWT header
4. **Access todo features** → Todo API validates JWT with Core API

### Todo Operations Flow
1. **View todos** → Todo API validates JWT → Returns user-specific todos
2. **Create todo** → Check permissions → Create with user context
3. **Update/Delete** → Verify ownership/permissions → Perform operation

### Multi-tenant Flow (when enabled)
1. **Login** → Select tenant → Switch tenant context
2. **All operations** → Include tenant context in requests
3. **Data isolation** → Automatic tenant filtering in queries

## 🗄️ Database Design

### Core Tables (AegisX Core)
- **users**: User profiles and authentication data
- **roles**: Role definitions (admin, user, etc.)
- **permissions**: Granular permission system
- **user_roles**: User-role assignments
- **role_permissions**: Role-permission mappings
- **tenants**: Organization/tenant management (multi-tenant)
- **user_tenants**: User-tenant relationships (multi-tenant)
- **events**: Event sourcing and audit trail
- **audit_logs**: Comprehensive activity logging
- **sessions**: User session management

### Application Tables (Todo API)
- **todos**: Todo items with user and tenant context
- **todo_categories**: Todo categorization
- **todo_shares**: Shared todos between users

### Multi-tenant Strategy
- **Single-tenant**: No tenant_id columns needed
- **Multi-tenant**: tenant_id columns with DEFAULT values
- **Migration**: ALTER TABLE ADD COLUMN tenant_id UUID DEFAULT 'default-uuid'

## 🚀 Implementation Timeline

### Phase 1: Core API Foundation (1 week)
**Week 1: AegisX Core API**
- Day 1-2: Project setup + Database schema
- Day 3-4: Authentication system (JWT + OAuth)
- Day 5-6: User management + RBAC implementation
- Day 7: Testing + Documentation

**Deliverables:**
- ✅ Working authentication system
- ✅ User registration/login endpoints
- ✅ RBAC with roles and permissions
- ✅ API documentation (OpenAPI)
- ✅ Test suite (90%+ coverage)

### Phase 2: Application Integration (3-4 days)
**Todo Application Development**
- Day 1: Todo API setup + Core integration
- Day 2: Todo CRUD operations + permissions
- Day 3: Frontend development (web/mobile)
- Day 4: Testing + polish

**Deliverables:**
- ✅ Complete Todo application
- ✅ Core API integration working
- ✅ Frontend with authentication
- ✅ Production deployment ready

### Phase 3: Advanced Features (optional)
- Multi-tenant UI and management
- Advanced analytics and monitoring
- Additional applications
- Performance optimization

## 🔧 Key Technical Decisions

### 1. Multi-Tenant Architecture
**Decision**: Configuration-driven flexible multi-tenancy  
**Rationale**: Start simple, scale when needed without rewrite  
**Implementation**: ENABLE_MULTI_TENANT environment variable

### 2. Authentication Strategy
**Decision**: JWT RS256 + OAuth 2.0  
**Rationale**: Industry standard, scalable, secure  
**Implementation**: Centralized in Core API, validated by applications

### 3. Database Strategy
**Decision**: PostgreSQL with Knex.js  
**Rationale**: ACID compliance, strong ecosystem, migration support  
**Implementation**: Schema-per-tenant for multi-tenancy

### 4. Communication Pattern
**Decision**: REST APIs + Event-driven messaging  
**Rationale**: Simple integration + scalable async communication  
**Implementation**: RabbitMQ for events, HTTP for real-time operations

### 5. Testing Strategy
**Decision**: Comprehensive testing pyramid with enterprise-grade tools  
**Rationale**: HIS/ERP systems require extensive testing for compliance  
**Implementation**: 90%+ coverage requirement with security testing

**Testing Stack:**
- **Unit Tests (70%)**: Vitest + @vitest/ui for fast feedback
- **Integration Tests (20%)**: Vitest + Testcontainers for real database testing
- **E2E Tests (10%)**: Playwright for critical business workflows
- **Performance Tests**: Artillery + k6 for load and stress testing
- **Security Tests**: OWASP ZAP + Snyk for vulnerability scanning

**HIS/ERP Specific Workflows:**
- Patient registration and medical record workflows (HIS)
- Financial transaction processing (ERP) 
- Audit trail verification and compliance testing
- Role-based access control validation

## 📊 Performance Considerations

### Caching Strategy
- **L1**: Application-level cache (in-memory)
- **L2**: Redis distributed cache
- **L3**: Database query result caching
- **Sessions**: Redis for session storage

### Scaling Approach
- **Horizontal**: Multiple Core API instances
- **Database**: Read replicas + connection pooling
- **Message Queue**: RabbitMQ clustering
- **Load Balancing**: API Gateway (Kong/Envoy)

### Performance Targets
- **Response Time**: < 200ms for auth operations
- **Throughput**: 1000+ requests/second per instance
- **Availability**: 99.9% uptime
- **Error Rate**: < 0.1% error rate

## 🛡️ Security Implementation

### Authentication Security
- **JWT**: RS256 algorithm with key rotation
- **Tokens**: 15min access + 7day refresh tokens
- **MFA**: TOTP-based two-factor authentication
- **Rate Limiting**: 5 login attempts per minute per IP

### Authorization Security
- **RBAC**: Role-based access control
- **PBAC**: Permission-based access control
- **Resource-level**: Own vs all resource permissions
- **Principle of Least Privilege**: Minimal permissions by default

### API Security
- **Input Validation**: JSON Schema with TypeBox
- **Rate Limiting**: Per-user and per-IP limits
- **CORS**: Configurable origin restrictions
- **Headers**: Security headers via Helmet.js

### Data Protection
- **Encryption at Rest**: Database TDE
- **Encryption in Transit**: TLS 1.3
- **Password Security**: bcrypt with cost 12
- **Audit Logging**: All user actions logged

## 🔍 Code Quality & Testing

### ESLint Configuration
**Enterprise-grade linting for HIS/ERP compliance:**

**Core Configuration:**
- **Base**: @typescript-eslint/recommended + airbnb-typescript
- **Security**: eslint-plugin-security for SQL injection and XSS prevention
- **Quality**: eslint-plugin-sonarjs for code complexity analysis
- **TypeScript**: Strict type checking with no-any rules

**Enterprise Rules:**
- **Security Rules**: Detect SQL injection, object injection, eval usage
- **TypeScript Rules**: Explicit return types, strict boolean expressions
- **Code Quality**: Max complexity (15), max parameters (4), max lines (300)
- **HIS/ERP Specific**: No console.log in production, proper error handling

**Automation:**
- **Pre-commit Hooks**: Husky + lint-staged for automatic fixing
- **CI/CD Integration**: GitHub Actions with lint checks
- **Prettier Integration**: Consistent code formatting

### Testing Strategy

**Testing Pyramid (Enterprise Standard):**
```
E2E Tests (10%)     ←  Critical business workflows
Integration (20%)   ←  API endpoints + database
Unit Tests (70%)    ←  Fast, isolated components
```

**Comprehensive Test Coverage:**

**1. Unit Testing (70%)**
- **Framework**: Vitest with @vitest/ui for enhanced developer experience
- **Coverage Target**: 90% minimum (95% for critical modules)
- **Approach**: Fast, isolated component testing with mocking

**2. Integration Testing (20%)**
- **Framework**: Vitest + Testcontainers
- **Database**: Real PostgreSQL containers for authentic testing
- **API Testing**: Complete HTTP endpoint testing with authentication

**3. E2E Testing (10%)**
- **Framework**: Playwright for cross-browser testing
- **Focus**: Critical business workflows only
- **HIS Workflows**: Patient registration, medical records, audit trails
- **ERP Workflows**: Financial transactions, inventory management

**4. Performance Testing**
- **Load Testing**: Artillery for sustained load (1000+ concurrent users)
- **Stress Testing**: k6 for breaking point identification
- **Scenarios**: Peak hours simulation, report generation, backup operations

**5. Security Testing**
- **Vulnerability Scanning**: OWASP ZAP for web application security
- **Dependency Checking**: Snyk for npm package vulnerabilities
- **Compliance Testing**: HIPAA (HIS), SOX (ERP), GDPR validation

**HIS/ERP Specific Test Cases:**
- **Patient Data Security**: Medical record access controls
- **Financial Integrity**: Transaction accuracy and audit trails
- **Compliance Validation**: Healthcare and financial regulations
- **User Permission Testing**: Role-based access scenarios
- **Data Retention**: Automated data lifecycle management

**Test Data Management:**
- **Factory Pattern**: Faker.js for realistic test data generation
- **Fixtures**: Predefined datasets for consistent testing
- **Isolation**: Clean database state between tests
- **Compliance**: Anonymized data for production-like testing

**CI/CD Testing Pipeline:**
```yaml
Testing Pipeline:
  1. Linting & Formatting (ESLint + Prettier)
  2. Unit Tests (Vitest)
  3. Integration Tests (Testcontainers)
  4. Security Scans (OWASP ZAP + Snyk)
  5. E2E Tests (Playwright)
  6. Performance Tests (Artillery)
  7. Coverage Reports (c8)
```

**Coverage Requirements:**
- **Overall**: 90% minimum
- **Critical Modules**: 95% required
- **HIS Critical**: Patient data, medical records, audit logging
- **ERP Critical**: Financial calculations, inventory tracking, compliance

## 🔄 Integration Patterns

### Application Registration
```typescript
// Register new application with Core API
const appConfig = {
  name: "Todo Application",
  clientId: "todo-app-client",
  redirectUris: ["https://todo.example.com/callback"],
  scopes: ["user:read", "todo:write"],
  tenantId: "optional-tenant-id"
};
```

### JWT Validation Middleware
```typescript
// Application middleware for Core API integration
app.use('/api', async (req, res, next) => {
  const token = extractJWT(req);
  const user = await validateWithCoreAPI(token);
  req.user = user;
  req.tenantId = user.tenantId;
  next();
});
```

### Permission Checking
```typescript
// Check permissions before operations
app.delete('/todos/:id', 
  requirePermission('todo:delete'),
  async (req, res) => {
    // Business logic
  }
);
```

## 📈 Monitoring & Analytics

### Health Monitoring
- **API Health**: /health endpoint with dependency checks
- **Database**: Connection pool monitoring
- **Cache**: Redis connectivity and performance
- **Message Queue**: RabbitMQ queue depths

### Performance Metrics
- **Response Times**: P95, P99 latency tracking
- **Throughput**: Requests per second
- **Error Rates**: 4xx/5xx error tracking
- **Resource Usage**: CPU, memory, disk

### Business Analytics
- **User Activity**: Login patterns, feature usage
- **API Usage**: Endpoint popularity, rate limiting hits
- **Security Events**: Failed logins, permission denials
- **Tenant Analytics**: Multi-tenant usage patterns

## 🚢 Deployment Strategy

### Development Environment
```yaml
docker-compose.yml:
  services:
    - postgres: Database
    - redis: Cache and sessions
    - rabbitmq: Message queue
    - aegisx-core: Core API service
    - todo-api: Example application
```

### Production Environment
- **Container**: Docker with multi-stage builds
- **Orchestration**: Kubernetes with Helm charts
- **Database**: PostgreSQL cluster with read replicas
- **Cache**: Redis cluster for high availability
- **Load Balancer**: Kong API Gateway
- **Monitoring**: Prometheus + Grafana + Jaeger

### CI/CD Pipeline
**Enhanced Enterprise Pipeline:**
1. **Code Commit** → Trigger GitHub Actions
2. **Quality Gates** → ESLint + Prettier + TypeScript checking
3. **Unit Testing** → Vitest with 90%+ coverage requirement
4. **Integration Testing** → Testcontainers with real database
5. **Security Scanning** → OWASP ZAP + Snyk vulnerability assessment
6. **Performance Testing** → Artillery load testing
7. **Build** → Docker image creation with security scanning
8. **Deploy Staging** → Automated staging deployment
9. **E2E Testing** → Playwright full workflow testing
10. **Production Deploy** → Blue-green deployment with monitoring

**Quality Gates:**
- **Linting**: ESLint must pass with zero errors
- **Coverage**: 90% minimum (95% for critical modules)
- **Security**: Zero high/critical vulnerabilities
- **Performance**: Response time < 200ms for auth operations

## 💡 Future Enhancements

### Short-term (3-6 months)
- **Advanced Analytics**: User behavior insights
- **Mobile SDK**: Native mobile authentication
- **Plugin System**: Extensible Core API modules
- **GraphQL**: Alternative API interface

### Medium-term (6-12 months)
- **Machine Learning**: Anomaly detection
- **Federation**: Multi-Core API support
- **Compliance**: SOC2, ISO27001 certification
- **Global Scale**: Multi-region deployment

### Long-term (12+ months)
- **Blockchain**: Decentralized identity options
- **AI Integration**: Intelligent access control
- **Edge Computing**: Distributed Core APIs
- **Industry Verticals**: Domain-specific modules

## 📞 Key Contacts & Resources

### Documentation
- **Architecture**: `aegisx-core-architecture.yaml`
- **API Docs**: Auto-generated OpenAPI specs
- **Deployment**: Kubernetes manifests
- **Development**: Setup and contribution guides

### Repositories
- **Core API**: `aegisx-core/`
- **Applications**: `apps/*/`
- **Frontend**: `frontend/*/`
- **Infrastructure**: `infra/*/`

### Environment URLs
- **Development**: `http://localhost:3000`
- **Staging**: `https://staging-api.aegisx.dev`
- **Production**: `https://api.aegisx.dev`
- **Documentation**: `https://docs.aegisx.dev`

---

## 🎯 Next Actions

**Ready to start development:**
1. **Command**: "เริ่มสร้าง Core API" → Begin AegisX Core implementation
2. **Command**: "สร้าง Todo App" → Build example Todo application  
3. **Command**: "Setup ESLint & Testing" → Configure development environment
4. **Command**: "Deploy Production" → Production deployment setup

**Development Setup Includes:**
- **ESLint Configuration**: Enterprise-grade linting rules
- **Testing Environment**: Vitest + Testcontainers + Playwright setup
- **Pre-commit Hooks**: Husky + lint-staged automation
- **CI/CD Pipeline**: GitHub Actions with quality gates

**For questions or clarification:**
- Reference this document for project context
- Check `aegisx-core-architecture.yaml` for detailed specs  
- Review ESLint and Testing strategy sections above
- Use established patterns for new features

---

*This document serves as the comprehensive reference for the AegisX Universal Core API project, capturing all architectural decisions, implementation details, and future plans discussed during the planning phase.* 