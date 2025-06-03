# Audit Logging System

## ภาพรวม

Audit Logging System ใน AegisX เป็นระบบบันทึกการกระทำสำคัญของผู้ใช้และระบบ เพื่อให้สามารถติดตาม ตรวจสอบ และวิเคราะห์พฤติกรรมการใช้งานได้

## คุณสมบัติหลัก

### 🔍 การบันทึก Audit Logs
- บันทึกการกระทำสำคัญทั้งหมดในระบบ
- เก็บข้อมูล actor, action, target, timestamp
- รองรับ metadata เพิ่มเติม (IP address, User Agent)
- บันทึกผ่าน Event Bus และฐานข้อมูล

### 📊 การค้นหาและกรอง
- ค้นหาตาม actor, action, target
- กรองตามช่วงเวลา
- Pagination สำหรับข้อมูลจำนวนมาก
- สถิติการใช้งาน

### 📈 Analytics และ Reporting  
- สถิติตาม action type
- สถิติตาม user/actor
- กราฟกิจกรรมรายวัน
- Export ข้อมูลสำหรับการวิเคราะห์

## การใช้งาน

### 1. บันทึก Audit Log

```typescript
import { logAudit } from '../utils/audit-log';

// บันทึก audit log พื้นฐาน
await logAudit(
  'user-123',           // actor (ผู้กระทำ)
  'user.created',       // action (การกระทำ)
  'user:456',          // target (เป้าหมาย)
  { email: 'user@example.com' }, // details (รายละเอียดเพิ่มเติม)
  { ip: '192.168.1.1', userAgent: 'Mozilla/5.0...' } // metadata
);
```

### 2. ตัวอย่างการใช้งานใน Service

```typescript
// ใน User Service
export class UserService {
  static async create(data: any, actorId?: string, metadata?: AuditMetadata) {
    const user = await knex('users').insert(data).returning('*');
    
    // บันทึก audit log
    await logAudit(
      actorId || 'system',
      'user.created',
      `user:${user[0].id}`,
      { username: user[0].username, email: user[0].email },
      metadata
    );
    
    return user[0];
  }
}
```

### 3. ตัวอย่างการใช้งานใน Controller

```typescript
// ใน Auth Controller
export class AuthController {
  static async login(request: FastifyRequest, reply: FastifyReply) {
    const metadata = {
      ip: request.ip,
      userAgent: request.headers['user-agent']
    };
    
    const result = await AuthService.login(username, password, metadata);
    return reply.send({ token: result });
  }
}
```

## API Endpoints

### 1. รายการ Audit Logs

```http
GET /audit-logs?page=1&limit=20&actor=user-123&action=login&from=2025-01-01&to=2025-12-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "actor": "user-123",
        "action": "login.success",
        "target": "auth:session",
        "details": {
          "username": "john.doe"
        },
        "created_at": "2025-06-03T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### 2. สถิติ Audit Logs

```http
GET /audit-logs/stats?from=2025-01-01&to=2025-12-31
```

**Response:**
```json
{
  "success": true,
  "data": {
    "actionStats": [
      { "action": "login.success", "count": 245 },
      { "action": "user.created", "count": 89 },
      { "action": "api_key.created", "count": 23 }
    ],
    "actorStats": [
      { "actor": "user-123", "count": 156 },
      { "actor": "admin-456", "count": 89 }
    ],
    "dailyActivity": [
      { "date": "2025-06-03", "count": 45 },
      { "date": "2025-06-02", "count": 38 }
    ]
  }
}
```

### 3. รายละเอียด Audit Log

```http
GET /audit-logs/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "actor": "user-123",
    "action": "user.updated",
    "target": "user:456",
    "details": {
      "changes": ["email", "username"],
      "oldValues": {
        "email": "old@example.com"
      },
      "newValues": {
        "email": "new@example.com"
      }
    },
    "created_at": "2025-06-03T10:30:00Z"
  }
}
```

## Action Types

### Authentication
- `login.success` - เข้าสู่ระบบสำเร็จ
- `login.failed` - เข้าสู่ระบบล้มเหลว
- `logout` - ออกจากระบบ
- `password.changed` - เปลี่ยนรหัสผ่าน

### User Management
- `user.created` - สร้างผู้ใช้ใหม่
- `user.updated` - แก้ไขข้อมูลผู้ใช้
- `user.deleted` - ลบผู้ใช้
- `user.role_changed` - เปลี่ยน role ผู้ใช้

### API Key Management
- `api_key.created` - สร้าง API key
- `api_key.revoked` - ยกเลิก API key
- `api_key.used` - ใช้งาน API key

### RBAC Operations
- `role.created` - สร้าง role ใหม่
- `role.updated` - แก้ไข role
- `role.deleted` - ลบ role
- `permission.granted` - มอบสิทธิ์
- `permission.revoked` - เพิกถอนสิทธิ์

## Target Format

Target ใช้รูปแบบ `type:id` เพื่อระบุเป้าหมายของการกระทำ:

- `user:123` - ผู้ใช้ ID 123
- `role:admin` - Role admin
- `api_key:456` - API Key ID 456
- `auth:session` - Session authentication
- `system:config` - System configuration

## Best Practices

### 1. การบันทึกที่สำคัญ
```typescript
// ❌ ไม่ควรบันทึก
await logAudit(userId, 'user.viewed_profile', `user:${userId}`);

// ✅ ควรบันทึก
await logAudit(userId, 'user.password_changed', `user:${userId}`);
await logAudit(userId, 'api_key.created', `api_key:${keyId}`);
```

### 2. การใส่ Details ที่เป็นประโยชน์
```typescript
// ❌ Details ไม่เป็นประโยชน์
await logAudit(userId, 'user.updated', `user:${targetId}`, { success: true });

// ✅ Details ที่เป็นประโยชน์
await logAudit(userId, 'user.updated', `user:${targetId}`, {
  changes: ['email', 'role_id'],
  oldRole: 'user',
  newRole: 'admin'
});
```

### 3. Error Handling
```typescript
try {
  await logAudit(userId, 'user.created', `user:${newUser.id}`);
} catch (error) {
  // อย่าให้ audit log error ทำให้ main flow หยุด
  console.error('Failed to log audit:', error);
  // Continue with main flow
}
```

## การติดตั้งและตั้งค่า

### 1. Database Migration
ตาราง `audit_logs` ถูกสร้างโดย migration:

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_type VARCHAR NOT NULL,
  actor_id UUID NOT NULL,
  action VARCHAR NOT NULL,
  target VARCHAR,
  ip_address VARCHAR,
  user_agent VARCHAR,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### 2. การเปิดใช้งาน
Audit logging เปิดใช้งานอัตโนมัติเมื่อ import `logAudit` function:

```typescript
import { logAudit } from '../utils/audit-log';
```

### 3. Routes Registration
Routes สำหรับ audit logs ลงทะเบียนใน `app.ts`:

```typescript
import { auditRoutes } from './core/audit/audit.route';
app.register(auditRoutes);
```

## การ Monitor และ Maintenance

### 1. การทำความสะอาดข้อมูล
```sql
-- ลบ audit logs เก่าเกิน 1 ปี
DELETE FROM audit_logs 
WHERE created_at < NOW() - INTERVAL '1 year';
```

### 2. การสร้าง Index
```sql
-- เพิ่ม index สำหรับการค้นหา
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

### 3. การ Archive
```typescript
// สำหรับข้อมูลจำนวนมาก ควร archive ไปยัง cold storage
const oldLogs = await knex('audit_logs')
  .where('created_at', '<', thirtyDaysAgo)
  .select('*');

// Export to file or external storage
await exportToS3(oldLogs);
await knex('audit_logs')
  .where('created_at', '<', thirtyDaysAgo)
  .del();
```

## Troubleshooting

### 1. Audit Log ไม่ถูกบันทึก
- ตรวจสอบการ import `logAudit` function
- ตรวจสอบ database connection
- ตรวจสอบ table `audit_logs` มีอยู่หรือไม่

### 2. Performance Issues
- เพิ่ม database index
- ใช้ async logging เพื่อไม่ให้ block main thread
- พิจารณาใช้ queue สำหรับ audit logging

### 3. Disk Space Issues
- ตั้งค่า log rotation
- Archive ข้อมูลเก่า
- Compress audit logs
