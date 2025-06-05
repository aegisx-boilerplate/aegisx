import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from './auth.service';
import { ApiKeyService } from '../api-key/api-key.service';
import { updateRateLimit } from '../../middlewares/rate-limit';
import {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  RefreshTokenRequest,
  ApiKeyCreateRequest,
  AuthMetadata
} from './types';

export class AuthController {

  /**
   * POST /auth/login - Login with username/email and password
   */
  static async login(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as LoginRequest;
    const usernameOrEmail = body.username || body.email;
    const password = body.password;

    if (!usernameOrEmail || !password) {
      return reply.code(400).send({
        success: false,
        error: 'Username/email and password are required',
      });
    }

    let success = false;
    try {
      const metadata: AuthMetadata = {
        ip: request.ip,
        userAgent: request.headers['user-agent'],
        sessionId: request.id,
      };

      const result = await AuthService.login(usernameOrEmail, password, metadata);
      success = true;

      // Update rate limit on successful login
      await updateRateLimit(request, reply, success);

      return reply.send({
        success: true,
        data: result,
      });
    } catch (error: any) {
      // Update rate limit on failed login
      await updateRateLimit(request, reply, success);

      return reply.code(401).send({
        success: false,
        error: error.message || 'Authentication failed',
      });
    }
  }

  /**
   * POST /auth/register - Register a new user
   */
  static async register(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as RegisterRequest;

    try {
      const metadata: AuthMetadata = {
        ip: request.ip,
        userAgent: request.headers['user-agent'],
        sessionId: request.id,
      };

      const result = await AuthService.register(body, metadata);

      return reply.code(201).send({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        error: error.message || 'Registration failed',
      });
    }
  }

  /**
   * POST /auth/refresh - Refresh access token
   */
  static async refreshToken(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as RefreshTokenRequest;

    try {
      const result = await AuthService.refreshToken(body);

      return reply.send({
        success: true,
        data: result,
      });
    } catch (error: any) {
      return reply.code(401).send({
        success: false,
        error: error.message || 'Token refresh failed',
      });
    }
  }

  /**
   * POST /auth/logout - Logout and revoke tokens
   */
  static async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user; // From JWT middleware
      const body = request.body as { refresh_token?: string };

      const metadata: AuthMetadata = {
        ip: request.ip,
        userAgent: request.headers['user-agent'],
        sessionId: request.id,
      };

      await AuthService.logout(user.id, body.refresh_token, metadata);

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

  /**
   * POST /auth/forgot-password - Request password reset
   */
  static async forgotPassword(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as ForgotPasswordRequest;

    try {
      const metadata: AuthMetadata = {
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      };

      await AuthService.forgotPassword(body, metadata);

      return reply.send({
        success: true,
        message: 'If the email exists, a password reset link has been sent',
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message || 'Password reset request failed',
      });
    }
  }

  /**
   * POST /auth/reset-password - Reset password with token
   */
  static async resetPassword(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as ResetPasswordRequest;

    try {
      const metadata: AuthMetadata = {
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      };

      await AuthService.resetPassword(body, metadata);

      return reply.send({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        error: error.message || 'Password reset failed',
      });
    }
  }

  /**
   * POST /auth/change-password - Change password (requires authentication)
   */
  static async changePassword(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as ChangePasswordRequest;
    const user = (request as any).user; // From JWT middleware

    try {
      const metadata: AuthMetadata = {
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      };

      await AuthService.changePassword(user.id, body, metadata);

      return reply.send({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        error: error.message || 'Password change failed',
      });
    }
  }

  /**
   * GET /auth/me - Get current user info
   */
  static async getCurrentUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user; // From JWT middleware
      const currentUser = await AuthService.getCurrentUser(user.id);

      return reply.send({
        success: true,
        data: currentUser,
      });
    } catch (error: any) {
      return reply.code(404).send({
        success: false,
        error: error.message || 'User not found',
      });
    }
  }

  /**
   * POST /auth/api-key - Generate API key
   */
  static async createApiKey(request: FastifyRequest, reply: FastifyReply) {
    const body = request.body as ApiKeyCreateRequest;
    const user = (request as any).user; // From JWT middleware

    try {
      const metadata: AuthMetadata = {
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      };

      const apiKey = await ApiKeyService.create(body, user.id, metadata);

      return reply.code(201).send({
        success: true,
        data: apiKey,
      });
    } catch (error: any) {
      return reply.code(400).send({
        success: false,
        error: error.message || 'API key creation failed',
      });
    }
  }

  /**
   * GET /auth/api-key - List user's API keys
   */
  static async listApiKeys(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = (request as any).user; // From JWT middleware
      const apiKeys = await ApiKeyService.listByUser(user.id);

      return reply.send({
        success: true,
        data: apiKeys,
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message || 'Failed to list API keys',
      });
    }
  }

  /**
   * DELETE /auth/api-key/:id - Revoke API key
   */
  static async revokeApiKey(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const user = (request as any).user; // From JWT middleware

      const metadata: AuthMetadata = {
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      };

      const apiKey = await ApiKeyService.revokeUserApiKey(id, user.id, user.id, metadata);

      if (!apiKey) {
        return reply.code(404).send({
          success: false,
          error: 'API key not found or does not belong to user',
        });
      }

      return reply.send({
        success: true,
        message: 'API key revoked successfully',
      });
    } catch (error: any) {
      return reply.code(500).send({
        success: false,
        error: error.message || 'Failed to revoke API key',
      });
    }
  }
}
