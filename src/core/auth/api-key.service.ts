import { knex } from '../../db/knex';
import { generateApiKey } from '../../utils/generate-api-key';
import Redis from 'ioredis';
import { env } from '../../config/env';
import { AuditLogger } from '../../utils/audit-logger';
import { ResilientEventBus } from '../event-bus';

const redis = new Redis(env.REDIS_URL);

export class ApiKeyService {
  static async create(
    {
      name,
      scopes,
      ipWhitelist,
      userId,
    }: {
      name: string;
      scopes: string[];
      ipWhitelist?: string[];
      userId?: string;
    },
    actorId?: string,
    metadata?: { ip?: string; userAgent?: string },
    eventBus?: ResilientEventBus
  ) {
    const key = generateApiKey();
    const [apiKey] = await knex('api_keys')
      .insert({
        key,
        name,
        user_id: userId, // Add user_id for user association
        scopes: JSON.stringify(scopes),
        ip_whitelist: ipWhitelist ? JSON.stringify(ipWhitelist) : null,
        revoked: false,
      })
      .returning('*');
    await redis.set(`api-key:${key}`, JSON.stringify(apiKey));

    // Log API key creation
    if (eventBus) {
      await AuditLogger.logApiKey(eventBus, {
        actorId: actorId || 'system',
        action: 'api_key.created',
        keyId: apiKey.id,
        details: {
          name,
          scopes,
          userId,
        },
        ip: metadata?.ip,
        userAgent: metadata?.userAgent,
      });
    }

    return {
      ...apiKey,
      key: apiKey.key, // Return the actual key only during creation
    };
  }

  static async list() {
    const keys = await knex('api_keys')
      .select(
        'id',
        'name',
        'scopes',
        'ip_whitelist',
        'expires_at',
        'created_at',
        'revoked',
        'user_id'
      )
      .orderBy('created_at', 'desc');
    return keys;
  }

  /**
   * List API keys for a specific user
   */
  static async listByUser(userId: string) {
    const keys = await knex('api_keys')
      .where({ user_id: userId })
      .select('id', 'name', 'scopes', 'ip_whitelist', 'expires_at', 'created_at', 'revoked')
      .orderBy('created_at', 'desc');

    return keys.map((key) => ({
      ...key,
      scopes: typeof key.scopes === 'string' ? JSON.parse(key.scopes) : key.scopes,
      ip_whitelist: key.ip_whitelist ? JSON.parse(key.ip_whitelist) : null,
    }));
  }

  static async revoke(
    id: string,
    actorId?: string,
    metadata?: { ip?: string; userAgent?: string },
    eventBus?: ResilientEventBus
  ) {
    // Get API key info before revocation for audit log
    const existingKey = await knex('api_keys').where({ id }).first();
    const [apiKey] = await knex('api_keys').where({ id }).update({ revoked: true }).returning('*');
    if (apiKey) await redis.del(`api-key:${apiKey.key}`);

    // Log API key revocation
    if (eventBus) {
      await AuditLogger.logApiKey(eventBus, {
        actorId: actorId || 'system',
        action: 'api_key.revoked',
        keyId: id,
        details: {
          name: existingKey?.name,
        },
        ip: metadata?.ip,
        userAgent: metadata?.userAgent,
      });
    }

    return apiKey;
  }

  /**
   * Revoke all API keys for a specific user
   */
  static async revokeByUser(
    userId: string,
    actorId?: string,
    metadata?: { ip?: string; userAgent?: string },
    eventBus?: ResilientEventBus
  ) {
    // Get user's API keys before revocation
    const userKeys = await knex('api_keys').where({ user_id: userId, revoked: false }).select('*');

    // Revoke all user's API keys
    const revokedKeys = await knex('api_keys')
      .where({ user_id: userId, revoked: false })
      .update({ revoked: true })
      .returning('*');

    // Clear from Redis cache
    for (const key of userKeys) {
      await redis.del(`api-key:${key.key}`);
    }

    // Log API key revocations
    if (eventBus) {
      for (const key of revokedKeys) {
        await AuditLogger.logApiKey(eventBus, {
          actorId: actorId || 'system',
          action: 'api_key.revoked',
          keyId: key.id,
          details: {
            name: key.name,
            reason: 'user_revocation',
          },
          ip: metadata?.ip,
          userAgent: metadata?.userAgent,
        });
      }
    }

    return revokedKeys;
  }

  /**
   * Revoke a specific API key for a user with ownership validation
   */
  static async revokeUserApiKey(
    keyId: string,
    userId: string,
    actorId?: string,
    metadata?: { ip?: string; userAgent?: string },
    eventBus?: ResilientEventBus
  ) {
    // First verify the API key belongs to the user
    const existingKey = await knex('api_keys')
      .where({ id: keyId, user_id: userId, revoked: false })
      .first();

    if (!existingKey) {
      return null; // Key not found or doesn't belong to user
    }

    // Revoke the API key
    const [apiKey] = await knex('api_keys')
      .where({ id: keyId, user_id: userId })
      .update({ revoked: true })
      .returning('*');

    if (apiKey) {
      // Clear from Redis cache
      await redis.del(`api-key:${apiKey.key}`);

      // Log API key revocation
      if (eventBus) {
        await AuditLogger.logApiKey(eventBus, {
          actorId: actorId || userId,
          action: 'api_key.revoked',
          keyId: keyId,
          details: {
            name: existingKey.name,
            reason: 'user_revocation',
          },
          ip: metadata?.ip,
          userAgent: metadata?.userAgent,
        });
      }
    }

    return apiKey;
  }

  static async validate(key: string, ip?: string, scope?: string) {
    let apiKey: any = await redis.get(`api-key:${key}`);
    if (apiKey) apiKey = JSON.parse(apiKey);
    else {
      apiKey = await knex('api_keys').where({ key, revoked: false }).first();
      if (!apiKey) return false;
      await redis.set(`api-key:${key}`, JSON.stringify(apiKey));
    }
    if (apiKey.revoked) return false;
    if (ip && apiKey.ip_whitelist) {
      const whitelist = JSON.parse(apiKey.ip_whitelist);
      if (!whitelist.includes(ip)) return false;
    }
    if (scope && apiKey.scopes) {
      const scopes = typeof apiKey.scopes === 'string' ? JSON.parse(apiKey.scopes) : apiKey.scopes;
      if (!scopes.includes(scope)) return false;
    }
    return true;
  }
}
