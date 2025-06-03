# Event Analytics Service

## ภาพรวม

Event Analytics Service เป็นระบบวิเคราะห์และติดตาม events แบบ real-time ที่ให้ข้อมูล metrics, สถิติ, และการ monitoring ของ event-driven architecture ใน AegisX

## คุณสมบัติหลัก

### 🔍 Real-time Event Monitoring
- ติดตาม events ทั้งหมดในระบบแบบ real-time
- แสดงสถิติการใช้งานตาม event type และ queue
- รองรับการกรองข้อมูลตามช่วงเวลา

### 📊 Event Metrics & Analytics
- จำนวน events ทั้งหมดและแยกตาม type
- การกระจายของ events ตาม message queue
- Recent activity tracking
- Performance และ health monitoring

### 👤 User-specific Statistics
- สถิติการใช้งานของแต่ละ user
- ประวัติ activity ของ user
- Behavior pattern analysis

### 📤 Data Export
- Export ข้อมูลในรูปแบบ JSON และ CSV
- กรองข้อมูลตาม time range และ limit
- เหมาะสำหรับ data analysis และ reporting

## API Endpoints

### 1. Health Check
```http
GET /events/health
```

**Response:**
```json
{
  "success": true,
  "health": {
    "status": "healthy",
    "message": "Event system is operating normally",
    "uptime": 123.45
  },
  "timestamp": "2025-06-03T01:18:41.699Z"
}
```

**Health Status:**
- `healthy`: ระบบทำงานปกติ
- `warning`: มีข้อควรระวัง เช่น ไม่มี activity ล่าสุด
- `error`: มีปัญหาในระบบ

### 2. Event Metrics
```http
GET /events/metrics
GET /events/metrics?period=1h
GET /events/metrics?start=2025-06-01T00:00:00Z&end=2025-06-02T00:00:00Z
```

**Query Parameters:**
- `period` (optional): `1h`, `24h`, `7d`, `30d`
- `start` (optional): ISO date string
- `end` (optional): ISO date string

**Response:**
```json
{
  "success": true,
  "data": {
    "totalEvents": 15,
    "eventsByType": {
      "user.login": 5,
      "user.create": 3,
      "user.update": 2,
      "inventory.create": 3,
      "budget.update": 2
    },
    "eventsByQueue": {
      "user.events": 10,
      "audit.log": 3,
      "inventory.events": 2
    },
    "recentEvents": [
      {
        "type": "user.login",
        "queue": "user.events",
        "timestamp": "2025-06-03T01:21:20.950Z",
        "userId": "admin1"
      }
    ],
    "systemHealth": {
      "status": "healthy",
      "message": "Event system is operating normally",
      "uptime": 456.78
    }
  },
  "timestamp": "2025-06-03T01:21:32.574Z"
}
```

### 3. User Statistics
```http
GET /events/users/{userId}/stats
GET /events/users/{userId}/stats?period=7d
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "admin1",
    "totalEvents": 8,
    "eventsByType": {
      "user.login": 3,
      "user.update": 2,
      "inventory.create": 3
    },
    "recentActivity": [
      {
        "type": "user.login",
        "queue": "user.events",
        "timestamp": "2025-06-03T01:21:20.950Z"
      }
    ]
  },
  "timestamp": "2025-06-03T01:21:59.749Z"
}
```

### 4. Data Export
```http
GET /events/export?format=json
GET /events/export?format=csv&limit=100
GET /events/export?format=json&period=24h&userId=admin1
```

**Query Parameters:**
- `format` (required): `json` หรือ `csv`
- `limit` (optional): จำนวน events ที่ต้องการ (default: 100)
- `period` (optional): ช่วงเวลา `1h`, `24h`, `7d`, `30d`
- `userId` (optional): กรองเฉพาะ user
- `eventType` (optional): กรองเฉพาะ event type

**JSON Response:**
```json
[
  {
    "type": "user.login",
    "queue": "user.events",
    "timestamp": "2025-06-03T01:21:20.950Z",
    "userId": "admin1",
    "data": {
      "ip": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "success": true
    }
  }
]
```

**CSV Response:**
```csv
timestamp,type,queue,userId
2025-06-03T01:21:20.950Z,user.login,user.events,admin1
2025-06-03T01:20:15.123Z,user.create,user.events,admin1
```

## การใช้งาน

### 1. Real-time Monitoring Dashboard

```bash
# ดู health status
curl http://localhost:3000/events/health

# ดู metrics ปัจจุบัน
curl http://localhost:3000/events/metrics

# ดู metrics ของ 1 ชั่วโมงที่ผ่านมา
curl "http://localhost:3000/events/metrics?period=1h"
```

### 2. User Activity Monitoring

```bash
# ดูสถิติของ user คนหนึ่ง
curl http://localhost:3000/events/users/admin1/stats

# ดูสถิติของ user ใน 7 วันที่ผ่านมา
curl "http://localhost:3000/events/users/admin1/stats?period=7d"
```

### 3. Data Analysis & Export

```bash
# Export ข้อมูลเป็น JSON
curl "http://localhost:3000/events/export?format=json&limit=50"

# Export ข้อมูลเป็น CSV สำหรับ analysis
curl "http://localhost:3000/events/export?format=csv&period=24h" > events.csv

# Export เฉพาะ login events
curl "http://localhost:3000/events/export?format=json&eventType=user.login"
```

## Event Types ที่รองรับ

### Authentication Events
- `user.login` - ล็อกอินสำเร็จ
- `user.login.failed` - ล็อกอินไม่สำเร็จ
- `user.logout` - ล็อกเอาต์

### User Management Events
- `user.create` - สร้าง user ใหม่
- `user.get` - ดู user profile
- `user.update` - แก้ไข user
- `user.delete` - ลบ user

### RBAC Events
- `role.assign` - มอบหมาย role
- `permission.grant` - ให้สิทธิ์
- `permission.revoke` - เพิกถอนสิทธิ์

### Business Logic Events
- `inventory.create` - สร้าง inventory item
- `inventory.update` - อัปเดต inventory
- `budget.update` - อัปเดต budget
- `requisition.create` - สร้าง requisition

## การ Integration

### 1. Event Recording ใน Plugin

```typescript
import { EventAnalyticsService } from '../utils/event-analytics';

// ใน event plugin
async function publishEvent(event: Event) {
  // Publish ไป RabbitMQ
  await eventPublisher.publish(event.queue, event);
  
  // Record สำหรับ analytics
  EventAnalyticsService.recordEvent(
    event.type,
    event.queue,
    event.userId,
    event.data
  );
}
```

### 2. Custom Event Types

```typescript
// เพิ่ม event type ใหม่ใน business logic
EventAnalyticsService.recordEvent(
  'custom.operation',
  'custom.queue',
  userId,
  { action: 'performed', result: 'success' }
);
```

## Performance Considerations

### 1. Memory Usage
- เก็บ events ล่าสุด 1,000 รายการใน memory
- Auto-cleanup เมื่อเกิน limit
- In-memory storage สำหรับ real-time performance

### 2. Response Time
- Health check: < 10ms
- Metrics calculation: < 50ms
- Data export: < 200ms (สำหรับ 100 records)

### 3. Scalability
- ไม่กระทบต่อ main application performance
- Non-blocking event recording
- Suitable สำหรับ production use

## Monitoring & Alerting

### 1. Health Monitoring
```bash
# Script สำหรับ health check
#!/bin/bash
HEALTH=$(curl -s http://localhost:3000/events/health | jq -r '.health.status')
if [ "$HEALTH" != "healthy" ]; then
  echo "ALERT: Event system unhealthy"
  # Send notification
fi
```

### 2. Performance Monitoring
```bash
# ดู event rate
curl -s "http://localhost:3000/events/metrics?period=1h" | \
  jq '.data.totalEvents'

# ดู recent activity
curl -s http://localhost:3000/events/metrics | \
  jq '.data.recentEvents[0:5]'
```

## Security Considerations

### 1. Authentication Required
- ทุก endpoint ต้อง authentication
- ใช้ JWT token เดียวกันกับ main application

### 2. Data Privacy
- ไม่เก็บ sensitive data ใน event history
- User data ถูก sanitize ก่อน recording

### 3. Access Control
- Admin เท่านั้นที่เข้าถึง analytics data ได้
- User ดูได้เฉพาะ stats ของตัวเอง

## Troubleshooting

### 1. ไม่มี Events ใน Analytics

**สาเหตุ:**
- Event plugins ไม่ได้ register EventAnalyticsService.recordEvent()
- Application เพิ่งเริ่ม ยังไม่มี activity

**วิธีแก้:**
```bash
# ตรวจสอบว่า event system ทำงาน
curl http://localhost:3000/events/status

# Generate test events
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin1", "password": "admin1"}'
```

### 2. Health Status เป็น Warning

**สาเหตุ:**
- ไม่มี recent activity ใน 5 นาที
- Application เพิ่งเริ่ม

**วิธีแก้:**
- ตรวจสอบว่า event system ทำงานปกติ
- ทำ activity เพื่อ generate events

### 3. Performance ช้า

**สาเหตุ:**
- Event history ใหญ่เกินไป
- Server resources ไม่เพียงพอ

**วิธีแก้:**
- ลด maxHistorySize ใน EventAnalyticsService
- ใช้ pagination ใน export
- Restart application เพื่อ clear memory

## Future Enhancements

### 1. Persistent Storage
- เก็บ historical data ใน database
- Long-term analytics และ trends

### 2. Advanced Analytics
- Event correlation analysis
- Performance pattern detection
- Predictive analytics

### 3. Real-time Alerts
- Webhook notifications
- Slack/Discord integration
- Automated incident response

### 4. Visualization Dashboard
- Web-based analytics dashboard
- Charts และ graphs
- Real-time data updates

---

Event Analytics Service ให้ความสามารถในการ monitor, analyze และ optimize event-driven architecture ของ AegisX อย่างครอบคลุมและมีประสิทธิภาพ
