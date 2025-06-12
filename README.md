# 🛡️ AegisX Core Package

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-22_LTS-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![NPM Package](https://img.shields.io/badge/NPM-@aegisx/core-red.svg)](https://www.npmjs.com/)

> **Enterprise-grade Authentication & Authorization Core Package**  
> A reusable npm package for authentication, RBAC, and user management that can be shared across multiple applications.

---

## 🎯 **Core Concept**

AegisX เป็น **Nx Monorepo** ที่ประกอบด้วย multiple packages สำหรับ enterprise authentication & authorization ใช้แค่ `npm install @aegisx/core @aegisx/angular-ui` แล้วใช้งานได้เลย ทั้ง backend core และ Angular UI components พร้อมใช้งาน

### **📦 Package Ecosystem**
- **@aegisx/core** - Authentication & authorization core (Node.js)
- **@aegisx/angular-ui** - Pre-built Angular components & guards  
- **@aegisx/cli** - CLI tools for scaffolding & setup

```mermaid
graph TD
    A["AegisX Nx Monorepo<br/>✅ Phase 1 Complete"] --> B["📦 packages/"]
    A --> C["📱 apps/"]
    A --> D["📚 libs/"]
    A --> E["🛠️ tools/"]
    
    B --> B1["@aegisx/core<br/>⏳ Phase 2 - Planned"]
    B --> B2["@aegisx/angular-ui<br/>⏳ Phase 3 - Planned"]
    B --> B3["@aegisx/cli<br/>⏳ Phase 4 - Planned"]
    
    C --> C1["demo-his<br/>⏳ Phase 5 - Planned"]
    C --> C2["demo-erp<br/>⏳ Phase 5 - Planned"]
    C --> C3["playground<br/>⏳ Phase 5 - Planned"]
    
    D --> D1["shared<br/>⏳ Future"]
    D --> D2["testing<br/>⏳ Future"]
    
    style A fill:#90EE90
    style B1 fill:#FFE4B5
    style B2 fill:#FFE4B5
    style B3 fill:#FFE4B5
    style C1 fill:#FFE4B5
    style C2 fill:#FFE4B5
    style C3 fill:#FFE4B5
```

---

## ✨ **Key Features**

### 🔐 **Authentication System**
- **JWT Tokens** with RS256 signatures
- **OAuth 2.0** (Google, GitHub, Microsoft)
- **Multi-factor Authentication** (TOTP, SMS)
- **Session Management** with refresh tokens
- **Password Security** with bcrypt

### 🛡️ **Authorization (RBAC/PBAC)**  
- **Role-Based Access Control** with hierarchical roles
- **Permission-Based Access Control** for granular permissions
- **Resource-level Authorization** (own, department, all)
- **Guard Functions** for easy middleware integration
- **Dynamic Permission Evaluation**

### 👥 **User Management**
- **User CRUD Operations** with validation
- **Profile Management** with custom fields
- **Email Verification** workflow
- **Password Reset** functionality
- **Account Status** management

### 🗄️ **Database Layer**
- **PostgreSQL Models** with Knex.js
- **Database Migrations** and seeds
- **Multi-tenant Ready** schema
- **Audit Logging** for compliance
- **Performance Optimized** with indexing

---

## 🚀 **Quick Start**

### **Installation**
```bash
# Backend Authentication Core
npm install @aegisx/core

# Angular UI Components (สำหรับ Angular apps)
npm install @aegisx/angular-ui

# CLI Tools (optional)
npm install -g @aegisx/cli

# Install peer dependencies
npm install pg knex bcrypt jsonwebtoken
npm install -D @types/pg @types/bcrypt @types/jsonwebtoken
```

### **Basic Setup**
```typescript
// app.ts
import { createAegisX, Guards } from '@aegisx/core';
import express from 'express';

const app = express();

// Initialize AegisX with database
await createAegisX({
  database: {
    host: 'localhost',
    port: 5432,
    database: 'myapp',
    user: 'postgres',
    password: 'password'
  },
  jwt: {
    secret: 'your-secret-key',
    expiresIn: '15m'
  }
});

// Use authentication middleware
app.use('/api', Guards.requireAuth);

// Use permission guards
app.get('/admin', 
  Guards.requirePermission('admin:read'),
  (req, res) => {
    res.json({ message: 'Admin area', user: req.user });
  }
);

app.listen(3000);
```

### **Authentication**
```typescript
import { AuthService } from '@aegisx/core';

// Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.json(result); // { user, accessToken, refreshToken }
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Register
app.post('/register', async (req, res) => {
  try {
    const user = await AuthService.register(req.body);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### **Authorization (Backend)**
```typescript
import { Guards, PermissionService } from '@aegisx/core';

// Using guards (recommended)
app.get('/patients', 
  Guards.requireAuth,
  Guards.requirePermission('patient:read:dept'),
  async (req, res) => {
    // Your business logic here
    // req.user is available with user info
  }
);

// Manual permission check
app.get('/reports', Guards.requireAuth, async (req, res) => {
  const canViewReports = await PermissionService.check(
    req.user.id, 
    'reports:read:all'
  );
  
  if (!canViewReports) {
    return res.status(403).json({ error: 'Permission denied' });
  }
  
  // Generate reports...
});
```

### **Angular UI Components**
```typescript
// app.module.ts
import { AegisXAngularUIModule } from '@aegisx/angular-ui';

@NgModule({
  imports: [
    AegisXAngularUIModule.forRoot({
      apiUrl: 'http://localhost:3000/api',
      authEndpoint: '/auth'
    })
  ]
})
export class AppModule { }

// login.component.ts
import { AegisXLoginComponent } from '@aegisx/angular-ui/auth';

@Component({
  template: `
    <aegisx-login 
      (loginSuccess)="onLoginSuccess($event)"
      (loginError)="onLoginError($event)">
    </aegisx-login>
  `
})
export class LoginPageComponent {
  onLoginSuccess(user: any) {
    // Handle successful login
    this.router.navigate(['/dashboard']);
  }
}

// Using RBAC guards and directives
import { AuthGuard, HasPermissionDirective } from '@aegisx/angular-ui/rbac';

@Component({
  template: `
    <button *aegisxHasPermission="'patient:create'" 
            (click)="createPatient()">
      Create Patient
    </button>
    
    <div *aegisxHasRole="'doctor'">
      Doctor-only content
    </div>
  `
})
export class PatientListComponent { }
```

---

## 🏗️ **Architecture**

### **Nx Monorepo Structure**
```
aegisx/                              # Nx Monorepo Root
├── packages/
│   ├── core/                        # @aegisx/core
│   │   ├── src/
│   │   │   ├── auth/              # Authentication system
│   │   │   │   ├── AuthService.ts
│   │   │   │   ├── JwtService.ts
│   │   │   │   └── middleware.ts
│   │   │   ├── rbac/              # Authorization system
│   │   │   │   ├── RoleService.ts
│   │   │   │   ├── PermissionService.ts
│   │   │   │   └── guards.ts
│   │   │   ├── user/              # User management
│   │   │   │   ├── UserService.ts
│   │   │   │   ├── UserModel.ts
│   │   │   │   └── validation.ts
│   │   │   └── database/          # Database layer
│   │   │       ├── migrations/
│   │   │       ├── seeds/
│   │   │       └── connection.ts
│   │   └── package.json           # @aegisx/core
│   │
│   ├── angular-ui/                 # @aegisx/angular-ui
│   │   ├── src/lib/
│   │   │   ├── auth/              # Angular Auth Components
│   │   │   │   ├── login/
│   │   │   │   ├── register/
│   │   │   │   └── forgot-password/
│   │   │   ├── rbac/              # Angular RBAC Components
│   │   │   │   ├── guards/
│   │   │   │   ├── directives/
│   │   │   │   └── components/
│   │   │   ├── user/              # User Management UI
│   │   │   │   ├── profile/
│   │   │   │   ├── user-list/
│   │   │   │   └── user-form/
│   │   │   └── shared/            # Shared Angular utilities
│   │   └── package.json           # @aegisx/angular-ui
│   │
│   └── cli/                        # @aegisx/cli
│       ├── src/
│       │   ├── commands/
│       │   └── generators/
│       └── package.json           # @aegisx/cli
│
├── apps/
│   ├── demo-his/                   # Demo HIS Angular app
│   ├── demo-erp/                   # Demo ERP Angular app
│   └── playground/                 # Development playground
│
├── libs/                           # Shared libraries
│   ├── shared/
│   └── testing/
│
├── nx.json                         # Nx configuration
├── angular.json                    # Angular workspace config
└── package.json                    # Root package.json
```

### **Usage Pattern**
```typescript
// High-level API (recommended)
import { Guards, AuthService } from '@aegisx/core';

// Low-level API (advanced)
import { UserModel, PermissionModel } from '@aegisx/core/database';
import { hashPassword, verifyPassword } from '@aegisx/core/utils';
```

---

## 📊 **Usage Examples**

### **HIS Application**
```typescript
// his-project/src/app.ts
import { Guards, RoleService } from '@aegisx/core';

// Setup HIS-specific roles
await RoleService.createRole({
  name: 'doctor',
  permissions: [
    'patient:read:dept',
    'patient:write:own',
    'medical_record:write:own',
    'prescription:create'
  ]
});

// Protect HIS routes
app.get('/patients', 
  Guards.requireAuth,
  Guards.requireRole('doctor'),
  getPatients
);
```

### **ERP Application**
```typescript
// erp-project/src/app.ts  
import { Guards, RoleService } from '@aegisx/core';

// Setup ERP-specific roles
await RoleService.createRole({
  name: 'accountant',
  permissions: [
    'invoice:read:dept',
    'invoice:write:own', 
    'financial_report:read',
    'budget:read:dept'
  ]
});

// Protect ERP routes
app.get('/invoices',
  Guards.requireAuth,
  Guards.requireRole('accountant'),
  getInvoices
);
```

### **Multi-tenant Support**
```typescript
// Enable multi-tenant mode
import { createAegisX } from '@aegisx/core';

await createAegisX({
  multiTenant: true,
  database: { /* config */ }
});

// Tenant-aware guards
app.get('/data',
  Guards.requireAuth,
  Guards.requireTenant(), // Auto-filter by tenant
  getData
);
```

---

## 🔧 **Configuration**

### **Environment Variables**
```bash
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/myapp

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Multi-tenant (optional)
ENABLE_MULTI_TENANT=false
DEFAULT_TENANT_ID=default

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### **Advanced Configuration**
```typescript
import { createAegisX } from '@aegisx/core';

await createAegisX({
  database: {
    host: 'localhost',
    port: 5432,
    database: 'myapp',
    user: 'postgres',
    password: 'password',
    pool: { min: 2, max: 10 }
  },
  jwt: {
    secret: 'your-secret',
    algorithm: 'RS256',
    expiresIn: '15m',
    refreshExpiresIn: '7d'
  },
  multiTenant: {
    enabled: true,
    defaultTenant: 'system'
  },
  security: {
    bcryptRounds: 12,
    rateLimiting: true,
    sessionTimeout: '24h'
  }
});
```

---

## 📚 **Documentation**

### **Core Guides**
- 📖 **[Getting Started](./docs/getting-started.md)** - Installation and basic setup
- 🔐 **[Authentication Guide](./docs/authentication.md)** - Login, register, JWT handling
- 🛡️ **[Authorization Guide](./docs/authorization.md)** - RBAC, permissions, guards
- 👥 **[User Management](./docs/user-management.md)** - User CRUD, profiles, validation
- 🗄️ **[Database Guide](./docs/database.md)** - Models, migrations, queries

### **Advanced Topics**
- 🏢 **[Multi-tenant Setup](./docs/multi-tenant.md)** - Tenant isolation and management
- 🔌 **[Integration Patterns](./docs/integration.md)** - Best practices for using with different frameworks
- 🚀 **[Performance Guide](./docs/performance.md)** - Optimization tips and caching
- 🔒 **[Security Best Practices](./docs/security.md)** - Hardening and compliance

### **API Reference**
- 📘 **[Complete Architecture](./aegisx-core-architecture.yaml)** - Detailed technical specifications
- 📄 **[API Documentation](./docs/api-reference.md)** - Full API reference
- 🧪 **[Testing Guide](./docs/testing.md)** - Unit and integration testing

---

## 🚀 **Development**

### **Prerequisites**
- Node.js 22 LTS
- PostgreSQL 15+
- npm 10+
- Nx CLI (`npm i -g nx`)

### **Setup Nx Workspace**
```bash
# Clone repository
git clone https://github.com/your-org/aegisx.git
cd aegisx

# Install dependencies
npm install

# Setup test database
createdb aegisx_test
npm run db:setup
```

### **Nx Development Commands**
```bash
# Build all packages
nx run-many -t build

# Build specific package
nx build core
nx build angular-ui

# Run tests
nx run-many -t test
nx test core
nx test angular-ui

# Lint code
nx run-many -t lint

# Serve demo applications
nx serve demo-his
nx serve demo-erp

# Generate new library
nx g @nx/node:library new-feature --directory=libs
nx g @nx/angular:library ui-components --directory=packages

# Dependency graph
nx graph
```

### **Development Workflow**
```bash
# 1. Start development server
nx serve playground

# 2. Work on core package
nx build core --watch

# 3. Work on Angular UI
nx build angular-ui --watch

# 4. Run tests in watch mode
nx test core --watch
nx test angular-ui --watch

# 5. Check affected projects
nx affected:test
nx affected:build
```

### **Publishing Packages**
```bash
# Build all packages
nx run-many -t build

# Version bump (individual packages)
cd packages/core && npm version patch
cd packages/angular-ui && npm version patch

# Publish to npm
nx run-many -t publish

# Or publish individually
cd packages/core && npm publish
cd packages/angular-ui && npm publish
```

---

## 🤝 **Contributing**

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### **Development Process**
1. Fork the repository
2. Create a feature branch
3. Write tests for your changes
4. Ensure all tests pass
5. Submit a pull request

---

## 📄 **License**

MIT License - see [LICENSE](./LICENSE) file for details.

---

## 🔗 **Links**

### **📦 NPM Packages**
- **@aegisx/core**: [Authentication & Authorization Core](https://www.npmjs.com/package/@aegisx/core)
- **@aegisx/angular-ui**: [Angular UI Components](https://www.npmjs.com/package/@aegisx/angular-ui)
- **@aegisx/cli**: [CLI Tools](https://www.npmjs.com/package/@aegisx/cli)

### **📚 Resources**
- **Documentation**: [Full Documentation](./docs/)
- **GitHub Repository**: [AegisX Monorepo](https://github.com/your-org/aegisx)
- **GitHub Issues**: [Report Issues](https://github.com/your-org/aegisx/issues)
- **Demo Applications**: [Live Demos](./apps/)
- **Nx Workspace**: [Development Guide](./docs/development.md)

---

> **Ready to get started?** Check out our [Getting Started Guide](./docs/getting-started.md) or try the [Quick Start](#-quick-start) above! 