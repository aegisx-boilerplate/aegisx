import { FastifyRequest, FastifyReply } from 'fastify';
import { AuditService } from './audit.service';

export class AuditController {
  static async getAuditLogs(request: FastifyRequest, reply: FastifyReply) {
    try {
      const filters = request.query as {
        actor?: string;
        action?: string;
        target?: string;
        from?: string;
        to?: string;
        page?: number;
        limit?: number;
      };

      const result = await AuditService.list(filters);

      return reply.send({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message || 'Failed to fetch audit logs',
      });
    }
  }

  static async getAuditLogById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };

      const auditLog = await AuditService.getById(id);

      if (!auditLog) {
        return reply.code(404).send({
          success: false,
          error: 'Audit log not found',
        });
      }

      return reply.send({
        success: true,
        data: auditLog,
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message || 'Failed to fetch audit log',
      });
    }
  }

  static async getAuditStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const filters = request.query as {
        from?: string;
        to?: string;
      };

      const stats = await AuditService.getStats(filters);

      return reply.send({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message || 'Failed to fetch audit statistics',
      });
    }
  }
}
