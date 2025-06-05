import { FastifyInstance } from 'fastify';
import { AuthController } from './auth.controller';
import { authenticate } from '../../middlewares/authenticate';
import { rateLimitMiddleware, RateLimitConfigs } from '../../middlewares/rate-limit';
import {
  LoginSchema,
  AuthResponseSchema,
  RegisterSchema,
  RefreshTokenSchema,
  LogoutSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  ChangePasswordSchema,
  UserInfoSchema,
  ApiKeyCreateSchema,
  ApiKeyResponseSchema,
  ApiKeyListResponseSchema,
  SuccessResponseSchema,
  ErrorResponseSchema,
} from './auth.schema';

export async function authRoutes(fastify: FastifyInstance) {

  // Public auth routes (no authentication required)

  fastify.post('/auth/login', {
    preHandler: [rateLimitMiddleware(RateLimitConfigs.auth)],
    schema: {
      tags: ['Auth'] as ['Auth'],
      summary: 'Login with username/email and password',
      description: 'Authenticate user and return JWT tokens',
      body: LoginSchema,
      response: {
        200: AuthResponseSchema,
        400: ErrorResponseSchema,
        401: ErrorResponseSchema,
        429: ErrorResponseSchema,
      },
    },
  }, AuthController.login);

  fastify.post('/auth/register', {
    preHandler: [rateLimitMiddleware(RateLimitConfigs.registration)],
    schema: {
      tags: ['Auth'] as ['Auth'],
      summary: 'Register a new user',
      description: 'Create a new user account and return JWT tokens',
      body: RegisterSchema,
      response: {
        201: AuthResponseSchema,
        400: ErrorResponseSchema,
      },
    },
  }, AuthController.register);

  fastify.post('/auth/refresh', {
    schema: {
      tags: ['Auth'] as ['Auth'],
      summary: 'Refresh access token',
      description: 'Get a new access token using refresh token',
      body: RefreshTokenSchema,
      response: {
        200: AuthResponseSchema,
        401: ErrorResponseSchema,
      },
    },
  }, AuthController.refreshToken);

  fastify.post('/auth/forgot-password', {
    preHandler: [rateLimitMiddleware(RateLimitConfigs.passwordReset)],
    schema: {
      tags: ['Auth'] as ['Auth'],
      summary: 'Request password reset',
      description: 'Send password reset email (if email exists)',
      body: ForgotPasswordSchema,
      response: {
        200: SuccessResponseSchema,
        400: ErrorResponseSchema,
        429: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
  }, AuthController.forgotPassword);

  fastify.post('/auth/reset-password', {
    preHandler: [rateLimitMiddleware(RateLimitConfigs.passwordReset)],
    schema: {
      tags: ['Auth'] as ['Auth'],
      summary: 'Reset password with token',
      description: 'Reset password using the token from email',
      body: ResetPasswordSchema,
      response: {
        200: SuccessResponseSchema,
        400: ErrorResponseSchema,
        429: ErrorResponseSchema,
      },
    },
  }, AuthController.resetPassword);

  // Protected auth routes (authentication required)

  fastify.post('/auth/logout', {
    preHandler: [authenticate],
    schema: {
      tags: ['Auth'] as ['Auth'],
      summary: 'Logout and revoke tokens',
      description: 'Logout user and optionally revoke refresh token',
      security: [{ bearerAuth: [] }],
      body: LogoutSchema,
      response: {
        200: SuccessResponseSchema,
        500: ErrorResponseSchema,
      },
    },
  }, AuthController.logout);

  fastify.post('/auth/change-password', {
    preHandler: [authenticate],
    schema: {
      tags: ['Auth'] as ['Auth'],
      summary: 'Change password',
      description: 'Change user password (requires current password)',
      security: [{ bearerAuth: [] }],
      body: ChangePasswordSchema,
      response: {
        200: SuccessResponseSchema,
        400: ErrorResponseSchema,
      },
    },
  }, AuthController.changePassword);

  fastify.get('/auth/me', {
    preHandler: [authenticate],
    schema: {
      tags: ['Auth'] as ['Auth'],
      summary: 'Get current user info',
      description: 'Get authenticated user information',
      security: [{ bearerAuth: [] }],
      response: {
        200: UserInfoSchema,
        404: ErrorResponseSchema,
      },
    },
  }, AuthController.getCurrentUser);

  // API Key management routes

  fastify.post('/auth/api-key', {
    preHandler: [authenticate],
    schema: {
      tags: ['Auth'] as ['Auth'],
      summary: 'Generate API key',
      description: 'Create a new API key for the authenticated user',
      security: [{ bearerAuth: [] }],
      body: ApiKeyCreateSchema,
      response: {
        201: ApiKeyResponseSchema,
        400: ErrorResponseSchema,
      },
    },
  }, AuthController.createApiKey);

  fastify.get('/auth/api-key', {
    preHandler: [authenticate],
    schema: {
      tags: ['Auth'] as ['Auth'],
      summary: 'List API keys',
      description: 'List all API keys for the authenticated user',
      security: [{ bearerAuth: [] }],
      response: {
        200: ApiKeyListResponseSchema,
        500: ErrorResponseSchema,
      },
    },
  }, AuthController.listApiKeys);

  fastify.delete('/auth/api-key/:id', {
    preHandler: [authenticate],
    schema: {
      tags: ['Auth'] as ['Auth'],
      summary: 'Revoke API key',
      description: 'Revoke/delete an API key',
      security: [{ bearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'API key ID' }
        },
        required: ['id']
      },
      response: {
        200: SuccessResponseSchema,
        404: ErrorResponseSchema,
        500: ErrorResponseSchema,
      },
    },
  }, AuthController.revokeApiKey);
}
