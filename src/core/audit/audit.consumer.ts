import { EventConsumer, AuditLogEvent } from '../event-bus';
import { knex } from '../../db/knex';

/**
 * Dedicated Audit Consumer for Database Persistence
 * 
 * This consumer is ONLY responsible for writing audit events to the database.
 * It does NOT publish any further events to avoid infinite loops.
 */
export class AuditPersistenceConsumer {
  private static isStarted = false;

  /**
   * Start the audit persistence consumer
   */
  static async start(): Promise<void> {
    if (this.isStarted) {
      console.log('Audit persistence consumer already started');
      return;
    }

    try {
      await EventConsumer.startAuditLogConsumer(this.handleAuditEvent);
      this.isStarted = true;
      console.log('Audit persistence consumer started successfully');
    } catch (error) {
      console.error('Failed to start audit persistence consumer:', error);
      throw error;
    }
  }

  /**
   * Handle incoming audit log events - DATABASE WRITE ONLY
   */
  private static async handleAuditEvent(event: AuditLogEvent): Promise<void> {
    try {
      console.log('Persisting audit event to database:', event);

      const target = event.resourceId ? `${event.resource}:${event.resourceId}` : event.resource;

      // Extract IP and User Agent from details if they exist (backward compatibility)
      const ip_address = event.ip || event.details?.ip_address || event.details?.ip || null;
      const user_agent = event.userAgent || event.details?.user_agent || event.details?.userAgent || null;

      // Clean details - remove IP and User Agent since they have dedicated columns
      const cleanedDetails = event.details ? { ...event.details } : null;
      if (cleanedDetails) {
        delete cleanedDetails.ip_address;
        delete cleanedDetails.ip;
        delete cleanedDetails.user_agent;
        delete cleanedDetails.userAgent;
      }

      // Direct database insert - NO EVENT PUBLISHING to avoid loops
      await knex('audit_logs').insert({
        actor: event.userId || 'system',
        action: event.action,
        target,
        details: cleanedDetails ? JSON.stringify(cleanedDetails) : null,
        ip_address,
        user_agent,
        created_at: event.timestamp || new Date().toISOString(),
      });

      console.log('Audit event persisted successfully');
    } catch (error) {
      console.error('Error persisting audit event:', error);
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

/**
 * Analytics Consumer for Real-time Metrics
 * 
 * This consumer processes audit events for analytics and monitoring
 * without writing to the audit_logs table.
 */
export class AuditAnalyticsConsumer {
  private static isStarted = false;

  static async start(): Promise<void> {
    if (this.isStarted) {
      console.log('Audit analytics consumer already started');
      return;
    }

    try {
      await EventConsumer.startAuditLogConsumer(this.handleAnalyticsEvent);
      this.isStarted = true;
      console.log('Audit analytics consumer started successfully');
    } catch (error) {
      console.error('Failed to start audit analytics consumer:', error);
      throw error;
    }
  }

  private static async handleAnalyticsEvent(event: AuditLogEvent): Promise<void> {
    try {
      // Process metrics and analytics
      console.log('Processing audit analytics:', {
        action: event.action,
        resource: event.resource,
        timestamp: event.timestamp,
      });

      // TODO: Implement actual analytics processing
      // - Update counters
      // - Track patterns
      // - Generate real-time metrics

    } catch (error) {
      console.error('Error processing audit analytics:', error);
      // Don't throw - analytics failures shouldn't stop audit logging
    }
  }

  static isRunning(): boolean {
    return this.isStarted;
  }
}

/**
 * Notification Consumer for Security Alerts
 * 
 * This consumer sends notifications for critical security events
 */
export class AuditNotificationConsumer {
  private static isStarted = false;

  static async start(): Promise<void> {
    if (this.isStarted) {
      console.log('Audit notification consumer already started');
      return;
    }

    try {
      await EventConsumer.startAuditLogConsumer(this.handleNotificationEvent);
      this.isStarted = true;
      console.log('Audit notification consumer started successfully');
    } catch (error) {
      console.error('Failed to start audit notification consumer:', error);
      throw error;
    }
  }

  private static async handleNotificationEvent(event: AuditLogEvent): Promise<void> {
    try {
      // Check if this event requires notification
      const criticalActions = [
        'login.failed',
        'user.deleted',
        'role.assigned',
        'permission.granted',
        'api_key.created',
        'api_key.revoked',
      ];

      if (criticalActions.includes(event.action)) {
        console.log('Sending security notification for:', event.action);

        // TODO: Implement actual notification logic
        // - Send emails to admins
        // - Trigger alerts
        // - Update security dashboards
      }

    } catch (error) {
      console.error('Error processing audit notification:', error);
      // Don't throw - notification failures shouldn't stop audit logging
    }
  }

  static isRunning(): boolean {
    return this.isStarted;
  }
}

/**
 * Utility class to manage all audit consumers
 */
export class AuditConsumerManager {
  static async startAll(): Promise<void> {
    console.log('Starting all audit consumers...');

    await Promise.all([
      AuditPersistenceConsumer.start(),
      AuditAnalyticsConsumer.start(),
      AuditNotificationConsumer.start(),
    ]);

    console.log('All audit consumers started successfully');
  }

  static getAllStatus(): Record<string, boolean> {
    return {
      persistence: AuditPersistenceConsumer.isRunning(),
      analytics: AuditAnalyticsConsumer.isRunning(),
      notifications: AuditNotificationConsumer.isRunning(),
    };
  }
}

// Legacy export for backward compatibility
export { AuditPersistenceConsumer as AuditConsumer };
