"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authSchemas = void 0;
const type_provider_typebox_1 = require("@fastify/type-provider-typebox");
const auth_schema_1 = require("../schemas/auth.schema");
class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async register(request, reply) {
        try {
            const result = await this.authService.register(request.body);
            await reply.code(201).send(result);
        }
        catch (error) {
            const statusCode = error?.statusCode || 400;
            const message = error?.message || 'Registration failed';
            await reply.code(statusCode).send({ message });
        }
    }
    async login(request, reply) {
        try {
            const result = await this.authService.login(request.body);
            await reply.code(200).send(result);
        }
        catch (error) {
            const statusCode = error?.statusCode || 401;
            const message = error?.message || 'Invalid credentials';
            await reply.code(statusCode).send({ message });
        }
    }
    async refreshToken(request, reply) {
        try {
            const result = await this.authService.refreshToken(request.body.refreshToken);
            await reply.code(200).send(result);
        }
        catch (error) {
            const statusCode = error?.statusCode || 401;
            const message = error?.message || 'Invalid refresh token';
            await reply.code(statusCode).send({ message });
        }
    }
    async logout(request, reply) {
        try {
            const token = request.headers.authorization?.split(' ')[1];
            if (!token) {
                throw new Error('No token provided');
            }
            await this.authService.logout(token);
            await reply.code(200).send({ message: 'Logged out successfully' });
        }
        catch (error) {
            const statusCode = error?.statusCode || 400;
            const message = error?.message || 'Logout failed';
            await reply.code(statusCode).send({ message });
        }
    }
    async getProfile(request, reply) {
        try {
            // TODO: Implement proper authentication middleware
            // const user = request.user as JwtPayload | undefined;
            // Temporary implementation
            const authHeader = request.headers.authorization;
            if (!authHeader) {
                throw new Error('User not authenticated');
            }
            const userId = 'temp-user-id';
            const profile = await this.authService.getProfile(userId);
            if (!profile) {
                throw new Error('User not found');
            }
            await reply.code(200).send(profile);
        }
        catch (error) {
            const statusCode = error?.message === 'User not found' ? 404 : 401;
            const message = error?.message || 'Failed to get user profile';
            await reply.code(statusCode).send({ message });
        }
    }
}
exports.default = AuthController;
// Schema definitions for route registration (ตามหลัก fastify)
exports.authSchemas = {
    register: {
        schema: {
            body: auth_schema_1.RegisterSchema,
            response: {
                201: auth_schema_1.RegisterResponseSchema,
                400: auth_schema_1.ErrorResponseSchema
            }
        }
    },
    login: {
        schema: {
            body: auth_schema_1.LoginSchema,
            response: {
                200: auth_schema_1.LoginResponseSchema,
                401: auth_schema_1.ErrorResponseSchema
            }
        }
    },
    refreshToken: {
        schema: {
            body: auth_schema_1.RefreshTokenSchema,
            response: {
                200: auth_schema_1.RefreshTokenResponseSchema,
                401: auth_schema_1.ErrorResponseSchema
            }
        }
    },
    logout: {
        schema: {
            response: {
                200: type_provider_typebox_1.Type.Object({ message: type_provider_typebox_1.Type.String() }),
                400: auth_schema_1.ErrorResponseSchema
            }
        }
    },
    getProfile: {
        schema: {
            response: {
                200: auth_schema_1.ProfileResponseSchema,
                401: auth_schema_1.ErrorResponseSchema,
                404: auth_schema_1.ErrorResponseSchema
            }
        }
    }
};
//# sourceMappingURL=AuthController.js.map