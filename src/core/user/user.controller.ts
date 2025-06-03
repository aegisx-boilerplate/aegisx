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
    const user = await UserService.create(request.body);
    return reply.code(201).send({ success: true, data: user });
  }
  static async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const user = await UserService.update(id, request.body);
    return reply.send({ success: true, data: user });
  }
  static async remove(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    await UserService.remove(id);
    return reply.code(204).send();
  }
}
