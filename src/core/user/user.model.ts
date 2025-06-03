import { Type, Static } from '@fastify/type-provider-typebox';

export const UserModel = Type.Object({
  id: Type.String(),
  username: Type.String(),
  password: Type.String(),
  email: Type.Optional(Type.String({ format: 'email' })),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
});

export type User = Static<typeof UserModel>;
