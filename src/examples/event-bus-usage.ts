// Example: Enhanced Auth Controller with Event Bus Integration
import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../core/auth/auth.service';
import { EventPublisher } from './event-bus';

export class EnhancedAuthController {
  static async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { username, password } = request.body as { username: string; password: string };
      const result = await AuthService.login(username, password);

      // Publish user login event
      await EventPublisher.userEvent({
        type: 'user.login',
        userId: result.userId || username,
        data: {
          ip: request.ip,
          userAgent: request.headers['user-agent'],
          timestamp: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      });

      // Publish audit log event
      await EventPublisher.auditLog({
        userId: result.userId || username,
        action: 'user.login',
        resource: 'auth',
        details: {
          success: true,
          ip: request.ip,
          userAgent: request.headers['user-agent'],
        },
        timestamp: new Date().toISOString(),
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      });

      return reply.send({
        success: true,
        data: { token: result.token || result },
      });
    } catch (error: any) {
      // Publish failed login attempt
      await EventPublisher.auditLog({
        action: 'user.login.failed',
        resource: 'auth',
        details: {
          error: error.message,
          ip: request.ip,
          userAgent: request.headers['user-agent'],
          attemptedUsername: (request.body as any)?.username,
        },
        timestamp: new Date().toISOString(),
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      });

      return reply.code(401).send({
        success: false,
        error: error.message || 'Authentication failed',
      });
    }
  }

  static async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      // Get user from JWT token (assuming you have auth middleware)
      const user = (request as any).user;

      if (user) {
        // Publish user logout event
        await EventPublisher.userEvent({
          type: 'user.logout',
          userId: user.id,
          data: {
            ip: request.ip,
            userAgent: request.headers['user-agent'],
          },
          timestamp: new Date().toISOString(),
        });

        // Publish audit log event
        await EventPublisher.auditLog({
          userId: user.id,
          action: 'user.logout',
          resource: 'auth',
          details: {
            ip: request.ip,
            userAgent: request.headers['user-agent'],
          },
          timestamp: new Date().toISOString(),
          ip: request.ip,
          userAgent: request.headers['user-agent'],
        });
      }

      return reply.send({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message || 'Logout failed',
      });
    }
  }
}

// Example: API Key Controller Integration
export class EnhancedApiKeyController {
  static async createApiKey(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user;
      const { name, scopes } = request.body as { name: string; scopes: string[] };

      // Create API key (assuming you have this service)
      const apiKey = await SomeApiKeyService.create(user.id, name, scopes);

      // Publish API key created event
      await EventPublisher.apiKeyEvent({
        type: 'api_key.created',
        apiKeyId: apiKey.id,
        userId: user.id,
        data: {
          name,
          scopes,
          createdAt: apiKey.createdAt,
        },
        timestamp: new Date().toISOString(),
      });

      // Publish audit log event
      await EventPublisher.auditLog({
        userId: user.id,
        action: 'api_key.create',
        resource: 'api_key',
        resourceId: apiKey.id,
        details: {
          name,
          scopes,
          ip: request.ip,
        },
        timestamp: new Date().toISOString(),
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      });

      return reply.code(201).send({
        success: true,
        data: apiKey,
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message,
      });
    }
  }

  static async revokeApiKey(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user;
      const { apiKeyId } = request.params as { apiKeyId: string };

      // Revoke API key
      await SomeApiKeyService.revoke(apiKeyId, user.id);

      // Publish API key revoked event
      await EventPublisher.apiKeyEvent({
        type: 'api_key.revoked',
        apiKeyId,
        userId: user.id,
        timestamp: new Date().toISOString(),
      });

      // Publish audit log event
      await EventPublisher.auditLog({
        userId: user.id,
        action: 'api_key.revoke',
        resource: 'api_key',
        resourceId: apiKeyId,
        details: {
          ip: request.ip,
        },
        timestamp: new Date().toISOString(),
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      });

      return reply.send({
        success: true,
        message: 'API key revoked successfully',
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message,
      });
    }
  }
}

// Mock service for example (you would use your actual service)
class SomeApiKeyService {
  static async create(userId: string, name: string, scopes: string[]) {
    return {
      id: 'api_key_123',
      name,
      scopes,
      createdAt: new Date().toISOString(),
    };
  }

  static async revoke(apiKeyId: string, userId: string) {
    // Revoke logic here
  }
}
