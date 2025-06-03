import { AuditService } from '../core/audit/audit.service';

export async function logAudit(
  actor: string,
  action: string,
  target: string,
  details?: Record<string, any>,
  metadata?: {
    ip?: string;
    userAgent?: string;
  }
) {
  return await AuditService.create(actor, action, target, details, metadata);
}
