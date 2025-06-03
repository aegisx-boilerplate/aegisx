import { FastifyInstance } from 'fastify';
import { ApiKeyService } from './api-key.service';
import {
  ApiKeyCreateSchema,
  ApiKeyResponseSchema,
  ApiKeyListResponseSchema,
} from './api-key.schema';

export async function apiKeyRoutes(fastify: FastifyInstance) {
  fastify.post('/api-keys', {
    schema: {
      tags: ['api-key'] as ['api-key'],
      body: ApiKeyCreateSchema,
      response: { 201: ApiKeyResponseSchema },
    },
    handler: async (request, reply) => {
      const apiKey = await ApiKeyService.create(request.body as any);
      reply.code(201).send(apiKey);
    },
  });
  fastify.get('/api-keys', {
    schema: { tags: ['api-key'] as ['api-key'], response: { 200: ApiKeyListResponseSchema } },
    handler: async (request, reply) => {
      const keys = await ApiKeyService.list();
      reply.send(keys);
    },
  });
  fastify.delete('/api-keys/:id', {
    schema: { tags: ['api-key'] as ['api-key'] },
    handler: async (request, reply) => {
      const { id } = request.params as any;
      const apiKey = await ApiKeyService.revoke(id);
      if (!apiKey) return reply.code(404).send({ message: 'Not found' });
      reply.send(apiKey);
    },
  });
}
