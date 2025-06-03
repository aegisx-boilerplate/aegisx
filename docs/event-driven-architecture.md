# AegisX Event-Driven Architecture

ระบบ Event-Driven Architecture ที่ครอบคลุมทุก modules ในระบบ AegisX โดยใช้ Fastify hooks และ RabbitMQ เป็น message broker

## 🏗️ Architecture Overview

```
Request → Controller → Response → onSend Hook → Event Publishing → RabbitMQ → Event Consumers
```

## 📦 Event Plugins

### Core Module Events

#### 1. **Auth Events** (`src/core/auth/auth.events.ts`)
- **Purpose**: ติดตาม authentication activities
- **Events**: Login success/failure
- **Queues**: `user.events`, `audit.log`
- **Data**: Username, IP, User Agent, success status

#### 2. **API Key Events** (`src/core/api-key/api-key.events.ts`)
- **Purpose**: ติดตาม API key management
- **Events**: Create, revoke, usage tracking
- **Queues**: `api_key.events`, `audit.log`
- **Data**: API key ID, name, user ID, actions

#### 3. **User Events** (`src/core/user/user.events.ts`)
- **Purpose**: ติดตาม user management activities
- **Events**: Create, update, delete, role changes
- **Queues**: `user.events`, `audit.log`
- **Data**: User ID, username, email, role changes

#### 4. **RBAC Events** (`src/core/rbac/rbac.events.ts`)
- **Purpose**: ติดตาม role และ permission changes
- **Events**: Role/permission create/update/delete/assign/revoke
- **Queues**: `audit.log`, `user.events` (for assignments)
- **Data**: Role/permission details, assignments

### Business Module Events

#### 5. **Budget Events** (`src/modules/budget/budget.events.ts`)
- **Purpose**: ติดตาม financial transactions
- **Events**: Create, approve, reject, allocate, transfer
- **Queues**: `audit.log`, `user.events`
- **Data**: Budget details, amounts, department, fiscal year

#### 6. **Inventory Events** (`src/modules/inventory/inventory.events.ts`)
- **Purpose**: ติดตาม stock movements
- **Events**: Stock in/out, transfer, adjustment, audit
- **Queues**: `audit.log`, `user.events`
- **Data**: Item details, quantities, locations, suppliers

#### 7. **Requisition Events** (`src/modules/requisition/requisition.events.ts`)
- **Purpose**: ติดตาม workflow state changes
- **Events**: Submit, approve, reject, cancel, fulfill
- **Queues**: `audit.log`, `user.events`
- **Data**: Requisition details, status changes, workflow actors

## 🔌 Master Events Plugin

**Location**: `src/plugins/events.ts`

รวมทุก event plugins ไว้ในที่เดียว:
```typescript
import eventsPlugin from './plugins/events';
app.register(eventsPlugin);
```

## 🎯 Event Queues

### 1. `user.events`
- **Purpose**: User activity tracking
- **Consumers**: User analytics, activity feeds
- **Events**: Login, user management, role assignments

### 2. `audit.log`
- **Purpose**: Security และ compliance logging
- **Consumers**: Security monitoring, compliance reports
- **Events**: All critical actions (auth, RBAC, financial)

### 3. `api_key.events`
- **Purpose**: API usage tracking
- **Consumers**: API analytics, rate limiting
- **Events**: API key lifecycle และ usage

## 📊 Event Monitoring

### Status Check
```bash
curl http://localhost:3000/events/status
```

### NPM Script
```bash
npm run test:events
```

### Response Example
```json
{
  "status": "active",
  "plugins": [
    "auth-events",
    "api-key-events", 
    "user-events",
    "rbac-events",
    "budget-events",
    "inventory-events",
    "requisition-events"
  ],
  "timestamp": "2025-06-03T00:59:56.409Z",
  "message": "Event-driven architecture is running"
}
```

## 🔄 Event Flow

### 1. **Request Processing**
- User makes API request
- Controller processes business logic
- Response is prepared

### 2. **Event Publishing (onSend Hook)**
- Fastify `onSend` hook intercepts before response
- Event data is extracted from request/response
- Events are published asynchronously (non-blocking)

### 3. **Event Consumption**
- RabbitMQ delivers events to consumers
- Each consumer processes events independently
- No impact on original API response time

## 🛠️ Implementation Pattern

### Basic Event Plugin Structure
```typescript
const moduleEventsPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.addHook('onSend', async (request, reply, payload) => {
    // 1. Check if route matches
    if (!isTargetRoute(request)) return payload;
    
    // 2. Extract event data
    const eventData = extractEventData(request, reply);
    
    // 3. Publish events asynchronously
    setTimeout(async () => {
      await publishEvents(eventData, request);
    }, 0);
    
    return payload;
  });
};

export default fp(moduleEventsPlugin);
```

## ✅ Benefits

### 1. **Separation of Concerns**
- Controllers focus on business logic only
- Event publishing is handled separately
- Clean, maintainable code

### 2. **Non-Blocking Performance**
- Events published asynchronously
- No impact on API response time
- Better user experience

### 3. **Centralized Audit Trail**
- All critical actions logged automatically
- Compliance and security monitoring
- Forensic analysis capabilities

### 4. **Scalable Architecture**
- Easy to add new event types
- Independent event consumers
- Horizontal scaling support

### 5. **Real-time Tracking**
- User activity feeds
- System monitoring
- Business intelligence

## 🚀 Getting Started

### 1. **Enable Event System**
Event system is automatically loaded with the application:
```typescript
// Already included in src/app.ts
app.register(eventsPlugin);
```

### 2. **Test Event System**
```bash
# Start application
docker-compose up -d

# Test event system
npm run test:events

# Test specific events (auth)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin1", "password": "admin1"}'
```

### 3. **Monitor Events**
Check RabbitMQ management UI at http://localhost:15672
- Username: `guest`
- Password: `guest`

## 📝 Event Data Examples

### Auth Login Event
```json
{
  "type": "user.login",
  "userId": "admin1",
  "data": {
    "ip": "192.168.1.1",
    "userAgent": "curl/8.7.1",
    "timestamp": "2025-06-03T00:55:46.516Z"
  },
  "timestamp": "2025-06-03T00:55:46.516Z"
}
```

### Audit Log Event
```json
{
  "userId": "admin1",
  "action": "user.login",
  "resource": "auth", 
  "details": {
    "success": true,
    "ip": "192.168.1.1",
    "userAgent": "curl/8.7.1"
  },
  "timestamp": "2025-06-03T00:55:46.516Z",
  "ip": "192.168.1.1",
  "userAgent": "curl/8.7.1"
}
```

## 🔧 Development

### Adding New Event Plugin
1. Create event plugin file: `src/modules/yourmodule/yourmodule.events.ts`
2. Register in master events plugin: `src/plugins/events.ts`
3. Test with your module's API endpoints

### Event Plugin Template
Use existing plugins as templates and adapt for your specific module needs.

---

## 📚 Related Documentation

- [Event Bus Setup Guide](./docs/event-bus.md)
- [Event Bus Quick Start](./docs/quick-start-event-bus.md)
- [Event Bus Summary](./docs/event-bus-summary.md)
