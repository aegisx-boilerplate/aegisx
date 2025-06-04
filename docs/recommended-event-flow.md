# 🏗️ Recommended Event Flow Architecture

## Current Issues Analysis

### Problem: Multiple Audit Patterns
1. **Direct calls** to AuditService.create()
2. **Legacy methods** in auditEvents (auth, user, apiKey, rbac)
3. **AuditEventBuilder** for complex scenarios
4. **Mixed event publishing** causing confusion

### Solution: Unified Event-Driven Flow

## 🎯 Recommended Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Controller    │ -> │   Event Bus      │ -> │   Consumers     │
│   (Business)    │    │   (RabbitMQ)     │    │   (Workers)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                               │
                               ├── audit.log (Audit Consumer)
                               ├── user.events (Analytics, Notifications)
                               ├── api_key.events (Security Monitoring)
                               └── rbac.events (Compliance Tracking)
```

## 🔄 Event Flow Design

### 1. **Single Source of Truth: Event Bus First**
```typescript
// ALL audit events go through event bus
await EventPublisher.auditLog({
  userId: 'user123',
  action: 'user.login',
  resource: 'auth',
  details: { success: true },
  ip: req.ip,
  userAgent: req.headers['user-agent']
});
```

### 2. **Dedicated Consumers for Different Purposes**
```typescript
// Audit Consumer: Database persistence only
AuditConsumer.start() // -> writes to audit_logs table

// Analytics Consumer: Real-time metrics
AnalyticsConsumer.start() // -> updates dashboards, metrics

// Security Consumer: Threat detection
SecurityConsumer.start() // -> monitors suspicious activities

// Notification Consumer: Alerts and emails
NotificationConsumer.start() // -> sends alerts for critical events
```

## 🎯 Implementation Strategy

### Phase 1: Standardize Event Publishing
```typescript
// Single unified audit utility
export class AuditLogger {
  static async log(data: {
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: Record<string, any>;
    ip?: string;
    userAgent?: string;
  }) {
    // Always publish to event bus
    await EventPublisher.auditLog({
      ...data,
      timestamp: new Date().toISOString()
    });
  }
}
```

### Phase 2: Consumer Separation
```typescript
// Audit Consumer: Only database writes
export class AuditConsumer {
  static async handleEvent(event: AuditLogEvent) {
    // Direct database insert (no further events)
    await knex('audit_logs').insert({
      actor: event.userId || 'system',
      action: event.action,
      target: event.resource + (event.resourceId ? `:${event.resourceId}` : ''),
      details: event.details,
      ip_address: event.ip,
      user_agent: event.userAgent,
      created_at: event.timestamp
    });
  }
}

// Analytics Consumer: Metrics and monitoring
export class AnalyticsConsumer {
  static async handleEvent(event: AuditLogEvent) {
    // Update real-time metrics
    await updateDashboard(event);
    await trackUserActivity(event);
  }
}
```

### Phase 3: Legacy Method Migration
```typescript
// Migrate legacy methods to use unified logger
export const auditEvents = {
  auth: {
    async recordLogin(data: LoginData) {
      return AuditLogger.log({
        userId: data.userId,
        action: data.success ? 'login.success' : 'login.failed',
        resource: 'auth',
        details: { reason: data.reason },
        ip: data.ip,
        userAgent: data.userAgent
      });
    }
  },
  // ... other legacy methods
};
```

## ✅ Benefits

### 1. **Single Event Flow**
- All events go through same path
- No mixed patterns
- Easier to debug and monitor

### 2. **Separation of Concerns**
- Database writes = Audit Consumer
- Analytics = Analytics Consumer  
- Security monitoring = Security Consumer
- Notifications = Notification Consumer

### 3. **Scalability**
- Easy to add new consumers
- Independent scaling of each concern
- No coupling between different event processing

### 4. **Reliability**
- Event durability in RabbitMQ
- Retry mechanisms
- Offline fallback logging

## 🔧 Migration Steps

### Step 1: Create Unified AuditLogger
```typescript
// Replace direct AuditService calls with event-first approach
```

### Step 2: Separate Consumer Responsibilities
```typescript
// Split current AuditConsumer into specialized consumers
```

### Step 3: Update All Event Publishers
```typescript
// Standardize all audit event publishing to use AuditLogger
```

### Step 4: Remove Direct Database Calls
```typescript
// Ensure ALL audit logging goes through event bus
```

## 🚨 Important Considerations

### 1. **No Infinite Loops**
- Consumers must NOT publish audit events
- Use direct database operations in consumers
- Clear separation: Publishers vs Consumers

### 2. **Event Ordering**
- Use message ordering if sequence matters
- Consider event timestamps for chronological ordering

### 3. **Error Handling**
- Fallback mechanisms when RabbitMQ is down
- Dead letter queues for failed processing
- Monitoring and alerting for consumer failures

### 4. **Performance**
- Batch processing in consumers where possible
- Proper queue prefetch settings
- Monitor queue lengths and processing times

## 📊 Monitoring & Observability

### 1. **Event Bus Metrics**
```typescript
// Monitor queue lengths, processing times, error rates
await EventBusMonitor.getMetrics();
```

### 2. **Consumer Health Checks**
```typescript
// Ensure all consumers are running and processing events
await ConsumerHealthCheck.run();
```

### 3. **Event Tracing**
```typescript
// Trace event flow from publisher to final processing
await EventTracer.trace(eventId);
```
