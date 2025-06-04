import { knex } from '../../db/knex';
import Redis from 'ioredis';
import { env } from '../../config/env';
import bcrypt from 'bcryptjs';
import { AuditLogger } from '../../utils/audit-logger';

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
        delete data.password; // Remove plain password from data
        const insertData: any = {
            username: data.username,
            password_hash: passwordHash,
            email: data.email,
            name: data.name,
            role_id: data.roleId,
            is_active: data.isActive !== undefined ? data.isActive : true
        };
        const [user] = await knex('users')
            .insert(insertData)
            .returning('*');
        await redis.del('users:all');

        // Log user creation
        await AuditLogger.logUserManagement({
            actorId: actorId || 'system',
            action: 'user.created',
            targetUserId: user.id,
            details: {
                username: user.username,
                email: user.email,
            },
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
        const updateData: any = {};
        if (data.username) updateData.username = data.username;
        if (data.email) updateData.email = data.email;
        if (data.name) updateData.name = data.name;
        if (data.roleId) updateData.role_id = data.roleId;
        if (typeof data.isActive === 'boolean') updateData.is_active = data.isActive;
        if (data.password) {
            updateData.password_hash = await bcrypt.hash(data.password, 10);
        }
        if (Object.keys(updateData).length === 0) return await this.getById(id);
        updateData.updated_at = knex.fn.now();
        const [user] = await knex('users').where({ id }).update(updateData).returning('*');
        await redis.del('users:all');

        // Log user update
        await AuditLogger.logUserManagement({
            actorId: actorId || 'system',
            action: 'user.updated',
            targetUserId: id,
            details: {
                changes: Object.keys(updateData),
            },
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
        await AuditLogger.logUserManagement({
            actorId: actorId || 'system',
            action: 'user.deleted',
            targetUserId: id,
            details: {
                username: user?.username,
            },
            ip: metadata?.ip,
            userAgent: metadata?.userAgent,
        });

        return { id };
    }
}
