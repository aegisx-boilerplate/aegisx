/**
 * Event Schema Validation
 * Centralized event structure validation
 */

import { z } from 'zod';

// Base event schema
export const BaseEventSchema = z.object({
    type: z.string(),
    timestamp: z.string().datetime(),
    metadata: z.object({
        source: z.string(),
        version: z.string().default('1.0'),
        correlationId: z.string().optional(),
    }),
});

// User event schema
export const UserEventSchema = BaseEventSchema.extend({
    userId: z.string().uuid(),
    data: z.record(z.any()),
});

// Audit event schema  
export const AuditEventSchema = BaseEventSchema.extend({
    userId: z.string(),
    action: z.string(),
    resource: z.string().optional(),
    ip: z.string(),
    userAgent: z.string(),
    reason: z.string().optional(),
});

// Analytics event schema
export const AnalyticsEventSchema = BaseEventSchema.extend({
    eventType: z.string(),
    queue: z.string(),
    userId: z.string(),
    data: z.record(z.any()),
});

export type BaseEvent = z.infer<typeof BaseEventSchema>;
export type UserEvent = z.infer<typeof UserEventSchema>;
export type AuditEvent = z.infer<typeof AuditEventSchema>;
export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;
