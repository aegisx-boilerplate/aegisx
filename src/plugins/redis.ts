import fp from 'fastify-plugin';
import fastifyRedis from '@fastify/redis';
import { config } from '../config/config';

export default fp(async (fastify) => {
  fastify.register(fastifyRedis, {
    url: config.redis.url,
  });
});
