# Event Bus System for AegisX

Event Bus system ที่ใช้ RabbitMQ สำหรับการสื่อสารแบบ asynchronous ใน Fastify application

## Features

- 🚀 **Easy to use**: Simple API สำหรับ publish/consume events
- 🔄 **Async messaging**: ใช้ RabbitMQ สำหรับ reliable message delivery
- 🎯 **Type-safe**: TypeScript interfaces สำหรับ event types
- 🛡️ **Error handling**: Built-in error handling และ connection management
- 📊 **Audit logging**: Integration กับ audit log system
- 🔌 **Fastify plugin**: Easy integration กับ Fastify ecosystem

## Installation

```bash
npm install amqplib
npm install --save-dev @types/amqplib
```

## Configuration

Add RabbitMQ URL to your environment variables:

```env
RABBITMQ_URL=amqp://localhost:5672
# or for production
RABBITMQ_URL=amqp://user:password@rabbitmq-server:5672
```

## Quick Start

### 1. Register the Event Bus Plugin

```typescript
// src/app.ts
import eventBusPlugin from './plugins/event-bus';

await app.register(eventBusPlugin);
```

### 2. Publishing Events

```typescript
import { EventPublisher } from './utils/event-bus';

// Publish audit log event
await EventPublisher.auditLog({
  userId: 'user123',
  action: 'user.create',
  resource: 'user',
  resourceId: 'user456',
  details: { email: 'user@example.com' },
  timestamp: new Date().toISOString(),
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
});

// Publish user event
await EventPublisher.userEvent({
  type: 'user.created',
  userId: 'user123',
  data: { email: 'user@example.com' },
  timestamp: new Date().toISOString(),
});

// Publish API key event
await EventPublisher.apiKeyEvent({
  type: 'api_key.created',
  apiKeyId: 'key123',
  userId: 'user123',
  timestamp: new Date().toISOString(),
});
```

### 3. Consuming Events

```typescript
import { EventConsumer, AuditLogEvent } from './utils/event-bus';

// Start consuming audit log events
await EventConsumer.startAuditLogConsumer(async (event: AuditLogEvent) => {
  console.log('Received audit log:', event);
  
  // Process the event (send alerts, analytics, etc.)
  if (event.action.includes('delete')) {
    // Send alert for sensitive actions
    await sendAlert(event);
  }
});
```

### 4. Manual Event Publishing/Consuming

```typescript
import { eventBus, QUEUES } from './utils/event-bus';

// Manual publishing
await eventBus.publishEvent('custom.queue', {
  message: 'Hello World',
  timestamp: new Date().toISOString(),
});

// Manual consuming
await eventBus.consumeEvent('custom.queue', async (data) => {
  console.log('Received:', data);
}, {
  durable: true,
  prefetch: 5,
});
```

## Event Types

### Audit Log Events
```typescript
interface AuditLogEvent {
  userId?: string;
  action: string;           // e.g., 'user.create', 'api_key.revoke'
  resource: string;         // e.g., 'user', 'api_key', 'role'
  resourceId?: string;      // ID of the affected resource
  details?: Record<string, any>;
  timestamp: string;
  ip?: string;
  userAgent?: string;
}
```

### User Events
```typescript
interface UserEvent {
  type: 'user.created' | 'user.updated' | 'user.deleted' | 'user.login' | 'user.logout';
  userId: string;
  data?: Record<string, any>;
  timestamp: string;
}
```

### API Key Events
```typescript
interface ApiKeyEvent {
  type: 'api_key.created' | 'api_key.revoked' | 'api_key.used';
  apiKeyId: string;
  userId?: string;
  data?: Record<string, any>;
  timestamp: string;
}
```

## Available Queues

```typescript
export const QUEUES = {
  AUDIT_LOG: 'audit.log',
  USER_EVENTS: 'user.events',
  API_KEY_EVENTS: 'api_key.events',
  EMAIL_NOTIFICATIONS: 'email.notifications',
  SYSTEM_ALERTS: 'system.alerts',
} as const;
```

## Integration Examples

### Auth Controller Integration

```typescript
import { EventPublisher } from '../utils/event-bus';

export class AuthController {
  static async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { username, password } = request.body;
      const result = await AuthService.login(username, password);
      
      // Publish login event
      await EventPublisher.userEvent({
        type: 'user.login',
        userId: result.userId,
        data: {
          ip: request.ip,
          userAgent: request.headers['user-agent'],
        },
        timestamp: new Date().toISOString(),
      });

      return reply.send({ success: true, data: result });
    } catch (error) {
      // Publish failed login attempt
      await EventPublisher.auditLog({
        action: 'user.login.failed',
        resource: 'auth',
        details: { error: error.message },
        timestamp: new Date().toISOString(),
      });
      
      throw error;
    }
  }
}
```

### Enhanced Audit Logging

The audit log utility is automatically enhanced to publish events:

```typescript
import { logAudit } from './utils/audit-log';

// This will both save to database AND publish to event bus
await logAudit(
  'user123',
  'user.create', 
  'user:user456',
  { email: 'user@example.com' },
  { ip: '192.168.1.1', userAgent: 'Mozilla/5.0...' }
);
```

## Event Consumers

Event consumers are automatically started when the plugin is registered. They handle:

- **Audit Log Events**: Real-time alerts, analytics, compliance reporting
- **User Events**: Welcome emails, user lifecycle management, analytics
- **API Key Events**: Usage tracking, security monitoring, rate limiting

## Connection Management

The event bus handles connection management automatically:

- Auto-reconnection on connection loss
- Graceful shutdown on application exit
- Error handling and logging
- Health check methods

```typescript
// Check connection status
if (eventBus.isConnectionOpen()) {
  console.log('Event bus is connected');
}
```

## Docker Setup

Add RabbitMQ to your docker-compose.yml:

```yaml
version: '3.8'
services:
  app:
    # your app config
    environment:
      - RABBITMQ_URL=amqp://rabbitmq:5672
    depends_on:
      - rabbitmq

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"  # Management UI
    environment:
      - RABBITMQ_DEFAULT_USER=admin
      - RABBITMQ_DEFAULT_PASS=password
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq

volumes:
  rabbitmq_data:
```

## Monitoring

RabbitMQ Management UI is available at http://localhost:15672 (admin/password)

## Best Practices

1. **Always handle errors**: Don't let event publishing fail your main business logic
2. **Use appropriate prefetch**: Set prefetch counts for better load balancing
3. **Monitor queue depths**: Watch for queue buildup indicating processing issues
4. **Use durable queues**: For important events that shouldn't be lost
5. **Implement idempotency**: Handle duplicate events gracefully
6. **Log events**: Include sufficient context for debugging

## Troubleshooting

### Connection Issues
```bash
# Check if RabbitMQ is running
docker ps | grep rabbitmq

# Check connection string
echo $RABBITMQ_URL
```

### Queue Issues
- Use RabbitMQ Management UI to inspect queues
- Check consumer counts and message rates
- Monitor error logs for processing failures

### Performance Issues
- Adjust prefetch counts
- Scale consumers horizontally
- Monitor memory and CPU usage
