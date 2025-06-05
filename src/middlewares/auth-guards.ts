import { FastifyRequest, FastifyReply } from 'fastify';
import { ApiKeyService } from '../core/auth/api-key.service';
import { JwtService } from '../core/auth/jwt.service';
import { RbacService } from '../core/rbac/rbac.service';

export interface AuthUser {
    id: string;
    username: string;
    email: string;
    permissions: string[];
}

export interface ApiKeyAuth {
    id: string;
    name: string;
    scopes: string[];
    user_id?: string;
}

/**
 * JWT Authentication Guard
 * Validates JWT token and loads user information
 */
export async function jwtAuthGuard(
    request: FastifyRequest,
    reply: FastifyReply
): Promise<void> {
    try {
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return reply.code(401).send({
                success: false,
                error: 'Unauthorized',
                message: 'Missing or invalid authorization header',
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify JWT token
        const payload = await JwtService.verifyAccessToken(token);
        if (!payload) {
            return reply.code(401).send({
                success: false,
                error: 'Unauthorized',
                message: 'Invalid or expired token',
            });
        }

        // Ensure token is access token (not refresh token)
        if (payload.type !== 'access') {
            return reply.code(401).send({
                success: false,
                error: 'Unauthorized',
                message: 'Invalid token type',
            });
        }

        // Load fresh permissions (in case they've changed)
        const permissions = await RbacService.getUserPermissions(payload.id);

        // Attach user to request
        (request as any).user = {
            id: payload.id,
            username: payload.username,
            email: payload.email,
            permissions,
        } as AuthUser;

        // Attach auth type for audit logging
        (request as any).authType = 'jwt';

    } catch (error) {
        return reply.code(401).send({
            success: false,
            error: 'Unauthorized',
            message: 'Token verification failed',
        });
    }
}

/**
 * API Key Authentication Guard
 * Validates API key and loads associated information
 */
export async function apiKeyAuthGuard(
    request: FastifyRequest,
    reply: FastifyReply
): Promise<void> {
    try {
        const apiKey = request.headers['x-api-key'] as string;

        if (!apiKey) {
            return reply.code(401).send({
                success: false,
                error: 'Unauthorized',
                message: 'Missing API key',
            });
        }

        // Validate API key
        const isValid = await ApiKeyService.validate(apiKey, request.ip);
        if (!isValid) {
            return reply.code(401).send({
                success: false,
                error: 'Unauthorized',
                message: 'Invalid API key',
            });
        }

        // Get API key details
        const apiKeyDetails = await getApiKeyDetails(apiKey);
        if (!apiKeyDetails) {
            return reply.code(401).send({
                success: false,
                error: 'Unauthorized',
                message: 'API key not found',
            });
        }

        // Attach API key info to request
        (request as any).apiKey = apiKeyDetails;
        (request as any).authType = 'api_key';

        // If API key is associated with a user, load user permissions
        if (apiKeyDetails.user_id) {
            const permissions = await RbacService.getUserPermissions(apiKeyDetails.user_id);
            (request as any).user = {
                id: apiKeyDetails.user_id,
                permissions,
            };
        }

    } catch (error) {
        return reply.code(401).send({
            success: false,
            error: 'Unauthorized',
            message: 'API key validation failed',
        });
    }
}

/**
 * Flexible Authentication Guard
 * Accepts either JWT or API key authentication
 */
export async function flexibleAuthGuard(
    request: FastifyRequest,
    reply: FastifyReply
): Promise<void> {
    const authHeader = request.headers.authorization;
    const apiKey = request.headers['x-api-key'] as string;

    // Try JWT authentication first
    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            await jwtAuthGuard(request, reply);
            return; // Success, continue with JWT auth
        } catch (error) {
            // JWT failed, try API key if available
        }
    }

    // Try API key authentication
    if (apiKey) {
        try {
            await apiKeyAuthGuard(request, reply);
            return; // Success, continue with API key auth
        } catch (error) {
            // API key failed
        }
    }

    // Both authentication methods failed
    return reply.code(401).send({
        success: false,
        error: 'Unauthorized',
        message: 'Authentication required. Provide either a valid JWT token or API key.',
    });
}

/**
 * Permission-based authorization guard
 * Requires specific permissions to access the endpoint
 */
export function requirePermissions(...requiredPermissions: string[]) {
    return async function (request: FastifyRequest, reply: FastifyReply) {
        const user = (request as any).user as AuthUser;
        const apiKey = (request as any).apiKey as ApiKeyAuth;

        if (!user && !apiKey) {
            return reply.code(401).send({
                success: false,
                error: 'Unauthorized',
                message: 'Authentication required',
            });
        }

        // Check permissions
        const hasPermissions = checkPermissions(
            requiredPermissions,
            user?.permissions || [],
            apiKey?.scopes || []
        );

        if (!hasPermissions) {
            return reply.code(403).send({
                success: false,
                error: 'Forbidden',
                message: `Insufficient permissions. Required: ${requiredPermissions.join(', ')}`,
            });
        }
    };
}

/**
 * Role-based authorization guard
 * Requires specific role to access the endpoint
 */
export function requireRole(requiredRole: string) {
    return async function (request: FastifyRequest, reply: FastifyReply) {
        const user = (request as any).user as AuthUser;

        if (!user) {
            return reply.code(401).send({
                success: false,
                error: 'Unauthorized',
                message: 'Authentication required',
            });
        }

        // Check role (this is simplified - in practice you might want to check role hierarchy)
        const userRole = await RbacService.getUserRole(user.id);
        if (userRole !== requiredRole) {
            return reply.code(403).send({
                success: false,
                error: 'Forbidden',
                message: `Insufficient privileges. Required role: ${requiredRole}`,
            });
        }
    };
}

/**
 * API Key scope validation guard
 * Validates that API key has required scopes
 */
export function requireScopes(...requiredScopes: string[]) {
    return async function (request: FastifyRequest, reply: FastifyReply) {
        const apiKey = (request as any).apiKey as ApiKeyAuth;

        if (!apiKey) {
            return reply.code(401).send({
                success: false,
                error: 'Unauthorized',
                message: 'API key authentication required',
            });
        }

        const hasScopes = requiredScopes.every(scope =>
            apiKey.scopes.includes(scope)
        );

        if (!hasScopes) {
            return reply.code(403).send({
                success: false,
                error: 'Forbidden',
                message: `Insufficient API key scopes. Required: ${requiredScopes.join(', ')}`,
            });
        }
    };
}

/**
 * Helper function to check if user has required permissions
 */
function checkPermissions(
    required: string[],
    userPermissions: string[],
    apiKeyScopes: string[]
): boolean {
    // Combine user permissions and API key scopes
    const allPermissions = [...userPermissions, ...apiKeyScopes];

    // Check if all required permissions are present
    return required.every(permission =>
        allPermissions.includes(permission) ||
        allPermissions.includes('*') // Wildcard permission
    );
}

/**
 * Helper function to get API key details from database
 */
async function getApiKeyDetails(key: string): Promise<ApiKeyAuth | null> {
    try {
        const { knex } = await import('../db/knex');

        const apiKey = await knex('api_keys')
            .where({ key, revoked: false })
            .select('id', 'name', 'scopes', 'user_id')
            .first();

        if (!apiKey) return null;

        return {
            id: apiKey.id,
            name: apiKey.name,
            scopes: typeof apiKey.scopes === 'string' ? JSON.parse(apiKey.scopes) : apiKey.scopes,
            user_id: apiKey.user_id,
        };
    } catch (error) {
        console.error('Failed to get API key details:', error);
        return null;
    }
}

/**
 * Combined authentication and authorization middleware
 */
export function createAuthMiddleware(options: {
    authType?: 'jwt' | 'api_key' | 'flexible';
    permissions?: string[];
    scopes?: string[];
    role?: string;
} = {}) {
    return async function (request: FastifyRequest, reply: FastifyReply) {
        // Authentication
        switch (options.authType) {
            case 'jwt':
                await jwtAuthGuard(request, reply);
                break;
            case 'api_key':
                await apiKeyAuthGuard(request, reply);
                break;
            case 'flexible':
            default:
                await flexibleAuthGuard(request, reply);
                break;
        }

        // Authorization checks
        if (options.permissions) {
            await requirePermissions(...options.permissions)(request, reply);
        }

        if (options.scopes) {
            await requireScopes(...options.scopes)(request, reply);
        }

        if (options.role) {
            await requireRole(options.role)(request, reply);
        }
    };
}
