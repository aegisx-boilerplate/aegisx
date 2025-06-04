import { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { EventPublisher } from '../../utils/event-bus';
import { AuditLogger } from '../../utils/audit-logger';

interface RbacRequestBody {
  name?: string;
  description?: string;
  permissions?: string[];
  roleId?: string;
  permissionId?: string;
}

interface RbacEventData {
  resourceId?: string;
  resourceType: 'role' | 'permission';
  name?: string;
  description?: string;
  permissions?: string[];
  ip: string;
  userAgent: string;
  statusCode: number;
  action: 'create' | 'update' | 'delete' | 'assign' | 'revoke' | 'list' | 'get';
}

/**
 * RBAC Events Plugin
 *
 * Plugin สำหรับจัดการ RBAC events ใน rbac module
 * ใช้ Fastify onSend hook เพื่อ publish role และ permission events
 * หลังจากส่ง response ให้ client แล้ว (non-blocking)
 *
 * Features:
 * - Role management events → audit.log queue (เพราะเป็น security-critical)
 * - Permission management events → audit.log queue
 * - Role assignment/revocation events → user.events + audit.log queues
 * - IP tracking และ User Agent logging
 * - Async event publishing ไม่รบกวน RBAC management flow
 *
 * Location: core/rbac/ เพราะเป็น rbac-specific functionality
 */
const rbacEventsPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.log.info('[RBAC-EVENTS] Plugin loaded successfully');

  // onSend hook - runs right before response is sent
  fastify.addHook('onSend', async (request: FastifyRequest, reply: FastifyReply, payload) => {
    // ตรวจสอบว่าเป็น RBAC route หรือไม่
    if (!isRbacRoute(request)) {
      return payload;
    }

    fastify.log.info(`[RBAC-EVENTS] Processing RBAC route: ${request.url} ${request.method}`);

    const eventData: RbacEventData = {
      resourceType: getRbacResourceType(request),
      ip: request.ip,
      userAgent: request.headers['user-agent'] || 'unknown',
      statusCode: reply.statusCode,
      action: getRbacAction(request),
    };

    // Extract data from request body
    if (request.body) {
      const body = (request.body as RbacRequestBody) || {};
      eventData.name = body.name;
      eventData.description = body.description;
      eventData.permissions = body.permissions;
    }

    // Extract resource ID from URL
    const resourceId = extractResourceIdFromUrl(request.url, eventData.resourceType);
    if (resourceId) {
      eventData.resourceId = resourceId;
    }

    // Publish events asynchronously (ไม่ block response)
    setTimeout(async () => {
      try {
        fastify.log.info(
          `[RBAC-EVENTS] Publishing events for action: ${eventData.action} on ${eventData.resourceType}`
        );
        await publishRbacEvents(eventData, request);
      } catch (error) {
        fastify.log.error('[RBAC-EVENTS] Failed to publish RBAC events:', error);
      }
    }, 0);

    return payload;
  });
};

// Export with fastify-plugin wrapper
export default fp(rbacEventsPlugin);

// Also export the function directly for backward compatibility
export { rbacEventsPlugin };

/**
 * ตรวจสอบว่าเป็น RBAC route หรือไม่
 */
function isRbacRoute(request: FastifyRequest): boolean {
  const url = request.routeOptions?.url || request.url;
  return url.includes('/roles') || url.includes('/permissions') || url.includes('/rbac');
}

/**
 * กำหนด resource type จาก URL
 */
function getRbacResourceType(request: FastifyRequest): 'role' | 'permission' {
  const url = request.url;
  if (url.includes('/roles')) {
    return 'role';
  }
  if (url.includes('/permissions')) {
    return 'permission';
  }
  return 'role'; // default
}

/**
 * กำหนด action จาก request method และ URL
 */
function getRbacAction(
  request: FastifyRequest
): 'create' | 'update' | 'delete' | 'assign' | 'revoke' | 'list' | 'get' {
  const url = request.url;
  const method = request.method;

  if (method === 'POST') {
    if (url.includes('/assign') || url.includes('/add')) {
      return 'assign';
    }
    return 'create';
  }
  if (method === 'PUT' || method === 'PATCH') {
    return 'update';
  }
  if (method === 'DELETE') {
    if (url.includes('/revoke') || url.includes('/remove')) {
      return 'revoke';
    }
    return 'delete';
  }
  if (
    method === 'GET' &&
    (url.includes('/roles') || url.includes('/permissions')) &&
    !extractResourceIdFromUrl(url, 'role') &&
    !extractResourceIdFromUrl(url, 'permission')
  ) {
    return 'list';
  }
  if (method === 'GET') {
    return 'get';
  }
  return 'update';
}

/**
 * Extract resource ID from URL path
 */
function extractResourceIdFromUrl(url: string, resourceType: 'role' | 'permission'): string | null {
  const pattern = resourceType === 'role' ? /\/roles\/([^/?]+)/ : /\/permissions\/([^/?]+)/;
  const match = url.match(pattern);
  return match ? match[1] : null;
}

/**
 * Publish RBAC events ไปยัง RabbitMQ queues
 */
async function publishRbacEvents(eventData: RbacEventData, request: FastifyRequest): Promise<void> {
  const {
    action,
    resourceType,
    resourceId,
    name,
    description,
    permissions,
    ip,
    userAgent,
    statusCode,
  } = eventData;
  const isSuccess = statusCode >= 200 && statusCode < 300;

  request.log.info(
    `[RBAC-EVENTS] Publishing events - Action: ${action}, Resource: ${resourceType}, Success: ${isSuccess}`
  );

  try {
    // RBAC events are always security-critical, so always publish to audit log
    await AuditLogger.logRBAC({
      actorId: (request as any).user?.id || 'system',
      action: `${resourceType}.${action}`,
      targetUserId: resourceId,
      details: {
        success: isSuccess,
        resourceType,
        name,
        description,
        permissions,
        statusCode,
      },
      ip,
      userAgent,
    });

    // For role assignments/revocations, also publish to user events
    if ((action === 'assign' || action === 'revoke') && resourceType === 'role') {
      // Try to extract user ID from URL or request body
      const targetUserId = extractTargetUserIdFromRequest(request);
      if (targetUserId) {
        await EventPublisher.rbacEvent({
          type: `user.role.${action}` as 'user.role.assign' | 'user.role.revoke',
          userId: targetUserId,
          roleId: resourceId,
          data: {
            roleId: resourceId,
            roleName: name,
            success: isSuccess,
            assignedBy: (request as any).user?.id || 'system',
            ip,
            userAgent,
            timestamp: new Date().toISOString(),
          },
          timestamp: new Date().toISOString(),
        });
      }
    }

    request.log.info(
      `[RBAC-EVENTS] Successfully published ${action} events for ${resourceType}: ${name || resourceId}`
    );
  } catch (error) {
    request.log.error('Error publishing RBAC events:', error);
    // ไม่ throw error เพราะไม่ต้องการให้ส่งผลกระทบต่อ main application flow
  }
}

/**
 * Extract target user ID from request for role assignment/revocation
 */
function extractTargetUserIdFromRequest(request: FastifyRequest): string | null {
  // Try to get from request body
  const body = (request.body as any) || {};
  if (body.userId) {
    return body.userId;
  }

  // Try to get from URL params (e.g., /users/{userId}/roles/{roleId})
  const userIdMatch = request.url.match(/\/users\/([^/?]+)\/roles/);
  if (userIdMatch) {
    return userIdMatch[1];
  }

  return null;
}
