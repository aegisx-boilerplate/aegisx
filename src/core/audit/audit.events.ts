import { EventPublisher } from '../../utils/event-bus';

// Category-based organization for better scalability
export const auditEvents = {
  // Authentication Events
  auth: {
    async recordLogin(data: {
      userId: string;
      success: boolean;
      ip?: string;
      userAgent?: string;
      reason?: string;
    }) {
      await EventPublisher.auditLog({
        userId: data.userId,
        action: data.success ? 'login.success' : 'login.failed',
        resource: 'auth',
        resourceId: 'session',
        details: { reason: data.reason },
        timestamp: new Date().toISOString(),
        ip: data.ip,
        userAgent: data.userAgent,
      });
    },

    async recordLogout(data: { userId: string; ip?: string; userAgent?: string }) {
      await EventPublisher.auditLog({
        userId: data.userId,
        action: 'logout',
        resource: 'auth',
        resourceId: 'session',
        timestamp: new Date().toISOString(),
        ip: data.ip,
        userAgent: data.userAgent,
      });
    },
  },

  // User Management Events
  user: {
    async recordCreated(data: {
      actorId: string;
      userId: string;
      username: string;
      email?: string;
      ip?: string;
      userAgent?: string;
    }) {
      await EventPublisher.auditLog({
        userId: data.actorId,
        action: 'user.created',
        resource: 'user',
        resourceId: data.userId,
        details: { username: data.username, email: data.email },
        timestamp: new Date().toISOString(),
        ip: data.ip,
        userAgent: data.userAgent,
      });
    },

    async recordUpdated(data: {
      actorId: string;
      userId: string;
      changes: string[];
      ip?: string;
      userAgent?: string;
    }) {
      await EventPublisher.auditLog({
        userId: data.actorId,
        action: 'user.updated',
        resource: 'user',
        resourceId: data.userId,
        details: { changes: data.changes },
        timestamp: new Date().toISOString(),
        ip: data.ip,
        userAgent: data.userAgent,
      });
    },

    async recordDeleted(data: {
      actorId: string;
      userId: string;
      username?: string;
      ip?: string;
      userAgent?: string;
    }) {
      await EventPublisher.auditLog({
        userId: data.actorId,
        action: 'user.deleted',
        resource: 'user',
        resourceId: data.userId,
        details: { username: data.username },
        timestamp: new Date().toISOString(),
        ip: data.ip,
        userAgent: data.userAgent,
      });
    },
  },

  // API Key Events
  apiKey: {
    async recordCreated(data: {
      actorId: string;
      keyId: string;
      name: string;
      scopes: string[];
      ip?: string;
      userAgent?: string;
    }) {
      await EventPublisher.auditLog({
        userId: data.actorId,
        action: 'api_key.created',
        resource: 'api_key',
        resourceId: data.keyId,
        details: { name: data.name, scopes: data.scopes },
        timestamp: new Date().toISOString(),
        ip: data.ip,
        userAgent: data.userAgent,
      });
    },

    async recordRevoked(data: {
      actorId: string;
      keyId: string;
      name?: string;
      ip?: string;
      userAgent?: string;
    }) {
      await EventPublisher.auditLog({
        userId: data.actorId,
        action: 'api_key.revoked',
        resource: 'api_key',
        resourceId: data.keyId,
        details: { name: data.name },
        timestamp: new Date().toISOString(),
        ip: data.ip,
        userAgent: data.userAgent,
      });
    },
  },

  // RBAC Events
  rbac: {
    async recordRoleAssigned(data: {
      actorId: string;
      userId: string;
      roleId: string;
      roleName: string;
      ip?: string;
      userAgent?: string;
    }) {
      await EventPublisher.auditLog({
        userId: data.actorId,
        action: 'role.assigned',
        resource: 'user',
        resourceId: data.userId,
        details: { roleId: data.roleId, roleName: data.roleName },
        timestamp: new Date().toISOString(),
        ip: data.ip,
        userAgent: data.userAgent,
      });
    },

    async recordPermissionGranted(data: {
      actorId: string;
      userId: string;
      permission: string;
      ip?: string;
      userAgent?: string;
    }) {
      await EventPublisher.auditLog({
        userId: data.actorId,
        action: 'permission.granted',
        resource: 'user',
        resourceId: data.userId,
        details: { permission: data.permission },
        timestamp: new Date().toISOString(),
        ip: data.ip,
        userAgent: data.userAgent,
      });
    },
  },

  // Legacy methods for backward compatibility
  recordLogin: function (data: Parameters<typeof this.auth.recordLogin>[0]) {
    return this.auth.recordLogin(data);
  },
  recordLogout: function (data: Parameters<typeof this.auth.recordLogout>[0]) {
    return this.auth.recordLogout(data);
  },
  recordUserCreated: function (data: Parameters<typeof this.user.recordCreated>[0]) {
    return this.user.recordCreated(data);
  },
  recordUserUpdated: function (data: Parameters<typeof this.user.recordUpdated>[0]) {
    return this.user.recordUpdated(data);
  },
  recordUserDeleted: function (data: Parameters<typeof this.user.recordDeleted>[0]) {
    return this.user.recordDeleted(data);
  },
  recordApiKeyCreated: function (data: Parameters<typeof this.apiKey.recordCreated>[0]) {
    return this.apiKey.recordCreated(data);
  },
  recordApiKeyRevoked: function (data: Parameters<typeof this.apiKey.recordRevoked>[0]) {
    return this.apiKey.recordRevoked(data);
  },
  recordRoleAssigned: function (data: Parameters<typeof this.rbac.recordRoleAssigned>[0]) {
    return this.rbac.recordRoleAssigned(data);
  },
  recordPermissionGranted: function (
    data: Parameters<typeof this.rbac.recordPermissionGranted>[0]
  ) {
    return this.rbac.recordPermissionGranted(data);
  },
};

// Event Builder for complex audit scenarios
export class AuditEventBuilder {
  private event: Partial<Parameters<typeof EventPublisher.auditLog>[0]> = {};

  static create() {
    return new AuditEventBuilder();
  }

  actor(userId: string) {
    this.event.userId = userId;
    return this;
  }

  action(action: string) {
    this.event.action = action;
    return this;
  }

  resource(resource: string, resourceId?: string) {
    this.event.resource = resource;
    this.event.resourceId = resourceId;
    return this;
  }

  details(details: Record<string, any>) {
    this.event.details = { ...this.event.details, ...details };
    return this;
  }

  metadata(ip?: string, userAgent?: string) {
    this.event.ip = ip;
    this.event.userAgent = userAgent;
    return this;
  }

  async publish() {
    this.event.timestamp = new Date().toISOString();
    await EventPublisher.auditLog(this.event as Parameters<typeof EventPublisher.auditLog>[0]);
  }
}

// Usage example:
// await AuditEventBuilder.create()
//   .actor('user123')
//   .action('complex.operation')
//   .resource('document', 'doc456')
//   .details({ operation: 'bulk_update', affected_count: 10 })
//   .metadata(req.ip, req.headers['user-agent'])
//   .publish();
