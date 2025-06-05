export interface EventHandler<T = any> {
    (data: T): Promise<void> | void;
}

export interface EventBusConfig {
    exchange?: string;
    exchangeType?: string;
    durable?: boolean;
}

/**
 * Base event interface that all events should extend
 */
export interface BaseEvent {
    timestamp: string;
    version?: string;
    correlationId?: string;
    source?: string;
    meta?: Record<string, any>;
}

/**
 * Audit Log Event
 */
export interface AuditLogEvent extends BaseEvent {
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: Record<string, any>;
    ip?: string;
    userAgent?: string;
}

/**
 * User Event
 */
export interface UserEvent extends BaseEvent {
    type: 'user.created' | 'user.updated' | 'user.deleted' | 'user.login' | 'user.logout';
    userId: string;
    data?: Record<string, any>;
}

/**
 * API Key Event
 */
export interface ApiKeyEvent extends BaseEvent {
    type: 'api_key.created' | 'api_key.revoked' | 'api_key.used';
    apiKeyId: string;
    userId?: string;
    data?: Record<string, any>;
}

/**
 * RBAC Events
 */
export interface RBACEvent extends BaseEvent {
    type: 'user.role.assign' | 'user.role.revoke' | 'role.created' | 'role.updated' | 'permission.granted' | 'permission.revoked';
    userId?: string;
    roleId?: string;
    permissionId?: string;
    data?: Record<string, any>;
}
