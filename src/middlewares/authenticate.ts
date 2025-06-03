import { FastifyRequest, FastifyReply } from 'fastify';

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  // Fastify JWT plugin will decorate request with jwtVerify
  // This middleware should be used as preHandler
  try {
    await request.jwtVerify();
  } catch (err: any) {
    return reply.code(401).send({
      success: false,
      error: err?.message || 'Unauthorized',
    });
  }
}
