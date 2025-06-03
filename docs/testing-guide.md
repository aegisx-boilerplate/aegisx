# Testing Guide

## การทดสอบบน Local Environment

### วิธีที่ 1: ทดสอบแบบ Isolated (ไม่ต้องใช้ Services จริง)

```bash
# ทดสอบแบบ isolated โดยใช้ mocks
npm test

# ทดสอบแบบ watch mode
npm test -- --watch

# ทดสอบพร้อม UI
npm run test:ui

# ทดสอบพร้อม coverage
npm run test:coverage
```

**ข้อดี:**
- ไม่ต้องเซ็ตอัพ database หรือ services
- รันเร็ว
- Isolated และ reliable

**ข้อเสีย:**
- ไม่ได้ทดสอบ integration จริง

### วิธีที่ 2: ทดสอบแบบ Integration กับ Local Services

#### เริ่มต้น Local Services

```bash
# เริ่ม services ทั้งหมด (PostgreSQL, Redis, RabbitMQ)
npm run setup:local

# หรือเริ่มแยกเป็นรายตัว
docker run -d --name aegisx-postgres -p 5432:5432 -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=aegisx postgres:15-alpine
docker run -d --name aegisx-redis -p 6379:6379 redis:7-alpine
docker run -d --name aegisx-rabbitmq -p 5672:5672 -p 15672:15672 -e RABBITMQ_DEFAULT_USER=admin -e RABBITMQ_DEFAULT_PASS=password rabbitmq:3-management
```

#### รันการทดสอบ

```bash
# ทดสอบหลังจากเริ่ม services แล้ว
npm run test:run

# หรือทดสอบพร้อมเริ่ม services
npm run test:local
```

#### หยุด Local Services

```bash
npm run stop:local
```

### วิธีที่ 3: ทดสอบผ่าน Docker Compose

```bash
# เริ่ม environment ทั้งหมดผ่าน Docker
docker-compose up -d

# รันการทดสอบใน container
docker-compose exec app npm run test:run

# หยุด environment
docker-compose down
```

## การตั้งค่า Environment

### Local Development (.env)
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/aegisx
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://admin:password@localhost:5672
JWT_SECRET=local-dev-secret-key-change-in-production
```

### Testing (.env.test)
```env
NODE_ENV=test
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/aegisx_test
REDIS_URL=redis://localhost:6379/1
RABBITMQ_URL=amqp://admin:password@localhost:5672
JWT_SECRET=test-secret-key-123
```

### Docker Compose (.env - ใช้ service names)
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@db:5432/aegisx
REDIS_URL=redis://redis:6379
RABBITMQ_URL=amqp://admin:password@rabbitmq:5672
JWT_SECRET=your-secret-key
```

## การแก้ไขปัญหาที่พบบ่อย

### 1. Connection Errors
```bash
# ตรวจสอบว่า services รันอยู่หรือไม่
docker ps

# ตรวจสอบ logs
docker logs aegisx-postgres
docker logs aegisx-redis
docker logs aegisx-rabbitmq
```

### 2. Database Issues
```bash
# สร้าง test database
docker exec aegisx-postgres psql -U user -d aegisx -c "CREATE DATABASE aegisx_test;"

# รัน migrations
npm run knex:migrate

# รัน seeds
npm run knex:seed
```

### 3. Port Conflicts
หากพอร์ตถูกใช้งานอยู่แล้ว ให้เปลี่ยนพอร์ตใน `.env` หรือหยุด service ที่ใช้พอร์ตนั้น

## คำแนะนำ

1. **สำหรับ Development**: ใช้ Local Services (วิธีที่ 2)
2. **สำหรับ Unit Testing**: ใช้ Isolated Testing (วิธีที่ 1)
3. **สำหรับ Integration Testing**: ใช้ Docker Compose (วิธีที่ 3)
4. **สำหรับ CI/CD**: ใช้ Docker Compose หรือ Test Containers
