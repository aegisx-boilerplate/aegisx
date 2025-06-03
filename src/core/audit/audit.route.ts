import { FastifyInstance } from 'fastify';
import { AuditController } from './audit.controller';
import {
  AuditLogQuerySchema,
  AuditLogIdParamSchema,
  AuditLogStatsQuerySchema,
  AuditLogResponseSchema,
  AuditLogStatsResponseSchema,
  AuditLogDetailResponseSchema,
} from './audit.schema';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';

export async function auditRoutes(fastify: FastifyInstance) {
  // Get audit logs with filtering and pagination
  fastify.get(
    '/audit-logs',
    {
      preHandler: [authenticate, authorize('audit:read')],
      schema: {
        querystring: AuditLogQuerySchema,
        response: {
          200: AuditLogResponseSchema,
        },
        tags: ['Audit'],
        summary: 'Get audit logs',
        description: 'Retrieve audit logs with optional filtering and pagination',
      },
    },
    AuditController.getAuditLogs
  );

  // Get audit log statistics
  fastify.get(
    '/audit-logs/stats',
    {
      preHandler: [authenticate, authorize('audit:read')],
      schema: {
        querystring: AuditLogStatsQuerySchema,
        response: {
          200: AuditLogStatsResponseSchema,
        },
        tags: ['Audit'],
        summary: 'Get audit statistics',
        description: 'Retrieve audit log statistics and analytics',
      },
    },
    AuditController.getAuditStats
  );

  // Get audit log details by ID
  fastify.get(
    '/audit-logs/:id',
    {
      preHandler: [authenticate, authorize('audit:read')],
      schema: {
        params: AuditLogIdParamSchema,
        response: {
          200: AuditLogDetailResponseSchema,
        },
        tags: ['Audit'],
        summary: 'Get audit log by ID',
        description: 'Retrieve detailed audit log information by ID',
      },
    },
    AuditController.getAuditLogById
  );
}
