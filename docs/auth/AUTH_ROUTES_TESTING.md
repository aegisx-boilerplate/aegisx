# คู่มือการทดสอบ Auth Routes

เอกสารฉบับนี้อธิบายวิธีการใช้ scripts ที่สร้างขึ้นเพื่อทดสอบ authentication routes ของ AegisX

## Scripts ที่มี

1. `scripts/test-auth-routes.js` - ทดสอบ auth routes พื้นฐานทั้งหมด
2. `scripts/test-api-key-auth.js` - ทดสอบการยืนยันตัวตนด้วย API key แบบละเอียด
3. `scripts/quick-auth-test.mjs` - ทดสอบ auth endpoints หลักอย่างรวดเร็ว (ไม่รวม email dependencies)
4. `scripts/test-db.cjs` - ทดสอบ database schema และการเชื่อมต่อ
5. `scripts/test-logic.cjs` - ทดสอบ auth service logic
6. `scripts/test-registration.cjs` - ทดสอบ registration endpoint โดยเฉพาะ
7. `test-auth.sh` - script หลักสำหรับรันการทดสอบทั้งหมด
8. `test-auth-manual.sh` - script สำหรับทดสอบ manual auth endpoints

## ขั้นตอนการใช้งาน

### วิธีที่ 1: รันการทดสอบทั้งหมด

```bash
# รันการทดสอบกับ API ที่ localhost:3000 (default)
./test-auth.sh

# รันการทดสอบกับ API ที่ URL อื่น
./test-auth.sh https://api.example.com
```

### วิธีที่ 2: รันการทดสอบเฉพาะส่วน

```bash
# ทดสอบเฉพาะ auth routes พื้นฐาน
API_URL=http://localhost:3000 node --experimental-vm-modules ./scripts/test-auth-routes.js

# ทดสอบเฉพาะการยืนยันตัวตนด้วย API key
API_URL=http://localhost:3000 node --experimental-vm-modules ./scripts/test-api-key-auth.js

# ทดสอบ auth endpoints หลักอย่างรวดเร็ว (แนะนำสำหรับการทดสอบเบื้องต้น)
node ./scripts/quick-auth-test.mjs

# ทดสอบ database schema และการเชื่อมต่อ
node ./scripts/test-db.cjs

# ทดสอบ auth service logic
node ./scripts/test-logic.cjs

# ทดสอบ registration endpoint
node ./scripts/test-registration.cjs

# เปิดโหมด debug เพื่อแสดงข้อมูลโต้ตอบ (responses) ทั้งหมด
DEBUG=true API_URL=http://localhost:3000 node --experimental-vm-modules ./scripts/test-auth-routes.js
```

## Routes ที่ทดสอบ

1. `POST /auth/register` - ลงทะเบียนผู้ใช้ใหม่
2. `POST /auth/login` - เข้าสู่ระบบ (ทั้งแบบใช้ username และ email)
3. `GET /auth/me` - ดูข้อมูลผู้ใช้ปัจจุบัน
4. `POST /auth/change-password` - เปลี่ยนรหัสผ่าน
5. `POST /auth/logout` - ออกจากระบบ
6. `POST /auth/refresh` - รีเฟรช token
7. `POST /auth/forgot-password` - ขอรีเซ็ตรหัสผ่าน
8. `POST /auth/reset-password` - รีเซ็ตรหัสผ่านด้วย token
9. `POST /auth/api-key` - สร้าง API key
10. `GET /auth/api-key` - แสดงรายการ API keys
11. `DELETE /auth/api-key/:id` - ลบ API key

## การทดสอบ API Key Authentication

Script `test-api-key-auth.js` จะทดสอบแง่มุมต่างๆ ของ API key:

1. API key ที่มีสิทธิ์เต็ม (full access)
2. API key ที่มีสิทธิ์อ่านอย่างเดียว (read-only)
3. API key ที่มีการจำกัด IP (IP whitelist)

## หมายเหตุ

- การทดสอบ reset password จะใช้ token จำลอง จึงไม่สามารถทดสอบได้อย่างสมบูรณ์
- ในการทดสอบจริง ควรดูที่ logs ของเซิร์ฟเวอร์เพื่อตรวจสอบการทำงานที่ไม่แสดงผลในการทดสอบนี้ เช่น การส่งอีเมล
- เมื่อทดสอบกับ API key IP whitelist ผลลัพธ์อาจแตกต่างกันขึ้นอยู่กับการตั้งค่าและเครือข่ายที่ใช้ทดสอบ

## การแก้ไขปัญหา

หากพบปัญหาระหว่างการทดสอบ:

1. ตรวจสอบว่าเซิร์ฟเวอร์กำลังทำงาน
2. ตรวจสอบว่ามีการตั้งค่า environment variables ที่จำเป็นทั้งหมด
3. หากใช้งาน custom authentication flow ที่ไม่ใช่แบบมาตรฐาน อาจต้องปรับปรุง scripts

## Log แบบ verbose

เพื่อดูข้อมูลโต้ตอบทั้งหมดระหว่างการทดสอบ:

```bash
DEBUG=true ./test-auth.sh
```
