/**
 * Event Analytics Consumer
 * Dedicated consumer for analytics events
 */

import { EventConsumer } from '../event-bus/EventConsumer';
import { EventAnalyticsService } from '../events/event-analytics';
import { AnalyticsEvent } from '../event-bus/types';

// Use console.log for now instead of the logger import to avoid import issues
const logger = {
    warn: (message: string, context?: any) => console.log(`[WARN] ${message}`, context || ''),
    error: (message: string, context?: any) => console.log(`[ERROR] ${message}`, context || ''),
    debug: (message: string, context?: any) => console.log(`[DEBUG] ${message}`, context || ''),
    info: (message: string, context?: any) => console.log(`[INFO] ${message}`, context || ''),
};

/**
 * Analytics Consumer for Event Processing
 * 
 * This consumer processes analytics events and records them for reporting
 */
export class EventAnalyticsConsumer {
    private static isStarted = false;

    /**
     * Start the analytics consumer
     */
    static async start(): Promise<void> {
        if (this.isStarted) {
            logger.info('Analytics consumer already started');
            return;
        }

        try {
            // Use EventConsumer helper to start consuming analytics events
            // Since there's no dedicated startAnalyticsEventsConsumer, we'll use user events
            // and filter for analytics type events
            await EventConsumer.startUserEventsConsumer(this.handleAnalyticsEvent);
            this.isStarted = true;
            logger.info('Analytics consumer started successfully');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error('Failed to start analytics consumer', { error: errorMessage });
            throw error;
        }
    }

    /**
     * Handle incoming analytics events
     */
    private static async handleAnalyticsEvent(event: any): Promise<void> {
        try {
            // Filter for analytics events only
            if (event.type !== 'analytics.record') {
                return; // Skip non-analytics events
            }

            logger.info('Processing analytics event', {
                type: event.type,
                userId: event.userId
            });

            // Convert to AnalyticsEvent format
            const analyticsEvent: AnalyticsEvent = {
                type: 'analytics.record',
                eventType: event.data?.eventType || event.type,
                userId: event.userId,
                queue: 'analytics-queue',
                timestamp: event.timestamp,
                meta: event.meta || {},
                data: event.data || {}
            };

            // Record event through analytics service
            // EventAnalyticsService.recordEvent(type, queue, userId?, data?)
            await EventAnalyticsService.recordEvent(
                analyticsEvent.eventType,
                analyticsEvent.queue,
                analyticsEvent.userId,
                {
                    ...analyticsEvent.data,
                    meta: analyticsEvent.meta
                }
            );

            logger.info('Analytics event processed successfully', {
                type: event.type,
                userId: event.userId,
            });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error('Failed to process analytics event', {
                error: errorMessage,
                event: event.type,
                userId: event.userId,
            });

            // Re-throw for dead letter queue handling
            throw error;
        }
    }

    /**
     * Get consumer status
     */
    static isRunning(): boolean {
        return this.isStarted;
    }
}

// Export both the class and an instance for backward compatibility
export const eventAnalyticsConsumer = EventAnalyticsConsumer;
