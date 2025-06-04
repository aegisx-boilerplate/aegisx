import { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';

import path from 'path';

// Import package.json using require for version info
// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require(path.join(process.cwd(), 'package.json'));

/**
 * OpenAPI 3.0.3 configuration for AegisX Boilerplate API
 */
export const swaggerConfig = {
    openapi: {
        openapi: '3.0.3',
        info: {
            title: 'AegisX Boilerplate API',
            version: packageJson.version,
            description: 'AegisX API boilerplate with Fastify, TypeBox, Knex, Redis, RabbitMQ and comprehensive RBAC system',
            contact: {
                name: 'AegisX Team',
                url: 'https://github.com/aegisx-boilerplate/aegisx',
                email: 'support@aegisx.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: '/',
                description: 'Development server'
            },
            {
                url: 'https://api.aegisx.com',
                description: 'Production server'
            },
            {
                url: 'https://staging-api.aegisx.com',
                description: 'Staging server'
            }
        ],
        tags: [
            { name: 'Health', description: 'Health check endpoints' },
            { name: 'Auth', description: 'Authentication and authorization endpoints' },
            { name: 'User', description: 'User management endpoints' },
            { name: 'RBAC', description: 'Role-based access control endpoints' },
            { name: 'ApiKey', description: 'API key management endpoints' },
            { name: 'Audit', description: 'Audit log endpoints' },
            { name: 'Events', description: 'Event system analytics endpoints' }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http' as const,
                    scheme: 'bearer' as const,
                    bearerFormat: 'JWT',
                    description: 'JWT token obtained from /auth/login endpoint'
                },
                apiKey: {
                    type: 'apiKey' as const,
                    in: 'header' as const,
                    name: 'x-api-key',
                    description: 'API key for service-to-service authentication'
                }
            },
            responses: {
                UnauthorizedError: {
                    description: 'Authentication information is missing or invalid',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object' as const,
                                properties: {
                                    statusCode: { type: 'number' as const, example: 401 },
                                    error: { type: 'string' as const, example: 'Unauthorized' },
                                    message: { type: 'string' as const, example: 'Invalid token' }
                                }
                            }
                        }
                    }
                },
                ForbiddenError: {
                    description: 'Access forbidden - insufficient permissions',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object' as const,
                                properties: {
                                    statusCode: { type: 'number' as const, example: 403 },
                                    error: { type: 'string' as const, example: 'Forbidden' },
                                    message: { type: 'string' as const, example: 'Insufficient permissions' }
                                }
                            }
                        }
                    }
                },
                ValidationError: {
                    description: 'Validation error in request data',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object' as const,
                                properties: {
                                    statusCode: { type: 'number' as const, example: 400 },
                                    error: { type: 'string' as const, example: 'Bad Request' },
                                    message: { type: 'string' as const, example: 'Validation failed' }
                                }
                            }
                        }
                    }
                },
                NotFoundError: {
                    description: 'Resource not found',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object' as const,
                                properties: {
                                    statusCode: { type: 'number' as const, example: 404 },
                                    error: { type: 'string' as const, example: 'Not Found' },
                                    message: { type: 'string' as const, example: 'Resource not found' }
                                }
                            }
                        }
                    }
                },
                InternalServerError: {
                    description: 'Internal server error',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object' as const,
                                properties: {
                                    statusCode: { type: 'number' as const, example: 500 },
                                    error: { type: 'string' as const, example: 'Internal Server Error' },
                                    message: { type: 'string' as const, example: 'An unexpected error occurred' }
                                }
                            }
                        }
                    }
                }
            },
            schemas: {
                SuccessResponse: {
                    type: 'object' as const,
                    properties: {
                        success: { type: 'boolean' as const, example: true },
                        message: { type: 'string' as const, example: 'Operation completed successfully' }
                    }
                },
                PaginationMeta: {
                    type: 'object' as const,
                    properties: {
                        page: { type: 'number' as const, example: 1 },
                        limit: { type: 'number' as const, example: 10 },
                        total: { type: 'number' as const, example: 100 },
                        totalPages: { type: 'number' as const, example: 10 },
                        hasNext: { type: 'boolean' as const, example: true },
                        hasPrev: { type: 'boolean' as const, example: false }
                    }
                }
            }
        },
        security: [
            { bearerAuth: [] }
        ],
        externalDocs: {
            description: 'Find more info about AegisX Boilerplate',
            url: 'https://github.com/aegisx-boilerplate/aegisx'
        }
    }
};

/**
 * Swagger UI configuration
 */
export const swaggerUiConfig = {
    routePrefix: '/docs',
    uiConfig: {
        docExpansion: 'list' as const,
        deepLinking: true,
        defaultModelsExpandDepth: 1,
        defaultModelExpandDepth: 1,
        displayOperationId: false,
        displayRequestDuration: true,
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        tryItOutEnabled: true
    },
    staticCSP: true,
    transformSpecificationClone: true
};

/**
 * Register Swagger and Swagger UI plugins (Alternative method)
 */
export async function registerSwagger(app: FastifyInstance) {
    // Register Swagger with type assertion to handle complex type issues
    await app.register(swagger, swaggerConfig as any);

    // Register Swagger UI
    await app.register(swaggerUi, swaggerUiConfig);
}
