import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from './user.service';

export class UserController {
  static async list(request: FastifyRequest, reply: FastifyReply) {
    const users = await UserService.list();
    return reply.send({ success: true, data: users });
  }
  static async getById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const user = await UserService.getById(id);
    if (!user) return reply.code(404).send({ success: false, error: 'User not found' });
    return reply.send({ success: true, data: user });
  }
  static async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user; // From JWT middleware for actorId
      const metadata = {
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      };
      const eventBus = (request.server as any).eventBus;

      const newUser = await UserService.create(request.body, user?.id, metadata, eventBus);
      return reply.code(201).send({ success: true, data: newUser });
    } catch (error: any) {
      return reply.code(400).send({ success: false, error: error.message });
    }
  }
  static async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const user = (request as any).user; // From JWT middleware for actorId
      const metadata = {
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      };
      const eventBus = (request.server as any).eventBus;

      const updatedUser = await UserService.update(id, request.body, user?.id, metadata, eventBus);
      return reply.send({ success: true, data: updatedUser });
    } catch (error: any) {
      return reply.code(400).send({ success: false, error: error.message });
    }
  }
  static async remove(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const user = (request as any).user; // From JWT middleware for actorId
      const metadata = {
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      };
      const eventBus = (request.server as any).eventBus;

      await UserService.remove(id, user?.id, metadata, eventBus);
      return reply.code(204).send();
    } catch (error: any) {
      return reply.code(400).send({ success: false, error: error.message });
    }
  }
}
