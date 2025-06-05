import { Type } from '@fastify/type-provider-typebox';

// Login Schemas
export const LoginSchema = Type.Object({
  username: Type.Optional(Type.String({ description: 'Username for authentication' })),
  email: Type.Optional(Type.String({ description: 'Email for authentication' })),
  password: Type.String({ description: 'User password' }),
});

export const AuthResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Object({
    access_token: Type.String({ description: 'JWT access token' }),
    refresh_token: Type.String({ description: 'Refresh token' }),
    expires_in: Type.Number({ description: 'Token expiry in seconds' }),
    token_type: Type.Literal('Bearer'),
    user: Type.Object({
      id: Type.String(),
      username: Type.String(),
      email: Type.String(),
      roles: Type.Array(Type.String()),
    }),
  }),
});

// Register Schemas
export const RegisterSchema = Type.Object({
  username: Type.String({ description: 'Unique username' }),
  email: Type.String({ format: 'email', description: 'Email address' }),
  password: Type.String({ minLength: 8, description: 'Password (min 8 characters)' }),
});

// Refresh Token Schemas
export const RefreshTokenSchema = Type.Object({
  refresh_token: Type.String({ description: 'Refresh token' }),
});

// Logout Schema
export const LogoutSchema = Type.Object({
  refresh_token: Type.Optional(Type.String({ description: 'Refresh token to revoke' })),
});

// Password Reset Schemas
export const ForgotPasswordSchema = Type.Object({
  email: Type.String({ format: 'email', description: 'Email address' }),
});

export const ResetPasswordSchema = Type.Object({
  token: Type.String({ description: 'Password reset token' }),
  newPassword: Type.String({ minLength: 8, description: 'New password (min 8 characters)' }),
});

export const ChangePasswordSchema = Type.Object({
  currentPassword: Type.String({ description: 'Current password' }),
  newPassword: Type.String({ minLength: 8, description: 'New password (min 8 characters)' }),
});

// User Info Schema
export const UserInfoSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Object({
    id: Type.String(),
    username: Type.String(),
    email: Type.String(),
    permissions: Type.Array(Type.String()),
    created_at: Type.String({ format: 'date-time' }),
    updated_at: Type.String({ format: 'date-time' }),
  }),
});

// API Key Schemas
export const ApiKeyCreateSchema = Type.Object({
  name: Type.String({ description: 'API key name/description' }),
  scopes: Type.Array(Type.String(), { description: 'Allowed scopes/permissions' }),
  ipWhitelist: Type.Optional(Type.Array(Type.String(), { description: 'Allowed IP addresses' })),
  expiresAt: Type.Optional(Type.String({ format: 'date-time', description: 'Expiry date' })),
});

export const ApiKeyResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Object({
    id: Type.String(),
    name: Type.String(),
    key: Type.String({ description: 'API key (shown only once)' }),
    scopes: Type.Array(Type.String()),
    ipWhitelist: Type.Optional(Type.Array(Type.String())),
    expiresAt: Type.Optional(Type.String({ format: 'date-time' })),
    created_at: Type.String({ format: 'date-time' }),
    revoked: Type.Boolean(),
  }),
});

export const ApiKeyListResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Array(Type.Object({
    id: Type.String(),
    name: Type.String(),
    scopes: Type.Array(Type.String()),
    ipWhitelist: Type.Optional(Type.Array(Type.String())),
    expiresAt: Type.Optional(Type.String({ format: 'date-time' })),
    created_at: Type.String({ format: 'date-time' }),
    revoked: Type.Boolean(),
    // Note: key is NOT included in list response for security
  })),
});

// Success Response Schema
export const SuccessResponseSchema = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
});

// Error Response Schema
export const ErrorResponseSchema = Type.Object({
  success: Type.Boolean(),
  error: Type.String(),
});

// Security schema definitions for OpenAPI
export const SecuritySchemas = {
  bearerAuth: {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'JWT token authentication'
  },
  apiKeyAuth: {
    type: 'apiKey',
    in: 'header',
    name: 'x-api-key',
    description: 'API Key authentication'
  }
};
