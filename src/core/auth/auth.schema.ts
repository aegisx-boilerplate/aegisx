import { Type } from '@fastify/type-provider-typebox';

export const LoginSchema = Type.Object({
  username: Type.String({ description: 'Username for authentication' }),
  password: Type.String({ description: 'User password' }),
});

export const AuthResponseSchema = Type.Object({
  token: Type.String({ description: 'JWT access token' }),
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
    name: 'Authorization',
    description: 'API Key authentication (format: "Api-Key <key>")'
  }
};
