import { knex } from '../../db/knex';
import Redis from 'ioredis';
import { env } from '../../config/env';

const redis = new Redis(env.REDIS_URL);

export class RbacService {
  static async listRoles() {
    return knex('roles').select('*');
  }
  static async createRole(data: any) {
    const [role] = await knex('roles').insert(data).returning('*');
    return role;
  }
  static async listPermissions() {
    return knex('permissions').select('*');
  }
  static async createPermission(data: any) {
    const [permission] = await knex('permissions').insert(data).returning('*');
    return permission;
  }
  static async assignRole(userId: string, roleId: string) {
    await knex('user_roles').insert({ user_id: userId, role_id: roleId });
    await this.cacheUserPermissions(userId);
    return { userId, roleId };
  }
  static async assignPermission(roleId: string, permissionId: string) {
    await knex('role_permissions').insert({ role_id: roleId, permission_id: permissionId });
    // update all users with this role
    const users = await knex('user_roles').where({ role_id: roleId });
    for (const u of users) {
      await this.cacheUserPermissions(u.user_id);
    }
    return { roleId, permissionId };
  }
  static async getUserPermissions(userId: string): Promise<string[]> {
    const cached = await redis.get(`user:${userId}:permissions`);
    if (cached) return JSON.parse(cached);
    return this.cacheUserPermissions(userId);
  }
  static async cacheUserPermissions(userId: string): Promise<string[]> {
    const rows = await knex('user_roles')
      .join('role_permissions', 'user_roles.role_id', 'role_permissions.role_id')
      .join('permissions', 'role_permissions.permission_id', 'permissions.id')
      .where('user_roles.user_id', userId)
      .select('permissions.name');
    const permissions = rows.map((r: any) => r.name);
    await redis.set(`user:${userId}:permissions`, JSON.stringify(permissions));
    return permissions;
  }
}
