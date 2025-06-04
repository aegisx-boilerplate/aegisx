import { FastifyInstance } from 'fastify';
import { AuthController } from './auth.controller';
import { LoginSchema, AuthResponseSchema } from './auth.schema';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/auth/login',
    {
      schema: {
        tags: ['Auth'],
        body: LoginSchema,
        response: { 200: AuthResponseSchema },
      },
    },
    AuthController.login
  );
}
