# AegisX Development Roadmap

## 🎯 **Project Overview**

**Architecture:** API-First Modular Monolith with Enhanced Core Layer  
**Pattern:** Domain-Driven Design (DDD) + Clean Architecture + Hexagonal Architecture  
**Deployment:** Separated Projects with Shared Core API  
**Structure:** 4-Layer Architecture (Core → Application → Infrastructure → Modules)  

---

## 🏗️ **System Architecture**

### **Core Concept:**
```
🏢 AegisX Ecosystem
├── 🔐 AegisX Core API (Identity Hub)    ← Central authentication & authorization
│   └── Deploy: https://core-api.aegisx.dev:3000
│
└── 📱 Business Applications (Separated Projects)
    ├── 🏥 HIS App → https://his-api.aegisx.dev:3001
    ├── 💼 ERP App → https://erp-api.aegisx.dev:3002
    ├── 💊 Pharmacy App → https://pharmacy-api.aegisx.dev:3003
    └── 📋 Todo App → https://todo-api.aegisx.dev:3004
```

### **Ecosystem Structure:**
```
aegisx-ecosystem/
├── packages/
│   ├── aegisx-core/               # Core Identity API (4-Layer Architecture)
│   ├── aegisx-sdk/                # SDK for other apps
│   └── aegisx-shared/             # Shared utilities
├── apps/
│   ├── his-app/                   # Hospital Information System
│   ├── erp-app/                   # Enterprise Resource Planning
│   ├── pharmacy-app/              # Pharmacy Management
│   └── todo-app/                  # Example application
├── frontends/
│   ├── his-web/                   # React/Vue frontends
│   ├── erp-web/
│   └── mobile-app/
└── docker-compose.yml
```

### **AegisX Core API Structure (Enhanced with Core Layer):**
```
packages/aegisx-core/src/
├── core/                          # 🧠 Domain Layer (Pure Business Logic)
│   ├── entities/                  # Domain entities
│   │   ├── User.entity.ts
│   │   ├── Role.entity.ts
│   │   ├── Permission.entity.ts
│   │   ├── Tenant.entity.ts
│   │   └── AuditLog.entity.ts
│   ├── value-objects/             # Value objects
│   │   ├── Email.vo.ts
│   │   ├── Password.vo.ts
│   │   ├── UserId.vo.ts
│   │   └── TenantId.vo.ts
│   ├── aggregates/                # Domain aggregates
│   │   ├── UserAggregate.ts
│   │   ├── TenantAggregate.ts
│   │   └── RoleAggregate.ts
│   ├── repositories/              # Repository interfaces
│   │   ├── IUserRepository.ts
│   │   ├── IRoleRepository.ts
│   │   └── ITenantRepository.ts
│   ├── services/                  # Domain services
│   │   ├── UserDomainService.ts
│   │   ├── AuthDomainService.ts
│   │   └── PermissionDomainService.ts
│   ├── events/                    # Domain events
│   │   ├── UserCreatedEvent.ts
│   │   ├── RoleAssignedEvent.ts
│   │   └── TenantCreatedEvent.ts
│   ├── exceptions/                # Domain exceptions
│   │   ├── UserNotFoundException.ts
│   │   ├── InvalidPasswordException.ts
│   │   └── DuplicateEmailException.ts
│   └── specifications/            # Business rules
│       ├── UserSpecification.ts
│       ├── PasswordSpecification.ts
│       └── EmailSpecification.ts
│
├── application/                   # 📋 Application Layer (Use Cases)
│   ├── services/                  # Application services
│   │   ├── UserApplicationService.ts
│   │   ├── AuthApplicationService.ts
│   │   └── RoleApplicationService.ts
│   ├── handlers/                  # Command/Query handlers
│   │   ├── commands/
│   │   │   ├── CreateUserCommandHandler.ts
│   │   │   ├── UpdateUserCommandHandler.ts
│   │   │   └── AssignRoleCommandHandler.ts
│   │   └── queries/
│   │       ├── GetUserQueryHandler.ts
│   │       ├── GetUsersQueryHandler.ts
│   │       └── GetRolesQueryHandler.ts
│   ├── commands/                  # Command objects
│   │   ├── CreateUserCommand.ts
│   │   ├── UpdateUserCommand.ts
│   │   └── AssignRoleCommand.ts
│   ├── queries/                   # Query objects
│   │   ├── GetUserQuery.ts
│   │   ├── GetUsersQuery.ts
│   │   └── GetRolesQuery.ts
│   └── events/                    # Application event handlers
│       ├── UserEventHandler.ts
│       ├── AuditEventHandler.ts
│       └── NotificationEventHandler.ts
│
├── infrastructure/                # 🛠️ Infrastructure Layer (External Systems)
│   ├── database/                  # Database implementations
│   │   ├── repositories/          # Repository implementations
│   │   │   ├── KnexUserRepository.ts
│   │   │   ├── KnexRoleRepository.ts
│   │   │   └── KnexTenantRepository.ts
│   │   ├── migrations/            # Database migrations
│   │   ├── seeds/                 # Database seeds
│   │   ├── models/                # Database models/DTOs
│   │   ├── mappers/               # Entity-Model mappers
│   │   └── connection.ts
│   ├── cache/                     # Cache implementations
│   │   ├── RedisCache.ts
│   │   └── MemoryCache.ts
│   ├── messaging/                 # Message queue implementations
│   │   ├── RabbitMQPublisher.ts
│   │   └── RabbitMQSubscriber.ts
│   ├── security/                  # Security implementations
│   │   ├── JwtTokenService.ts
│   │   ├── BcryptPasswordService.ts
│   │   └── CryptoService.ts
│   └── logging/                   # Logging implementations
│       ├── PinoLogger.ts
│       └── FileLogger.ts
│
├── modules/                       # 🌐 Interface Layer (HTTP/API)
│   ├── auth/
│   │   ├── controllers/           # HTTP controllers
│   │   │   └── AuthController.ts
│   │   ├── routes/                # Route definitions
│   │   │   └── auth.routes.ts
│   │   ├── schemas/               # Request/Response schemas
│   │   │   ├── LoginSchema.ts
│   │   │   └── RegisterSchema.ts
│   │   ├── middleware/            # Module middleware
│   │   │   └── jwt.middleware.ts
│   │   └── mappers/               # Data mappers
│   │       └── UserMapper.ts
│   ├── user/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── schemas/
│   │   └── mappers/
│   ├── rbac/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── middleware/
│   │   └── mappers/
│   ├── tenant/
│   └── audit/
│
├── shared/                        # 🔧 Shared Utilities
│   ├── middleware/                # Global middleware
│   ├── plugins/                   # Fastify plugins
│   ├── utils/                     # Utility functions
│   ├── config/                    # Configuration
│   ├── constants/                 # Application constants
│   ├── interfaces/                # Global interfaces
│   └── types/                     # Global types
│
├── events/                        # Event system
├── jobs/                          # Background jobs
├── routes/                        # Route registration
└── app.ts                         # Main Fastify application
```

---

## 🏛️ **4-Layer Architecture Explained**

### **🧠 Core Layer (Domain)**
- **Pure Business Logic** - ไม่ขึ้นกับเทคโนโลジี
- **Entities** - ตัวจริงในระบบ (User, Role, Permission)
- **Value Objects** - ค่าที่สำคัญ (Email, Password)
- **Domain Services** - กฎธุรกิจที่ซับซ้อน
- **Repositories (Interfaces)** - ข้อตกลงการเข้าถึงข้อมูล

### **📋 Application Layer (Use Cases)**
- **Application Services** - งานที่ระบบต้องทำ
- **Command/Query Handlers** - จัดการคำสั่งและการค้นหา
- **Event Handlers** - จัดการ events ในระบบ

### **🛠️ Infrastructure Layer (External Systems)**
- **Repository Implementations** - การเชื่อมต่อฐานข้อมูลจริง
- **Cache, Messaging, Security** - เครื่องมือภายนอก
- **Database Models & Mappers** - แปลงข้อมูลระหว่าง layers

### **🌐 Modules Layer (Interface)**
- **Controllers** - รับ HTTP requests
- **Routes** - กำหนดเส้นทาง API
- **Schemas** - ตรวจสอบข้อมูลที่เข้ามา
- **Middleware** - ประมวลผลก่อน/หลัง request

### **🔄 Data Flow:**
```
HTTP Request → Modules → Application → Core → Infrastructure → Database
HTTP Response ← Modules ← Application ← Core ← Infrastructure ← Database
```

---

## 🚀 **Phase 1: MVP Core API (3-5 Days)**

### **Day 1-2: Infrastructure Setup**
**Target:** Basic project structure and database

**Tasks:**
- [ ] Create `packages/aegisx-core/` project
- [ ] Setup PostgreSQL database connection
- [ ] Create basic migrations (users table)
- [ ] Setup TypeScript + Fastify + Knex configuration
- [ ] Docker compose for development environment

**Deliverables:**
- ✅ Working database connection
- ✅ Basic project structure
- ✅ Development environment ready

### **Day 3: Core Domain (MVP)**
**Target:** Basic authentication functionality

**Implementation Order (ตาม 4-Layer Architecture):**

1. **🧠 Core Layer (2 hours)**
   ```
   core/
   ├── entities/
   │   └── User.entity.ts         # User entity with business logic
   ├── value-objects/
   │   ├── Email.vo.ts            # Email validation rules
   │   └── Password.vo.ts         # Password hashing logic
   ├── repositories/
   │   └── IUserRepository.ts     # Repository interface
   └── services/
       └── AuthDomainService.ts   # Authentication business rules
   ```

2. **🛠️ Infrastructure Layer (2 hours)**
   ```
   infrastructure/
   ├── database/
   │   ├── repositories/
   │   │   └── KnexUserRepository.ts    # Repository implementation
   │   ├── models/
   │   │   └── UserModel.ts             # Database model
   │   └── mappers/
   │       └── UserEntityMapper.ts     # Entity-Model mapping
   └── security/
       └── BcryptPasswordService.ts    # Password service implementation
   ```

3. **📋 Application Layer (2 hours)**
   ```
   application/
   ├── services/
   │   └── AuthApplicationService.ts    # Use cases: register(), login()
   ├── commands/
   │   ├── RegisterUserCommand.ts       # Command objects
   │   └── LoginUserCommand.ts
   └── handlers/
       ├── RegisterUserHandler.ts       # Command handlers
       └── LoginUserHandler.ts
   ```

4. **🌐 Modules Layer (2 hours)**
   ```
   modules/auth/
   ├── controllers/
   │   └── AuthController.ts            # HTTP endpoints
   ├── routes/
   │   └── auth.routes.ts               # Route definitions
   ├── schemas/
   │   ├── RegisterSchema.ts            # Request validation
   │   └── LoginSchema.ts
   └── mappers/
       └── AuthResponseMapper.ts        # Response mapping
   ```

**Deliverables:**
- ✅ POST /auth/register
- ✅ POST /auth/login
- ✅ Basic password hashing
- ✅ Email validation

### **Day 4-5: JWT Authentication**
**Target:** Protected endpoints with JWT

**Tasks:**
- [ ] JWT token generation (access + refresh)
- [ ] JWT middleware for protected routes
- [ ] GET /auth/me endpoint (user profile)
- [ ] Token refresh mechanism
- [ ] Basic error handling

**Deliverables:**
- ✅ Working JWT authentication
- ✅ Protected route example
- ✅ Token refresh flow
- ✅ Basic API documentation

---

## 🔧 **Phase 2: Core Features (1 Week)**

### **Day 6-7: User Management**
- [ ] User CRUD operations
- [ ] User profile management
- [ ] Password change functionality
- [ ] Email verification (optional)

### **Day 8-9: Basic RBAC**
- [ ] Role entity and management
- [ ] Permission system
- [ ] User-role assignments
- [ ] Permission middleware

### **Day 10-12: Multi-tenancy (Optional)**
- [ ] Tenant entity and management
- [ ] Tenant-aware queries
- [ ] Tenant switching API
- [ ] Configuration-driven multi-tenancy

**Deliverables:**
- ✅ Complete user management API
- ✅ Working RBAC system
- ✅ Multi-tenant support (if needed)
- ✅ Comprehensive API documentation

---

## 📦 **Phase 3: SDK Development (2-3 Days)**

### **AegisX SDK Package**
**Target:** Reusable SDK for other applications

**Features:**
- [ ] Authentication client
- [ ] User profile management
- [ ] Permission checking
- [ ] Token management
- [ ] TypeScript types export

```typescript
// Usage example in other apps
import { AegisXClient } from '@aegisx/sdk';

const client = new AegisXClient('https://core-api.aegisx.dev');
const user = await client.validateToken(token);
const hasPermission = await client.checkPermission(userId, 'user:read');
```

**Deliverables:**
- ✅ Published SDK package
- ✅ SDK documentation
- ✅ TypeScript type definitions
- ✅ Example integration code

---

## 🏥 **Phase 4: First Business App (HIS) (1 Week)**

### **Day 1-2: HIS Project Setup**
- [ ] Create `apps/his-app/` project
- [ ] Setup HIS-specific database
- [ ] Install and configure AegisX SDK
- [ ] Setup authentication middleware

### **Day 3-4: Core HIS Features**
- [ ] Patient management module
- [ ] Doctor management module
- [ ] Appointment scheduling
- [ ] Medical records (basic)

### **Day 5-7: Integration & Testing**
- [ ] Complete Core API integration
- [ ] Permission-based access control
- [ ] API testing and documentation
- [ ] Deployment configuration

**Deliverables:**
- ✅ Working HIS application
- ✅ Integrated with Core API
- ✅ Basic medical workflows
- ✅ Deployment ready

---

## 💼 **Phase 5: Second Business App (ERP) (1 Week)**

### **Day 1-2: ERP Project Setup**
- [ ] Create `apps/erp-app/` project
- [ ] Setup ERP-specific database
- [ ] AegisX SDK integration
- [ ] Authentication middleware

### **Day 3-5: Core ERP Features**
- [ ] Financial management module
- [ ] Inventory control module
- [ ] Human resources basics
- [ ] Accounting integration

### **Day 6-7: Integration & Testing**
- [ ] Core API integration
- [ ] Multi-app testing
- [ ] Performance optimization
- [ ] Documentation

**Deliverables:**
- ✅ Working ERP application
- ✅ Multi-app ecosystem functioning
- ✅ Shared authentication working
- ✅ Performance tested

---

## 🌐 **Phase 6: Frontend Development (2 Weeks)**

### **Week 1: Admin Dashboard**
- [ ] React/Vue admin dashboard
- [ ] User management interface
- [ ] Role and permission management
- [ ] System monitoring dashboard

### **Week 2: Business App Frontends**
- [ ] HIS web interface
- [ ] ERP web interface
- [ ] Mobile app (React Native)
- [ ] API integration

**Deliverables:**
- ✅ Complete admin dashboard
- ✅ Business application frontends
- ✅ Mobile application
- ✅ End-to-end workflows

---

## 🚀 **Phase 7: Production Deployment (1 Week)**

### **Infrastructure Setup**
- [ ] Production server configuration
- [ ] Database cluster setup
- [ ] Redis cluster for caching
- [ ] Load balancer configuration

### **CI/CD Pipeline**
- [ ] GitHub Actions setup
- [ ] Automated testing pipeline
- [ ] Docker image building
- [ ] Deployment automation

### **Monitoring & Security**
- [ ] Prometheus + Grafana monitoring
- [ ] Security scanning integration
- [ ] SSL certificates
- [ ] Backup strategies

**Deliverables:**
- ✅ Production environment ready
- ✅ Automated deployment pipeline
- ✅ Monitoring and alerting
- ✅ Security measures in place

---

## 📈 **Phase 8: Scaling & Optimization (Ongoing)**

### **Performance Optimization**
- [ ] Database query optimization
- [ ] Caching strategy implementation
- [ ] API response time optimization
- [ ] Load testing and tuning

### **Additional Features**
- [ ] Audit logging enhancements
- [ ] Advanced analytics
- [ ] API rate limiting
- [ ] Advanced security features

### **New Business Apps**
- [ ] Pharmacy management system
- [ ] Laboratory information system
- [ ] Additional ERP modules
- [ ] Third-party integrations

---

## 💡 **Benefits of Enhanced Core Layer Architecture**

### **🎯 Core Benefits:**
1. **Pure Business Logic**
   - Core layer ไม่ขึ้นกับ framework หรือ database
   - Business rules อยู่ในที่เดียว ไม่กระจาย
   - ง่ายต่อการ unit test

2. **Flexibility & Maintainability**
   - เปลี่ยน database ไม่กระทบ business logic
   - เปลี่ยน framework ไม่กระทบ core
   - เพิ่มฟีเจอร์ใหม่ง่าย

3. **Enterprise-Grade Quality**
   - Clear separation of concerns
   - SOLID principles compliance
   - Domain-driven design patterns

### **🏥 HIS/ERP Specific Benefits:**
1. **Compliance Ready**
   - Audit trail ใน domain events
   - Business rules เป็นระเบียบ
   - Data consistency ผ่าน aggregates

2. **Scalability**
   - แยก layer ชัดเจน ทำให้ scale ง่าย
   - Performance optimization ทำได้แยกแต่ละ layer
   - Team development แยกกันได้

3. **Security**
   - Security logic อยู่ใน core domain
   - Input validation หลายชั้น
   - Authorization ผ่าน domain services

---

## 🔧 **Technical Stack Summary**

### **Core API (AegisX Core)**
- **Runtime:** Node.js 22 LTS
- **Framework:** Fastify 4.x
- **Language:** TypeScript 5.x
- **Database:** PostgreSQL 15+ (Primary), Redis 7+ (Cache)
- **ORM:** Knex.js
- **Testing:** Vitest + Playwright + Testcontainers
- **Security:** JWT RS256 + bcrypt
- **Linting:** ESLint 8.x + Prettier
- **Build:** SWC compiler

### **Business Applications**
- **Same tech stack as Core API**
- **Integration:** AegisX SDK
- **Authentication:** JWT tokens from Core API
- **Database:** Separate per application
- **Deployment:** Independent containers

### **Frontend Applications**
- **Web:** React 18 / Vue 3 + TypeScript
- **Mobile:** React Native + TypeScript
- **Admin:** Vue 3 + TypeScript
- **State Management:** Zustand / Pinia
- **API Client:** Axios / TanStack Query

---

## 📋 **Development Guidelines**

### **Code Quality Standards**
- **Coverage:** 90% minimum (95% for critical modules)
- **Linting:** ESLint + Prettier with enterprise rules
- **Testing:** Unit (70%) + Integration (20%) + E2E (10%)
- **Security:** OWASP ZAP + Snyk scanning
- **Documentation:** OpenAPI 3.0 + code comments

### **Git Workflow**
- **Commits:** Conventional commits format
- **Branches:** Feature branches + PR reviews
- **CI/CD:** Automated testing + deployment
- **Versioning:** Semantic versioning

### **Security Requirements**
- **Authentication:** JWT RS256 with refresh tokens
- **Authorization:** RBAC + PBAC with resource-level permissions
- **Encryption:** bcrypt for passwords, AES-256-GCM for sensitive data
- **Compliance:** HIPAA (HIS) + SOX (ERP) + GDPR ready

---

## 🎯 **Success Metrics**

### **Phase 1 Success Criteria**
- [ ] Authentication API working (login/register)
- [ ] JWT tokens functioning
- [ ] Basic user management
- [ ] 90%+ test coverage

### **Phase 4 Success Criteria**
- [ ] HIS app fully integrated with Core API
- [ ] All authentication flows working
- [ ] Permission-based access control
- [ ] Performance < 200ms response time

### **Phase 6 Success Criteria**
- [ ] End-to-end user workflows functioning
- [ ] Multi-app ecosystem working seamlessly
- [ ] Mobile app connecting to APIs
- [ ] Admin dashboard fully functional

### **Production Success Criteria**
- [ ] 99.9% uptime achieved
- [ ] < 200ms API response times
- [ ] Zero security vulnerabilities
- [ ] Complete audit trail functioning

---

## 📞 **Next Steps**

### **Immediate Actions (This Week)**
1. **Setup Development Environment**
   ```bash
   mkdir aegisx-ecosystem
   cd aegisx-ecosystem
   mkdir -p packages/aegisx-core
   mkdir -p apps
   mkdir -p frontends
   ```

2. **Initialize Core API Project**
   ```bash
   cd packages/aegisx-core
   npm init -y
   npm install fastify typescript knex pg bcryptjs
   ```

3. **Start Phase 1 Implementation**
   - Follow MVP Core API roadmap
   - Begin with database setup
   - Implement basic authentication

### **Development Commands**
```bash
# Development
npm run dev              # Start all services
npm run dev:core         # Start core API only
npm run dev:his          # Start HIS app only

# Testing
npm run test             # Run all tests
npm run test:coverage    # Coverage reports
npm run lint             # Code linting

# Deployment
npm run build            # Build all projects
npm run deploy:staging   # Deploy to staging
npm run deploy:prod      # Deploy to production
```

---

**Ready to begin development! 🚀**

*This roadmap provides a clear path from MVP to production-ready enterprise system with proper separation of concerns and scalable architecture.* 