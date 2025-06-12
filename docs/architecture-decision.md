# 🏗️ Architecture Decision: Shared Package Approach

This document explains why we chose the **Shared Core Package** approach for AegisX over other alternatives.

## 🤔 **The Problem**

เมื่อสร้างหลายแอปพลิเคชัน (HIS, ERP, Todo, etc.) เราต้องการ authentication และ authorization ในทุกแอป แต่ไม่อยากเขียนซ้ำ

### **Requirements:**
- ✅ **Performance** - การ validate token ต้องเร็ว
- ✅ **Consistency** - logic เดียวกันในทุกแอป
- ✅ **Maintainability** - แก้ไขง่าย update ง่าย
- ✅ **Developer Experience** - ใช้งานง่าย integrate ง่าย
- ✅ **HIS/ERP Ready** - รองรับ enterprise requirements

## 🔄 **Approaches Considered**

### **1. Copy-Paste Code (Traditional)**
```typescript
// ทุกโปรเจคมี auth code เหมือนกัน
his-project/auth/
erp-project/auth/
todo-project/auth/
```

**✅ Pros:**
- เร็วมาก (no network calls)
- ไม่ซับซ้อน
- Independent deployment

**❌ Cons:**
- Code duplication มาก
- Update ยาก (ต้องแก้หลายที่)
- Inconsistency risk
- Maintenance nightmare

### **2. Microservice API (Distributed)**
```typescript
// Central auth service
aegisx-auth-api:3000  ← ทุกแอปเรียกผ่าน HTTP

his-app → HTTP calls → aegisx-auth-api
erp-app → HTTP calls → aegisx-auth-api
```

**✅ Pros:**
- Single source of truth
- Easy updates
- Consistent behavior
- Independent scaling

**❌ Cons:**
- Network latency (50-200ms per call)
- Network dependency
- More complex deployment
- Potential single point of failure

### **3. Shared Core Package (Chosen) ⭐**
```typescript
// NPM package approach
npm install @aegisx/core

// ทุกแอปใช้ package เดียวกัน
import { Guards } from '@aegisx/core';
app.use(Guards.requireAuth); // ⚡ Local call
```

**✅ Pros:**
- **Fast performance** (local function calls)
- **Easy updates** (npm update)
- **Consistent behavior** (same code everywhere)
- **Simple deployment** (no extra services)
- **Great DX** (import and use)

**❌ Cons:**
- Version management complexity
- Node.js only
- Shared database considerations

## 🎯 **Decision Matrix**

| Criteria | Copy-Paste | Microservice | **Shared Package** |
|----------|------------|--------------|-------------------|
| **Performance** | ⚡ Excellent | 🐌 Slow | ⚡ **Excellent** |
| **Consistency** | ❌ Poor | ✅ Good | ✅ **Excellent** |
| **Maintainability** | ❌ Poor | 🔧 Medium | ✅ **Good** |
| **Deployment** | ✅ Simple | ❌ Complex | ✅ **Simple** |
| **Developer Experience** | 🔧 Medium | ❌ Complex | ✅ **Excellent** |
| **Scalability** | ✅ Good | ✅ Excellent | 🔧 **Medium** |
| **Network Dependency** | ✅ None | ❌ High | ✅ **None** |

## 📊 **Performance Comparison**

### **Authentication Validation Time:**

```
Copy-Paste:      ~2ms   (local function call)
Shared Package:  ~2ms   (local function call) ⭐
Microservice:    ~50ms  (HTTP call + network)
```

### **Permission Check Time:**

```
Copy-Paste:      ~1ms   (local check)
Shared Package:  ~1ms   (local check) ⭐  
Microservice:    ~30ms  (HTTP call)
```

### **For 1000 requests/second:**

```
Copy-Paste:      Handles easily
Shared Package:  Handles easily ⭐
Microservice:    Requires careful optimization
```

## 🏢 **Why Perfect for HIS/ERP**

### **HIS Requirements:**
- **HIPAA Compliance** - Audit logging, data protection
- **Real-time Performance** - Patient data access can't be slow
- **Reliability** - Medical systems can't depend on network
- **Complex RBAC** - Doctor/Nurse/Admin roles with granular permissions

### **ERP Requirements:**
- **SOX Compliance** - Financial data access control
- **High Volume** - Many concurrent users
- **Complex Workflows** - Multi-step approval processes
- **Integration** - With existing systems

### **Shared Package Advantages:**
```typescript
// HIS usage
import { Guards } from '@aegisx/core';

app.get('/patients', 
  Guards.requireAuth,                    // ⚡ 2ms
  Guards.requirePermission('patient:read:dept'), // ⚡ 1ms
  getPatients // Business logic
);

// Total auth overhead: ~3ms (vs 80ms with microservice)
```

## 🔧 **Implementation Details**

### **Package Architecture:**
```
@aegisx/core
├── auth/         # JWT, OAuth, sessions
├── rbac/         # Roles, permissions, guards  
├── user/         # User management
├── database/     # Models, migrations
└── utils/        # Shared utilities
```

### **Integration Pattern:**
```typescript
// Each project installs the package
npm install @aegisx/core

// Import and use immediately
import { createAegisX, Guards } from '@aegisx/core';

await createAegisX(config);
app.use(Guards.requireAuth);
```

### **Update Workflow:**
```bash
# Update core package
cd aegisx-core
npm version patch
npm publish

# Update in projects  
cd his-project
npm update @aegisx/core  # ⚡ Gets latest features

cd erp-project
npm update @aegisx/core  # ⚡ Same features
```

## 🚀 **Migration Path**

### **Phase 1: Package Development**
```bash
# Create core package
npm create @aegisx/core
npm publish
```

### **Phase 2: HIS Integration**
```bash
# HIS project uses package
npm install @aegisx/core
# Immediate authentication working
```

### **Phase 3: ERP Integration**
```bash
# ERP project uses same package
npm install @aegisx/core
# Same auth system, different business logic
```

### **Future: Microservice Option**
```typescript
// If needed later, can switch to microservice
// by changing package internals to HTTP calls
// API stays the same!

import { Guards } from '@aegisx/core';
app.use(Guards.requireAuth); // Same API, different implementation
```

## 🌟 **Real-world Examples**

### **Companies Using This Approach:**

**Stripe:**
```javascript
npm install @stripe/stripe-js
import { Stripe } from '@stripe/stripe-js';
// Used across all Stripe products
```

**Shopify:**
```javascript
npm install @shopify/polaris
import { Button } from '@shopify/polaris';
// Consistent UI across all Shopify apps
```

**Auth0:**
```javascript
npm install @auth0/auth0-js
import { Auth0 } from '@auth0/auth0-js';
// Authentication package approach
```

## ⚖️ **Trade-offs Accepted**

### **✅ We Get:**
- **⚡ Performance** - Local function calls
- **🔧 Easy Updates** - npm update
- **✅ Consistency** - Same code everywhere
- **🚀 Simple Deploy** - No extra services
- **👨‍💻 Great DX** - Import and use

### **⚠️ We Accept:**
- **Node.js Lock-in** - Can't use with Python/Java easily
- **Version Management** - Need semantic versioning discipline
- **Database Coordination** - Need shared schema planning

## 🎯 **Conclusion**

**Shared Core Package** เป็นตัวเลือกที่ดีที่สุดสำหรับ:

1. **Node.js ecosystem** - ใช้ language เดียวกัน
2. **Performance-critical applications** - HIS, ERP ต้องการความเร็ว
3. **Enterprise compliance** - HIPAA, SOX requirements
4. **Team productivity** - Developer experience สำคัญ
5. **Maintenance efficiency** - Update once, use everywhere

**Future-proof:** ถ้าในอนาคตต้องการ microservice สามารถเปลี่ยน implementation ใน package ได้ โดยไม่ต้องแก้ code ในแอป

---

> **เลือก Shared Package เพราะได้ทั้ง performance และ maintainability โดยไม่ต้อง trade-off มาก** 🎯 