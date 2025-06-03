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
  // Merge metadata into details if provided
  const enrichedDetails = metadata ? { ...details, ...metadata } : details;
  return await AuditService.create(actor, action, target, enrichedDetails);
}
