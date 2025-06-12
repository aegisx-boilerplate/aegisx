# 🚀 Getting Started with AegisX Core

This guide will help you get started with **AegisX Core Package** - the enterprise-grade authentication and authorization npm package.

## 🎯 **What is AegisX Core?**

AegisX Core เป็น **npm package** ที่รวม authentication, authorization, และ user management ไว้ในที่เดียว แทนที่จะสร้าง auth system ใหม่ในทุกโปรเจค เพียงแค่ `npm install @aegisx/core` แล้วใช้งานได้เลย

### **Key Benefits:**
- ⚡ **Instant Performance** - No network calls, local validation
- 🔒 **Enterprise Security** - JWT, RBAC, audit logging built-in
- 🛠️ **Easy Integration** - Works with Express, Fastify, NestJS
- 🏢 **Multi-tenant Ready** - Single or multi-tenant mode
- 📦 **Zero Config** - Works out of the box with sensible defaults

## 📦 **Installation**

### **1. Install Core Package**
```bash
npm install @aegisx/core
```

### **2. Install Peer Dependencies**
```bash
# Database and crypto dependencies
npm install pg knex bcrypt jsonwebtoken

# TypeScript definitions (if using TypeScript)
npm install -D @types/pg @types/bcrypt @types/jsonwebtoken
```

### **3. Optional Dependencies**
```bash
# For OAuth support
npm install passport passport-google-oauth20 passport-github2

# For Redis caching
npm install redis

# For email verification
npm install nodemailer
```

## 🗄️ **Database Setup**

### **PostgreSQL Installation**
```bash
# macOS (with Homebrew)
brew install postgresql@15
brew services start postgresql@15

# Ubuntu/Debian
sudo apt update
sudo apt install postgresql-15 postgresql-contrib

# Docker (recommended for development)
docker run --name aegisx-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=aegisx_dev \
  -p 5432:5432 \
  -d postgres:15
```

### **Create Database**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE aegisx_dev;
CREATE USER aegisx_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE aegisx_dev TO aegisx_user;

# Exit
\q
```

## ⚙️ **Basic Configuration**

### **1. Environment Variables**
Create `.env` file in your project root:

```bash
# Database Configuration
DATABASE_URL=postgresql://aegisx_user:password@localhost:5432/aegisx_dev

# JWT Configuration
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Application Settings
NODE_ENV=development
PORT=3000

# Multi-tenant (optional)
ENABLE_MULTI_TENANT=false
```

### **2. Basic App Setup**
```typescript
// app.ts
import express from 'express';
import { createAegisX, Guards } from '@aegisx/core';

const app = express();

// Parse JSON requests
app.use(express.json());

async function main() {
  // Initialize AegisX Core
  await createAegisX({
    database: {
      host: 'localhost',
      port: 5432,
      database: 'aegisx_dev',
      user: 'aegisx_user',
      password: 'password'
    },
    jwt: {
      secret: process.env.JWT_SECRET || 'your-secret-key',
      expiresIn: '15m'
    }
  });

  // Your routes here...
  
  app.listen(3000, () => {
    console.log('🚀 Server running on http://localhost:3000');
  });
}

main().catch(console.error);
```

## 🔐 **Your First Authentication**

### **1. Add Authentication Routes**
```typescript
import { AuthService } from '@aegisx/core';

// Register endpoint
app.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    const user = await AuthService.register({
      email,
      password,
      firstName,
      lastName
    });
    
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await AuthService.login(email, password);
    
    res.json({
      message: 'Login successful',
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});
```

### **2. Add Protected Routes**
```typescript
import { Guards } from '@aegisx/core';

// Protect all /api routes
app.use('/api', Guards.requireAuth);

// Protected profile endpoint
app.get('/api/profile', (req, res) => {
  // req.user is automatically available after authentication
  res.json({
    message: 'Profile data',
    user: req.user
  });
});

// Admin-only endpoint
app.get('/api/admin', 
  Guards.requirePermission('admin:read'),
  (req, res) => {
    res.json({ message: 'Admin area', user: req.user });
  }
);
```

## 🧪 **Test Your Setup**

### **1. Start Your Server**
```bash
npm run dev
# or
node app.js
```

### **2. Test Registration**
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### **3. Test Login**
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### **4. Test Protected Route**
```bash
# Replace YOUR_TOKEN with the accessToken from login response
curl -X GET http://localhost:3000/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🛡️ **Add Authorization (RBAC)**

### **1. Create Roles and Permissions**
```typescript
import { RoleService, PermissionService } from '@aegisx/core';

async function setupRoles() {
  // Create permissions
  await PermissionService.createPermission({
    name: 'user:read',
    description: 'Read user data'
  });
  
  await PermissionService.createPermission({
    name: 'admin:read',
    description: 'Read admin data'
  });

  // Create roles
  const userRole = await RoleService.createRole({
    name: 'user',
    description: 'Regular user',
    permissions: ['user:read']
  });

  const adminRole = await RoleService.createRole({
    name: 'admin', 
    description: 'Administrator',
    permissions: ['user:read', 'admin:read']
  });

  console.log('✅ Roles and permissions created');
}

// Run this once to setup your roles
setupRoles().catch(console.error);
```

### **2. Assign Roles to Users**
```typescript
import { UserService } from '@aegisx/core';

// Assign role during registration
app.post('/register', async (req, res) => {
  try {
    const user = await AuthService.register(req.body);
    
    // Assign default 'user' role
    await UserService.assignRole(user.id, 'user');
    
    res.status(201).json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### **3. Use Permission Guards**
```typescript
// Different permission levels
app.get('/api/users', 
  Guards.requireAuth,
  Guards.requirePermission('user:read'),
  getUserList
);

app.get('/api/admin/reports',
  Guards.requireAuth, 
  Guards.requirePermission('admin:read'),
  getAdminReports
);

app.delete('/api/admin/users/:id',
  Guards.requireAuth,
  Guards.requireRole('admin'), // Alternative: require specific role
  deleteUser
);
```

## 🎯 **Next Steps**

### **📚 Learn More**
- **[Authentication Guide](./authentication.md)** - Deep dive into auth features
- **[Authorization Guide](./authorization.md)** - Advanced RBAC patterns
- **[Database Guide](./database.md)** - Custom models and migrations
- **[Integration Patterns](./integration.md)** - Framework-specific examples

### **🏗️ Production Setup**
- **[Security Best Practices](./security.md)** - Hardening for production
- **[Performance Guide](./performance.md)** - Optimization and caching
- **[Multi-tenant Setup](./multi-tenant.md)** - If you need multi-tenancy

### **🧪 Advanced Topics**
- **[Testing Guide](./testing.md)** - Unit and integration testing
- **[API Reference](./api-reference.md)** - Complete API documentation

## ❓ **Common Issues**

### **Database Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:** Make sure PostgreSQL is running and connection details are correct.

### **JWT Secret Error**
```
Error: JWT secret is required
```
**Solution:** Set `JWT_SECRET` environment variable or pass it in configuration.

### **Permission Denied**
```
Error: Permission denied: admin:read
```
**Solution:** Make sure user has the required role/permission assigned.

## 💡 **Quick Tips**

### **Environment Variables**
```typescript
// Use environment variables for configuration
await createAegisX({
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'aegisx_dev',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m'
  }
});
```

### **Error Handling**
```typescript
// Global error handler
app.use((error, req, res, next) => {
  console.error(error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({ error: error.message });
  }
  
  if (error.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  res.status(500).json({ error: 'Internal server error' });
});
```

### **Development vs Production**
```typescript
const config = {
  database: {
    // Use connection pooling in production
    pool: process.env.NODE_ENV === 'production' 
      ? { min: 2, max: 10 }
      : { min: 1, max: 2 }
  },
  jwt: {
    // Use RS256 in production, HS256 in development
    algorithm: process.env.NODE_ENV === 'production' ? 'RS256' : 'HS256'
  }
};
```

---

## 🎉 **You're Ready!**

คุณได้ setup AegisX Core เรียบร้อยแล้ว! ตอนนี้คุณมี:

- ✅ **Authentication system** ที่ใช้งานได้
- ✅ **JWT tokens** พร้อม refresh mechanism  
- ✅ **RBAC permissions** system
- ✅ **Protected routes** ที่ปลอดภัย

**อะไรต่อไป?** ลองดู **[Quick Examples](./quick-examples.md)** สำหรับ common use cases หรือ **[Integration Patterns](./integration.md)** สำหรับ framework ที่คุณใช้! 