import { Type } from '@fastify/type-provider-typebox';

export const UserCreateSchema = Type.Object({
  username: Type.String({ minLength: 3 }),
  password: Type.String({ minLength: 6 }),
  email: Type.Optional(Type.String({ format: 'email' })),
});

export const UserUpdateSchema = Type.Partial(UserCreateSchema);

export const UserIdParamSchema = Type.Object({
  id: Type.String(),
});
