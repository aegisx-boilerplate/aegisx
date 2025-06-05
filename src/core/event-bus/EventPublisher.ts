import { EventBus } from './EventBus';
import { QUEUES } from './queues';
import { AuditLogEvent, UserEvent, ApiKeyEvent, RBACEvent, AnalyticsEvent } from './types';

// Helper functions for common event types
export class EventPublisher {
    private static eventBus: EventBus;

    static setEventBus(eventBus: EventBus): void {
        this.eventBus = eventBus;
    }

    /**
     * Publish audit log event
     */
    static async auditLog(event: AuditLogEvent): Promise<void> {
        const fullEvent = {
            ...event,
            timestamp: event.timestamp || new Date().toISOString(),
        };
        try {
            await this.eventBus.publishEvent(QUEUES.AUDIT_LOG, fullEvent);
        } catch (err) {
            // Fallback: write to durable offline log
            const fs = await import('fs');
            const path = await import('path');
            const logDir = path.resolve(__dirname, '../../../logs');

            // Support per-pod/container scaling with unique log files
            const podIdentifier = process.env.HOSTNAME || process.env.POD_NAME || process.env.CONTAINER_NAME || 'default';
            const logFile = path.join(logDir, `audit-offline-${podIdentifier}.jsonl`);
            try {
                if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
                fs.appendFileSync(logFile, JSON.stringify(fullEvent) + '\n');
                console.error('[AUDIT] RabbitMQ unavailable, event written to offline log:', logFile);
            } catch (fileErr) {
                console.error('[AUDIT] Failed to write offline audit log:', fileErr);
            }
        }
    }

    /**
     * Publish user event
     */
    static async userEvent(event: UserEvent): Promise<void> {
        await this.eventBus.publishEvent(QUEUES.USER_EVENTS, {
            ...event,
            timestamp: event.timestamp || new Date().toISOString(),
        });
    }

    /**
     * Publish API key event
     */
    static async apiKeyEvent(event: ApiKeyEvent): Promise<void> {
        await this.eventBus.publishEvent(QUEUES.API_KEY_EVENTS, {
            ...event,
            timestamp: event.timestamp || new Date().toISOString(),
        });
    }

    /**
     * Publish RBAC event
     */
    static async rbacEvent(event: RBACEvent): Promise<void> {
        await this.eventBus.publishEvent(QUEUES.RBAC_EVENTS, {
            ...event,
            timestamp: event.timestamp || new Date().toISOString(),
        });
    }

    /**
     * Publish analytics event
     */
    static async analyticsEvent(event: AnalyticsEvent): Promise<void> {
        await this.eventBus.publishEvent(QUEUES.USER_EVENTS, {
            ...event,
            timestamp: event.timestamp || new Date().toISOString(),
        });
    }
}
