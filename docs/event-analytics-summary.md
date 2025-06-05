# Event Analytics System - สรุปภาพรวม

## บทนำ

Event Analytics System เป็นระบบวิเคราะห์และติดตามเหตุการณ์ (Event) แบบ real-time ของ AegisX ที่ออกแบบมาเพื่อให้ข้อมูล metrics, analytics และการตรวจสอบสุขภาพของระบบ

## คุณสมบัติหลัก

### 📊 Analytics และ Metrics
- **Total Events**: จำนวน events ทั้งหมดตามช่วงเวลา
- **Events by Type**: การจัดกลุ่ม events ตามประเภท
- **Events by Queue**: การจัดกลุ่ม events ตาม message queue
- **Recent Events**: events ล่าสุดพร้อม timestamp และ user information

### 🏗️ Storage Adapter Pattern
ระบบรองรับการจัดเก็บข้อมูลแบบ pluggable ผ่าน Storage Adapter:

```typescript
interface IEventStorageAdapter {
  initialize(): Promise<void>;
  storeEvent(event: EventData): Promise<void>;
  getEvents(options: GetEventsOptions): Promise<EventData[]>;
  getEventCount(options: FilterOptions): Promise<number>;
  getEventsByType(options: FilterOptions): Promise<Record<string, number>>;
  getEventsByQueue(options: FilterOptions): Promise<Record<string, number>>;
  exportEvents(options: ExportOptions): Promise<string>;
  clearEvents(): Promise<void>;
  getHealthStatus(): Promise<HealthStatus>;
}
```

### 📈 Time Range Queries
รองรับการ query ข้อมูลตามช่วงเวลา:
- **1h**: 1 ชั่วโมงที่ผ่านมา
- **24h**: 24 ชั่วโมงที่ผ่านมา (default)
- **7d**: 7 วันที่ผ่านมา
- **30d**: 30 วันที่ผ่านมา
- **Custom**: กำหนด start/end date เอง

### 👤 User-specific Analytics
- สถิติ events ตาม user ID
- Recent activity ของแต่ละ user
- การวิเคราะห์พฤติกรรมผู้ใช้

## API Endpoints

### 1. GET `/events/metrics`
**สิทธิ์**: `events:read`
**คำอธิบาย**: ดึงข้อมูล metrics ของระบบ event

**Query Parameters:**
```typescript
{
  period?: '1h' | '24h' | '7d' | '30d';
  start?: string;    // ISO date string
  end?: string;      // ISO date string
}
```

**Response:**
```typescript
{
  success: true,
  data: {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsByQueue: Record<string, number>;
    recentEvents: Array<{
      type: string;
      queue: string;
      timestamp: string;
      userId?: string;
    }>;
    systemHealth: {
      status: 'healthy' | 'warning' | 'error';
      message: string;
      uptime: number;
    };
  },
  timestamp: string;
}
```

### 2. GET `/events/user/:userId/stats`
**สิทธิ์**: `events:read`
**คำอธิบาย**: ดึงสถิติ events ของ user เฉพาะ

**Response:**
```typescript
{
  success: true,
  data: {
    userId: string;
    totalEvents: number;
    eventsByType: Record<string, number>;
    recentActivity: Array<{
      type: string;
      queue: string;
      timestamp: string;
    }>;
  },
  timestamp: string;
}
```

### 3. GET `/events/export`
**สิทธิ์**: `events:export`
**คำอธิบาย**: Export ข้อมูล events ในรูปแบบ JSON หรือ CSV

**Query Parameters:**
```typescript
{
  format?: 'json' | 'csv';
}
```

### 4. GET `/events/health`
**สิทธิ์**: `events:read`
**คำอธิบาย**: ตรวจสอบสุขภาพของระบบ event

**Response:**
```typescript
{
  success: true,
  health: {
    status: 'healthy' | 'warning' | 'error';
    message: string;
    uptime: number;
  },
  timestamp: string;
}
```

## การใช้งาน

### การบันทึก Event
```typescript
// บันทึก event ผ่าน EventAnalyticsService
await EventAnalyticsService.recordEvent(
  'user_login',           // type
  'auth-queue',          // queue
  'user123',             // userId (optional)
  { ip: '192.168.1.1' }  // data (optional)
);
```

### การดึงข้อมูล Metrics
```typescript
// ดึง metrics สำหรับ 24 ชั่วโมงที่ผ่านมา
const metrics = await EventAnalyticsService.getEventMetrics({
  period: '24h'
});

// ดึง metrics สำหรับช่วงเวลาที่กำหนด
const customMetrics = await EventAnalyticsService.getEventMetrics({
  start: '2024-01-01T00:00:00Z',
  end: '2024-01-02T00:00:00Z'
});
```

### การดึงสถิติ User
```typescript
const userStats = await EventAnalyticsService.getUserEventStats(
  'user123',
  { period: '7d' }
);
```

## Configuration

### Environment Variables
```bash
# Storage Adapter Configuration
EVENT_STORAGE_ADAPTER=memory|database|hybrid
EVENT_STORAGE_MAX_EVENTS=10000
EVENT_STORAGE_RETENTION_DAYS=30

# Database Storage (if using database adapter)
DATABASE_URL=postgresql://user:pass@localhost:5432/aegisx
```

### การเลือก Storage Adapter
```typescript
// สร้าง adapter จาก environment
const adapter = EventStorageAdapterFactory.createFromEnv();

// หรือสร้าง adapter เฉพาะ
const memoryAdapter = new MemoryStorageAdapter();
const dbAdapter = new DatabaseStorageAdapter();

// Initialize service ด้วย adapter
await EventAnalyticsService.initialize(adapter);
```

## Storage Adapters

### 1. Memory Storage Adapter
- เก็บข้อมูลใน memory
- เหมาะสำหรับ development และ testing
- ข้อมูลจะหายเมื่อ restart service

### 2. Database Storage Adapter
- เก็บข้อมูลใน PostgreSQL database
- เหมาะสำหรับ production
- ข้อมูลถาวรและรองรับ scalability

### 3. Hybrid Storage Adapter
- ผสมผสานระหว่าง memory และ database
- Cache ข้อมูลล่าสุดใน memory
- Persist ข้อมูลใน database

## Health Monitoring

ระบบมีการตรวจสอบสุขภาพแบบ multi-level:

### System Health
- **Healthy**: ระบบทำงานปกติ
- **Warning**: มีปัญหาเล็กน้อย (เช่น เพิ่งเริ่ม service)
- **Error**: มีปัญหาร้ายแรง

### Storage Health
- ตรวจสอบสถานะของ storage adapter
- รายงานปัญหาการเชื่อมต่อ database
- แจ้งเตือนเมื่อ memory usage สูง

## Security

### Authentication & Authorization
- ทุก endpoint ต้องผ่าน authentication
- ใช้ RBAC สำหรับการควบคุมสิทธิ์
- สิทธิ์ที่จำเป็น:
  - `events:read` - อ่านข้อมูล metrics
  - `events:export` - export ข้อมูล

### Data Privacy
- ข้อมูลส่วนตัวจะถูก sanitize ก่อน logging
- มีการจำกัดการเข้าถึงข้อมูล user

## Performance Considerations

### Memory Management
- จำกัดจำนวน events ใน memory
- ใช้ LRU cache สำหรับ recent events
- Auto cleanup ข้อมูลเก่า

### Database Optimization
- สร้าง index สำหรับ timestamp และ userId
- ใช้ connection pooling
- Batch operations สำหรับ bulk inserts

### Caching Strategy
- Cache metrics ที่ถูกเรียกบ่อย
- Invalidate cache เมื่อมี events ใหม่
- ใช้ Redis สำหรับ distributed caching

## Error Handling

### Graceful Degradation
- ถ้า storage adapter ล้มเหลว จะพยายาม fallback
- Log errors แต่ไม่หยุดการทำงานของ main application
- Retry mechanism สำหรับ transient errors

### Error Types
```typescript
// Schema validation errors
EventAnalyticsErrorSchema = {
  success: false,
  error: string,
  timestamp: string
}

// HTTP Status Codes
- 400: Bad Request (invalid parameters)
- 401: Unauthorized (missing/invalid auth)
- 403: Forbidden (insufficient permissions)
- 404: Not Found (user not found)
- 500: Internal Server Error
```

## Testing

### Unit Tests
```typescript
// Test event recording
await EventAnalyticsService.recordEvent('test', 'queue');
const metrics = await EventAnalyticsService.getEventMetrics();
expect(metrics.totalEvents).toBe(1);

// Test adapter switching
const newAdapter = new MemoryStorageAdapter();
await EventAnalyticsService.switchAdapter(newAdapter);
```

### Integration Tests
- ทดสอบ API endpoints
- ทดสอบ authentication/authorization
- ทดสอบ storage adapters

## Monitoring และ Debugging

### Logging
```typescript
// Service initialization
console.log('📊 Event Analytics Service initialized with storage adapter');

// Event recording
console.log(`📝 Event recorded: ${type} in ${queue}`);

// Adapter switching
console.log(`🔄 Switched to new storage adapter: ${adapterName}`);
```

### Metrics Export
```bash
# Export เป็น JSON
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/events/export?format=json"

# Export เป็น CSV
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:3000/events/export?format=csv"
```

## Best Practices

### 1. Event Naming Convention
```typescript
// ใช้ format: resource_action
'user_login'
'user_logout' 
'order_created'
'payment_processed'
```

### 2. Queue Organization
```typescript
// จัดกลุ่ม queue ตาม domain
'auth-queue'
'order-queue'
'payment-queue'
'notification-queue'
```

### 3. Data Minimization
```typescript
// เก็บเฉพาะข้อมูลที่จำเป็น
await EventAnalyticsService.recordEvent(
  'user_login',
  'auth-queue',
  userId,
  { 
    ip: request.ip,
    userAgent: request.headers['user-agent'],
    // ไม่เก็บ password หรือ sensitive data
  }
);
```

### 4. Performance Optimization
```typescript
// ใช้ batch operations เมื่อเป็นไปได้
const events = [...]; // array ของ events
await Promise.all(
  events.map(event => EventAnalyticsService.recordEvent(...))
);
```

## Related Documentation

- [Event Analytics Adapters](./event-analytics-adapters.md) - รายละเอียด Storage Adapters
- [Event Analytics Quickstart](./event-analytics-quickstart.md) - คู่มือเริ่มต้นใช้งาน
- [Event Bus](./event-bus.md) - ระบบ Event Bus หลัก
- [Audit Logging](./audit-logging.md) - ระบบ Audit Log (แตกต่างจาก Event Analytics)

## Roadmap

### Phase 1 (Current)
- ✅ Basic analytics และ metrics
- ✅ Storage adapter pattern
- ✅ RESTful API endpoints
- ✅ Health monitoring

### Phase 2 (Planned)
- 🔄 Real-time dashboards
- 🔄 Advanced filtering และ aggregation
- 🔄 Event correlation analysis
- 🔄 Machine learning insights

### Phase 3 (Future)
- 📋 Predictive analytics
- 📋 Anomaly detection
- 📋 Custom alerting rules
- 📋 Integration กับ external monitoring tools

---

*สร้างเมื่อ: June 2025*  
*อัพเดทล่าสุด: June 2025*  
*เวอร์ชัน: 1.0.0*
