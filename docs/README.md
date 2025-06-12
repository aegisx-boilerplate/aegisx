# 📚 AegisX Core Documentation

Welcome to the complete documentation for **AegisX Core Package** - the enterprise-grade authentication and authorization npm package.

## 📖 **Documentation Structure**

### **🚀 Getting Started**
- **[Getting Started Guide](./getting-started.md)** - Installation, setup, and first steps
- **[Quick Examples](./quick-examples.md)** - Common usage patterns and code snippets
- **[Configuration Guide](./configuration.md)** - Environment variables and setup options

### **🔐 Core Features**
- **[Authentication Guide](./authentication.md)** - Login, register, JWT, OAuth integration
- **[Authorization Guide](./authorization.md)** - RBAC, permissions, guards, and middleware
- **[User Management](./user-management.md)** - User CRUD, profiles, validation, and lifecycle

### **🗄️ Database & Architecture**
- **[Database Guide](./database.md)** - Models, migrations, queries, and schema design
- **[Architecture Overview](./architecture.md)** - Package structure and design patterns
- **[API Reference](./api-reference.md)** - Complete API documentation

### **🏢 Advanced Topics**
- **[Multi-tenant Setup](./multi-tenant.md)** - Tenant isolation, switching, and management
- **[Integration Patterns](./integration.md)** - Using with Express, Fastify, NestJS, etc.
- **[Performance Guide](./performance.md)** - Optimization, caching, and best practices
- **[Security Best Practices](./security.md)** - Hardening, compliance, and security considerations

### **🧪 Development & Testing**
- **[Testing Guide](./testing.md)** - Unit tests, integration tests, and mocking
- **[Development Guide](./development.md)** - Contributing to the core package
- **[Migration Guide](./migration.md)** - Upgrading between versions

## 🎯 **Quick Navigation**

### **New to AegisX?**
1. Start with **[Getting Started Guide](./getting-started.md)**
2. Try the **[Quick Examples](./quick-examples.md)**
3. Read **[Configuration Guide](./configuration.md)**

### **Implementing Authentication?**
1. **[Authentication Guide](./authentication.md)** - JWT, OAuth, sessions
2. **[Authorization Guide](./authorization.md)** - RBAC and permissions
3. **[Security Best Practices](./security.md)** - Security hardening

### **Working with Database?**
1. **[Database Guide](./database.md)** - Models and migrations
2. **[User Management](./user-management.md)** - User operations
3. **[Multi-tenant Setup](./multi-tenant.md)** - If using multi-tenancy

### **Integration & Performance?**
1. **[Integration Patterns](./integration.md)** - Framework-specific guides
2. **[Performance Guide](./performance.md)** - Optimization tips
3. **[Testing Guide](./testing.md)** - Testing strategies

## 📋 **Common Use Cases**

### **HIS (Hospital Information System)**
```typescript
import { Guards, RoleService } from '@aegisx/core';

// Setup medical roles
await RoleService.createRole({
  name: 'doctor',
  permissions: ['patient:read:dept', 'prescription:create']
});

// Protect medical routes
app.get('/patients', Guards.requireRole('doctor'), getPatients);
```

### **ERP (Enterprise Resource Planning)**
```typescript
import { Guards, PermissionService } from '@aegisx/core';

// Check financial permissions
app.get('/reports', 
  Guards.requireAuth,
  Guards.requirePermission('financial:read:all'),
  getFinancialReports
);
```

### **Multi-tenant SaaS**
```typescript
import { createAegisX, Guards } from '@aegisx/core';

await createAegisX({ multiTenant: true });

app.get('/data',
  Guards.requireAuth,
  Guards.requireTenant(),
  getTenantData
);
```

## 🔧 **Architecture Decisions**

### **Why Shared Package Approach?**

**✅ Benefits:**
- **Performance** - No network calls, instant validation
- **Consistency** - Same auth logic across all applications
- **Maintainability** - Update once, used everywhere
- **Developer Experience** - Simple import and use

**📊 Comparison with Alternatives:**

| Approach | Performance | Consistency | Maintenance | Complexity |
|----------|-------------|-------------|-------------|------------|
| **Shared Package** | ⚡ Excellent | ✅ High | ✅ Easy | 🟡 Medium |
| Microservice API | 🐌 Slow | ✅ High | 🔧 Hard | 🔴 High |
| Copy-paste Code | ⚡ Excellent | ❌ Low | 🔴 Very Hard | 🟢 Low |

### **Package vs Microservice**

We chose **Shared Package** over **Microservice API** because:

- **No Network Latency** - Authentication checks are instant
- **No Network Dependencies** - Apps work offline
- **Simpler Deployment** - No additional services to manage
- **Better Developer Experience** - Import and use immediately

**When to Consider Microservice Approach:**
- Multiple programming languages (not just Node.js)
- Strict service isolation requirements
- Complex authentication workflows
- Real-time permission updates across services

## 🎯 **Design Philosophy**

### **API-First Design**
```typescript
// High-level, easy-to-use API
import { Guards } from '@aegisx/core';
app.use(Guards.requireAuth);

// Low-level, flexible API  
import { JwtService, PermissionService } from '@aegisx/core';
const user = await JwtService.verify(token);
const allowed = await PermissionService.check(user.id, permission);
```

### **Configuration over Convention**
```typescript
// Flexible configuration
await createAegisX({
  database: { /* any database config */ },
  jwt: { /* any JWT config */ },
  multiTenant: { /* tenant settings */ },
  security: { /* security options */ }
});
```

### **Extensible by Design**
```typescript
// Easy to extend for specific use cases
import { UserService } from '@aegisx/core';

class HISUserService extends UserService {
  async createDoctor(doctorData) {
    // HIS-specific user creation
    const user = await super.createUser(doctorData);
    await this.assignRole(user.id, 'doctor');
    return user;
  }
}
```

## 🔗 **External Links**

- **[Complete Architecture Specification](../aegisx-core-architecture.yaml)** - Technical implementation details
- **[GitHub Repository](https://github.com/your-org/aegisx-core)** - Source code and issues
- **[NPM Package](https://www.npmjs.com/package/@aegisx/core)** - Published package
- **[Example Projects](../examples/)** - Real-world usage examples

## 🤝 **Contributing to Documentation**

Found a typo or want to improve the docs?

1. **Edit on GitHub** - Click "Edit this page" on any documentation page
2. **Submit an Issue** - Report documentation issues or requests
3. **Join Discussions** - Participate in documentation planning

## 📝 **Documentation Standards**

- **Clear Examples** - Every concept includes working code examples
- **Multiple Frameworks** - Examples for Express, Fastify, NestJS
- **Progressive Complexity** - Start simple, build to advanced
- **Real-world Focus** - Examples based on actual use cases (HIS, ERP, etc.)

---

> **Need help?** Check our **[FAQ](./faq.md)** or **[create an issue](https://github.com/your-org/aegisx-core/issues)** for support. 