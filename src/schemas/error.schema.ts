import { Type } from '@fastify/type-provider-typebox';

export const ErrorResponse = Type.Object({
  statusCode: Type.Number(),
  error: Type.String(),
  message: Type.String(),
});
