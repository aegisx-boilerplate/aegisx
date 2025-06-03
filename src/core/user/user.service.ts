import { knex } from '../../db/knex';
import Redis from 'ioredis';
import { env } from '../../config/env';
import bcrypt from 'bcryptjs';
import { auditEvents } from '../audit/audit.events';

const redis = new Redis(env.REDIS_URL);

export class UserService {
  static async list() {
    const cached = await redis.get('users:all');
    if (cached) return JSON.parse(cached);
    const users = await knex('users').select('*');
    await redis.set('users:all', JSON.stringify(users));
    return users;
  }
  static async getById(id: string) {
    return knex('users').where({ id }).first();
  }
  static async create(data: any, actorId?: string, metadata?: { ip?: string; userAgent?: string }) {
    // Always hash password
    const passwordHash = await bcrypt.hash(data.password, 10);
    const [user] = await knex('users')
      .insert({
        ...data,
        password_hash: passwordHash,
        password: undefined,
      })
      .returning('*');
    await redis.del('users:all');

    // Log user creation
    await auditEvents.recordUserCreated({
      actorId: actorId || 'system',
      userId: user.id,
      username: user.username,
      email: user.email,
      ip: metadata?.ip,
      userAgent: metadata?.userAgent,
    });

    return user;
  }
  static async update(
    id: string,
    data: any,
    actorId?: string,
    metadata?: { ip?: string; userAgent?: string }
  ) {
    const updateData = { ...data };
    if (updateData.password) {
      updateData.password_hash = await bcrypt.hash(updateData.password, 10);
      delete updateData.password;
    }
    const [user] = await knex('users').where({ id }).update(updateData).returning('*');
    await redis.del('users:all');

    // Log user update
    await auditEvents.recordUserUpdated({
      actorId: actorId || 'system',
      userId: id,
      changes: Object.keys(updateData),
      ip: metadata?.ip,
      userAgent: metadata?.userAgent,
    });

    return user;
  }
  static async remove(
    id: string,
    actorId?: string,
    metadata?: { ip?: string; userAgent?: string }
  ) {
    // Get user info before deletion for audit log
    const user = await knex('users').where({ id }).first();
    await knex('users').where({ id }).del();
    await redis.del('users:all');

    // Log user deletion
    await auditEvents.recordUserDeleted({
      actorId: actorId || 'system',
      userId: id,
      username: user?.username,
      ip: metadata?.ip,
      userAgent: metadata?.userAgent,
    });

    return { id };
  }
}
