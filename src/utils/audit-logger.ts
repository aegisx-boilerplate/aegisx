import { ResilientEventBus, AuditLogEvent, QUEUES } from '../core/event-bus';
import { FastifyRequest } from 'fastify';

/**
 * Unified Audit Logger - Single source of truth for all audit events
 *
 * This replaces all direct AuditService calls and provides a consistent
 * interface for publishing audit events to the event bus.
 *
 * Updated to use Fastify dependency injection pattern instead of static EventPublisher.
 */
export class AuditLogger {
  /**
   * Log an audit event (publishes to event bus only)
   * The actual database write happens in AuditConsumer
   *
   * @param eventBus - ResilientEventBus instance from Fastify
   * @param data - Audit event data
   */
  static async log(
    eventBus: ResilientEventBus,
    data: {
      userId?: string;
      action: string;
      resource: string;
      resourceId?: string;
      details?: Record<string, any>;
      ip?: string;
      userAgent?: string;
    }
  ): Promise<void> {
    const event: AuditLogEvent = {
      userId: data.userId,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId,
      details: data.details,
      timestamp: new Date().toISOString(),
      ip: data.ip,
      userAgent: data.userAgent,
      correlationId: `audit-${Date.now()}-${Math.random().toString(36)}`,
      source: 'audit-logger',
      version: '1.0',
    };

    // Always publish to event bus - never direct database write
    await eventBus.publishEvent(QUEUES.AUDIT_LOG, event);
  }

  /**
   * Convenience method to get eventBus from FastifyRequest
   * @param request - Fastify request object
   * @param data - Audit event data
   */
  static async logFromRequest(
    request: FastifyRequest,
    data: {
      userId?: string;
      action: string;
      resource: string;
      resourceId?: string;
      details?: Record<string, any>;
      ip?: string;
      userAgent?: string;
    }
  ): Promise<void> {
    const eventBus = (request.server as any).eventBus as ResilientEventBus;
    if (!eventBus) {
      request.log.error('[AUDIT-LOGGER] EventBus not available on fastify instance');
      return;
    }

    // Auto-fill IP and UserAgent from request if not provided
    const eventData = {
      ...data,
      ip: data.ip || request.ip,
      userAgent: data.userAgent || request.headers['user-agent'] || 'unknown',
    };

    await this.log(eventBus, eventData);
  }

  /**
   * Convenience method for authentication events
   */
  static async logAuth(
    eventBus: ResilientEventBus,
    data: {
      userId: string;
      action: string;
      ip?: string;
      userAgent?: string;
      reason?: string;
    }
  ): Promise<void> {
    return this.log(eventBus, {
      userId: data.userId,
      action: data.action,
      resource: 'auth',
      resourceId: 'session',
      details: data.reason ? { reason: data.reason } : undefined,
      ip: data.ip,
      userAgent: data.userAgent,
    });
  }

  /**
   * Convenience method for user management events
   */
  static async logUserManagement(
    eventBus: ResilientEventBus,
    data: {
      actorId: string;
      action: string;
      targetUserId: string;
      details?: Record<string, any>;
      ip?: string;
      userAgent?: string;
    }
  ): Promise<void> {
    return this.log(eventBus, {
      userId: data.actorId,
      action: data.action,
      resource: 'user',
      resourceId: data.targetUserId,
      details: data.details,
      ip: data.ip,
      userAgent: data.userAgent,
    });
  }

  /**
   * Convenience method for role management events
   */
  static async logRoleManagement(
    eventBus: ResilientEventBus,
    data: {
      actorId: string;
      action: string;
      roleId?: string;
      targetUserId?: string;
      details?: Record<string, any>;
      ip?: string;
      userAgent?: string;
    }
  ): Promise<void> {
    return this.log(eventBus, {
      userId: data.actorId,
      action: data.action,
      resource: 'role',
      resourceId: data.roleId || data.targetUserId,
      details: data.details,
      ip: data.ip,
      userAgent: data.userAgent,
    });
  }

  /**
   * Convenience method for resource access events
   */
  static async logResourceAccess(
    eventBus: ResilientEventBus,
    data: {
      userId: string;
      action: string;
      resource: string;
      resourceId?: string;
      success?: boolean;
      details?: Record<string, any>;
      ip?: string;
      userAgent?: string;
    }
  ): Promise<void> {
    return this.log(eventBus, {
      userId: data.userId,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId,
      details: {
        ...data.details,
        success: data.success,
      },
      ip: data.ip,
      userAgent: data.userAgent,
    });
  }

  /**
   * Convenience method for system events
   */
  static async logSystem(
    eventBus: ResilientEventBus,
    data: {
      action: string;
      resource: string;
      resourceId?: string;
      details?: Record<string, any>;
      triggeredBy?: string;
    }
  ): Promise<void> {
    return this.log(eventBus, {
      userId: data.triggeredBy,
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId,
      details: data.details,
    });
  }

  /**
   * Convenience method for API key events
   */
  static async logApiKey(
    eventBus: ResilientEventBus,
    data: {
      actorId: string;
      action: string;
      keyId: string;
      details?: Record<string, any>;
      ip?: string;
      userAgent?: string;
    }
  ): Promise<void> {
    return this.log(eventBus, {
      userId: data.actorId,
      action: data.action,
      resource: 'api_key',
      resourceId: data.keyId,
      details: data.details,
      ip: data.ip,
      userAgent: data.userAgent,
    });
  }

  /**
   * Convenience method for RBAC events
   */
  static async logRBAC(
    eventBus: ResilientEventBus,
    data: {
      actorId: string;
      action: string;
      targetUserId?: string;
      roleId?: string;
      permission?: string;
      details?: Record<string, any>;
      ip?: string;
      userAgent?: string;
    }
  ): Promise<void> {
    return this.log(eventBus, {
      userId: data.actorId,
      action: data.action,
      resource: 'rbac',
      resourceId: data.targetUserId || data.roleId || data.permission,
      details: {
        ...data.details,
        targetUserId: data.targetUserId,
        roleId: data.roleId,
        permission: data.permission,
      },
      ip: data.ip,
      userAgent: data.userAgent,
    });
  }

  // Request-based convenience methods (recommended approach)

  /**
   * Convenience method for authentication events using request
   */
  static async logAuthFromRequest(
    request: FastifyRequest,
    data: {
      userId: string;
      action: string;
      reason?: string;
    }
  ): Promise<void> {
    return this.logFromRequest(request, {
      userId: data.userId,
      action: data.action,
      resource: 'auth',
      resourceId: 'session',
      details: data.reason ? { reason: data.reason } : undefined,
    });
  }

  /**
   * Convenience method for RBAC events using request
   */
  static async logRBACFromRequest(
    request: FastifyRequest,
    data: {
      actorId: string;
      action: string;
      targetUserId?: string;
      roleId?: string;
      permission?: string;
      details?: Record<string, any>;
    }
  ): Promise<void> {
    return this.logFromRequest(request, {
      userId: data.actorId,
      action: data.action,
      resource: 'rbac',
      resourceId: data.targetUserId || data.roleId || data.permission,
      details: {
        ...data.details,
        targetUserId: data.targetUserId,
        roleId: data.roleId,
        permission: data.permission,
      },
    });
  }
}

/**
 * Builder pattern for complex audit scenarios
 * NOTE: This builder requires eventBus to be passed in publish() method
 */
export class AuditEventBuilder {
  private event: Partial<{
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: Record<string, any>;
    ip?: string;
    userAgent?: string;
  }> = {};

  static create(): AuditEventBuilder {
    return new AuditEventBuilder();
  }

  actor(userId: string): AuditEventBuilder {
    this.event.userId = userId;
    return this;
  }

  action(action: string): AuditEventBuilder {
    this.event.action = action;
    return this;
  }

  resource(resource: string, resourceId?: string): AuditEventBuilder {
    this.event.resource = resource;
    this.event.resourceId = resourceId;
    return this;
  }

  details(details: Record<string, any>): AuditEventBuilder {
    this.event.details = { ...this.event.details, ...details };
    return this;
  }

  metadata(ip?: string, userAgent?: string): AuditEventBuilder {
    this.event.ip = ip;
    this.event.userAgent = userAgent;
    return this;
  }

  async publish(eventBus: ResilientEventBus): Promise<void> {
    if (!this.event.action || !this.event.resource) {
      throw new Error('Action and resource are required for audit events');
    }

    await AuditLogger.log(eventBus, this.event as Parameters<typeof AuditLogger.log>[1]);
  }

  async publishFromRequest(request: FastifyRequest): Promise<void> {
    if (!this.event.action || !this.event.resource) {
      throw new Error('Action and resource are required for audit events');
    }

    await AuditLogger.logFromRequest(
      request,
      this.event as Parameters<typeof AuditLogger.logFromRequest>[1]
    );
  }
}

// Export both for backward compatibility
export { AuditLogger as default };
