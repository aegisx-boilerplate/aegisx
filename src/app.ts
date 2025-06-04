import fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { env } from './config/env';
import { setFastifyInstance } from './core/auth/auth.service';
import autoload from '@fastify/autoload';
import path from 'path';

// Create Fastify instance with TypeBox type provider
const app = fastify({ logger: true }).withTypeProvider<TypeBoxTypeProvider>();

// Healthcheck route
app.get('/health', async (req, reply) => reply.send({ status: 'ok' }));

// Register plugins
import jwtPlugin from './plugins/jwt';
import redisPlugin from './plugins/redis';
import eventBusPlugin from './plugins/event-bus';
import eventsPlugin from './plugins/events';
import fastifyHelmet from '@fastify/helmet';
import fastifyCors from '@fastify/cors';
import fastifyRateLimit from '@fastify/rate-limit';
import { swaggerConfig, swaggerUiConfig } from './config/swagger';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

app.register(fastifyHelmet);
app.register(fastifyCors, { origin: true });
app.register(fastifyRateLimit, { max: 100, timeWindow: '1 minute' });
app.register(jwtPlugin);
app.register(redisPlugin);
app.register(eventBusPlugin);
app.register(eventsPlugin); // Register all event plugins

// Register Swagger documentation
app.register(swagger, swaggerConfig as any);
app.register(swaggerUi, swaggerUiConfig);

// Register core routes
import { authRoutes } from './core/auth/auth.route';
import { userRoutes } from './core/user/user.route';
import { roleRoutes } from './core/rbac/role.route';
import { permissionRoutes } from './core/rbac/permission.route';
import { apiKeyRoutes } from './core/api-key/api-key.route';
import { auditRoutes } from './core/audit/audit.route';
import { AuditConsumerManager } from './core/audit/audit.consumer';
import { registerEventAnalyticsRoutes } from './utils/event-analytics';

app.register(authRoutes);
app.register(userRoutes);
app.register(roleRoutes);
app.register(permissionRoutes);
app.register(apiKeyRoutes);
app.register(auditRoutes);

// Register event analytics routes
app.register(registerEventAnalyticsRoutes);

// Start all audit consumers to process audit events from message queue
app.ready(async () => {
  try {
    await AuditConsumerManager.startAll();
    app.log.info('All audit consumers started successfully');
  } catch (error) {
    app.log.error('Failed to start audit consumers:', error);
  }
});

// Conditionally load modules if the directory exists
import fs from 'fs';
const modulesDir = path.join(__dirname, 'modules');
if (fs.existsSync(modulesDir)) {
  app.register(autoload, {
    dir: modulesDir,
    options: {},
    dirNameRoutePrefix: false, // autoload option: no prefix from folder name
  });
}
// Global error handler for ErrorResponse schema
import { ErrorResponse } from './schemas/error.schema';
app.setErrorHandler((error, request, reply) => {
  const statusCode = error.statusCode || 500;
  if (env.NODE_ENV !== 'production') {
    app.log.error(error);
  }
  reply.status(statusCode).send({
    statusCode,
    error: error.name || 'InternalServerError',
    message:
      env.NODE_ENV === 'production' ? 'Unexpected error' : error.message || 'Unexpected error',
    stack: env.NODE_ENV === 'production' ? undefined : error.stack,
  } as unknown as typeof ErrorResponse);
});

setFastifyInstance(app);

export default app;
