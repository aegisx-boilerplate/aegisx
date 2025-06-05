# Event Analytics Storage Adapters

Event Analytics ใน AegisX ใช้ **Adapter Pattern** เพื่อให้สามารถเปลี่ยน storage backend ได้ตามความต้องการ

## 🏗️ **Storage Adapters ที่มี**

### 1. **Memory Storage Adapter**
```typescript
// เก็บข้อมูลใน RAM
const adapter = new MemoryStorageAdapter(1000); // max 1000 events
```

**✅ ข้อดี:**
- เร็วมาก (in-memory)
- เหมาะสำหรับ development และ testing
- ไม่ต้องพึ่งพา database

**❌ ข้อเสีย:**
- หายเมื่อ restart server
- จำกัดขนาดตาม RAM
- ไม่เหมาะสำหรับ production

### 2. **Database Storage Adapter**
```typescript
// เก็บข้อมูลใน PostgreSQL
const adapter = new DatabaseStorageAdapter();
```

**✅ ข้อดี:**
- Persistent storage
- สามารถเก็บข้อมูลได้ไม่จำกัด
- Query ได้ซับซ้อน
- เหมาะสำหรับ production

**❌ ข้อเสิย:**
- ช้ากว่า memory
- ต้องพึ่งพา database connection
- ใช้ disk space

### 3. **Hybrid Storage Adapter** (แนะนำ)
```typescript
// รวม memory + database
const adapter = new HybridStorageAdapter(100); // 100 recent events in memory
```

**✅ ข้อดี:**
- เร็ว (recent data จาก memory)
- Persistent (historical data ใน database)
- ความสมดุลที่ดีที่สุด
- Auto fallback mechanism

**❌ ข้อเสีย:**
- ซับซ้อนกว่า single adapter
- ใช้ทั้ง memory และ disk

---

## 🔧 **Configuration**

### **Environment Variables**
```bash
# Storage adapter type
EVENT_STORAGE_ADAPTER=hybrid    # memory | database | hybrid

# Memory settings
EVENT_MEMORY_MAX_SIZE=1000      # Max events in memory adapter
EVENT_MEMORY_CACHE_SIZE=100     # Recent cache in hybrid adapter
```

### **Programmatic Configuration**
```typescript
// Import จาก core events module
import { EventStorageAdapterFactory, EventAnalyticsService } from '../core/events';

// ใช้ factory pattern
const adapter = EventStorageAdapterFactory.create({
  type: 'hybrid',
  hybrid: {
    memoryCacheSize: 50
  }
});

// หรือสร้างจาก environment
const adapter = EventStorageAdapterFactory.createFromEnv();

// Initialize service
await EventAnalyticsService.initialize(adapter);
```

---

## 📊 **Usage Examples**

### **Basic Usage**
```typescript
// Auto-initialize จาก environment
await EventAnalyticsService.recordEvent('user_login', 'auth.events', userId);

// Get metrics
const metrics = await EventAnalyticsService.getEventMetrics({
  period: '24h'
});
```

### **Custom Adapter**
```typescript
// ใช้ memory adapter สำหรับ testing
const memoryAdapter = new MemoryStorageAdapter(500);
await EventAnalyticsService.initialize(memoryAdapter);

// ใช้ database adapter สำหรับ production
const dbAdapter = new DatabaseStorageAdapter();
await EventAnalyticsService.initialize(dbAdapter);
```

### **Runtime Adapter Switching**
```typescript
// เปลี่ยน adapter ระหว่าง runtime (สำหรับ testing)
const newAdapter = new MemoryStorageAdapter();
await EventAnalyticsService.switchAdapter(newAdapter);
```

---

## 🔍 **Adapter Interface**

ทุก adapter ต้องไปementต่างๆ `IEventStorageAdapter`:

```typescript
interface IEventStorageAdapter {
  // Core operations
  initialize(): Promise<void>;
  storeEvent(event: Omit<EventData, 'id'>): Promise<EventData>;
  getEvents(filter?: FilterOptions): Promise<EventData[]>;
  
  // Analytics methods
  getEventCount(filter?: FilterOptions): Promise<number>;
  getEventsByType(filter?: FilterOptions): Promise<Record<string, number>>;
  getEventsByQueue(filter?: FilterOptions): Promise<Record<string, number>>;
  
  // Maintenance
  clearEvents(): Promise<void>;
  exportEvents(filter?: ExportOptions): Promise<string>;
  getHealthStatus(): Promise<HealthStatus>;
}
```

---

## 🏃‍♂️ **Performance Comparison**

| Operation | Memory | Database | Hybrid |
|-----------|---------|----------|---------|
| **Store Event** | ~1ms | ~10ms | ~10ms |
| **Recent Query** | ~1ms | ~50ms | ~1ms |
| **Historical Query** | N/A | ~100ms | ~100ms |
| **Export** | ~10ms | ~500ms | ~500ms |

---

## 🔄 **Adapter Selection Guide**

### **Development Environment**
```bash
EVENT_STORAGE_ADAPTER=memory
EVENT_MEMORY_MAX_SIZE=500
```
- เร็ว และ simple
- ไม่ต้อง setup database

### **Testing Environment**
```bash
EVENT_STORAGE_ADAPTER=memory
EVENT_MEMORY_MAX_SIZE=100
```
- แยก isolation ระหว่าง tests
- Clean state ทุกครั้ง

### **Staging Environment**
```bash
EVENT_STORAGE_ADAPTER=hybrid
EVENT_MEMORY_CACHE_SIZE=50
```
- ทดสอบ production-like behavior
- Balance ระหว่าง performance และ persistence

### **Production Environment**
```bash
EVENT_STORAGE_ADAPTER=hybrid
EVENT_MEMORY_CACHE_SIZE=100
```
- เร็วสำหรับ real-time queries
- Persistent สำหรับ historical analysis

---

## 🛠️ **Creating Custom Adapters**

```typescript
class RedisStorageAdapter implements IEventStorageAdapter {
  private redis: Redis;

  async initialize(): Promise<void> {
    this.redis = new Redis(process.env.REDIS_URL);
  }

  async storeEvent(event: Omit<EventData, 'id'>): Promise<EventData> {
    const id = generateId();
    const eventWithId = { ...event, id };
    await this.redis.lpush('events', JSON.stringify(eventWithId));
    return eventWithId;
  }

  // ... implement other methods
}

// Register custom adapter
const redisAdapter = new RedisStorageAdapter();
await EventAnalyticsService.initialize(redisAdapter);
```

---

## 🔄 **Migration Strategy**

### **จาก Memory ไป Database**
```typescript
// 1. Export จาก memory
const memoryData = await memoryAdapter.exportEvents({ format: 'json' });

// 2. Switch to database adapter
await EventAnalyticsService.switchAdapter(new DatabaseStorageAdapter());

// 3. Import data (manual process)
// ต้องเขียน import logic เอง
```

### **จาก Database ไป Hybrid**
```typescript
// Database data จะยังอยู่
// เพียงแค่เปลี่ยน configuration
EVENT_STORAGE_ADAPTER=hybrid
EVENT_MEMORY_CACHE_SIZE=100
```

---

## 📋 **Best Practices**

1. **ใช้ Hybrid สำหรับ Production**
   - ได้ทั้งความเร็วและ persistence

2. **Monitor Health Status**
   ```typescript
   const info = await EventAnalyticsService.getStorageInfo();
   console.log('Adapter:', info.adapterType);
   console.log('Health:', info.health);
   ```

3. **ปรับ Cache Size ตาม Load**
   - High traffic = cache size ใหญ่ขึ้น
   - Low memory = cache size เล็กลง

4. **Regular Health Checks**
   ```typescript
   setInterval(async () => {
     const health = await adapter.getHealthStatus();
     if (health.status === 'error') {
       // Alert หรือ fallback
     }
   }, 60000); // ทุก 1 นาที
   ```

5. **Graceful Degradation**
   - ถ้า database down ใน hybrid mode จะยังทำงานได้จาก memory
   - มี fallback mechanisms ทุกระดับ

Event Analytics Adapter Pattern ทำให้ระบบมีความยืดหยุ่นสูง สามารถปรับเปลี่ยนได้ตามความต้องการและสภาพแวดล้อมการใช้งาน! 🚀
