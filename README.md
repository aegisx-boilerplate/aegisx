# 🛡️ AegisX Core Package

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-22_LTS-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![NPM Package](https://img.shields.io/badge/NPM-@aegisx/core-red.svg)](https://www.npmjs.com/)

> **Enterprise-grade Authentication & Authorization Core Package**  
> A reusable npm package for authentication, RBAC, and user management that can be shared across multiple applications.

---

## 🎯 **Core Concept**

AegisX Core เป็น **shared npm package** ที่รวม authentication, authorization, และ user management เอาไว้ในที่เดียว แทนที่จะสร้าง auth system ใหม่ในทุกโปรเจค เพียงแค่ `npm install @aegisx/core` แล้วใช้งานได้เลย

```mermaid
graph TD
    A[@aegisx/core Package] --> B[🏥 HIS Application]
    A --> C[💼 ERP Application] 
    A --> D[📋 Todo Application]
    A --> E[📱 Mobile Apps]
    
    A --> F[🔐 Authentication]
    A --> G[👥 User Management]
    A --> H[🛡️ RBAC Authorization]
    A --> I[🗄️ Database Models]
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
# Install the core package
npm install @aegisx/core

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

### **Authorization**
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

---

## 🏗️ **Architecture**

### **Package Structure**
```
@aegisx/core/
├── src/
│   ├── auth/              # Authentication system
│   │   ├── AuthService.ts
│   │   ├── JwtService.ts
│   │   └── middleware.ts
│   ├── rbac/              # Authorization system
│   │   ├── RoleService.ts
│   │   ├── PermissionService.ts
│   │   └── guards.ts
│   ├── user/              # User management
│   │   ├── UserService.ts
│   │   ├── UserModel.ts
│   │   └── validation.ts
│   ├── database/          # Database layer
│   │   ├── migrations/
│   │   ├── seeds/
│   │   └── connection.ts
│   └── utils/             # Utilities
└── dist/                  # Compiled output
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

### **Setup Development Environment**
```bash
# Clone repository
git clone https://github.com/your-org/aegisx-core.git
cd aegisx-core

# Install dependencies
npm install

# Setup test database
createdb aegisx_test
npm run db:setup

# Run tests
npm test

# Build package
npm run build
```

### **Publishing**
```bash
# Build and test
npm run build
npm test

# Version bump
npm version patch

# Publish to npm
npm publish
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

- **NPM Package**: [@aegisx/core](https://www.npmjs.com/package/@aegisx/core)
- **Documentation**: [Full Documentation](./docs/)
- **GitHub Issues**: [Report Issues](https://github.com/your-org/aegisx-core/issues)
- **Examples**: [Example Projects](./examples/)

---

> **Ready to get started?** Check out our [Getting Started Guide](./docs/getting-started.md) or try the [Quick Start](#-quick-start) above! 