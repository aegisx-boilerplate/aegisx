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
- **Testing**: Vitest + Playwright + Testcontainers
- **Build**: SWC compiler (20x faster than tsc)
- **DI**: TSyringe for dependency injection
- **ORM**: Knex.js for database operations

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
**Decision**: Vitest + Testcontainers  
**Rationale**: Modern, fast, container-based integration testing  
**Implementation**: 90%+ coverage requirement

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
1. **Code Commit** → Trigger GitHub Actions
2. **Testing** → Unit, integration, e2e tests
3. **Security Scan** → Vulnerability assessment
4. **Build** → Docker image creation
5. **Deploy** → Staging environment
6. **E2E Tests** → Full workflow testing
7. **Production** → Blue-green deployment

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
3. **Command**: "Deploy Production" → Production deployment setup

**For questions or clarification:**
- Reference this document for project context
- Check `aegisx-core-architecture.yaml` for detailed specs
- Use established patterns for new features

---

*This document serves as the comprehensive reference for the AegisX Universal Core API project, capturing all architectural decisions, implementation details, and future plans discussed during the planning phase.* 