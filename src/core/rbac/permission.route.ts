import { FastifyInstance } from 'fastify';
import { RbacService } from './rbac.service';
import { PermissionSchema, AssignPermissionSchema } from './rbac.schema';
import { authenticate } from '../../middlewares/authenticate';

export async function permissionRoutes(fastify: FastifyInstance) {
  fastify.get('/permissions', {
    preHandler: [authenticate],
    schema: { tags: ['RBAC'] as ['RBAC'], security: [{ bearerAuth: [] }], description: 'List all permissions (requires authentication)' },
    handler: async (request, reply) => {
      const permissions = await RbacService.listPermissions();
      reply.send({ success: true, data: permissions });
    },
  });
  fastify.post('/permissions', {
    preHandler: [authenticate],
    schema: { tags: ['RBAC'] as ['RBAC'], body: PermissionSchema, security: [{ bearerAuth: [] }], description: 'Create a new permission (requires authentication)' },
    handler: async (request, reply) => {
      const permission = await RbacService.createPermission(request.body);
      reply.code(201).send({ success: true, data: permission });
    },
  });
  fastify.post('/permissions/assign', {
    preHandler: [authenticate],
    schema: { tags: ['RBAC'] as ['RBAC'], body: AssignPermissionSchema, security: [{ bearerAuth: [] }], description: 'Assign permission to role (requires authentication)' },
    handler: async (request, reply) => {
      const { roleId, permissionId } = request.body as any;
      const result = await RbacService.assignPermission(roleId, permissionId);
      reply.send({ success: true, data: result });
    },
  });
}
