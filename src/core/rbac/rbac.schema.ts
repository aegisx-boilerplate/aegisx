import { Type } from '@fastify/type-provider-typebox';

export const RoleSchema = Type.Object({
  name: Type.String({ minLength: 2 }),
  description: Type.Optional(Type.String()),
});

export const PermissionSchema = Type.Object({
  name: Type.String({ minLength: 2 }),
  description: Type.Optional(Type.String()),
});

export const AssignRoleSchema = Type.Object({
  userId: Type.String(),
  roleId: Type.String(),
});

export const AssignPermissionSchema = Type.Object({
  roleId: Type.String(),
  permissionId: Type.String(),
});
