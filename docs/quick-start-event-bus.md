# Quick Start Guide - Event Bus

## Setup RabbitMQ with Docker

Start RabbitMQ using Docker Compose:

```bash
# Start all services including RabbitMQ
docker-compose up -d

# Or start just RabbitMQ
docker run -d --name rabbitmq \
  -p 5672:5672 \
  -p 15672:15672 \
  -e RABBITMQ_DEFAULT_USER=admin \
  -e RABBITMQ_DEFAULT_PASS=password \
  rabbitmq:3-management
```

## Setup Environment

```bash
# Copy environment file
cp .env.example .env

# Edit .env and update RABBITMQ_URL if needed
# RABBITMQ_URL=amqp://admin:password@localhost:5672
```

## Initialize Event Bus

```bash
# Setup event bus queues (optional - they're created automatically)
npm run setup:eventbus
```

## Test the Integration

```bash
# Start the application
npm run dev

# The event bus will automatically connect to RabbitMQ
# Check logs for "Connected to RabbitMQ successfully"
```

## Monitor RabbitMQ

- **Management UI**: http://localhost:15672
- **Username**: admin
- **Password**: password

## Usage Examples

### Publishing Events in Controllers

```typescript
import { EventPublisher } from '../../utils/event-bus';

// In your controller
await EventPublisher.auditLog({
  userId: 'user123',
  action: 'user.create',
  resource: 'user',
  details: { email: 'user@example.com' },
  timestamp: new Date().toISOString(),
});
```

### Setting up Event Consumers

Event consumers are automatically started when the application starts. Check `src/plugins/event-bus.ts` for the consumer implementations.

## Troubleshooting

### Connection Issues

```bash
# Check if RabbitMQ is running
docker ps | grep rabbitmq

# Check RabbitMQ logs
docker logs rabbitmq

# Test connection manually
telnet localhost 5672
```

### Application Logs

Look for these log messages:
- ✅ "Connected to RabbitMQ successfully"
- ✅ "Started consuming events from queue..."
- ❌ "Failed to connect to RabbitMQ"

### Queue Monitoring

1. Go to http://localhost:15672
2. Login with admin/password
3. Check "Queues and Streams" tab
4. Monitor message rates and queue depths
