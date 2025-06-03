import { FastifyInstance } from 'fastify';
import { UserController } from './user.controller';
import { UserCreateSchema, UserUpdateSchema, UserIdParamSchema } from './user.schema';
import { authorize } from '../../middlewares/authorize';
import { authenticate } from '../../middlewares/authenticate';

export async function userRoutes(fastify: FastifyInstance) {
    fastify.get('/users', {
        preHandler: [authenticate],
        schema: {
            tags: ['user'] as ['user'],
            security: [{ bearerAuth: [] }],
            description: 'Get all users (requires authentication)'
        },
        handler: UserController.list,
    });
    fastify.get('/users/:id', {
        preHandler: [authenticate],
        schema: {
            tags: ['user'] as ['user'],
            params: UserIdParamSchema,
            security: [{ bearerAuth: [] }],
            description: 'Get user by ID (requires authentication)'
        },
        handler: UserController.getById,
    });
    fastify.post('/users', {
        schema: {
            tags: ['user'] as ['user'],
            body: UserCreateSchema,
            description: 'Create new user (public endpoint for registration)'
        },
        handler: UserController.create,
    });
    fastify.put('/users/:id', {
        preHandler: [authenticate, authorize('user:manage')],
        schema: {
            tags: ['user'] as ['user'],
            params: UserIdParamSchema,
            body: UserUpdateSchema,
            security: [{ bearerAuth: [] }],
            description: 'Update user (requires authentication and user:manage permission)'
        },
        handler: UserController.update,
    });
    fastify.delete('/users/:id', {
        preHandler: [authenticate, authorize('user:manage')],
        schema: {
            tags: ['user'] as ['user'],
            params: UserIdParamSchema,
            security: [{ bearerAuth: [] }],
            description: 'Delete user (requires authentication and user:manage permission)'
        },
        handler: UserController.remove,
    });
}
