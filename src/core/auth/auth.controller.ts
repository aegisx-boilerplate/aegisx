import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './auth.service';

export class AuthController {
  static async login(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as any;
    const usernameOrEmail = body.username || body.email;
    const password = body.password;

    if (!usernameOrEmail || !password) {
      return reply.code(400).send({
        success: false,
        error: 'Username/email and password are required',
      });
    }

    try {
      // Extract metadata for audit logging
      const metadata = {
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      };

      const result = await AuthService.login(usernameOrEmail, password, metadata);
      return reply.send({
        success: true,
        token: result,
      });
    } catch (error: any) {
      return reply.code(401).send({
        success: false,
        error: error.message || 'Authentication failed',
      });
    }
  }
}
