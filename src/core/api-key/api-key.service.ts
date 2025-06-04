import { knex } from '../../db/knex';
import { generateApiKey } from '../../utils/generate-api-key';
import Redis from 'ioredis';
import { env } from '../../config/env';
import { AuditLogger } from '../../utils/audit-logger';

const redis = new Redis(env.REDIS_URL);

export class ApiKeyService {
  static async create(
    {
      name,
      scopes,
      ipWhitelist,
    }: {
      name: string;
      scopes: string[];
      ipWhitelist?: string[];
    },
    actorId?: string,
    metadata?: { ip?: string; userAgent?: string }
  ) {
    const key = generateApiKey();
    const [apiKey] = await knex('api_keys')
      .insert({
        key,
        name,
        scopes: JSON.stringify(scopes),
        ip_whitelist: ipWhitelist ? JSON.stringify(ipWhitelist) : null,
        revoked: false,
      })
      .returning('*');
    await redis.set(`api-key:${key}`, JSON.stringify(apiKey));

    // Log API key creation
    await AuditLogger.logApiKey({
      actorId: actorId || 'system',
      action: 'api_key.created',
      keyId: apiKey.id,
      details: {
        name,
        scopes,
      },
      ip: metadata?.ip,
      userAgent: metadata?.userAgent,
    });

    return apiKey;
  }

  static async list() {
    const keys = await knex('api_keys').select('*');
    return keys;
  }

  static async revoke(
    id: string,
    actorId?: string,
    metadata?: { ip?: string; userAgent?: string }
  ) {
    // Get API key info before revocation for audit log
    const existingKey = await knex('api_keys').where({ id }).first();
    const [apiKey] = await knex('api_keys').where({ id }).update({ revoked: true }).returning('*');
    if (apiKey) await redis.del(`api-key:${apiKey.key}`);

    // Log API key revocation
    await AuditLogger.logApiKey({
      actorId: actorId || 'system',
      action: 'api_key.revoked',
      keyId: id,
      details: {
        name: existingKey?.name,
      },
      ip: metadata?.ip,
      userAgent: metadata?.userAgent,
    });

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
