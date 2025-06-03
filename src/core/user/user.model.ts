import { Type, Static } from '@fastify/type-provider-typebox';

export const UserModel = Type.Object({
  id: Type.String(),
  username: Type.String(),
  email: Type.Optional(Type.String({ format: 'email' })),
  name: Type.Optional(Type.String()),
  roleId: Type.Optional(Type.String()),
  isActive: Type.Optional(Type.Boolean()),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
});

export type User = Static<typeof UserModel>;
