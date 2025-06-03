import { FastifyRequest, FastifyReply } from 'fastify';
import { RbacService } from '../core/rbac/rbac.service';

export function authorize(permission: string) {
  return async function (request: FastifyRequest, reply: FastifyReply) {
    // Assume user id is in request.user.id (populated by authenticate middleware)
    const user = (request as any).user;
    if (!user || !user.id) {
      return reply.code(401).send({ message: 'Unauthorized' });
    }
    const permissions = await RbacService.getUserPermissions(user.id);
    if (!permissions.includes(permission)) {
      return reply.code(403).send({ message: 'Forbidden' });
    }
    // If authorized, just return (no done needed)
  };
}
