import { Type } from '@fastify/type-provider-typebox';

export const ApiKeyModel = Type.Object({
  id: Type.String(),
  key: Type.String(),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
});
