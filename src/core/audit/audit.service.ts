import { knex } from '../../db/knex';
import { ResilientEventBus } from '../event-bus';
import { AuditLog } from './audit.model';

export class AuditService {
  /**
   * Create audit log entry (direct insert only)
   */
  static async create(
    actor: string,
    action: string,
    target: string,
    details?: Record<string, any>,
    ip_address?: string,
    user_agent?: string
  ): Promise<AuditLog> {
    const timestamp = new Date().toISOString();

    // Save to database only
    const [auditLog] = await knex('audit_logs')
      .insert({
        actor,
        action,
        target,
        details: details || null,
        ip_address: ip_address || null,
        user_agent: user_agent || null,
        created_at: timestamp,
      })
      .returning('*');

    return auditLog;
  }

  /**
   * Create audit log entry and publish event
   */
  static async createWithEvent(
    actor: string,
    action: string,
    target: string,
    details?: Record<string, any>,
    ip_address?: string,
    user_agent?: string,
    eventBus?: ResilientEventBus
  ): Promise<AuditLog> {
    const timestamp = new Date().toISOString();

    // Save to database
    const [auditLog] = await knex('audit_logs')
      .insert({
        actor,
        action,
        target,
        details: details || null,
        ip_address: ip_address || null,
        user_agent: user_agent || null,
        created_at: timestamp,
      })
      .returning('*');

    // Publish event to message queue for real-time processing
    if (eventBus) {
      try {
        await eventBus.publishEvent('audit.log', {
          userId: actor,
          action,
          resource: target.split(':')[0] || target,
          resourceId: target.split(':')[1],
          details,
          timestamp,
        });
      } catch (error) {
        console.error('Failed to publish audit log event:', error);
        // Don't throw error to avoid disrupting main flow
      }
    }

    return {
      ...auditLog,
      details: auditLog.details ? JSON.parse(auditLog.details) : null,
    };
  }

  static async list(filters: {
    actor?: string;
    action?: string;
    target?: string;
    ip_address?: string;
    user_agent?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }) {
    const {
      actor,
      action,
      target,
      ip_address,
      user_agent,
      from,
      to,
      page = 1,
      limit = 20,
    } = filters;

    let query = knex('audit_logs').select('*');

    // Apply filters
    if (actor) query = query.where('actor', 'ilike', `%${actor}%`);
    if (action) query = query.where('action', 'ilike', `%${action}%`);
    if (target) query = query.where('target', 'ilike', `%${target}%`);
    if (ip_address) query = query.where('ip_address', 'ilike', `%${ip_address}%`);
    if (user_agent) query = query.where('user_agent', 'ilike', `%${user_agent}%`);
    if (from) query = query.where('created_at', '>=', from);
    if (to) query = query.where('created_at', '<=', to);

    // Get total count
    const totalQuery = query.clone();
    const [{ count }] = await totalQuery.count('* as count');
    const total = parseInt(count as string);

    // Apply pagination
    const offset = (page - 1) * limit;
    const logs = await query.orderBy('created_at', 'desc').limit(limit).offset(offset);

    return {
      logs: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async getById(id: string): Promise<AuditLog | null> {
    const log = await knex('audit_logs').where({ id }).first();

    if (!log) return null;

    return log;
  }

  static async getStats(filters: { from?: string; to?: string }) {
    const { from, to } = filters;

    let query = knex('audit_logs');
    if (from) query = query.where('created_at', '>=', from);
    if (to) query = query.where('created_at', '<=', to);

    // Get action statistics
    const actionStats = await query
      .clone()
      .select('action')
      .count('* as count')
      .groupBy('action')
      .orderBy('count', 'desc');

    // Get actor statistics
    const actorStats = await query
      .clone()
      .select('actor')
      .count('* as count')
      .groupBy('actor')
      .orderBy('count', 'desc')
      .limit(10);

    // Get daily activity
    const dailyActivity = await query
      .clone()
      .select(knex.raw('DATE(created_at) as date'))
      .count('* as count')
      .groupBy(knex.raw('DATE(created_at)'))
      .orderBy('date', 'desc')
      .limit(30);

    return {
      actionStats: actionStats.map((stat) => ({
        action: stat.action,
        count: parseInt(stat.count as string),
      })),
      actorStats: actorStats.map((stat) => ({
        actor: stat.actor,
        count: parseInt(stat.count as string),
      })),
      dailyActivity: dailyActivity.map((stat: any) => ({
        date: stat.date,
        count: parseInt(stat.count as string),
      })),
    };
  }

  static async deleteOlderThan(days: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const deletedCount = await knex('audit_logs')
      .where('created_at', '<', cutoffDate.toISOString())
      .del();

    return deletedCount;
  }
}
