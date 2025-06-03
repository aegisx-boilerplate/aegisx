import { FastifyRequest, FastifyReply } from 'fastify';
import { ApiKeyService } from './api-key.service';

export function apiKeyMiddleware(scope?: string) {
  return async function (request: FastifyRequest, reply: FastifyReply) {
    const apiKey = request.headers['x-api-key'] as string;
    if (!apiKey) {
      return reply.code(401).send({ message: 'API key required' });
    }
    const ip = request.ip;
    const valid = await ApiKeyService.validate(apiKey, ip, scope);
    if (!valid) {
      return reply.code(403).send({ message: 'Invalid or unauthorized API key' });
    }
    // If valid, just return
  };
}
