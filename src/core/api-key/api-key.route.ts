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
      tags: ['ApiKey'] as ['ApiKey'],
      body: ApiKeyCreateSchema,
      response: { 201: ApiKeyResponseSchema },
      security: [{ bearerAuth: [] }],
      description: 'Create a new API key (requires authentication)'
    },
    handler: async (request, reply) => {
      const apiKey = await ApiKeyService.create(request.body as any);
      reply.code(201).send(apiKey);
    },
  });
  fastify.get('/api-keys', {
    schema: { tags: ['ApiKey'] as ['ApiKey'], response: { 200: ApiKeyListResponseSchema }, security: [{ bearerAuth: [] }], description: 'List all API keys (requires authentication)' },
    handler: async (request, reply) => {
      const keys = await ApiKeyService.list();
      reply.send(keys);
    },
  });
  fastify.delete('/api-keys/:id', {
    schema: { tags: ['ApiKey'] as ['ApiKey'], security: [{ bearerAuth: [] }], description: 'Revoke API key (requires authentication)' },
    handler: async (request, reply) => {
      const { id } = request.params as any;
      const apiKey = await ApiKeyService.revoke(id);
      if (!apiKey) return reply.code(404).send({ message: 'Not found' });
      reply.send(apiKey);
    },
  });
}
