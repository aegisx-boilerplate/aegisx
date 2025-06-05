import { FastifyRequest, FastifyReply } from 'fastify';
import { jwtAuthGuard, flexibleAuthGuard } from './auth-guards';

/**
 * Legacy authenticate middleware - uses JWT authentication
 * @deprecated Use auth guards directly for better flexibility
 */
export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  return jwtAuthGuard(request, reply);
}

/**
 * Flexible authentication middleware - supports both JWT and API key
 */
export async function authenticateFlexible(request: FastifyRequest, reply: FastifyReply) {
  return flexibleAuthGuard(request, reply);
}
