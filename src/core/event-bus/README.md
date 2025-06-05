# AegisX Universal Event Bus

เป็น Universal Event Bus สำหรับ AegisX ที่ใช้ RabbitMQ เป็น message broker รองรับการ publish และ consume events แบบ type-safe

## 🏗️ Architecture

```
/src/core/event-bus/
├── EventBus.ts          # Core EventBus class (RabbitMQ adapter)
├── EventPublisher.ts    # Publisher helper functions
├── EventConsumer.ts     # Consumer helper functions
├── types.ts             # Event type definitions
├── queues.ts            # Queue configuration
└── index.ts             # Main exports
```

## ⚙️ Configuration

### Environment Variables

```bash
# Event Bus Configuration
EVENT_BUS_EXCHANGE=aegisx_events           # Exchange name
EVENT_BUS_EXCHANGE_TYPE=topic              # Exchange type
EVENT_BUS_DURABLE=true                     # Durable exchanges/queues
EVENT_BUS_QUEUE_PREFIX=aegisx              # Queue name prefix
```

### Default Queues

```typescript
export const QUEUES = {
  AUDIT_LOG: 'aegisx.audit.log',
  USER_EVENTS: 'aegisx.user.events',
  API_KEY_EVENTS: 'aegisx.api_key.events',
  RBAC_EVENTS: 'aegisx.rbac.events',
  EMAIL_NOTIFICATIONS: 'aegisx.email.notifications',
  SYSTEM_ALERTS: 'aegisx.system.alerts',
} as const;
```

## 📝 Event Types

### Base Event

ทุก event ควรสืบทอดจาก `BaseEvent`:

```typescript
interface BaseEvent {
  timestamp: string;
  version?: string;
  correlationId?: string;
  source?: string;
  meta?: Record<string, any>;
}
```

### Available Event Types

- **AuditLogEvent** - Audit logs
- **UserEvent** - User operations (created, updated, deleted, login, logout)
- **ApiKeyEvent** - API key operations (created, revoked, used)
- **RBACEvent** - Role-based access control events

## 🚀 Usage

### Publishing Events

```typescript
import { EventPublisher } from '@/core/event-bus';

// Audit log
await EventPublisher.auditLog({
  userId: '123',
  action: 'user.login',
  resource: 'auth',
  timestamp: new Date().toISOString(),
});

// User event
await EventPublisher.userEvent({
  type: 'user.created',
  userId: '123',
  data: { email: 'user@example.com' },
  timestamp: new Date().toISOString(),
});
```

### Consuming Events

```typescript
import { EventConsumer, AuditLogEvent } from '@/core/event-bus';

// Start audit log consumer
await EventConsumer.startAuditLogConsumer(async (event: AuditLogEvent) => {
  console.log('Received audit event:', event);
  // Process the event
});
```

### Direct Event Bus Usage

```typescript
import { eventBus } from '@/core/event-bus';

// Connect
await eventBus.connect();

// Publish custom event
await eventBus.publishEvent('custom.queue', { data: 'example' });

// Consume custom event
await eventBus.consumeEvent('custom.queue', async (data) => {
  console.log('Received:', data);
});

// Disconnect
await eventBus.disconnect();
```

## 🔒 Features

### ✅ Type Safety
- TypeScript interfaces สำหรับทุก event type
- Compile-time validation

### ✅ Configurable
- ตั้งค่า exchange, queue, binding pattern ได้
- Environment-based configuration

### ✅ Offline Fallback
- Audit logs จะ fallback เขียนไฟล์หาก RabbitMQ ไม่พร้อมใช้งาน

### ✅ Connection Management
- Auto-reconnection handling
- Graceful shutdown support

### ✅ Error Handling
- Retry mechanism via RabbitMQ
- Dead letter queue support

## 🌍 Universal Design

Event Bus นี้ออกแบบให้เป็น Universal Core สามารถนำไปใช้กับโปรเจกต์อื่นได้:

1. **Configurable Prefix** - ชื่อ queue ปรับได้ผ่าน `EVENT_BUS_QUEUE_PREFIX`
2. **Environment-based Config** - ทุกการตั้งค่าผ่าน environment variables
3. **Extensible Event Types** - เพิ่ม event type ใหม่ได้ง่าย
4. **Adapter Pattern** - สามารถเปลี่ยน message broker ได้โดยไม่แก้ interface

## 📊 Best Practices

### Event Schema

```typescript
// แนะนำรูปแบบ event ที่สมบูรณ์
{
  "type": "user.created",
  "version": "1.0.0",
  "correlationId": "uuid-xxx",
  "source": "user-service",
  "timestamp": "2024-06-05T15:00:00Z",
  "userId": "123",
  "data": {
    "email": "user@example.com"
  },
  "meta": {
    "ip": "192.168.1.1",
    "userAgent": "Mozilla/5.0..."
  }
}
```

### Multiple Consumers

```typescript
// แต่ละ consumer ทำหน้าที่เฉพาะ
class AuditPersistenceConsumer {
  // เขียน database อย่างเดียว
}

class AuditAnalyticsConsumer {
  // ทำ analytics อย่างเดียว
}

class AuditNotificationConsumer {
  // ส่ง notification อย่างเดียว
}
```

## 🔧 Development

### Starting Consumers

```typescript
import { AuditConsumerManager } from '@/core/audit/audit.consumer';

// Start all audit consumers
await AuditConsumerManager.startAll();

// Check status
const status = AuditConsumerManager.getAllStatus();
console.log(status); // { persistence: true, analytics: true, notifications: true }
```

### Health Check

```typescript
// Check connection status
const isHealthy = eventBus.isConnectionOpen();
```
