import { Type } from '@fastify/type-provider-typebox';

export const UserCreateSchema = Type.Object({
  username: Type.String({ minLength: 3, description: 'Username (minimum 3 characters)' }),
  password: Type.String({ minLength: 6, description: 'Password (minimum 6 characters)' }),
  email: Type.Optional(Type.String({ format: 'email', description: 'User email address' })),
});

export const UserUpdateSchema = Type.Partial(UserCreateSchema);

export const UserIdParamSchema = Type.Object({
  id: Type.String({ description: 'User ID parameter' }),
});

export const UserResponseSchema = Type.Object({
  id: Type.String({ description: 'User ID' }),
  username: Type.String({ description: 'Username' }),
  email: Type.Optional(Type.String({ description: 'User email' })),
  name: Type.Optional(Type.String({ description: 'Full name' })),
  roleId: Type.Optional(Type.String({ description: 'Role ID' })),
  isActive: Type.Optional(Type.Boolean({ description: 'Active status' })),
  createdAt: Type.String({ format: 'date-time', description: 'Creation timestamp' }),
  updatedAt: Type.String({ format: 'date-time', description: 'Last update timestamp' }),
});

export const UserListResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Array(UserResponseSchema),
});
