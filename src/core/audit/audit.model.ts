import { Type, Static } from '@fastify/type-provider-typebox';

export const AuditLogModel = Type.Object({
  id: Type.String({ format: 'uuid' }),
  actor: Type.String(),
  action: Type.String(),
  target: Type.Optional(Type.String()),
  details: Type.Optional(Type.Any()),
  created_at: Type.String({ format: 'date-time' }),
});

export const AuditLogMetadata = Type.Object({
  ip: Type.Optional(Type.String()),
  userAgent: Type.Optional(Type.String()),
});

export type AuditLog = Static<typeof AuditLogModel>;
export type AuditMetadata = Static<typeof AuditLogMetadata>;
