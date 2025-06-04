import { FastifyInstance } from 'fastify';
import { RbacService } from './rbac.service';
import { RoleSchema, AssignRoleSchema } from './rbac.schema';
import { authenticate } from '../../middlewares/authenticate';

export async function roleRoutes(fastify: FastifyInstance) {
    fastify.get('/roles', {
        preHandler: [authenticate],
        schema: { tags: ['RBAC'] as ['RBAC'], security: [{ bearerAuth: [] }], description: 'List all roles (requires authentication)' },
        handler: async (request, reply) => {
            const roles = await RbacService.listRoles();
            reply.send({ success: true, data: roles });
        },
    });
    fastify.post('/roles', {
        preHandler: [authenticate],
        schema: { tags: ['RBAC'] as ['RBAC'], body: RoleSchema, security: [{ bearerAuth: [] }], description: 'Create a new role (requires authentication)' },
        handler: async (request, reply) => {
            const role = await RbacService.createRole(request.body);
            reply.code(201).send({ success: true, data: role });
        },
    });
    fastify.post('/roles/assign', {
        preHandler: [authenticate],
        schema: { tags: ['RBAC'] as ['RBAC'], body: AssignRoleSchema, security: [{ bearerAuth: [] }], description: 'Assign role to user (requires authentication)' },
        handler: async (request, reply) => {
            const { userId, roleId } = request.body as any;
            const result = await RbacService.assignRole(userId, roleId);
            reply.send({ success: true, data: result });
        },
    });
}
