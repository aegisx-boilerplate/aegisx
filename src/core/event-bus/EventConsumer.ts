import { EventBus } from './EventBus';
import { QUEUES } from './queues';
import { EventHandler, AuditLogEvent, UserEvent, ApiKeyEvent, RBACEvent } from './types';

// Helper functions for common consumers
export class EventConsumer {
    private static eventBus: EventBus;

    static setEventBus(eventBus: EventBus): void {
        this.eventBus = eventBus;
    }

    /**
     * Start audit log consumer
     */
    static async startAuditLogConsumer(handler: EventHandler<AuditLogEvent>): Promise<void> {
        await this.eventBus.consumeEvent(QUEUES.AUDIT_LOG, handler, {
            prefetch: 10,
        });
    }

    /**
     * Start user events consumer
     */
    static async startUserEventsConsumer(handler: EventHandler<UserEvent>): Promise<void> {
        await this.eventBus.consumeEvent(QUEUES.USER_EVENTS, handler, {
            prefetch: 5,
        });
    }

    /**
     * Start API key events consumer
     */
    static async startApiKeyEventsConsumer(handler: EventHandler<ApiKeyEvent>): Promise<void> {
        await this.eventBus.consumeEvent(QUEUES.API_KEY_EVENTS, handler, {
            prefetch: 5,
        });
    }

    /**
     * Start RBAC events consumer
     */
    static async startRBACEventsConsumer(handler: EventHandler<RBACEvent>): Promise<void> {
        await this.eventBus.consumeEvent(QUEUES.RBAC_EVENTS, handler, {
            prefetch: 5,
        });
    }
}
