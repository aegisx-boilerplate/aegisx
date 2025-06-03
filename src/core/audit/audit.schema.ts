import { Type } from '@fastify/type-provider-typebox';

export const AuditLogQuerySchema = Type.Object({
  actor: Type.Optional(Type.String()),
  action: Type.Optional(Type.String()),
  target: Type.Optional(Type.String()),
  from: Type.Optional(Type.String({ format: 'date-time' })),
  to: Type.Optional(Type.String({ format: 'date-time' })),
  page: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 20 })),
});

export const AuditLogIdParamSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
});

export const AuditLogStatsQuerySchema = Type.Object({
  from: Type.Optional(Type.String({ format: 'date-time' })),
  to: Type.Optional(Type.String({ format: 'date-time' })),
});

export const AuditLogResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Object({
    logs: Type.Array(
      Type.Object({
        id: Type.String({ format: 'uuid' }),
        actor: Type.String(),
        action: Type.String(),
        target: Type.Optional(Type.String()),
        details: Type.Optional(Type.Any()),
        created_at: Type.String({ format: 'date-time' }),
      })
    ),
    pagination: Type.Object({
      page: Type.Integer(),
      limit: Type.Integer(),
      total: Type.Integer(),
      totalPages: Type.Integer(),
    }),
  }),
});

export const AuditLogStatsResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Object({
    actionStats: Type.Array(
      Type.Object({
        action: Type.String(),
        count: Type.Integer(),
      })
    ),
    actorStats: Type.Array(
      Type.Object({
        actor: Type.String(),
        count: Type.Integer(),
      })
    ),
    dailyActivity: Type.Array(
      Type.Object({
        date: Type.String(),
        count: Type.Integer(),
      })
    ),
  }),
});

export const AuditLogDetailResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Object({
    id: Type.String({ format: 'uuid' }),
    actor: Type.String(),
    action: Type.String(),
    target: Type.Optional(Type.String()),
    details: Type.Optional(Type.Any()),
    created_at: Type.String({ format: 'date-time' }),
  }),
});
