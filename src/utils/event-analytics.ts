import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { EventPublisher } from '../utils/event-bus';

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
 * Event Analytics Service
 *
 * ให้ข้อมูล analytics และ metrics ของ event system
 * รวมถึง real-time monitoring และ historical data
 */
export class EventAnalyticsService {
  private static eventHistory: Array<{
    type: string;
    queue: string;
    timestamp: Date;
    userId?: string;
    data?: any;
  }> = [];

  private static maxHistorySize = 1000; // เก็บ events ล่าสุด 1000 รายการ

  /**
   * บันทึก event เข้า history สำหรับ analytics
   */
  static recordEvent(type: string, queue: string, userId?: string, data?: any): void {
    this.eventHistory.unshift({
      type,
      queue,
      timestamp: new Date(),
      userId,
      data,
    });

    // ควบคุมขนาด history
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(0, this.maxHistorySize);
    }
  }

  /**
   * รับ event metrics สำหรับช่วงเวลาที่กำหนด
   */
  static getEventMetrics(timeRange?: TimeRange): EventMetrics {
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

    // Filter events by time range
    const filteredEvents = this.eventHistory.filter(
      (event) => event.timestamp >= startDate && event.timestamp <= endDate
    );

    // Calculate metrics
    const eventsByType: Record<string, number> = {};
    const eventsByQueue: Record<string, number> = {};

    filteredEvents.forEach((event) => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      eventsByQueue[event.queue] = (eventsByQueue[event.queue] || 0) + 1;
    });

    // Get recent events (last 10)
    const recentEvents = filteredEvents.slice(0, 10).map((event) => ({
      type: event.type,
      queue: event.queue,
      timestamp: event.timestamp.toISOString(),
      userId: event.userId,
    }));

    // System health check
    const systemHealth = this.getSystemHealth();

    return {
      totalEvents: filteredEvents.length,
      eventsByType,
      eventsByQueue,
      recentEvents,
      systemHealth,
    };
  }

  /**
   * ตรวจสอบสุขภาพของ event system
   */
  private static getSystemHealth(): EventMetrics['systemHealth'] {
    const uptime = process.uptime();
    const recentEvents = this.eventHistory.slice(0, 10);

    // ตรวจสอบว่ามี events ใหม่ในช่วง 5 นาทีที่ผ่านมา
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const hasRecentActivity = recentEvents.some((event) => event.timestamp > fiveMinutesAgo);

    if (uptime < 60) {
      return {
        status: 'warning',
        message: 'System recently started',
        uptime,
      };
    }

    if (!hasRecentActivity && this.eventHistory.length > 0) {
      return {
        status: 'warning',
        message: 'No recent event activity detected',
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
   * รับสถิติ events ตาม user
   */
  static getUserEventStats(
    userId: string,
    timeRange?: TimeRange
  ): {
    totalEvents: number;
    eventsByType: Record<string, number>;
    recentActivity: Array<{
      type: string;
      queue: string;
      timestamp: string;
    }>;
  } {
    const now = new Date();
    const startDate = timeRange?.start
      ? new Date(timeRange.start)
      : new Date(now.getTime() - 24 * 60 * 60 * 1000); // Default: last 24h

    const userEvents = this.eventHistory.filter(
      (event) => event.userId === userId && event.timestamp >= startDate
    );

    const eventsByType: Record<string, number> = {};
    userEvents.forEach((event) => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
    });

    const recentActivity = userEvents.slice(0, 5).map((event) => ({
      type: event.type,
      queue: event.queue,
      timestamp: event.timestamp.toISOString(),
    }));

    return {
      totalEvents: userEvents.length,
      eventsByType,
      recentActivity,
    };
  }

  /**
   * ล้าง event history (สำหรับ testing หรือ maintenance)
   */
  static clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Export event data สำหรับ backup หรือ analysis
   */
  static exportEventData(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.eventHistory, null, 2);
    }

    // CSV format
    const headers = ['timestamp', 'type', 'queue', 'userId'];
    const csvRows = [
      headers.join(','),
      ...this.eventHistory.map((event) =>
        [event.timestamp.toISOString(), event.type, event.queue, event.userId || ''].join(',')
      ),
    ];

    return csvRows.join('\n');
  }
}

/**
 * Register analytics routes
 */
export async function registerEventAnalyticsRoutes(fastify: FastifyInstance): Promise<void> {
  // Event metrics endpoint
  fastify.get('/events/metrics', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as { period?: '1h' | '24h' | '7d' | '30d' };
    const metrics = EventAnalyticsService.getEventMetrics({ period: query.period });

    return {
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    };
  });

  // User-specific event stats
  fastify.get(
    '/events/users/:userId/stats',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { userId } = request.params as { userId: string };
      const query = request.query as { period?: '1h' | '24h' | '7d' | '30d' };

      const stats = EventAnalyticsService.getUserEventStats(userId, { period: query.period });

      return {
        success: true,
        data: {
          userId,
          ...stats,
        },
        timestamp: new Date().toISOString(),
      };
    }
  );

  // Export event data
  fastify.get('/events/export', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as { format?: 'json' | 'csv' };
    const format = query.format || 'json';

    const data = EventAnalyticsService.exportEventData(format);

    reply.header('Content-Type', format === 'json' ? 'application/json' : 'text/csv');
    reply.header('Content-Disposition', `attachment; filename="events.${format}"`);

    return data;
  });

  // System health check
  fastify.get('/events/health', async (request: FastifyRequest, reply: FastifyReply) => {
    const metrics = EventAnalyticsService.getEventMetrics();

    return {
      success: true,
      health: metrics.systemHealth,
      timestamp: new Date().toISOString(),
    };
  });

  fastify.log.info('📊 Event analytics routes registered');
}
