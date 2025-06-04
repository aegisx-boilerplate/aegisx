import { FastifyInstance, FastifyRequest, FastifyReply, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { EventPublisher } from '../../utils/event-bus';
import { AuditLogger } from '../../utils/audit-logger';

interface ApiKeyRequestBody {
  name?: string;
  permissions?: string[];
  userId?: string;
}

interface ApiKeyEventData {
  apiKeyId?: string;
  name?: string;
  userId?: string;
  ip: string;
  userAgent: string;
  statusCode: number;
  action: 'create' | 'revoke' | 'usage' | 'list';
}

/**
 * API Key Events Plugin
 *
 * Plugin สำหรับจัดการ API key events ใน api-key module
 * ใช้ Fastify onSend hook เพื่อ publish API key events
 * หลังจากส่ง response ให้ client แล้ว (non-blocking)
 *
 * Features:
 * - API key creation events → api_key.events + audit.log queues
 * - API key usage events → api_key.events queue
 * - API key revocation events → api_key.events + audit.log queues
 * - IP tracking และ User Agent logging
 * - Async event publishing ไม่รบกวน API flow
 *
 * Location: core/api-key/ เพราะเป็น api-key-specific functionality
 */
const apiKeyEventsPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.log.info('[API-KEY-EVENTS] Plugin loaded successfully');

  // onSend hook - runs right before response is sent
  fastify.addHook('onSend', async (request: FastifyRequest, reply: FastifyReply, payload) => {
    // ตรวจสอบว่าเป็น api-key route หรือไม่
    if (!isApiKeyRoute(request)) {
      return payload;
    }

    fastify.log.info(`[API-KEY-EVENTS] Processing API key route: ${request.url} ${request.method}`);

    const eventData: ApiKeyEventData = {
      ip: request.ip,
      userAgent: request.headers['user-agent'] || 'unknown',
      statusCode: reply.statusCode,
      action: getApiKeyAction(request),
    };

    // Extract data from request body for create/revoke actions
    if (request.method === 'POST' || request.method === 'DELETE') {
      const body = (request.body as ApiKeyRequestBody) || {};
      eventData.name = body.name;
      eventData.userId = body.userId || (request as any).user?.id;
    }

    // Extract API key ID from URL for specific operations
    const apiKeyId = extractApiKeyIdFromUrl(request.url);
    if (apiKeyId) {
      eventData.apiKeyId = apiKeyId;
    }

    // Publish events asynchronously (ไม่ block response)
    setTimeout(async () => {
      try {
        fastify.log.info(`[API-KEY-EVENTS] Publishing events for action: ${eventData.action}`);
        await publishApiKeyEvents(eventData, request);
      } catch (error) {
        fastify.log.error('[API-KEY-EVENTS] Failed to publish API key events:', error);
      }
    }, 0);

    return payload;
  });
};

// Export with fastify-plugin wrapper
export default fp(apiKeyEventsPlugin);

// Also export the function directly for backward compatibility
export { apiKeyEventsPlugin };

/**
 * ตรวจสอบว่าเป็น api-key route หรือไม่
 */
function isApiKeyRoute(request: FastifyRequest): boolean {
  const url = request.routeOptions?.url || request.url;
  return url.includes('/api-keys') || url.includes('/api-key');
}

/**
 * กำหนด action จาก request method และ URL
 */
function getApiKeyAction(request: FastifyRequest): 'create' | 'revoke' | 'usage' | 'list' {
  const url = request.url;
  const method = request.method;

  if (method === 'POST' && url.includes('/api-keys')) {
    return 'create';
  }
  if (method === 'DELETE') {
    return 'revoke';
  }
  if (method === 'GET' && url.includes('/api-keys')) {
    return 'list';
  }
  // For middleware usage tracking, we'll handle this separately
  return 'usage';
}

/**
 * Extract API key ID from URL path
 */
function extractApiKeyIdFromUrl(url: string): string | null {
  const match = url.match(/\/api-keys\/([^/?]+)/);
  return match ? match[1] : null;
}

/**
 * Publish API key events ไปยัง RabbitMQ queues
 */
async function publishApiKeyEvents(
  eventData: ApiKeyEventData,
  request: FastifyRequest
): Promise<void> {
  const { action, apiKeyId, name, userId, ip, userAgent, statusCode } = eventData;
  const isSuccess = statusCode >= 200 && statusCode < 300;

  request.log.info(
    `[API-KEY-EVENTS] Publishing events - Action: ${action}, Success: ${isSuccess}, Status: ${statusCode}`
  );

  try {
    // Always publish to api_key.events queue for API key tracking
    const eventType = action === 'create' ? 'created' :
      action === 'revoke' ? 'revoked' :
        action === 'usage' ? 'used' :
          action === 'list' ? 'used' : 'used';

    await EventPublisher.apiKeyEvent({
      type: `api_key.${eventType}` as 'api_key.created' | 'api_key.revoked' | 'api_key.used',
      apiKeyId: apiKeyId || 'unknown',
      data: {
        name,
        userId,
        success: isSuccess,
        ip,
        userAgent,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    });

    // For critical actions, also publish to audit log
    if (action === 'create' || action === 'revoke') {
      await AuditLogger.logApiKey({
        actorId: userId || 'system',
        action: `api_key.${action}`,
        keyId: apiKeyId || 'unknown',
        details: {
          success: isSuccess,
          name,
          statusCode,
        },
        ip,
        userAgent,
      });
    }

    request.log.info(
      `[API-KEY-EVENTS] Successfully published ${action} events for API key: ${apiKeyId || name}`
    );
  } catch (error) {
    request.log.error('Error publishing API key events:', error);
    // ไม่ throw error เพราะไม่ต้องการให้ส่งผลกระทบต่อ main application flow
  }
}
