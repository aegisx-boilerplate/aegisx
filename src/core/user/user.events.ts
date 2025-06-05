import { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { EventPublisher } from '../event-bus';
import { EventAnalyticsService } from '../event-analytics';
import { AuditLogger } from '../../utils/audit-logger';

interface UserRequestBody {
  username?: string;
  email?: string;
  roleId?: string;
  password?: string;
}

interface UserEventData {
  userId?: string;
  username?: string;
  email?: string;
  roleId?: string;
  ip: string;
  userAgent: string;
  statusCode: number;
  action: 'create' | 'update' | 'delete' | 'list' | 'get' | 'role_change';
}

/**
 * User Events Plugin
 *
 * Plugin สำหรับจัดการ user events ใน user module
 * ใช้ Fastify onSend hook เพื่อ publish user management events
 * หลังจากส่ง response ให้ client แล้ว (non-blocking)
 *
 * Features:
 * - User creation events → user.events + audit.log queues
 * - User update events → user.events + audit.log queues
 * - User deletion events → user.events + audit.log queues
 * - Role change events → user.events + audit.log queues
 * - IP tracking และ User Agent logging
 * - Async event publishing ไม่รบกวน user management flow
 *
 * Location: core/user/ เพราะเป็น user-specific functionality
 */
const userEventsPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.log.info('[USER-EVENTS] Plugin loaded successfully');

  // onSend hook - runs right before response is sent
  fastify.addHook('onSend', async (request: FastifyRequest, reply: FastifyReply, payload) => {
    // ตรวจสอบว่าเป็น user route หรือไม่
    if (!isUserRoute(request)) {
      return payload;
    }

    fastify.log.info(`[USER-EVENTS] Processing user route: ${request.url} ${request.method}`);

    const eventData: UserEventData = {
      ip: request.ip,
      userAgent: request.headers['user-agent'] || 'unknown',
      statusCode: reply.statusCode,
      action: getUserAction(request),
    };

    // Extract data from request body
    if (request.body) {
      const body = (request.body as UserRequestBody) || {};
      eventData.username = body.username;
      eventData.email = body.email;
      eventData.roleId = body.roleId;
    }

    // Extract user ID from URL for specific operations
    const userId = extractUserIdFromUrl(request.url);
    if (userId) {
      eventData.userId = userId;
    }

    // Add current user context if available
    const currentUser = (request as any).user;
    if (currentUser) {
      eventData.userId = eventData.userId || currentUser.id;
    }

    // Publish events asynchronously (ไม่ block response)
    setTimeout(async () => {
      try {
        fastify.log.info(`[USER-EVENTS] Publishing events for action: ${eventData.action}`);
        await publishUserEvents(eventData, request);
      } catch (error) {
        fastify.log.error('[USER-EVENTS] Failed to publish user events:', error);
      }
    }, 0);

    return payload;
  });
};

// Export with fastify-plugin wrapper
export default fp(userEventsPlugin);

// Also export the function directly for backward compatibility
export { userEventsPlugin };

/**
 * ตรวจสอบว่าเป็น user route หรือไม่
 */
function isUserRoute(request: FastifyRequest): boolean {
  const url = request.routeOptions?.url || request.url;
  return url.includes('/users') || url.includes('/user');
}

/**
 * กำหนด action จาก request method และ URL
 */
function getUserAction(
  request: FastifyRequest
): 'create' | 'update' | 'delete' | 'list' | 'get' | 'role_change' {
  const url = request.url;
  const method = request.method;

  if (method === 'POST' && url.includes('/users')) {
    return 'create';
  }
  if (method === 'PUT' || method === 'PATCH') {
    // Check if it's a role change specifically
    if (url.includes('/role') || (request.body as any)?.roleId) {
      return 'role_change';
    }
    return 'update';
  }
  if (method === 'DELETE') {
    return 'delete';
  }
  if (method === 'GET' && url.includes('/users') && !extractUserIdFromUrl(url)) {
    return 'list';
  }
  if (method === 'GET') {
    return 'get';
  }
  return 'update';
}

/**
 * Extract user ID from URL path
 */
function extractUserIdFromUrl(url: string): string | null {
  const match = url.match(/\/users\/([^/?]+)/);
  return match ? match[1] : null;
}

/**
 * Publish user events ไปยัง RabbitMQ queues
 */
async function publishUserEvents(eventData: UserEventData, request: FastifyRequest): Promise<void> {
  const { action, userId, username, email, roleId, ip, userAgent, statusCode } = eventData;
  const isSuccess = statusCode >= 200 && statusCode < 300;

  request.log.info(
    `[USER-EVENTS] Publishing events - Action: ${action}, User: ${username || userId}, Success: ${isSuccess}`
  );

  try {
    // Map action to proper event type name
    const eventTypeMap = {
      create: 'user.created',
      update: 'user.updated',
      delete: 'user.deleted',
      list: 'user.get',
      get: 'user.get',
      role_change: 'user.updated',
    };

    const eventType = eventTypeMap[action] as
      | 'user.created'
      | 'user.updated'
      | 'user.deleted'
      | 'user.login'
      | 'user.logout';

    // Always publish to user.events queue for user activity tracking
    await EventPublisher.userEvent({
      type: eventType || 'user.updated',
      userId: userId || username || 'unknown',
      data: {
        username,
        email,
        roleId,
        success: isSuccess,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });

    // Record event in analytics service
    EventAnalyticsService.recordEvent(
      eventType || 'user.updated',
      'user.events',
      userId || username,
      {
        action,
        success: isSuccess,
        ip,
        userAgent,
        email,
        roleId,
      }
    );

    // For critical actions, also publish to audit log
    if (['create', 'update', 'delete', 'role_change'].includes(action)) {
      await AuditLogger.log({
        userId: (request as any).user?.id || 'system',
        action: `user.${action}`,
        resource: 'user',
        resourceId: userId,
        details: {
          success: isSuccess,
          targetUsername: username,
          email,
          roleId,
          statusCode,
        },
        ip,
        userAgent,
      });

      // Record audit event in analytics service
      EventAnalyticsService.recordEvent(`user.${action}`, 'audit.log', userId || username, {
        action,
        success: isSuccess,
        ip,
        userAgent,
        targetUserId: userId,
        email,
        roleId,
      });
    }

    request.log.info(
      `[USER-EVENTS] Successfully published ${action} events for user: ${username || userId}`
    );
  } catch (error) {
    request.log.error('Error publishing user events:', error);
    // ไม่ throw error เพราะไม่ต้องการให้ส่งผลกระทบต่อ main application flow
  }
}
