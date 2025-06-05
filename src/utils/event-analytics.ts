import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticate } from '../middlewares/authenticate';
import { authorize } from '../middlewares/authorize';
import {
  EventMetricsQuerySchema,
  UserEventStatsParamsSchema,
  EventExportQuerySchema,
  EventMetricsResponseSchema,
  UserEventStatsResponseSchema,
  EventHealthResponseSchema,
  EventAnalyticsErrorSchema,
} from './event-analytics.schema';
import { IEventStorageAdapter } from './adapters/event-storage.adapter';
import { EventStorageAdapterFactory } from './adapters/event-storage.factory';

interface EventMetrics {
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsByQueue: Record<string, number>;
  recentEvents: Array<{
    type: string;
    queue: string;
    timestamp: string;
    userId?: string;
  }>;
  systemHealth: {
    status: 'healthy' | 'warning' | 'error';
    message: string;
    uptime: number;
  };
}

interface TimeRange {
  start?: string;
  end?: string;
  period?: '1h' | '24h' | '7d' | '30d';
}

/**
 * Event Analytics Service - Enhanced with Storage Adapter Pattern
 *
 * ให้ข้อมูล analytics และ metrics ของ event system
 * รวมถึง real-time monitoring และ historical data
 * พร้อม pluggable storage adapters (memory, database, hybrid)
 */
export class EventAnalyticsService {
  private static storageAdapter: IEventStorageAdapter;
  private static isInitialized = false;

  /**
   * Initialize service with storage adapter
   */
  static async initialize(adapter?: IEventStorageAdapter): Promise<void> {
    if (this.isInitialized && this.storageAdapter) return;

    try {
      // Create adapter from environment if not provided
      this.storageAdapter = adapter || EventStorageAdapterFactory.createFromEnv();

      // Initialize the adapter
      await this.storageAdapter.initialize();

      this.isInitialized = true;
      console.log('📊 Event Analytics Service initialized with storage adapter');
    } catch (error) {
      console.error('Failed to initialize Event Analytics Service:', error);
      throw error;
    }
  }

  /**
   * บันทึก event ผ่าน storage adapter
   */
  static async recordEvent(
    type: string,
    queue: string,
    userId?: string,
    data?: any
  ): Promise<void> {
    try {
      // Ensure service is initialized
      await this.initialize();

      // Store event using adapter
      await this.storageAdapter.storeEvent({
        type,
        queue,
        userId,
        data,
        timestamp: new Date(),
      });

      console.log(`📝 Event recorded: ${type} in ${queue}`);
    } catch (error) {
      console.error('Failed to record event:', error);
      throw error;
    }
  }

  /**
   * รับ event metrics สำหรับช่วงเวลาที่กำหนด
   */
  static async getEventMetrics(timeRange?: TimeRange): Promise<EventMetrics> {
    // Ensure service is initialized
    await this.initialize();

    const now = new Date();
    let startDate: Date;

    if (timeRange?.start) {
      startDate = new Date(timeRange.start);
    } else {
      // Default to last 24 hours
      const period = timeRange?.period || '24h';
      switch (period) {
        case '1h':
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }
    }

    const endDate = timeRange?.end ? new Date(timeRange.end) : now;

    // Get data from storage adapter
    const [totalEvents, eventsByType, eventsByQueue, recentEvents, storageHealth] =
      await Promise.all([
        this.storageAdapter.getEventCount({
          timeRange: { start: startDate, end: endDate },
        }),
        this.storageAdapter.getEventsByType({
          timeRange: { start: startDate, end: endDate },
        }),
        this.storageAdapter.getEventsByQueue({
          timeRange: { start: startDate, end: endDate },
        }),
        this.storageAdapter.getEvents({
          timeRange: { start: startDate, end: endDate },
          limit: 10,
        }),
        this.storageAdapter.getHealthStatus(),
      ]);

    // Convert recent events to required format
    const formattedRecentEvents = recentEvents.map((event) => ({
      type: event.type,
      queue: event.queue,
      timestamp: event.timestamp.toISOString(),
      userId: event.userId,
    }));

    // Combine storage health with system health
    const systemHealth = this.combineHealthStatus(storageHealth);

    return {
      totalEvents,
      eventsByType,
      eventsByQueue,
      recentEvents: formattedRecentEvents,
      systemHealth,
    };
  }

  /**
   * รับสถิติ events ตาม user
   */
  static async getUserEventStats(
    userId: string,
    timeRange?: TimeRange
  ): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    recentActivity: Array<{
      type: string;
      queue: string;
      timestamp: string;
    }>;
  }> {
    // Ensure service is initialized
    await this.initialize();

    const now = new Date();
    const startDate = timeRange?.start
      ? new Date(timeRange.start)
      : new Date(now.getTime() - 24 * 60 * 60 * 1000); // Default: last 24h

    const endDate = timeRange?.end ? new Date(timeRange.end) : now;

    // Get user-specific data from storage adapter
    const [totalEvents, eventsByType, recentEvents] = await Promise.all([
      this.storageAdapter.getEventCount({
        userId,
        timeRange: { start: startDate, end: endDate },
      }),
      this.storageAdapter.getEventsByType({
        userId,
        timeRange: { start: startDate, end: endDate },
      }),
      this.storageAdapter.getEvents({
        userId,
        timeRange: { start: startDate, end: endDate },
        limit: 5,
      }),
    ]);

    const recentActivity = recentEvents.map((event) => ({
      type: event.type,
      queue: event.queue,
      timestamp: event.timestamp.toISOString(),
    }));

    return {
      totalEvents,
      eventsByType,
      recentActivity,
    };
  }

  /**
   * ล้าง event history (สำหรับ testing หรือ maintenance)
   */
  static async clearHistory(): Promise<void> {
    await this.initialize();
    await this.storageAdapter.clearEvents();
  }

  /**
   * Export event data สำหรับ backup หรือ analysis
   */
  static async exportEventData(format: 'json' | 'csv' = 'json'): Promise<string> {
    await this.initialize();
    return await this.storageAdapter.exportEvents({ format });
  }

  /**
   * Get storage adapter health combined with system health
   */
  private static combineHealthStatus(storageHealth: {
    status: 'healthy' | 'warning' | 'error';
    message: string;
    details?: any;
  }): EventMetrics['systemHealth'] {
    const uptime = process.uptime();

    // If storage has issues, reflect that in system health
    if (storageHealth.status === 'error') {
      return {
        status: 'error',
        message: `Storage error: ${storageHealth.message}`,
        uptime,
      };
    }

    if (storageHealth.status === 'warning') {
      return {
        status: 'warning',
        message: `Storage warning: ${storageHealth.message}`,
        uptime,
      };
    }

    // Check system-level health
    if (uptime < 60) {
      return {
        status: 'warning',
        message: 'System recently started',
        uptime,
      };
    }

    return {
      status: 'healthy',
      message: 'Event system is operating normally',
      uptime,
    };
  }

  /**
   * Get current storage adapter type and health
   */
  static async getStorageInfo(): Promise<{
    adapterType: string;
    health: any;
    isInitialized: boolean;
  }> {
    if (!this.isInitialized || !this.storageAdapter) {
      return {
        adapterType: 'none',
        health: { status: 'error', message: 'Service not initialized' },
        isInitialized: false,
      };
    }

    const health = await this.storageAdapter.getHealthStatus();
    return {
      adapterType: this.storageAdapter.constructor.name,
      health,
      isInitialized: this.isInitialized,
    };
  }

  /**
   * Switch storage adapter (useful for testing or runtime reconfiguration)
   */
  static async switchAdapter(newAdapter: IEventStorageAdapter): Promise<void> {
    await newAdapter.initialize();
    this.storageAdapter = newAdapter;
    console.log(`🔄 Switched to new storage adapter: ${newAdapter.constructor.name}`);
  }
}

/**
 * Register analytics routes
 */
export async function registerEventAnalyticsRoutes(fastify: FastifyInstance): Promise<void> {
  // Event metrics endpoint
  fastify.get(
    '/events/metrics',
    {
      preHandler: [authenticate, authorize('events:read')],
      schema: {
        tags: ['Events'],
        summary: 'Get event system metrics',
        description:
          'Retrieve comprehensive event system metrics and analytics for a specified time period',
        querystring: EventMetricsQuerySchema,
        response: {
          200: EventMetricsResponseSchema,
          400: EventAnalyticsErrorSchema,
          401: EventAnalyticsErrorSchema,
          403: EventAnalyticsErrorSchema,
          500: EventAnalyticsErrorSchema,
        },
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const query = request.query as {
          period?: '1h' | '24h' | '7d' | '30d';
          start?: string;
          end?: string;
        };
        const metrics = await EventAnalyticsService.getEventMetrics({
          period: query.period,
          start: query.start,
          end: query.end,
        });

        return reply.send({
          success: true,
          data: metrics,
          timestamp: new Date().toISOString(),
        });
      } catch (error: any) {
        return reply.code(500).send({
          success: false,
          error: error.message || 'Failed to retrieve event metrics',
          timestamp: new Date().toISOString(),
        });
      }
    }
  );

  // User-specific event stats
  fastify.get(
    '/events/user/:userId/stats',
    {
      preHandler: [authenticate, authorize('events:read')],
      schema: {
        tags: ['Events'],
        summary: 'Get user-specific event statistics',
        description: 'Retrieve event statistics and recent activity for a specific user',
        params: UserEventStatsParamsSchema,
        querystring: EventMetricsQuerySchema,
        response: {
          200: UserEventStatsResponseSchema,
          400: EventAnalyticsErrorSchema,
          401: EventAnalyticsErrorSchema,
          403: EventAnalyticsErrorSchema,
          404: EventAnalyticsErrorSchema,
          500: EventAnalyticsErrorSchema,
        },
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const { userId } = request.params as { userId: string };
        const query = request.query as {
          period?: '1h' | '24h' | '7d' | '30d';
          start?: string;
          end?: string;
        };

        if (!userId) {
          return reply.code(400).send({
            success: false,
            error: 'User ID is required',
            timestamp: new Date().toISOString(),
          });
        }

        const stats = await EventAnalyticsService.getUserEventStats(userId, {
          period: query.period,
          start: query.start,
          end: query.end,
        });

        return reply.send({
          success: true,
          data: {
            userId,
            ...stats,
          },
          timestamp: new Date().toISOString(),
        });
      } catch (error: any) {
        return reply.code(500).send({
          success: false,
          error: error.message || 'Failed to retrieve user event statistics',
          timestamp: new Date().toISOString(),
        });
      }
    }
  );

  // Export event data
  fastify.get(
    '/events/export',
    {
      preHandler: [authenticate, authorize('events:export')],
      schema: {
        tags: ['Events'],
        summary: 'Export event data',
        description: 'Export event history data in JSON or CSV format for backup or analysis',
        querystring: EventExportQuerySchema,
        response: {
          400: EventAnalyticsErrorSchema,
          401: EventAnalyticsErrorSchema,
          403: EventAnalyticsErrorSchema,
          500: EventAnalyticsErrorSchema,
        },
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const query = request.query as { format?: 'json' | 'csv' };
        const format = query.format || 'json';

        const data = await EventAnalyticsService.exportEventData(format);

        reply.header('Content-Type', format === 'json' ? 'application/json' : 'text/csv');
        reply.header('Content-Disposition', `attachment; filename="events.${format}"`);

        // Return raw data without schema validation for successful responses
        return reply.send(data);
      } catch (error: any) {
        return reply.code(500).send({
          success: false,
          error: error.message || 'Failed to export event data',
          timestamp: new Date().toISOString(),
        });
      }
    }
  );

  // System health check
  fastify.get(
    '/events/health',
    {
      preHandler: [authenticate, authorize('events:read')],
      schema: {
        tags: ['Events'],
        summary: 'Check event system health',
        description: 'Get current health status and diagnostics of the event system',
        response: {
          200: EventHealthResponseSchema,
          401: EventAnalyticsErrorSchema,
          403: EventAnalyticsErrorSchema,
          500: EventAnalyticsErrorSchema,
        },
        security: [{ bearerAuth: [] }],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const metrics = await EventAnalyticsService.getEventMetrics();

        return reply.send({
          success: true,
          health: metrics.systemHealth,
          timestamp: new Date().toISOString(),
        });
      } catch (error: any) {
        return reply.code(500).send({
          success: false,
          error: error.message || 'Failed to check event system health',
          timestamp: new Date().toISOString(),
        });
      }
    }
  );

  fastify.log.info('📊 Event analytics routes registered with comprehensive schemas');
}
