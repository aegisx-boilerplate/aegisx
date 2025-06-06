# Testing the Enhanced Auth Core Module

## Quick Start Testing

### 1. Start Development Environment

```bash
# Start services (PostgreSQL, Redis, RabbitMQ)
npm run services:up

# Setup database (run migrations and seeds)
npm run db:setup

# Start development server
npm run dev
```

### 2. Run Automated Tests

```bash
# Run the comprehensive auth testing script
./test-auth.sh

# หรือรันเฉพาะ script ที่ต้องการ
node --experimental-vm-modules ./scripts/test-auth-routes.js       # ทดสอบ auth routes พื้นฐาน
node --experimental-vm-modules ./scripts/test-api-key-auth.js      # ทดสอบ API key authentication

# รันพร้อมโหมด debug เพื่อแสดงข้อมูลเพิ่มเติม
DEBUG=true ./test-auth.sh
```

### 3. Scripts ที่มีให้ใช้งาน

เพิ่ม Scripts ต่อไปนี้สำหรับทดสอบ Auth Routes ทั้งหมด:

- **test-auth.sh**: Script หลักสำหรับรันทั้งหมด
- **scripts/test-auth-routes.js**: ทดสอบ auth routes พื้นฐาน (register, login, me, change-password, logout, refresh, forgot-password, reset-password)
- **scripts/test-api-key-auth.js**: ทดสอบ API key authentication แบบละเอียด รวมถึง scopes และ IP whitelist
./test-auth-manual.sh
```

### 3. Manual API Testing

#### Register a New User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com", 
    "password": "TestPassword123!"
  }'
```

**Expected Response:**
- Status: 200/201
- Auto-login with access_token and refresh_token
- User object with roles/permissions assigned
- No first_name/last_name fields

#### Verify User Has Default Role
```bash
# Use the access_token from registration response
curl -H "Authorization: Bearer <access_token>" \
  http://localhost:3000/auth/me
```

**Expected Response:**
- User info with roles array containing permissions
- Default USER role permissions should be included

## Database Verification

### Check User Creation
```sql
-- Connect to PostgreSQL
psql postgres://user:password@localhost:5432/aegisx

-- Check user was created correctly
SELECT u.id, u.username, u.email, u.created_at 
FROM users u 
WHERE u.username = 'testuser';
```

### Check Role Assignment
```sql
-- Verify default role assignment
SELECT u.username, r.name as role, ur.created_at as assigned_at
FROM users u 
JOIN user_roles ur ON u.id = ur.user_id 
JOIN roles r ON ur.role_id = r.id 
WHERE u.username = 'testuser';
```

### Check User Permissions
```sql
-- Check user permissions through roles
SELECT u.username, r.name as role, p.name as permission
FROM users u 
JOIN user_roles ur ON u.id = ur.user_id 
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.username = 'testuser';
```

## Key Features to Test

### ✅ User Registration
- [x] Registration without first_name/last_name
- [x] Automatic assignment of default 'USER' role
- [x] Auto-login after registration
- [x] Proper password hashing with bcrypt
- [x] Password history storage

### ✅ JWT Authentication
- [x] Access token generation and validation
- [x] Refresh token functionality
- [x] Bearer token authentication
- [x] Token expiry handling

### ✅ RBAC Integration
- [x] Role-based access control
- [x] Permission checking
- [x] Many-to-many user-role relationship
- [x] No role_id column dependency

### ✅ Security Features
- [x] Password complexity validation
- [x] Rate limiting on auth endpoints
- [x] Audit logging of auth events
- [x] Secure session management

### ✅ API Endpoints
- [x] POST /auth/register
- [x] POST /auth/login
- [x] GET /auth/me
- [x] POST /auth/refresh
- [x] POST /auth/logout
- [x] POST /auth/forgot-password
- [x] POST /auth/reset-password
- [x] POST /auth/change-password

## Troubleshooting

### Server Won't Start
1. Check services are running: `npm run services:status`
2. Check environment variables in `.env` file
3. Verify database connection: `npm run db:setup`

### Registration Fails
1. Check if USER role exists in database
2. Verify password meets complexity requirements
3. Check for duplicate username/email

### Token Authentication Fails
1. Verify JWT_SECRET is set in environment
2. Check token hasn't expired
3. Ensure Bearer format: `Authorization: Bearer <token>`

### Role Assignment Issues
1. Check if default USER role exists: `SELECT * FROM roles WHERE name = 'USER';`
2. Verify user_roles table structure
3. Check RBAC service methods are working

## Performance Notes

- Registration includes automatic role assignment (slight overhead)
- JWT tokens are verified on each authenticated request
- User permissions are cached in Redis for performance
- Rate limiting prevents brute force attacks

## Security Considerations

- Passwords are hashed with bcrypt (12 rounds by default)
- JWT tokens have configurable expiry times
- Refresh tokens are stored securely in database
- Rate limiting prevents abuse
- All auth events are logged for audit trails
