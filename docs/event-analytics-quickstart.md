# Event Analytics Quick Start Guide

## 🚀 เริ่มต้นใช้งาน Event Analytics Service

Event Analytics Service ให้ข้อมูล real-time analytics และ monitoring สำหรับ event system ของ AegisX

## ⚡ Quick Setup

### 1. เปิดใช้งาน Analytics Service

Event Analytics Service เปิดใช้งานอัตโนมัติเมื่อ application เริ่มทำงาน

```bash
# เริ่ม application
npm run dev

# หรือใน Docker
docker-compose up -d
```

### 2. ตรวจสอบสถานะ System

```bash
# Health check
curl http://localhost:3000/events/health
```

**Response ที่คาดหวัง:**
```json
{
  "success": true,
  "health": {
    "status": "healthy",
    "message": "Event system is operating normally",
    "uptime": 123.45
  }
}
```

## 📊 การใช้งานพื้นฐาน

### 1. ดู Event Metrics

```bash
# ดู metrics ทั้งหมด
curl http://localhost:3000/events/metrics | jq
```

**ตัวอย่าง Response:**
```json
{
  "success": true,
  "data": {
    "totalEvents": 15,
    "eventsByType": {
      "user.login": 5,
      "user.create": 3,
      "inventory.create": 2
    },
    "eventsByQueue": {
      "user.events": 10,
      "audit.log": 5
    },
    "recentEvents": [
      {
        "type": "user.login",
        "queue": "user.events",
        "timestamp": "2025-06-03T01:21:20.950Z",
        "userId": "admin1"
      }
    ]
  }
}
```

### 2. สร้าง Events เพื่อทดสอบ

```bash
# Login เพื่อสร้าง auth events
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin1", "password": "admin1"}'

# ดู users เพื่อสร้าง user events  
TOKEN="your_jwt_token_here"
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/users
```

### 3. ดู User Statistics

```bash
# สถิติของ user คนหนึ่ง
curl http://localhost:3000/events/users/admin1/stats | jq
```

## 📈 Use Cases ที่เป็นประโยชน์

### 1. Security Monitoring

```bash
# ดู failed login attempts
curl "http://localhost:3000/events/export?format=json&eventType=user.login.failed" | jq

# ดู login activity ใน 24 ชั่วโมง
curl "http://localhost:3000/events/metrics?period=24h" | \
  jq '.data.eventsByType["user.login"]'
```

### 2. User Activity Tracking

```bash
# Top active users (ต้องใช้ jq processing)
curl -s "http://localhost:3000/events/export?format=json&period=24h" | \
  jq '[.[] | select(.userId != null) | .userId] | group_by(.) | map({user: .[0], count: length}) | sort_by(.count) | reverse'
```

### 3. System Performance Monitoring

```bash
# Event rate per hour
curl -s "http://localhost:3000/events/metrics?period=1h" | \
  jq '.data.totalEvents'

# Recent system activity  
curl -s http://localhost:3000/events/metrics | \
  jq '.data.recentEvents[0:5]'
```

## 📊 Dashboard Examples

### 1. Simple Monitoring Script

สร้างไฟล์ `monitor.sh`:

```bash
#!/bin/bash

echo "=== AegisX Event Analytics Dashboard ==="
echo "$(date)"
echo

# Health Status
echo "🏥 System Health:"
curl -s http://localhost:3000/events/health | jq -r '.health.status'
echo

# Event Counts (Last Hour)
echo "📊 Events (Last Hour):"
curl -s "http://localhost:3000/events/metrics?period=1h" | jq -r '.data.totalEvents'
echo

# Top Event Types
echo "🔥 Top Event Types:"
curl -s "http://localhost:3000/events/metrics?period=24h" | \
  jq -r '.data.eventsByType | to_entries | sort_by(.value) | reverse | .[0:5] | .[] | "\(.key): \(.value)"'
echo

# Recent Activity
echo "🕐 Recent Activity:"
curl -s http://localhost:3000/events/metrics | \
  jq -r '.data.recentEvents[0:3] | .[] | "\(.timestamp) | \(.type) | \(.userId // "system")"'
```

```bash
# เรียกใช้งาน
chmod +x monitor.sh
./monitor.sh
```

### 2. Export Data for Analysis

```bash
# Export ข้อมูล 24 ชั่วโมงเป็น CSV
curl "http://localhost:3000/events/export?format=csv&period=24h" > daily_events.csv

# ใช้ Excel หรือ Google Sheets เปิดไฟล์เพื่อ analyze
```

### 3. JSON Analysis with jq

```bash
# นับ events ของแต่ละ user
curl -s "http://localhost:3000/events/export?format=json&period=7d" | \
  jq 'group_by(.userId) | map({user: .[0].userId, events: length}) | sort_by(.events) | reverse'

# หา peak activity hours
curl -s "http://localhost:3000/events/export?format=json&period=24h" | \
  jq '[.[] | .timestamp | strptime("%Y-%m-%dT%H:%M:%S.%fZ") | strftime("%H")] | group_by(.) | map({hour: .[0], count: length}) | sort_by(.count) | reverse'
```

## 🔧 Troubleshooting

### ❓ ไม่เห็น Events ใน Analytics

1. **ตรวจสอบ Event System:**
```bash
curl http://localhost:3000/events/status
```

2. **สร้าง Test Events:**
```bash
# Login เพื่อสร้าง events
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin1", "password": "admin1"}'
```

3. **ตรวจสอบ Metrics อีกครั้ง:**
```bash
curl http://localhost:3000/events/metrics | jq '.data.totalEvents'
```

### ❓ Health Status เป็น Warning

**สาเหตุ:** Application เพิ่งเริ่ม หรือไม่มี activity

**วิธีแก้:** ทำ activity เพื่อ generate events:
```bash
# Generate user activity
TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin1", "password": "admin1"}' | jq -r '.token')

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/users
```

### ❓ Response ช้า

**วิธีแก้:** ใช้ limit ใน export:
```bash
# แทนที่จะ export ทั้งหมด
curl "http://localhost:3000/events/export?format=json&limit=50"
```

## 📱 Integration Examples

### 1. Webhook Alert

```bash
# สร้าง simple alerting script
#!/bin/bash
HEALTH=$(curl -s http://localhost:3000/events/health | jq -r '.health.status')

if [ "$HEALTH" != "healthy" ]; then
  curl -X POST https://hooks.slack.com/your/webhook/url \
    -H 'Content-type: application/json' \
    --data '{"text":"⚠️ AegisX Event System Alert: Status is '$HEALTH'"}'
fi
```

### 2. Automated Reporting

```bash
# Daily report script
#!/bin/bash
DATE=$(date +%Y-%m-%d)
REPORT_FILE="aegisx_daily_report_$DATE.json"

# Export วันนี้
curl -s "http://localhost:3000/events/export?format=json&period=24h" > $REPORT_FILE

# Send via email or upload to cloud storage
echo "Report generated: $REPORT_FILE"
```

## 🎯 Next Steps

1. **Set up Monitoring:** ใช้ monitoring script เพื่อดู system health
2. **Create Dashboards:** สร้าง dashboard สำหรับ stakeholders
3. **Set up Alerts:** ตั้ง alerting สำหรับ critical events
4. **Data Analysis:** ใช้ exported data วิเคราะห์ user behavior

## 📚 ข้อมูลเพิ่มเติม

- [Event Analytics Documentation](./event-analytics.md) - เอกสารฉบับเต็ม
- [Event Bus Documentation](./event-bus.md) - ระบบ Event Bus หลัก
- [Event-Driven Architecture](./event-driven-architecture.md) - สถาปัตยกรรมแบบ Event-driven

---

🚀 **พร้อมใช้งาน Event Analytics แล้ว!** ลองทำตาม Quick Start Guide นี้เพื่อเริ่มต้น monitoring และ analyzing events ในระบบของคุณ
