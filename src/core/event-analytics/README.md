# Events Core Module

## 📊 **Overview**

Events Core Module เป็นส่วนหัวใจของระบบ Event Analytics และ Storage Adapters สำหรับ AegisX ที่ย้ายจาก `utils` มาเป็น `core` module เพื่อแสดงความสำคัญของ event system ในสถาปัตยกรรมของระบบ

### **Key Features**
- 📈 **Real-time Event Analytics** - ติดตามและวิเคราะห์ events แบบ real-time
- 🔧 **Pluggable Storage Adapters** - รองรับ Memory, Database และ Hybrid storage
- 📊 **Comprehensive Metrics** - event counts, user statistics, system health
- 🛡️ **Security Monitoring** - ติดตาม login attempts, failed authentications
- 📤 **Data Export** - export ข้อมูลเป็น JSON หรือ CSV สำหรับ analysis
- 🚀 **High Performance** - optimized สำหรับ high-throughput event processing

## 🏗️ **Architecture**

```
src/core/event-analytics/
├── index.ts                    # Main exports และ public API
├── event-analytics.ts          # Event analytics service & API routes
├── event-analytics.schema.ts   # Fastify schemas สำหรับ validation
├── README.md                   # Documentation (this file)
└── adapters/
    ├── event-storage.adapter.ts   # Storage adapters implementation
    └── event-storage.factory.ts   # Factory pattern สำหรับ adapter creation
```

### **Database Schema**
Events ถูกเก็บใน `events` table:
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR NOT NULL,           -- event type (e.g., 'user.login')
  queue VARCHAR NOT NULL,          -- queue name (e.g., 'auth.events')
  user_id UUID,                   -- associated user (optional)
  data JSONB,                     -- event payload
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_events_type ON events(type);
CREATE INDEX idx_events_queue ON events(queue);
CREATE INDEX idx_events_type_created ON events(type, created_at);
CREATE INDEX idx_events_queue_created ON events(queue, created_at);
CREATE INDEX idx_events_user_created ON events(user_id, created_at);
```

## 🚀 **Quick Start**

### **Basic Usage**

```typescript
import { EventAnalyticsService } from '../core/event-analytics';

// Auto-initialize จาก environment
await EventAnalyticsService.recordEvent('user_login', 'auth.events', userId);

// Get metrics
const metrics = await EventAnalyticsService.getEventMetrics({
  period: '24h'
});
```

### **Custom Adapter Configuration**

```typescript
import { 
  EventAnalyticsService, 
  EventStorageAdapterFactory,
  MemoryStorageAdapter 
} from '../core/event-analytics';

// ใช้ memory adapter สำหรับ testing
const memoryAdapter = new MemoryStorageAdapter(500);
await EventAnalyticsService.initialize(memoryAdapter);

// หรือใช้ factory pattern
const adapter = EventStorageAdapterFactory.createFromEnv();
await EventAnalyticsService.initialize(adapter);
```

## 🔧 **Configuration**

Environment variables สำหรับ event analytics:

```bash
# Storage adapter type
EVENT_STORAGE_ADAPTER=hybrid    # memory | database | hybrid

# Memory settings
EVENT_MEMORY_LIMIT=1000         # Max events in memory adapter
EVENT_BATCH_SIZE=100            # Batch size for database operations
```

## 📡 **API Endpoints**

Events Core Module ให้บริการ REST API endpoints:

### **GET /events/metrics**
ดู event metrics และ statistics

```bash
# ตัวอย่าง request
curl -H "Authorization: Bearer <token>" \
     "http://localhost:3001/events/metrics?period=24h"

# Response
{
  "success": true,
  "data": {
    "totalEvents": 1247,
    "eventsByType": {
      "user.login": 523,
      "user.created": 45,
      "api_key.used": 679
    },
    "eventsByQueue": {
      "user.events": 568,
      "audit.log": 679
    },
    "systemHealth": {
      "status": "healthy",
      "message": "Event system is operating normally",
      "uptime": 86400
    }
  }
}
```

### **GET /events/user/:userId/stats**
ดู event statistics ตาม user

```bash
curl -H "Authorization: Bearer <token>" \
     "http://localhost:3001/events/user/123/stats"
```

### **GET /events/health**
ตรวจสอบ system health

```bash
curl -H "Authorization: Bearer <token>" \
     "http://localhost:3001/events/health"
```

### **GET /events/export**
Export event data เป็น JSON หรือ CSV

```bash
curl -H "Authorization: Bearer <token>" \
     "http://localhost:3001/events/export?format=csv"
```

## 📈 **Storage Adapters**

### **1. Memory Storage Adapter**

- ⚡ **เร็วมาก** - เก็บข้อมูลใน memory
- 🧪 **เหมาะสำหรับ development** และ testing
- ⚠️ **ข้อจำกัด** - หายเมื่อ restart server
- 🎯 **Use case** - Unit tests, development environment

```typescript
const memoryAdapter = new MemoryStorageAdapter(1000);
await EventAnalyticsService.initialize(memoryAdapter);
```

### **2. Database Storage Adapter**

- 💾 **Persistent storage** - เก็บข้อมูลใน PostgreSQL
- 📊 **Query ได้ซับซ้อน** - รองรับ complex queries
- 🏭 **เหมาะสำหรับ production** - reliable และ scalable
- 🔍 **Advanced features** - indexing, relationships, transactions

```typescript
const dbAdapter = new DatabaseStorageAdapter();
await EventAnalyticsService.initialize(dbAdapter);
```

### **3. Hybrid Storage Adapter** (แนะนำ)

- ⚡ **เร็ว** - recent data จาก memory
- 💾 **Persistent** - historical data ใน database
- 🎯 **ความสมดุลที่ดีที่สุด** - performance + persistence
- 🔄 **Auto-sync** - sync ข้อมูลจาก memory ไป database

```typescript
const hybridAdapter = new HybridStorageAdapter(
  new MemoryStorageAdapter(1000),
  new DatabaseStorageAdapter()
);
await EventAnalyticsService.initialize(hybridAdapter);
```

## 🔗 **Integration Points**

### **Event Publishers** (ผู้ส่ง events)

Events Core Module รับ events จาก:

- **Auth Events** (`src/core/auth/auth.events.ts`)
  - `user.login` - successful login
  - `user.login.failed` - failed login attempts
  - `user.logout` - user logout

- **User Events** (`src/core/user/user.events.ts`)
  - `user.created` - user registration
  - `user.updated` - profile updates
  - `user.deleted` - account deletion

- **API Key Events** (`src/core/api-key/api-key.events.ts`)
  - `api_key.created` - new API key
  - `api_key.used` - API key usage
  - `api_key.revoked` - API key revocation

- **RBAC Events** (`src/core/rbac/rbac.events.ts`)
  - `role.created` - role management
  - `permission.assigned` - permission changes

### **Event Consumers** (ผู้รับ events)

- **Audit Service** - เก็บ audit trail สำหรับ compliance
- **Analytics Dashboard** - real-time monitoring
- **Security Monitoring** - detect suspicious activities
- **User Behavior Analysis** - track usage patterns

## 🛠️ **Development**

### **Import Paths**

หลังจากย้ายมา core module แล้ว imports จะเป็น:

```typescript
// ✅ ใหม่ (core module)
import { EventAnalyticsService } from '../core/event-analytics';
import { EventStorageAdapterFactory } from '../core/event-analytics';

// ❌ เก่า (utils)
import { EventAnalyticsService } from '../utils/event-analytics';
import { EventStorageAdapterFactory } from '../utils/adapters/event-storage.factory';
```

### **Database Setup**

สร้าง events table:

```bash
# ใช้ script ที่มีอยู่
node create-events-table.js

# หรือรัน migration (ถ้ามี)
npm run db:migrate
```

### **Testing**

```typescript
// Unit test with memory adapter
const memoryAdapter = new MemoryStorageAdapter(100);
await EventAnalyticsService.initialize(memoryAdapter);

// Test recording events
await EventAnalyticsService.recordEvent('test.event', 'test.queue', 'user123');

// Test metrics
const metrics = await EventAnalyticsService.getEventMetrics();
expect(metrics.totalEvents).toBe(1);
```

### **Performance Considerations**

- **Memory Adapter**: เร็วที่สุด แต่จำกัดขนาด
- **Database Adapter**: เหมาะสำหรับ historical data และ complex queries
- **Hybrid Adapter**: สมดุลระหว่าง performance และ persistence
- **Batch Processing**: ใช้ `EVENT_BATCH_SIZE` เพื่อ optimize database writes

## 🔍 **Monitoring & Debugging**

### **Health Checks**

```typescript
// ตรวจสอบ adapter health
const metrics = await EventAnalyticsService.getEventMetrics();
console.log('System Health:', metrics.systemHealth);

// ตรวจสอบ storage adapter
const storageInfo = await EventAnalyticsService.getStorageInfo();
console.log('Storage Type:', storageInfo.type);
```

### **Logging**

Events Core Module ใช้ Fastify logger:

```bash
# ดู logs
npm run dev

# ใน production
pm2 logs aegisx
```

### **Performance Metrics**

- **Event Throughput**: จำนวน events ต่อวินาที
- **Storage Performance**: response time ของ storage operations
- **Memory Usage**: ใช้ memory เท่าไหร่ (สำหรับ memory/hybrid adapter)
- **Database Performance**: query execution time


## 📚 **Documentation**

### **Related Guides**

- [Event Analytics Adapters Guide](../../docs/event-analytics-adapters.md)
- [Event Analytics Quick Start](../../docs/event-analytics-quickstart.md)
- [Event-Driven Architecture](../../docs/event-driven-architecture.md)
- [Event Bus System](../../docs/event-bus.md)

### **API Documentation**

- **Swagger UI**: `http://localhost:3001/documentation` (in development)
- **Schema Validation**: ทุก endpoint ใช้ TypeBox schemas
- **Authentication**: ต้อง Bearer token สำหรับทุก endpoint
- **Authorization**: ต้อง permission `events:read` หรือ `events:export`

## 🚨 **Troubleshooting**

### **Common Issues**

**1. "Events table does not exist"**
```bash
# สร้าง events table
node create-events-table.js
```

**2. "Storage adapter not initialized"**
```typescript
// ตรวจสอบว่า service ถูก initialize แล้ว
await EventAnalyticsService.initialize();
```

**3. "Memory limit exceeded"**
```bash
# เพิ่ม memory limit ใน .env
EVENT_MEMORY_LIMIT=2000
```

**4. "Database connection error"**
```bash
# ตรวจสอบ database connection
npm run db:check
```

### **Performance Issues**

- **Slow queries**: เพิ่ม indexes ใน events table
- **High memory usage**: ลด `EVENT_MEMORY_LIMIT`
- **Database timeouts**: เพิ่ม `EVENT_BATCH_SIZE`

## 🔄 **Migration Notes**

### **จาก utils ไป core/event-analytics**

การย้ายจาก `utils` ไป `core/event-analytics`:

1. **Import paths** - อัปเดตแล้วทั้งหมด
2. **Functionality** - ไม่เปลี่ยนแปลง
3. **Configuration** - ยังใช้ environment variables เดิม
4. **API endpoints** - ยังเป็น `/events/*` เหมือนเดิม
5. **Database schema** - ไม่เปลี่ยนแปลง

### **Breaking Changes**

- **None** - การย้ายนี้เป็น refactoring เพียงอย่างเดียว
- **Import paths** - ต้องอัปเดต import statements
- **Type exports** - อาจมี type definitions ที่เปลี่ยนแปลง

### **Upgrade Guide**

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm install

# 3. Update database (if needed)
node create-events-table.js

# 4. Restart application
npm run dev
```

## 🎯 **Roadmap**

### **Planned Features**

- **Real-time Dashboard** - WebSocket-based real-time monitoring
- **Event Replay** - ability to replay events for debugging
- **Custom Adapters** - support for Redis, MongoDB, etc.
- **Event Filtering** - advanced filtering and search capabilities
- **Alerting System** - automated alerts based on event patterns
- **Event Correlation** - link related events together

### **Performance Improvements**

- **Event Streaming** - stream large datasets efficiently
- **Compression** - compress event data for storage
- **Caching** - cache frequently accessed metrics
- **Partitioning** - partition events table by date

---

Events Core Module ตอนนี้เป็นส่วนหัวใจของ event system ใน AegisX และพร้อมรองรับการขยายตัวในอนาคต! 🎯

For questions or contributions, please check our [main documentation](../../docs/README.md) or create an issue in the repository.
