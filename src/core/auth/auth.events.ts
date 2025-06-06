import { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { EventAnalyticsService } from '../event-analytics';
import { AuditLogger } from '../../utils/audit-logger';
import { knex } from '../../db/knex';
import { QUEUES } from '../event-bus/queues';
import { ResilientEventBus } from '../event-bus';

interface AuthRequestBody {
  username?: string;
  password?: string;
}

interface AuthLoginData {
  username: string;
  ip: string;
  userAgent: string;
  statusCode: number;
}

/**
 * Auth Events Plugin
 *
 * Plugin สำหรับจัดการ authentication events ใน auth module
 * ใช้ Fastify onSend hook เพื่อ publish authentication events
 * หลังจากส่ง response ให้ client แล้ว (non-blocking)
 *
 * Features:
 * - Successful login events → user.events + audit.log queues
 * - Failed login events → audit.log queue
 * - IP tracking และ User Agent logging
 * - Async event publishing ไม่รบกวน authentication flow
 * - ใช้ eventBus ผ่าน Fastify decoration pattern แทน static imports
 *
 * Location: core/auth/ เพราะเป็น auth-specific functionality
 *
 * สาเหตุที่ใช้ fastify.eventBus แทน static EventPublisher:
 * - เป็น Fastify pattern ที่ถูกต้อง (dependency injection)
 * - ง่ายต่อการ test และ mock
 * - สามารถเข้าถึง fastify context (request, reply, logger)
 * - ป้องกัน circular dependencies
 * - ควบคุม lifecycle ผ่าน fastify plugins
 */
const authEventsPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.log.info('[AUTH-EVENTS] Plugin loaded successfully');

  // Test hook to see if any hooks work
  fastify.addHook('onRequest', async (request: FastifyRequest) => {
    if (request.url.includes('/auth/login')) {
      fastify.log.info(`[AUTH-EVENTS] onRequest hook for: ${request.url} ${request.method}`);
    }
  });

  // Try onSend hook instead - runs right before response is sent
  fastify.addHook('onSend', async (request: FastifyRequest, reply: FastifyReply, payload) => {
    // Debug: ดู request URL ทุก request
    fastify.log.info(
      `[AUTH-EVENTS] onSend hook for: ${request.url} ${request.method} Status: ${reply.statusCode}`
    );

    // ตรวจสอบว่าเป็น auth login route หรือไม่
    if (!isAuthLoginRoute(request)) {
      fastify.log.info(`[AUTH-EVENTS] Not an auth login route: ${request.url}`);
      return payload;
    }

    fastify.log.info(`[AUTH-EVENTS] Processing auth login route...`);

    const { username } = (request.body as AuthRequestBody) || {};
    if (!username) {
      fastify.log.warn('[AUTH-EVENTS] No username found in request body');
      return payload;
    }

    fastify.log.info(`[AUTH-EVENTS] Processing auth event for user: ${username}`);

    const authData: AuthLoginData = {
      username,
      ip: request.ip,
      userAgent: request.headers['user-agent'] || 'unknown',
      statusCode: reply.statusCode,
    };

    // Publish events asynchronously (ไม่ block response)
    // ใช้ setTimeout เพื่อให้แน่ใจว่า events จะถูก publish
    setTimeout(async () => {
      try {
        fastify.log.info(
          `[AUTH-EVENTS] Publishing events for ${username} with status ${authData.statusCode}`
        );
        await publishAuthenticationEvents(authData, request);
      } catch (error) {
        fastify.log.error('[AUTH-EVENTS] Failed to publish authentication events:', error);
      }
    }, 0);

    return payload;
  });
};

// Export with fastify-plugin wrapper
export default fp(authEventsPlugin);

// Also export the function directly for backward compatibility
export { authEventsPlugin };

/**
 * ตรวจสอบว่าเป็น auth login route หรือไม่
 */
function isAuthLoginRoute(request: FastifyRequest): boolean {
  const url = request.routeOptions?.url || request.url;
  return url.includes('/auth/login') && request.method === 'POST';
}

/**
 * Publish authentication events ไปยัง RabbitMQ queues
 * ปรับปรุงให้ใช้ Event Bus pattern อย่างสมบูรณ์ผ่าน Fastify instance
 */
async function publishAuthenticationEvents(
  authData: AuthLoginData,
  request: FastifyRequest
): Promise<void> {
  const { username, ip, userAgent, statusCode } = authData;
  const isSuccess = statusCode === 200;

  request.log.info(
    `[AUTH-EVENTS] Publishing events - User: ${username}, Success: ${isSuccess}, Status: ${statusCode}`
  );

  try {
    // สร้าง correlationId สำหรับ tracking events
    const correlationId = `auth-${Date.now()}-${Math.random().toString(36)}`;

    if (isSuccess) {
      // For successful logins, we need to get the actual user ID instead of username
      // The user ID should be stored in the request context by auth service
      let userId = username; // fallback to username if we can't get the actual ID

      // Try to get user ID from request context set by auth service
      if ((request as any).loginUserId) {
        userId = (request as any).loginUserId;
        request.log.info(`[AUTH-EVENTS] Found user ID in request context: ${userId}`);
      } else {
        // Try to look up user by username to get the actual UUID
        try {
          const user = await knex('users').where({ username }).orWhere({ email: username }).first();

          if (user && user.id) {
            userId = user.id;
            request.log.info(`[AUTH-EVENTS] Retrieved user ID from database: ${userId}`);
          } else {
            request.log.warn(`[AUTH-EVENTS] Could not find user ID for username: ${username}`);
          }
        } catch (dbError) {
          request.log.error('[AUTH-EVENTS] Error looking up user ID:', dbError);
        }
      }

      // ใช้ eventBus ผ่าน fastify instance แทน static EventPublisher
      const eventBus = (request.server as any).eventBus as ResilientEventBus;

      if (!eventBus) {
        request.log.error('[AUTH-EVENTS] EventBus not available on fastify instance');
        return;
      }

      // Successful login events - publish through Event Bus consistently
      const eventPromises = [
        // User events queue - for user activity tracking
        eventBus.publishEvent(QUEUES.USER_EVENTS, {
          type: 'user.login',
          userId: userId,
          data: {
            username,
            ip,
            userAgent,
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
          correlationId,
          source: 'auth-service',
          version: '1.0',
        }),

        // Audit log queue - for security monitoring
        AuditLogger.logAuthFromRequest(request, {
          userId: userId,
          action: 'user.login',
        }),

        // Analytics event through Event Bus (instead of direct call)
        eventBus.publishEvent(QUEUES.USER_EVENTS, {
          type: 'analytics.record',
          eventType: 'user.login',
          userId: userId,
          queue: 'user.events',
          data: {
            username,
            ip,
            userAgent,
            success: true,
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
          correlationId,
          source: 'auth-service',
          version: '1.0',
        }),
      ];

      await Promise.all(eventPromises);

      request.log.info(
        `[AUTH-EVENTS] Successfully published successful login events for user: ${username} (ID: ${userId})`
      );
    } else {
      // Failed login attempt - audit log only (username is fine for failed attempts)
      await AuditLogger.logAuthFromRequest(request, {
        userId: username,
        action: 'user.login.failed',
        reason: `Failed login attempt, status: ${statusCode}`,
      });

      // Record failed attempt in analytics service
      EventAnalyticsService.recordEvent('user.login.failed', 'audit.log', username, {
        ip,
        userAgent,
        success: false,
        statusCode,
      });

      request.log.info(`Published failed login event for attempted user: ${username}`);
    }
  } catch (error) {
    request.log.error('Error publishing authentication events:', error);
    // ไม่ throw error เพราะไม่ต้องการให้ส่งผลกระทบต่อ main application flow
  }
}
