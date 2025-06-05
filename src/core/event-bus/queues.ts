import { env } from '../../config/env';

/**
 * Generate queue names with configurable prefix
 */
export const getQueues = (prefix: string = env.EVENT_BUS_QUEUE_PREFIX || 'aegisx') => ({
    AUDIT_LOG: `${prefix}.audit.log`,
    USER_EVENTS: `${prefix}.user.events`,
    API_KEY_EVENTS: `${prefix}.api_key.events`,
    RBAC_EVENTS: `${prefix}.rbac.events`,
    EMAIL_NOTIFICATIONS: `${prefix}.email.notifications`,
    SYSTEM_ALERTS: `${prefix}.system.alerts`,
} as const);

/**
 * Default queue configuration
 */
export const QUEUES = getQueues();

/**
 * Type for queue names
 */
export type QueueNames = typeof QUEUES[keyof typeof QUEUES];
