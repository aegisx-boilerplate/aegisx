import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { eventBus, EventConsumer, AuditLogEvent, UserEvent, ApiKeyEvent } from '../utils/event-bus';

const eventBusPlugin: FastifyPluginAsync = async (fastify) => {
  // Connect to RabbitMQ when the server starts
  await eventBus.connect();

  // Register event bus instance with Fastify
  fastify.decorate('eventBus', eventBus);

  // Start event consumers
  await startEventConsumers(fastify);

  // Graceful shutdown
  fastify.addHook('onClose', async () => {
    await eventBus.disconnect();
  });
};

async function startEventConsumers(fastify: any) {
  // Audit log consumer - process audit events for analytics, alerting, etc.
  await EventConsumer.startAuditLogConsumer(async (event: AuditLogEvent) => {
    fastify.log.info('Processing audit log event:', event);

    // Example: Send alert for sensitive actions
    if (event.action.includes('delete') || event.action.includes('revoke')) {
      // Could send to alerting system, Slack, email, etc.
      fastify.log.warn('Sensitive action detected:', {
        user: event.userId,
        action: event.action,
        resource: event.resource,
        timestamp: event.timestamp,
      });
    }

    // Example: Real-time analytics
    // Could send to analytics service, update dashboards, etc.
  });

  // User events consumer - handle user lifecycle events
  await EventConsumer.startUserEventsConsumer(async (event: UserEvent) => {
    fastify.log.info('Processing user event:', event);

    switch (event.type) {
      case 'user.created':
        // Send welcome email, create default settings, etc.
        fastify.log.info(`New user created: ${event.userId}`);
        break;

      case 'user.login':
        // Update last login, check for suspicious activity, etc.
        fastify.log.info(`User logged in: ${event.userId}`);
        break;

      case 'user.deleted':
        // Cleanup user data, send notifications, etc.
        fastify.log.info(`User deleted: ${event.userId}`);
        break;
    }
  });

  // API key events consumer - handle API key lifecycle events
  await EventConsumer.startApiKeyEventsConsumer(async (event: ApiKeyEvent) => {
    fastify.log.info('Processing API key event:', event);

    switch (event.type) {
      case 'api_key.created':
        // Log API key creation, send notifications, etc.
        fastify.log.info(`New API key created: ${event.apiKeyId}`);
        break;

      case 'api_key.used':
        // Track API usage, rate limiting, analytics, etc.
        break;

      case 'api_key.revoked':
        // Cleanup, notifications, etc.
        fastify.log.info(`API key revoked: ${event.apiKeyId}`);
        break;
    }
  });
}

// Extend Fastify type definitions
declare module 'fastify' {
  interface FastifyInstance {
    eventBus: typeof eventBus;
  }
}

export default fp(eventBusPlugin, {
  name: 'event-bus',
});
