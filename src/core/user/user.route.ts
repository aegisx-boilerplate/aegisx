import { FastifyInstance } from 'fastify';
import { UserController } from './user.controller';
import { UserCreateSchema, UserUpdateSchema, UserIdParamSchema } from './user.schema';
import { authorize } from '../../middlewares/authorize';
import { authenticate } from '../../middlewares/authenticate';

export async function userRoutes(fastify: FastifyInstance) {
  fastify.get('/users', {
    preHandler: [authenticate],
    schema: { tags: ['user'] as ['user'] },
    handler: UserController.list,
  });
  fastify.get('/users/:id', {
    preHandler: [authenticate],
    schema: { tags: ['user'] as ['user'], params: UserIdParamSchema },
    handler: UserController.getById,
  });
  fastify.post('/users', {
    schema: { tags: ['user'] as ['user'], body: UserCreateSchema },
    handler: UserController.create,
  });
  fastify.put('/users/:id', {
    preHandler: [authenticate, authorize('user:manage')],
    schema: { tags: ['user'] as ['user'], params: UserIdParamSchema, body: UserUpdateSchema },
    handler: UserController.update,
  });
  fastify.delete('/users/:id', {
    preHandler: [authenticate, authorize('user:manage')],
    schema: { tags: ['user'] as ['user'], params: UserIdParamSchema },
    handler: UserController.remove,
  });
}
