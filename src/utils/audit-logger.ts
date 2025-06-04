import { EventPublisher, AuditLogEvent } from './event-bus';

/**
 * Unified Audit Logger - Single source of truth for all audit events
 * 
 * This replaces all direct AuditService calls and provides a consistent
 * interface for publishing audit events to the event bus.
 */
export class AuditLogger {
    /**
     * Log an audit event (publishes to event bus only)
     * The actual database write happens in AuditConsumer
     */
    static async log(data: {
        userId?: string;
        action: string;
        resource: string;
        resourceId?: string;
        details?: Record<string, any>;
        ip?: string;
        userAgent?: string;
    }): Promise<void> {
        const event: AuditLogEvent = {
            userId: data.userId,
            action: data.action,
            resource: data.resource,
            resourceId: data.resourceId,
            details: data.details,
            timestamp: new Date().toISOString(),
            ip: data.ip,
            userAgent: data.userAgent,
        };

        // Always publish to event bus - never direct database write
        await EventPublisher.auditLog(event);
    }

    /**
     * Convenience method for authentication events
     */
    static async logAuth(data: {
        userId: string;
        action: string;
        ip?: string;
        userAgent?: string;
        reason?: string;
    }): Promise<void> {
        return this.log({
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
    static async logUserManagement(data: {
        actorId: string;
        action: string;
        targetUserId: string;
        details?: Record<string, any>;
        ip?: string;
        userAgent?: string;
    }): Promise<void> {
        return this.log({
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
    static async logRoleManagement(data: {
        actorId: string;
        action: string;
        roleId?: string;
        targetUserId?: string;
        details?: Record<string, any>;
        ip?: string;
        userAgent?: string;
    }): Promise<void> {
        return this.log({
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
    static async logResourceAccess(data: {
        userId: string;
        action: string;
        resource: string;
        resourceId?: string;
        success?: boolean;
        details?: Record<string, any>;
        ip?: string;
        userAgent?: string;
    }): Promise<void> {
        return this.log({
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
    static async logSystem(data: {
        action: string;
        resource: string;
        resourceId?: string;
        details?: Record<string, any>;
        triggeredBy?: string;
    }): Promise<void> {
        return this.log({
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
    static async logApiKey(data: {
        actorId: string;
        action: string;
        keyId: string;
        details?: Record<string, any>;
        ip?: string;
        userAgent?: string;
    }): Promise<void> {
        return this.log({
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
    static async logRBAC(data: {
        actorId: string;
        action: string;
        targetUserId?: string;
        roleId?: string;
        permission?: string;
        details?: Record<string, any>;
        ip?: string;
        userAgent?: string;
    }): Promise<void> {
        return this.log({
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
}

/**
 * Builder pattern for complex audit scenarios
 */
export class AuditEventBuilder {
    private event: Partial<Parameters<typeof AuditLogger.log>[0]> = {};

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

    async publish(): Promise<void> {
        if (!this.event.action || !this.event.resource) {
            throw new Error('Action and resource are required for audit events');
        }

        await AuditLogger.log(this.event as Parameters<typeof AuditLogger.log>[0]);
    }
}

// Export both for backward compatibility
export { AuditLogger as default };
