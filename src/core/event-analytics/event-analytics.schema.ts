import { Type } from '@fastify/type-provider-typebox';

// Query schemas
export const EventMetricsQuerySchema = Type.Object({
  period: Type.Optional(
    Type.Union([Type.Literal('1h'), Type.Literal('24h'), Type.Literal('7d'), Type.Literal('30d')], {
      description: 'Time period for metrics',
      default: '24h',
    })
  ),
  start: Type.Optional(
    Type.String({
      format: 'date-time',
      description: 'Custom start time (ISO 8601 format)',
    })
  ),
  end: Type.Optional(
    Type.String({
      format: 'date-time',
      description: 'Custom end time (ISO 8601 format)',
    })
  ),
});

export const UserEventStatsParamsSchema = Type.Object({
  userId: Type.String({
    description: 'User ID to get event statistics for',
  }),
});

export const EventExportQuerySchema = Type.Object({
  format: Type.Optional(
    Type.Union([Type.Literal('json'), Type.Literal('csv')], {
      description: 'Export format',
      default: 'json',
    })
  ),
});

// Response schemas
export const SystemHealthSchema = Type.Object({
  status: Type.Union([Type.Literal('healthy'), Type.Literal('warning'), Type.Literal('error')], {
    description: 'System health status',
  }),
  message: Type.String({ description: 'Health status message' }),
  uptime: Type.Number({ description: 'System uptime in seconds' }),
});

export const EventMetricsDataSchema = Type.Object({
  totalEvents: Type.Integer({
    minimum: 0,
    description: 'Total number of events in the time period',
  }),
  eventsByType: Type.Record(Type.String(), Type.Integer(), {
    description: 'Event count grouped by event type',
  }),
  eventsByQueue: Type.Record(Type.String(), Type.Integer(), {
    description: 'Event count grouped by queue name',
  }),
  recentEvents: Type.Array(
    Type.Object({
      type: Type.String({ description: 'Event type' }),
      queue: Type.String({ description: 'Queue name' }),
      timestamp: Type.String({
        format: 'date-time',
        description: 'Event timestamp (ISO 8601)',
      }),
      userId: Type.Optional(Type.String({ description: 'Associated user ID' })),
    }),
    {
      description: 'List of recent events (up to 10)',
      maxItems: 10,
    }
  ),
  systemHealth: SystemHealthSchema,
});

export const EventMetricsResponseSchema = Type.Object({
  success: Type.Literal(true),
  data: EventMetricsDataSchema,
  timestamp: Type.String({
    format: 'date-time',
    description: 'Response timestamp (ISO 8601)',
  }),
});

export const UserEventStatsDataSchema = Type.Object({
  userId: Type.String({ description: 'User ID' }),
  totalEvents: Type.Integer({
    minimum: 0,
    description: 'Total events for this user',
  }),
  eventsByType: Type.Record(Type.String(), Type.Integer(), {
    description: 'User event count grouped by event type',
  }),
  recentActivity: Type.Array(
    Type.Object({
      type: Type.String({ description: 'Event type' }),
      queue: Type.String({ description: 'Queue name' }),
      timestamp: Type.String({
        format: 'date-time',
        description: 'Event timestamp (ISO 8601)',
      }),
    }),
    {
      description: 'Recent user activity (up to 5)',
      maxItems: 5,
    }
  ),
});

export const UserEventStatsResponseSchema = Type.Object({
  success: Type.Literal(true),
  data: UserEventStatsDataSchema,
  timestamp: Type.String({
    format: 'date-time',
    description: 'Response timestamp (ISO 8601)',
  }),
});

export const EventHealthResponseSchema = Type.Object({
  success: Type.Literal(true),
  health: SystemHealthSchema,
  timestamp: Type.String({
    format: 'date-time',
    description: 'Response timestamp (ISO 8601)',
  }),
});

// Error response schemas
export const EventAnalyticsErrorSchema = Type.Object({
  success: Type.Literal(false),
  error: Type.String({ description: 'Error message' }),
  timestamp: Type.String({
    format: 'date-time',
    description: 'Error timestamp (ISO 8601)',
  }),
});
