import { Type } from '@fastify/type-provider-typebox';

export const ApiKeyCreateSchema = Type.Object({
  name: Type.String(),
  scopes: Type.Array(Type.String()),
  ipWhitelist: Type.Optional(Type.Array(Type.String({ format: 'ipv4' }))),
});

export const ApiKeyResponseSchema = Type.Object({
  id: Type.String(),
  key: Type.String(),
  name: Type.String(),
  scopes: Type.Array(Type.String()),
  ipWhitelist: Type.Optional(Type.Array(Type.String())),
  createdAt: Type.String({ format: 'date-time' }),
  revoked: Type.Boolean(),
});

export const ApiKeyListResponseSchema = Type.Array(ApiKeyResponseSchema);
