# Audit Events Usage Guide

## Overview

The audit system is designed with two distinct approaches for different types of modules:

### 🔧 Core Modules → Legacy Methods (Simple & Direct)
- User Service
- Auth Service  
- API Key Service
- RBAC Service

### 🚀 Feature Modules → AuditEventBuilder (Flexible & Advanced)
- Budget Module
- Inventory Module
- Requisition Module
- Any custom business modules

## 📋 Core Modules Usage

Core modules use simple, predefined methods for common audit scenarios:

```typescript
import { auditEvents } from '../../core/audit/audit.events';

// Authentication events
await auditEvents.recordLogin({
  userId: 'user123',
  success: true,
  ip: req.ip,
  userAgent: req.headers['user-agent']
});

// User management events
await auditEvents.recordUserCreated({
  actorId: 'admin123',
  userId: 'user456',
  username: 'john.doe',
  email: 'john@example.com',
  ip: req.ip,
  userAgent: req.headers['user-agent']
});

// API Key events
await auditEvents.recordApiKeyCreated({
  actorId: 'user123',
  keyId: 'key456',
  name: 'Production API Key',
  scopes: ['read', 'write'],
  ip: req.ip,
  userAgent: req.headers['user-agent']
});
```

### Categorized Usage (New Syntax)

```typescript
// Authentication
await auditEvents.auth.recordLogin(data);
await auditEvents.auth.recordLogout(data);

// User Management
await auditEvents.user.recordCreated(data);
await auditEvents.user.recordUpdated(data);
await auditEvents.user.recordDeleted(data);

// API Key Management
await auditEvents.apiKey.recordCreated(data);
await auditEvents.apiKey.recordRevoked(data);

// RBAC Management
await auditEvents.rbac.recordRoleAssigned(data);
await auditEvents.rbac.recordPermissionGranted(data);
```

## 🚀 Feature Modules Usage

Feature modules use `AuditEventBuilder` for complex, flexible audit scenarios:

```typescript
import { AuditEventBuilder } from '../../core/audit/audit.events';

// Simple usage
await AuditEventBuilder.create()
  .actor('user123')
  .action('budget.created')
  .resource('budget', 'budget456')
  .details({ name: 'Q1 Marketing Budget', amount: 100000 })
  .metadata(req.ip, req.headers['user-agent'])
  .publish();

// Complex workflow tracking
await AuditEventBuilder.create()
  .actor('manager123')
  .action('requisition.approved')
  .resource('requisition', 'req789')
  .details({
    title: 'Office Supplies Request',
    totalAmount: 5000,
    currency: 'USD',
    departmentId: 'dept123',
    previousStatus: 'pending',
    newStatus: 'approved',
    approvalNotes: 'Approved for Q1 budget allocation'
  })
  .metadata(req.ip, req.headers['user-agent'])
  .publish();

// Batch operations
await AuditEventBuilder.create()
  .actor('system')
  .action('inventory.bulk_update')
  .resource('inventory', 'bulk-001')
  .details({
    operation: 'stock_adjustment',
    affected_items: 50,
    total_value_change: -2500,
    reason: 'Annual inventory audit corrections'
  })
  .metadata(req.ip, req.headers['user-agent'])
  .publish();
```

## 🏗️ Architecture Benefits

### Core Modules (Legacy Methods)
- ✅ **Simple & Fast**: Predefined methods for common scenarios
- ✅ **Type Safety**: Strict TypeScript interfaces
- ✅ **Consistency**: Standardized event formats
- ✅ **Quick Implementation**: No complex configuration needed

### Feature Modules (AuditEventBuilder)
- ✅ **Flexibility**: Build complex events with fluent API
- ✅ **Extensibility**: Easy to add new fields and details
- ✅ **Method Chaining**: Readable and maintainable code
- ✅ **Business Logic**: Perfect for complex workflows

## 🔄 Event Flow

Both approaches follow the same event-driven architecture:

```
Service → Audit Event → Message Queue → AuditConsumer → Database
                    ↓
                Real-time Processing
```

1. **Service calls audit method** (legacy or builder)
2. **Event published to RabbitMQ** queue
3. **AuditConsumer processes event** asynchronously
4. **Event persisted to database** with full audit trail
5. **Real-time analytics** and monitoring available

## 📊 Event Categories

### Authentication & Authorization
- `login.success` / `login.failed`
- `logout`
- `role.assigned`
- `permission.granted`

### User Management
- `user.created` / `user.updated` / `user.deleted`

### API Security
- `api_key.created` / `api_key.revoked`

### Business Operations
- `budget.created` / `budget.approved` / `budget.allocated`
- `inventory.stock_in` / `inventory.stock_out` / `inventory.adjusted`
- `requisition.submitted` / `requisition.approved` / `requisition.fulfilled`

## 🔧 Best Practices

### For Core Modules
1. Use predefined methods for standard operations
2. Always include IP and User-Agent for security tracking
3. Keep details minimal and focused

### For Feature Modules
1. Use AuditEventBuilder for complex business logic
2. Include rich context in details for compliance
3. Track state changes with before/after values
4. Use meaningful action names (e.g., `budget.allocated` not `budget.update`)

## 🚨 Security Considerations

- All audit events are **immutable** once created
- Events include **IP tracking** and **user agent** information
- **Actor identification** is mandatory for accountability
- Events are **asynchronously processed** to avoid blocking operations
- **Message queue** provides reliability and retry mechanisms

## 📈 Analytics Integration

Audit events automatically integrate with:
- Real-time event analytics dashboard
- Compliance reporting tools
- Security monitoring systems
- Business intelligence platforms

Access analytics at: `/api/events/analytics`
