# เปรียบเทียบ Audit Log vs Event System ใน AegisX

## 📋 ภาพรวม

เอกสารนี้อธิบายความแตกต่างและความสัมพันธ์ระหว่างระบบ **Audit Log** และ **Event System** ใน AegisX ซึ่งทั้งสองระบบทำงานร่วมกันแต่มีวัตถุประสงค์และการใช้งานที่แตกต่างกัน

---

## 🎯 ความแตกต่างหลัก

| ประเด็น | Audit Log System | Event Analytics System |
|---------|------------------|------------------------|
| **วัตถุประสงค์หลัก** | การตรวจสอบและปฏิบัติตามกฎระเบียบ | การวิเคราะห์และติดตามแบบเรียลไทม์ |
| **การจัดเก็บข้อมูล** | ฐานข้อมูลถาวร (`audit_logs` table) | Storage Adapters (Memory/DB/Hybrid) |
| **ความคงทนของข้อมูล** | ถาวร (ไม่ลบ) | ชั่วคราว (อาจลบหลังวิเคราะห์) |
| **จุดเน้น** | ความปลอดภัย, การปฏิบัติตามกฎหมาย | ประสิทธิภาพ, การวิเคราะห์ |
| **ผู้ใช้หลัก** | เจ้าหน้าที่ Compliance, ผู้ตรวจสอบ | Developer, DevOps, Business Analyst |
| **รูปแบบข้อมูล** | Structured (actor, action, target) | Flexible (type, queue, metrics) |

---

## 📝 Audit Log System

### **วัตถุประสงค์**
- 🔒 **การตรวจสอบความปลอดภัย**: ติดตามการกระทำที่สำคัญทั้งหมด
- 📋 **การปฏิบัติตามกฎระเบียบ**: สร้าง audit trail สำหรับการตรวจสอบ
- ⚖️ **หลักฐานทางกฎหมาย**: บันทึกที่สามารถใช้เป็นหลักฐานได้
- 🕵️ **การสืบสวน**: วิเคราะห์เหตุการณ์ที่ผิดปกติ

### **คุณสมบัติหลัก**
```typescript
interface AuditLogEvent {
  userId?: string;        // ผู้กระทำ
  action: string;         // การกระทำ เช่น 'user.login', 'api_key.revoke'
  resource: string;       // ทรัพยากร เช่น 'user', 'api_key'
  resourceId?: string;    // ID ของทรัพยากร
  details?: object;       // รายละเอียดเพิ่มเติม
  ip?: string;           // IP Address
  userAgent?: string;    // User Agent
  timestamp: string;     // เวลาที่เกิดเหตุการณ์
}
```

### **การจัดเก็บข้อมูล**
- ✅ **ฐานข้อมูลหลัก**: บันทึกลงตาราง `audit_logs`
- ✅ **Offline Fallback**: บันทึกลงไฟล์เมื่อ RabbitMQ ไม่พร้อมใช้งาน
- ✅ **การ Replay**: สามารถนำข้อมูลจากไฟล์กลับเข้าระบบได้

### **API Endpoints**
```bash
GET /audit-logs                    # รายการ audit logs
GET /audit-logs/:id                # รายละเอียด audit log
GET /audit-logs/stats              # สถิติ audit logs
```

---

## 📊 Event Analytics System

### **วัตถุประสงค์**
- 📈 **การติดตามประสิทธิภาพ**: Real-time monitoring ของระบบ
- 👥 **การวิเคราะห์พฤติกรรม**: รูปแบบการใช้งานของผู้ใช้
- 🚨 **การแจ้งเตือน**: ตั้งค่า alerts สำหรับเหตุการณ์ผิดปกติ
- 📊 **Business Intelligence**: ข้อมูลเชิงลึกเพื่อการตัดสินใจ

### **คุณสมบัติหลัก**
```typescript
interface EventMetrics {
  totalEvents: number;                    // จำนวน events ทั้งหมด
  eventsByType: Record<string, number>;   // แยกตาม event type
  eventsByQueue: Record<string, number>;  // แยกตาม message queue
  recentEvents: RecentEvent[];            // events ล่าสุด
  systemHealth: HealthStatus;             // สถานะสุขภาพระบบ
}
```

### **Storage Adapters**
1. **Memory Adapter** 🚀
   - เร็วที่สุด
   - เหมาะสำหรับ real-time analytics
   - ข้อมูลหายเมื่อ restart

2. **Database Adapter** 💾
   - ข้อมูลคงทน
   - เหมาะสำหรับ historical analysis
   - ช้ากว่า memory

3. **Hybrid Adapter** ⚡
   - รวมข้อดีของทั้งสอง
   - Recent data ใน memory, old data ใน database
   - สมดุลระหว่างความเร็วและความคงทน

### **API Endpoints**
```bash
GET /events/health                  # สุขภาพระบบ
GET /events/metrics                 # event metrics
GET /events/users/:userId/stats     # สถิติผู้ใช้
GET /events/export                  # export ข้อมูล
```

---

## 🔄 การทำงานร่วมกัน

### **Event Flow Architecture**
```
การกระทำของผู้ใช้
    ↓
Controller → Response
    ↓
Event Publishing → RabbitMQ
    ↓
┌─────────────────┬─────────────────┐
│   Audit Consumer │ Analytics Consumer │
│   (ฐานข้อมูล)    │  (Analytics Store) │
└─────────────────┴─────────────────┘
```

### **Integration Points**

1. **Event Bus Integration**
   ```typescript
   // การส่ง event เดียวกันไปทั้งสองระบบ
   await EventPublisher.auditLog({
     userId: 'user123',
     action: 'user.login',
     resource: 'auth',
     details: { ip: '192.168.1.1' }
   });
   // ↓ ไปยัง audit.log queue
   // ↓ ไปยัง analytics processing
   ```

2. **Complementary Data**
   - **Audit**: "เกิดอะไรขึ้น?" → เพื่อการปฏิบัติตามกฎระเบียบ
   - **Analytics**: "ทำงานเป็นอย่างไร?" → เพื่อการปรับปรุงระบบ

3. **Different Retention Policies**
   - **Audit Logs**: เก็บถาวรตามกฎหมาย (7+ ปี)
   - **Event Analytics**: เก็บระยะสั้น (1-3 เดือน) เพื่อการวิเคราะห์

---

## 🎪 เมื่อไหร่ควรใช้ระบบไหน

### **ใช้ Audit Log เมื่อ** 🔍
- ติดตามการเข้าสู่ระบบและการออกจากระบบ
- บันทึกการเปลี่ยนแปลงข้อมูลสำคัญ
- ติดตามการใช้งาน API Key
- เตรียมข้อมูลสำหรับการตรวจสอบ
- สืบสวนเหตุการณ์ความปลอดภัย

**ตัวอย่าง Use Cases:**
```typescript
// การเข้าสู่ระบบล้มเหลว
await AuditLogger.logAuth({
  userId: username,
  action: 'login.failed',
  ip: request.ip,
  reason: 'Invalid password'
});

// การลบข้อมูลสำคัญ
await AuditLogger.logUserManagement({
  actorId: adminId,
  action: 'user.deleted',
  targetUserId: deletedUserId
});
```

### **ใช้ Event Analytics เมื่อ** 📈
- ติดตามประสิทธิภาพระบบ
- วิเคราะห์รูปแบบการใช้งาน
- สร้าง dashboard แบบเรียลไทม์
- ตั้งค่าการแจ้งเตือนอัตโนมัติ
- วิเคราะห์ user behavior

**ตัวอย่าง Use Cases:**
```typescript
// บันทึก event สำหรับ analytics
await EventAnalyticsService.recordEvent(
  'user.profile_viewed',
  'user.events',
  userId,
  { section: 'dashboard' }
);

// ดูสถิติการใช้งาน
const metrics = await EventAnalyticsService.getEventMetrics({
  period: '24h'
});
```

---

## ⚙️ การตั้งค่าและการใช้งาน

### **Environment Variables**
```bash
# Event Analytics Configuration
EVENT_STORAGE_ADAPTER=hybrid    # memory | database | hybrid
EVENT_MEMORY_LIMIT=1000         # จำนวน events สูงสุดใน memory
EVENT_BATCH_SIZE=100            # ขนาด batch สำหรับ database operations

# Audit Log Configuration
AUDIT_OFFLINE_LOG=true          # เปิดใช้งาน offline logging
AUDIT_LOG_DIR=./logs            # directory สำหรับ offline logs
```

### **การ Initialize**
```typescript
// Event Analytics
await EventAnalyticsService.initialize();

// Audit System จะ initialize อัตโนมัติ
```

---

## 🔧 Best Practices

### **Audit Log Best Practices**
1. **บันทึกเฉพาะสิ่งสำคัญ** - อย่าบันทึก event ทุกอย่าง
2. **ใส่ context ที่เพียงพอ** - รวม IP, User Agent, รายละเอียดที่สำคัญ
3. **ไม่เก็บข้อมูลลับ** - อย่าเก็บ password หรือ sensitive data
4. **Error Handling** - อย่าให้ audit logging ทำให้ main flow หยุด

### **Event Analytics Best Practices**
1. **เลือก Storage Adapter ที่เหมาะสม** - พิจารณาจาก use case
2. **ตั้งค่า Memory Limits** - ป้องกันการใช้ memory มากเกินไป
3. **Cleanup Policy** - ตั้งค่าการลบข้อมูลเก่า
4. **Monitor Performance** - ติดตามประสิทธิภาพการทำงาน

---

## 📚 เอกสารอ้างอิง

- [Audit Logging Documentation](./audit-logging.md)
- [Event Analytics Documentation](./event-analytics.md)
- [Event Bus Documentation](./event-bus.md)
- [Event-Driven Architecture](./event-driven-architecture.md)
- [Event Analytics Quick Start](./event-analytics-quickstart.md)

---

## 💡 สรุป

**Audit Log** และ **Event Analytics** เป็นระบบที่เสริมกัน:

- **Audit Log** = **"เกิดอะไรขึ้นเพื่อการปฏิบัติตามกฎระเบียบ?"**
  - ถาวร, เน้นความปลอดภัย, สำหรับการตรวจสอบ

- **Event Analytics** = **"ระบบทำงานเป็นอย่างไร?"**
  - เรียลไทม์, เน้นประสิทธิภาพ, สำหรับการปรับปรุง

ทั้งสองระบบทำงานร่วมกันเพื่อให้ AegisX มีความสามารถในการติดตาม การวิเคราะห์ และการปฏิบัติตามกฎระเบียบอย่างครอบคลุม โดยแต่ละระบบมีจุดเน้นและวัตถุประสงค์ที่ชัดเจนและแตกต่างกัน
