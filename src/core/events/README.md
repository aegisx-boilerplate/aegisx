# Events Core Module

## 📊 **Overview**

Event Analytics และ Storage Adapters สำหรับ AegisX - ย้ายจาก `utils` มาเป็น `core` module เพื่อแสดงความสำคัญของ event system ในการทำงานของระบบ

## 🏗️ **Architecture**

```
src/core/events/
├── index.ts                    # Main exports
├── event-analytics.ts          # Event analytics service & routes
├── event-analytics.schema.ts   # Event analytics schemas
└── adapters/
    ├── event-storage.adapter.ts   # Storage adapters (Memory, Database, Hybrid)
    └── event-storage.factory.ts   # Adapter factory pattern
```

## 🚀 **Quick Start**

### **Basic Usage**
```typescript
import { EventAnalyticsService } from '../core/events';

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
} from '../core/events';

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

## 📈 **Storage Adapters**

### **1. Memory Storage Adapter**
- ⚡ เร็วมาก (in-memory)
- 🧪 เหมาะสำหรับ development และ testing
- ⚠️ หายเมื่อ restart server

### **2. Database Storage Adapter**
- 💾 Persistent storage
- 📊 Query ได้ซับซ้อน
- 🏭 เหมาะสำหรับ production

### **3. Hybrid Storage Adapter** (แนะนำ)
- ⚡ เร็ว (recent data จาก memory)
- 💾 Persistent (historical data ใน database)
- 🎯 ความสมดุลที่ดีที่สุด

## 🛠️ **Development**

### **Import Paths**
หลังจากย้ายมา core module แล้ว imports จะเป็น:

```typescript
// ✅ ใหม่ (core module)
import { EventAnalyticsService } from '../core/events';
import { EventStorageAdapterFactory } from '../core/events';

// ❌ เก่า (utils)
import { EventAnalyticsService } from '../utils/event-analytics';
import { EventStorageAdapterFactory } from '../utils/adapters/event-storage.factory';
```

### **Integration**
Events core module integrate กับ modules อื่นๆ ดังนี้:

- **auth module**: ใช้ `EventAnalyticsService` เพื่อ track login events
- **user module**: ใช้ `EventAnalyticsService` เพื่อ track user activities
- **audit module**: อ่าน event data สำหรับ compliance reporting

## 📚 **Documentation**

- [Event Analytics Adapters Guide](../../docs/event-analytics-adapters.md)
- [Event Analytics Quick Start](../../docs/event-analytics-quickstart.md)
- [Event-Driven Architecture](../../docs/event-driven-architecture.md)

## 🔄 **Migration Notes**

การย้ายจาก `utils` ไป `core/events`:

1. **Import paths** อัปเดตแล้วทั้งหมด
2. **Functionality** ไม่เปลี่ยนแปลง
3. **Configuration** ยังใช้ environment variables เดิม
4. **API endpoints** ยังเป็น `/events/*` เหมือนเดิม

Events core module ตอนนี้แสดงความสำคัญของ event system ในสถาปัตยกรรมของ AegisX! 🎯
