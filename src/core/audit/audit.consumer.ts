import { EventConsumer, AuditLogEvent } from '../../utils/event-bus';
import { AuditService } from './audit.service';

/**
 * Audit Log Event Consumer
 * Listens for audit events and persists them to the database
 */
export class AuditConsumer {
  private static isStarted = false;

  /**
   * Start the audit log consumer
   */
  static async start(): Promise<void> {
    if (this.isStarted) {
      console.log('Audit consumer already started');
      return;
    }

    try {
      await EventConsumer.startAuditLogConsumer(this.handleAuditEvent);
      this.isStarted = true;
      console.log('Audit log consumer started successfully');
    } catch (error) {
      console.error('Failed to start audit log consumer:', error);
      throw error;
    }
  }

  /**
   * Handle incoming audit log events
   */
  private static async handleAuditEvent(event: AuditLogEvent): Promise<void> {
    try {
      console.log('Processing audit event:', event);

      const target = event.resourceId ? `${event.resource}:${event.resourceId}` : event.resource;

      // Use the direct insert method (no event publishing to avoid loops)
      await AuditService.create(event.userId || 'system', event.action, target, event.details);

      console.log('Audit event processed successfully');
    } catch (error) {
      console.error('Error processing audit event:', error);
      throw error; // Re-throw to trigger message queue retry mechanism
    }
  }

  /**
   * Get consumer status
   */
  static isRunning(): boolean {
    return this.isStarted;
  }
}
