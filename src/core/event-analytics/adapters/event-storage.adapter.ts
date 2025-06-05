import { knex } from '../../../db/knex';

/**
 * Event Data Interface
 */
export interface EventData {
  id?: string;
  type: string;
  queue: string;
  userId?: string;
  data?: any;
  timestamp: Date;
}

/**
 * Time Range Filter Interface
 */
export interface TimeRangeFilter {
  start?: Date;
  end?: Date;
}

/**
 * Event Storage Adapter Interface
 *
 * กำหนด interface สำหรับ storage backends ต่างๆ
 */
export interface IEventStorageAdapter {
  /**
   * Initialize the storage adapter
   */
  initialize(): Promise<void>;

  /**
   * Store a single event
   */
  storeEvent(event: Omit<EventData, 'id'>): Promise<EventData>;

  /**
   * Get events with optional filtering
   */
  getEvents(filter?: {
    timeRange?: TimeRangeFilter;
    userId?: string;
    type?: string;
    queue?: string;
    limit?: number;
    offset?: number;
  }): Promise<EventData[]>;

  /**
   * Get event count with optional filtering
   */
  getEventCount(filter?: {
    timeRange?: TimeRangeFilter;
    userId?: string;
    type?: string;
    queue?: string;
  }): Promise<number>;

  /**
   * Get events grouped by type
   */
  getEventsByType(filter?: {
    timeRange?: TimeRangeFilter;
    userId?: string;
  }): Promise<Record<string, number>>;

  /**
   * Get events grouped by queue
   */
  getEventsByQueue(filter?: {
    timeRange?: TimeRangeFilter;
    userId?: string;
  }): Promise<Record<string, number>>;

  /**
   * Clear all events (for testing/maintenance)
   */
  clearEvents(): Promise<void>;

  /**
   * Export all events
   */
  exportEvents(filter?: { timeRange?: TimeRangeFilter; format?: 'json' | 'csv' }): Promise<string>;

  /**
   * Get storage health status
   */
  getHealthStatus(): Promise<{
    status: 'healthy' | 'warning' | 'error';
    message: string;
    details?: any;
  }>;
}

/**
 * Memory Storage Adapter
 *
 * เก็บข้อมูลใน memory (RAM) - เร็วแต่หายเมื่อ restart
 */
export class MemoryStorageAdapter implements IEventStorageAdapter {
  private events: EventData[] = [];
  private maxSize: number;
  private currentId = 1;

  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }

  async initialize(): Promise<void> {
    console.log('🧠 Memory Storage Adapter initialized');
  }

  async storeEvent(event: Omit<EventData, 'id'>): Promise<EventData> {
    const eventWithId: EventData = {
      ...event,
      id: String(this.currentId++),
      timestamp: event.timestamp || new Date(),
    };

    this.events.unshift(eventWithId);

    // ควบคุมขนาด memory
    if (this.events.length > this.maxSize) {
      this.events = this.events.slice(0, this.maxSize);
    }

    return eventWithId;
  }

  async getEvents(filter?: any): Promise<EventData[]> {
    let filteredEvents = [...this.events];

    // Time range filter
    if (filter?.timeRange) {
      const { start, end } = filter.timeRange;
      filteredEvents = filteredEvents.filter((event) => {
        const timestamp = new Date(event.timestamp);
        if (start && timestamp < start) return false;
        if (end && timestamp > end) return false;
        return true;
      });
    }

    // User filter
    if (filter?.userId) {
      filteredEvents = filteredEvents.filter((event) => event.userId === filter.userId);
    }

    // Type filter
    if (filter?.type) {
      filteredEvents = filteredEvents.filter((event) => event.type === filter.type);
    }

    // Queue filter
    if (filter?.queue) {
      filteredEvents = filteredEvents.filter((event) => event.queue === filter.queue);
    }

    // Pagination
    const offset = filter?.offset || 0;
    const limit = filter?.limit || 100;

    return filteredEvents.slice(offset, offset + limit);
  }

  async getEventCount(filter?: any): Promise<number> {
    const events = await this.getEvents({ ...filter, limit: Number.MAX_SAFE_INTEGER });
    return events.length;
  }

  async getEventsByType(filter?: any): Promise<Record<string, number>> {
    const events = await this.getEvents({ ...filter, limit: Number.MAX_SAFE_INTEGER });
    const typeCount: Record<string, number> = {};

    events.forEach((event) => {
      typeCount[event.type] = (typeCount[event.type] || 0) + 1;
    });

    return typeCount;
  }

  async getEventsByQueue(filter?: any): Promise<Record<string, number>> {
    const events = await this.getEvents({ ...filter, limit: Number.MAX_SAFE_INTEGER });
    const queueCount: Record<string, number> = {};

    events.forEach((event) => {
      queueCount[event.queue] = (queueCount[event.queue] || 0) + 1;
    });

    return queueCount;
  }

  async clearEvents(): Promise<void> {
    this.events = [];
    this.currentId = 1;
  }

  async exportEvents(filter?: any): Promise<string> {
    const events = await this.getEvents({ ...filter, limit: Number.MAX_SAFE_INTEGER });
    const format = filter?.format || 'json';

    if (format === 'json') {
      return JSON.stringify(events, null, 2);
    }

    // CSV format
    const headers = ['id', 'timestamp', 'type', 'queue', 'userId', 'data'];
    const csvRows = [
      headers.join(','),
      ...events.map((event) =>
        [
          event.id,
          event.timestamp.toISOString(),
          event.type,
          event.queue,
          event.userId || '',
          event.data ? JSON.stringify(event.data) : '',
        ].join(',')
      ),
    ];

    return csvRows.join('\n');
  }

  async getHealthStatus(): Promise<{
    status: 'healthy' | 'warning' | 'error';
    message: string;
    details?: any;
  }> {
    const eventCount = this.events.length;
    const memoryUsage = process.memoryUsage();

    if (eventCount === 0) {
      return {
        status: 'warning',
        message: 'No events in memory storage',
        details: { eventCount, memoryUsage },
      };
    }

    if (eventCount >= this.maxSize * 0.9) {
      return {
        status: 'warning',
        message: 'Memory storage nearly full',
        details: { eventCount, maxSize: this.maxSize, memoryUsage },
      };
    }

    return {
      status: 'healthy',
      message: 'Memory storage operating normally',
      details: { eventCount, maxSize: this.maxSize, memoryUsage },
    };
  }
}

/**
 * Database Storage Adapter
 *
 * เก็บข้อมูลใน PostgreSQL database - persistent แต่อาจช้ากว่า memory
 */
export class DatabaseStorageAdapter implements IEventStorageAdapter {
  private tableName = 'events';

  async initialize(): Promise<void> {
    try {
      // Check if events table exists, create if not
      const hasTable = await knex.schema.hasTable(this.tableName);

      if (!hasTable) {
        await knex.schema.createTable(this.tableName, (table) => {
          table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
          table.string('type').notNullable().index();
          table.string('queue').notNullable().index();
          table.uuid('user_id').nullable().index();
          table.jsonb('data').nullable();
          table.timestamp('created_at').notNullable().defaultTo(knex.fn.now()).index();

          // Add indexes for performance
          table.index(['type', 'created_at']);
          table.index(['queue', 'created_at']);
          table.index(['user_id', 'created_at']);
        });

        console.log('📊 Events table created successfully');
      }

      console.log('🗄️ Database Storage Adapter initialized');
    } catch (error) {
      console.error('Failed to initialize Database Storage Adapter:', error);
      throw error;
    }
  }

  async storeEvent(event: Omit<EventData, 'id'>): Promise<EventData> {
    try {
      // Validate userId is a proper UUID format before storing
      // For failed login attempts, userId might be a username string which is not UUID
      let validUserId = null;
      let dataToStore = event.data;

      if (event.userId) {
        // UUID regex pattern: 8-4-4-4-12 hex digits
        const uuidPattern =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (uuidPattern.test(event.userId)) {
          validUserId = event.userId;
        } else {
          // Log the non-UUID userId for debugging, but store as null to avoid constraint violation
          console.warn(
            `[DATABASE-ADAPTER] Non-UUID userId detected: "${event.userId}", storing as null to maintain referential integrity`
          );

          // Preserve the original userId (username) in the data field so we don't lose it
          dataToStore = {
            ...event.data,
            originalUserId: event.userId,
          };
        }
      }

      const [storedEvent] = await knex(this.tableName)
        .insert({
          type: event.type,
          queue: event.queue,
          user_id: validUserId,
          data: dataToStore ? JSON.stringify(dataToStore) : null,
          created_at: event.timestamp || new Date(),
        })
        .returning(['id', 'type', 'queue', 'user_id as userId', 'data', 'created_at as timestamp']);

      return {
        id: storedEvent.id,
        type: storedEvent.type,
        queue: storedEvent.queue,
        userId: storedEvent.userId,
        data: storedEvent.data || null,
        timestamp: new Date(storedEvent.timestamp),
      };
    } catch (error) {
      console.error('Failed to store event in database:', error);
      throw error;
    }
  }

  async getEvents(filter?: any): Promise<EventData[]> {
    try {
      let query = knex(this.tableName).select([
        'id',
        'type',
        'queue',
        'user_id as userId',
        'data',
        'created_at as timestamp',
      ]);

      // Time range filter
      if (filter?.timeRange) {
        const { start, end } = filter.timeRange;
        if (start) query = query.where('created_at', '>=', start);
        if (end) query = query.where('created_at', '<=', end);
      }

      // User filter
      if (filter?.userId) {
        query = query.where('user_id', filter.userId);
      }

      // Type filter
      if (filter?.type) {
        query = query.where('type', filter.type);
      }

      // Queue filter
      if (filter?.queue) {
        query = query.where('queue', filter.queue);
      }

      // Pagination and ordering
      query = query.orderBy('created_at', 'desc');

      if (filter?.limit) {
        query = query.limit(filter.limit);
      }

      if (filter?.offset) {
        query = query.offset(filter.offset);
      }

      const events = await query;

      return events.map((event) => ({
        id: event.id,
        type: event.type,
        queue: event.queue,
        userId: event.userId,
        data: event.data || null,
        timestamp: new Date(event.timestamp),
      }));
    } catch (error) {
      console.error('Failed to get events from database:', error);
      throw error;
    }
  }

  async getEventCount(filter?: any): Promise<number> {
    try {
      let query = knex(this.tableName).count('* as count');

      // Apply same filters as getEvents
      if (filter?.timeRange) {
        const { start, end } = filter.timeRange;
        if (start) query = query.where('created_at', '>=', start);
        if (end) query = query.where('created_at', '<=', end);
      }

      if (filter?.userId) {
        query = query.where('user_id', filter.userId);
      }

      if (filter?.type) {
        query = query.where('type', filter.type);
      }

      if (filter?.queue) {
        query = query.where('queue', filter.queue);
      }

      const result = await query.first();
      return parseInt(String(result?.count || '0'));
    } catch (error) {
      console.error('Failed to get event count from database:', error);
      throw error;
    }
  }

  async getEventsByType(filter?: any): Promise<Record<string, number>> {
    try {
      let query = knex(this.tableName).select('type').count('* as count').groupBy('type');

      // Apply filters
      if (filter?.timeRange) {
        const { start, end } = filter.timeRange;
        if (start) query = query.where('created_at', '>=', start);
        if (end) query = query.where('created_at', '<=', end);
      }

      if (filter?.userId) {
        query = query.where('user_id', filter.userId);
      }

      const results = await query;
      const typeCount: Record<string, number> = {};

      results.forEach((row: any) => {
        typeCount[row.type] = parseInt(row.count);
      });

      return typeCount;
    } catch (error) {
      console.error('Failed to get events by type from database:', error);
      throw error;
    }
  }

  async getEventsByQueue(filter?: any): Promise<Record<string, number>> {
    try {
      let query = knex(this.tableName).select('queue').count('* as count').groupBy('queue');

      // Apply filters
      if (filter?.timeRange) {
        const { start, end } = filter.timeRange;
        if (start) query = query.where('created_at', '>=', start);
        if (end) query = query.where('created_at', '<=', end);
      }

      if (filter?.userId) {
        query = query.where('user_id', filter.userId);
      }

      const results = await query;
      const queueCount: Record<string, number> = {};

      results.forEach((row: any) => {
        queueCount[row.queue] = parseInt(row.count);
      });

      return queueCount;
    } catch (error) {
      console.error('Failed to get events by queue from database:', error);
      throw error;
    }
  }

  async clearEvents(): Promise<void> {
    try {
      await knex(this.tableName).del();
      console.log('🗑️ All events cleared from database');
    } catch (error) {
      console.error('Failed to clear events from database:', error);
      throw error;
    }
  }

  async exportEvents(filter?: any): Promise<string> {
    try {
      const events = await this.getEvents({ ...filter, limit: Number.MAX_SAFE_INTEGER });
      const format = filter?.format || 'json';

      if (format === 'json') {
        return JSON.stringify(events, null, 2);
      }

      // CSV format
      const headers = ['id', 'timestamp', 'type', 'queue', 'userId', 'data'];
      const csvRows = [
        headers.join(','),
        ...events.map((event) =>
          [
            event.id,
            event.timestamp.toISOString(),
            event.type,
            event.queue,
            event.userId || '',
            event.data ? JSON.stringify(event.data) : '',
          ].join(',')
        ),
      ];

      return csvRows.join('\n');
    } catch (error) {
      console.error('Failed to export events from database:', error);
      throw error;
    }
  }

  async getHealthStatus(): Promise<{
    status: 'healthy' | 'warning' | 'error';
    message: string;
    details?: any;
  }> {
    try {
      // Test database connection
      await knex.raw('SELECT 1');

      // Get table statistics
      const stats = await knex(this.tableName)
        .select([
          knex.raw('COUNT(*) as total_events'),
          knex.raw(
            "COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 hour') as events_last_hour"
          ),
          knex.raw(
            "COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as events_last_day"
          ),
        ])
        .first();

      return {
        status: 'healthy',
        message: 'Database storage operating normally',
        details: {
          totalEvents: parseInt(stats?.total_events || '0'),
          eventsLastHour: parseInt(stats?.events_last_hour || '0'),
          eventsLastDay: parseInt(stats?.events_last_day || '0'),
        },
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Database connection failed',
        details: { error: error instanceof Error ? error.message : String(error) },
      };
    }
  }
}

/**
 * Hybrid Storage Adapter
 *
 * รวม memory และ database - ใช้ memory สำหรับ recent events และ database สำหรับ long-term storage
 */
export class HybridStorageAdapter implements IEventStorageAdapter {
  private memoryAdapter: MemoryStorageAdapter;
  private databaseAdapter: DatabaseStorageAdapter;

  constructor(memoryCacheSize: number = 100) {
    this.memoryAdapter = new MemoryStorageAdapter(memoryCacheSize);
    this.databaseAdapter = new DatabaseStorageAdapter();
  }

  async initialize(): Promise<void> {
    await Promise.all([this.memoryAdapter.initialize(), this.databaseAdapter.initialize()]);
    console.log('🔀 Hybrid Storage Adapter initialized');
  }

  async storeEvent(event: Omit<EventData, 'id'>): Promise<EventData> {
    // Store in both memory and database
    const [, dbEvent] = await Promise.all([
      this.memoryAdapter.storeEvent(event),
      this.databaseAdapter.storeEvent(event),
    ]);

    // Return database event (has proper ID)
    return dbEvent;
  }

  async getEvents(filter?: any): Promise<EventData[]> {
    // For recent data (last hour), prefer memory cache
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const isRecentQuery =
      !filter?.timeRange ||
      (filter.timeRange.start && new Date(filter.timeRange.start) >= oneHourAgo);

    if (isRecentQuery && (!filter?.limit || filter.limit <= 100)) {
      try {
        return await this.memoryAdapter.getEvents(filter);
      } catch (error) {
        console.warn('Memory cache failed, falling back to database:', error);
      }
    }

    // For historical data or large queries, use database
    return await this.databaseAdapter.getEvents(filter);
  }

  async getEventCount(filter?: any): Promise<number> {
    return await this.databaseAdapter.getEventCount(filter);
  }

  async getEventsByType(filter?: any): Promise<Record<string, number>> {
    return await this.databaseAdapter.getEventsByType(filter);
  }

  async getEventsByQueue(filter?: any): Promise<Record<string, number>> {
    return await this.databaseAdapter.getEventsByQueue(filter);
  }

  async clearEvents(): Promise<void> {
    await Promise.all([this.memoryAdapter.clearEvents(), this.databaseAdapter.clearEvents()]);
  }

  async exportEvents(filter?: any): Promise<string> {
    return await this.databaseAdapter.exportEvents(filter);
  }

  async getHealthStatus(): Promise<{
    status: 'healthy' | 'warning' | 'error';
    message: string;
    details?: any;
  }> {
    const [memoryHealth, dbHealth] = await Promise.all([
      this.memoryAdapter.getHealthStatus(),
      this.databaseAdapter.getHealthStatus(),
    ]);

    // If database is down, but memory is ok, return warning
    if (dbHealth.status === 'error' && memoryHealth.status === 'healthy') {
      return {
        status: 'warning',
        message: 'Database storage unavailable, running on memory cache only',
        details: { memory: memoryHealth.details, database: dbHealth.details },
      };
    }

    // If both are healthy, return healthy
    if (memoryHealth.status === 'healthy' && dbHealth.status === 'healthy') {
      return {
        status: 'healthy',
        message: 'Hybrid storage operating normally',
        details: { memory: memoryHealth.details, database: dbHealth.details },
      };
    }

    // Otherwise, return the worse status
    return {
      status: dbHealth.status === 'error' ? 'error' : 'warning',
      message: 'Hybrid storage has issues',
      details: { memory: memoryHealth.details, database: dbHealth.details },
    };
  }
}
