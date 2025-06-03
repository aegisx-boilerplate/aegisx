import { Type } from '@fastify/type-provider-typebox';

export const LoginSchema = Type.Object({
  username: Type.String(),
  password: Type.String(),
});

export const AuthResponseSchema = Type.Object({
  token: Type.String(),
});
