import fp from 'fastify-plugin';
import fastifyRedis from '@fastify/redis';
import { env } from '../config/env';

export default fp(async (fastify) => {
  fastify.register(fastifyRedis, {
    url: env.REDIS_URL,
  });
});
