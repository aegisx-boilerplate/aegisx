import { FastifyRequest, FastifyReply } from 'fastify';
import { Type } from '@fastify/type-provider-typebox';
import { AuthService } from '../AuthService';
import { LoginDto } from '../dto/LoginDto';
import { RegisterDto } from '../dto/RegisterDto';
import { RefreshTokenDto } from '../dto/RefreshTokenDto';
import { JwtPayload } from '../../types/auth';
import {
    RegisterSchema,
    LoginSchema,
    RefreshTokenSchema,
    RegisterResponseSchema,
    LoginResponseSchema,
    RefreshTokenResponseSchema,
    ProfileResponseSchema,
    ErrorResponseSchema
} from '../schemas/auth.schema';

export default class AuthController {
    constructor(private readonly authService: AuthService) { }

    async register(request: FastifyRequest<{ Body: RegisterDto }>, reply: FastifyReply): Promise<void> {
        try {
            const result = await this.authService.register(request.body);
            await reply.code(201).send(result);
        } catch (error: any) {
            const statusCode = error?.statusCode || 400;
            const message = error?.message || 'Registration failed';
            await reply.code(statusCode).send({ message });
        }
    }

    async login(request: FastifyRequest<{ Body: LoginDto }>, reply: FastifyReply): Promise<void> {
        try {
            const result = await this.authService.login(request.body);
            await reply.code(200).send(result);
        } catch (error: any) {
            const statusCode = error?.statusCode || 401;
            const message = error?.message || 'Invalid credentials';
            await reply.code(statusCode).send({ message });
        }
    }

    async refreshToken(request: FastifyRequest<{ Body: RefreshTokenDto }>, reply: FastifyReply): Promise<void> {
        try {
            const result = await this.authService.refreshToken(request.body.refreshToken);
            await reply.code(200).send(result);
        } catch (error: any) {
            const statusCode = error?.statusCode || 401;
            const message = error?.message || 'Invalid refresh token';
            await reply.code(statusCode).send({ message });
        }
    }

    async logout(request: FastifyRequest, reply: FastifyReply): Promise<void> {
        try {
            const token = request.headers.authorization?.split(' ')[1];
            if (!token) {
                throw new Error('No token provided');
            }
            await this.authService.logout(token);
            await reply.code(200).send({ message: 'Logged out successfully' });
        } catch (error: any) {
            const statusCode = error?.statusCode || 400;
            const message = error?.message || 'Logout failed';
            await reply.code(statusCode).send({ message });
        }
    }

    async getProfile(request: FastifyRequest, reply: FastifyReply): Promise<void> {
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
        } catch (error: any) {
            const statusCode = error?.message === 'User not found' ? 404 : 401;
            const message = error?.message || 'Failed to get user profile';
            await reply.code(statusCode).send({ message });
        }
    }
}

// Schema definitions for route registration (ตามหลัก fastify)
export const authSchemas = {
    register: {
        schema: {
            body: RegisterSchema,
            response: {
                201: RegisterResponseSchema,
                400: ErrorResponseSchema
            }
        }
    },
    login: {
        schema: {
            body: LoginSchema,
            response: {
                200: LoginResponseSchema,
                401: ErrorResponseSchema
            }
        }
    },
    refreshToken: {
        schema: {
            body: RefreshTokenSchema,
            response: {
                200: RefreshTokenResponseSchema,
                401: ErrorResponseSchema
            }
        }
    },
    logout: {
        schema: {
            response: {
                200: Type.Object({ message: Type.String() }),
                400: ErrorResponseSchema
            }
        }
    },
    getProfile: {
        schema: {
            response: {
                200: ProfileResponseSchema,
                401: ErrorResponseSchema,
                404: ErrorResponseSchema
            }
        }
    }
}; 