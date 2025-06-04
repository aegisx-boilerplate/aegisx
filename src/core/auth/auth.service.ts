import { knex } from '../../db/knex';
import { env } from '../../config/env';
import Redis from 'ioredis';
import bcrypt from 'bcryptjs';
import { FastifyInstance } from 'fastify';
import { AuditLogger } from '../../utils/audit-logger';

const redis = new Redis(env.REDIS_URL);

let fastifyInstance: FastifyInstance | null = null;

export function setFastifyInstance(instance: FastifyInstance) {
  fastifyInstance = instance;
}

export class AuthService {
  static async login(
    usernameOrEmail: string,
    password: string,
    metadata?: { ip?: string; userAgent?: string }
  ) {
    // Try to find user by username first, then by email
    let user = await knex('users').where({ username: usernameOrEmail }).first();
    if (!user) {
      user = await knex('users').where({ email: usernameOrEmail }).first();
    }

    if (!user) {
      // Log failed login attempt
      await AuditLogger.logAuth({
        userId: usernameOrEmail,
        action: 'login.failed',
        reason: 'user_not_found',
        ip: metadata?.ip,
        userAgent: metadata?.userAgent,
      });
      throw new Error('Invalid credentials');
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      // Log failed login attempt
      await AuditLogger.logAuth({
        userId: user.id,
        action: 'login.failed',
        reason: 'invalid_password',
        ip: metadata?.ip,
        userAgent: metadata?.userAgent,
      });
      throw new Error('Invalid credentials');
    }
    // Load permissions for JWT (optional, for performance)
    let permissions: string[] = [];
    try {
      const rows = await knex('user_roles')
        .join('role_permissions', 'user_roles.role_id', 'role_permissions.role_id')
        .join('permissions', 'role_permissions.permission_id', 'permissions.id')
        .where('user_roles.user_id', user.id)
        .select('permissions.name');
      permissions = rows.map((r: any) => r.name);
    } catch {
      permissions = [];
    }
    await redis.set(`user:${user.id}:session`, JSON.stringify(user));

    // Log successful login
    await AuditLogger.logAuth({
      userId: user.id,
      action: 'login.success',
      ip: metadata?.ip,
      userAgent: metadata?.userAgent,
    });

    return this.signJwt({
      id: user.id,
      username: user.username,
      role_id: user.role_id,
      permissions,
    });
  }

  static signJwt(payload: any) {
    if (!fastifyInstance) throw new Error('Fastify instance not set');
    return fastifyInstance.jwt.sign(payload, { expiresIn: '1d' });
  }
}
