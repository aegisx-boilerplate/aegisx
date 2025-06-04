# 🔄 Event Flow Migration Guide

## Overview

This guide shows how to migrate from the current mixed audit patterns to a unified event-driven architecture.

## Current State Problems

### 1. **Multiple Audit Patterns**
```typescript
// ❌ Pattern 1: Direct database calls
await AuditService.create(actor, action, target, details);

// ❌ Pattern 2: Mixed event publishing
await auditEvents.auth.recordLogin({ userId, success, ip });

// ❌ Pattern 3: Builder pattern with direct EventPublisher
await AuditEventBuilder.create().actor(userId).publish();
```

### 2. **Potential Infinite Loops**
```typescript
// ❌ Consumer publishes more events
export class AuditConsumer {
  static async handleAuditEvent(event) {
    await AuditService.createWithEvent(...); // This publishes another event!
  }
}
```

### 3. **Inconsistent Data Flow**
- Some audit logs go through event bus
- Some go directly to database
- Mixed responsibilities in consumers

## ✅ Recommended Solution

### 1. **Single Unified Flow**

```typescript
// ✅ ALL audit events use the same path
import { AuditLogger } from '../utils/audit-logger';

// Simple logging
await AuditLogger.log({
  userId: 'user123',
  action: 'user.login',
  resource: 'auth',
  ip: req.ip,
  userAgent: req.headers['user-agent']
});

// Complex logging (maintains builder pattern)
await AuditEventBuilder.create()
  .actor('user123')
  .action('budget.approved')
  .resource('budget', 'budget456')
  .details({ amount: 100000 })
  .metadata(req.ip, req.headers['user-agent'])
  .publish();
```

### 2. **Separated Consumer Responsibilities**

```typescript
// ✅ Database Consumer: Only writes to database
export class AuditPersistenceConsumer {
  static async handleAuditEvent(event) {
    // Direct database insert - NO further event publishing
    await knex('audit_logs').insert({
      actor: event.userId,
      action: event.action,
      target: event.resource,
      // ...
    });
  }
}

// ✅ Analytics Consumer: Only handles metrics
export class AuditAnalyticsConsumer {
  static async handleAnalyticsEvent(event) {
    await updateDashboard(event);
    await trackUserActivity(event);
    // NO database writes
  }
}

// ✅ Notification Consumer: Only sends alerts
export class AuditNotificationConsumer {
  static async handleNotificationEvent(event) {
    await sendSecurityAlert(event);
    await notifyAdmins(event);
    // NO database writes
  }
}
```

## 🚀 Migration Steps

### Step 1: Install New Components

```typescript
// 1. Add new AuditLogger
cp src/utils/audit-logger.ts.example src/utils/audit-logger.ts

// 2. Add separated consumers
cp src/core/audit/audit.consumers.ts.example src/core/audit/audit.consumers.ts

// 3. Add unified events
cp src/core/audit/audit.events.unified.ts.example src/core/audit/audit.events.unified.ts
```

### Step 2: Update Application Bootstrap

```typescript
// src/app.ts or src/server.ts

import { AuditConsumerManager } from './core/audit/audit.consumers';

// ✅ Start all audit consumers
await AuditConsumerManager.startAll();

// Remove old consumer
// await AuditConsumer.start(); // ❌ Remove this
```

### Step 3: Migrate Direct Service Calls

```typescript
// ❌ Before: Direct database calls
import { AuditService } from '../core/audit/audit.service';
await AuditService.create(actor, action, target, details, ip, userAgent);

// ✅ After: Event-first approach
import { AuditLogger } from '../utils/audit-logger';
await AuditLogger.log({
  userId: actor,
  action: action,
  resource: target.split(':')[0],
  resourceId: target.split(':')[1],
  details: details,
  ip: ip,
  userAgent: userAgent
});
```

### Step 4: Update Legacy Event Methods

```typescript
// ❌ Before: Direct EventPublisher calls
import { EventPublisher } from '../utils/event-bus';
await EventPublisher.auditLog({
  userId: data.userId,
  action: 'login.success',
  resource: 'auth',
  // ...
});

// ✅ After: Use unified events (backward compatible)
import { auditEvents } from '../core/audit/audit.events.unified';
await auditEvents.auth.recordLogin({
  userId: data.userId,
  success: true,
  ip: data.ip,
  userAgent: data.userAgent
});
```

### Step 5: Update Controllers

```typescript
// ❌ Before: Mixed patterns in auth controller
export class AuthController {
  static async login(req, reply) {
    // Some direct audit service calls
    await AuditService.createWithEvent(...);
    
    // Some event publisher calls
    await EventPublisher.auditLog(...);
    
    // Some legacy audit events
    await auditEvents.auth.recordLogin(...);
  }
}

// ✅ After: Consistent pattern
export class AuthController {
  static async login(req, reply) {
    try {
      const result = await AuthService.login(username, password);
      
      // ✅ Single audit logging method
      await AuditLogger.logAuth({
        userId: result.userId,
        action: 'login.success',
        ip: req.ip,
        userAgent: req.headers['user-agent']
      });
      
      return reply.send({ success: true, data: result });
    } catch (error) {
      // ✅ Consistent error audit logging
      await AuditLogger.logAuth({
        userId: username,
        action: 'login.failed',
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        reason: error.message
      });
      
      throw error;
    }
  }
}
```

### Step 6: Update Complex Feature Modules

```typescript
// ✅ Feature modules continue to use builder pattern
export class BudgetController {
  static async approveBudget(req, reply) {
    const budget = await BudgetService.approve(req.params.id, req.body);
    
    // ✅ Complex audit logging using builder
    await AuditEventBuilder.create()
      .actor(req.user.id)
      .action('budget.approved')
      .resource('budget', budget.id)
      .details({
        previousStatus: budget.previousStatus,
        newStatus: budget.status,
        amount: budget.amount,
        currency: budget.currency,
        approvalNotes: req.body.notes
      })
      .metadata(req.ip, req.headers['user-agent'])
      .publish();
    
    return budget;
  }
}
```

## 🔧 Testing the Migration

### 1. **Verify Consumer Status**

```typescript
// Check all consumers are running
const status = AuditConsumerManager.getStatus();
console.log('Consumer status:', status);
// Expected: { persistence: true, analytics: true, notifications: true }
```

### 2. **Test Event Flow**

```typescript
// Send a test audit event
await AuditLogger.log({
  userId: 'test-user',
  action: 'test.action',
  resource: 'test',
  details: { test: true }
});

// Verify it appears in:
// 1. Database (audit_logs table)
// 2. Analytics logs
// 3. Notification logs (if applicable)
```

### 3. **Monitor Queue Health**

```typescript
// Check RabbitMQ queue status
// - audit.log queue should have messages flowing
// - No dead letter queue buildup
// - Consumers should be active
```

## ⚠️ Important Notes

### 1. **No Infinite Loops**
- Consumers MUST NOT publish audit events
- Use direct database operations in consumers
- Separate publishing from consuming logic

### 2. **Backward Compatibility**
- Old `auditEvents` methods still work
- `AuditEventBuilder` maintains same interface
- Gradual migration is possible

### 3. **Error Handling**
- RabbitMQ failures should not break main application flow
- Fallback to offline logging when event bus is unavailable
- Monitor consumer health and queue lengths

### 4. **Performance Considerations**
- Event publishing is async and non-blocking
- Consumer processing happens in background
- Monitor queue lengths and processing times

## 📊 Monitoring & Observability

### 1. **Consumer Health Checks**
```typescript
// Add health check endpoint
app.get('/health/audit-consumers', async (req, reply) => {
  const status = AuditConsumerManager.getStatus();
  const allRunning = Object.values(status).every(Boolean);
  
  return reply.code(allRunning ? 200 : 503).send({
    status: allRunning ? 'healthy' : 'unhealthy',
    consumers: status
  });
});
```

### 2. **Event Flow Metrics**
```typescript
// Monitor event publishing and processing rates
// Track queue lengths and processing times
// Alert on consumer failures or queue buildup
```

### 3. **Audit Trail Verification**
```typescript
// Verify audit events are properly persisted
// Check for missing events or data inconsistencies
// Monitor audit log completeness
```

## 🎯 Benefits After Migration

1. **Consistent Event Flow** - All audit events follow the same path
2. **Separation of Concerns** - Each consumer has a single responsibility
3. **Scalability** - Easy to add new consumers for different purposes
4. **Reliability** - Event durability and retry mechanisms
5. **Observability** - Clear monitoring and debugging capabilities
6. **Maintainability** - Single source of truth for audit logging

## 🚀 Next Steps

1. Complete the migration following the steps above
2. Monitor the system for a few days to ensure stability
3. Remove deprecated patterns once migration is complete
4. Add additional consumers as needed (compliance, reporting, etc.)
5. Implement advanced features like event replay, archiving, etc.
