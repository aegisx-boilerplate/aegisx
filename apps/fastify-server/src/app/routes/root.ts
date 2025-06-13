import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance) {
  fastify.get('/', async function () {
    return { message: 'Hello Fastify Server!' };
  });

  // Simple test route
  fastify.get('/test', async function () {
    return {
      status: 'ok',
      message: 'Fastify server is working!',
      timestamp: new Date().toISOString()
    };
  });
}
