import { FastifyInstance } from 'fastify';
import { knex } from '../../db/knex';
import { JwtPayload, RefreshToken } from './types';
import { env } from '../../config/env';
import crypto from 'crypto';

let fastifyInstance: FastifyInstance | null = null;

export function setFastifyInstance(instance: FastifyInstance) {
    fastifyInstance = instance;
}

export class JwtService {
    static ACCESS_TOKEN_EXPIRY = env.JWT_ACCESS_TOKEN_EXPIRY;
    static REFRESH_TOKEN_EXPIRY = env.JWT_REFRESH_TOKEN_EXPIRY;

    /**
     * Sign an access token
     */
    static signAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp' | 'type'>): string {
        if (!fastifyInstance) {
            throw new Error('Fastify instance not set. Call setFastifyInstance() first.');
        }

        const tokenPayload = {
            ...payload,
            type: 'access' as const,
        };

        return fastifyInstance.jwt.sign(tokenPayload, {
            expiresIn: this.ACCESS_TOKEN_EXPIRY
        });
    }

    /**
     * Sign a refresh token
     */
    static signRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp' | 'type'>): string {
        if (!fastifyInstance) {
            throw new Error('Fastify instance not set. Call setFastifyInstance() first.');
        }

        const tokenPayload = {
            ...payload,
            type: 'refresh' as const,
        };

        return fastifyInstance.jwt.sign(tokenPayload, {
            expiresIn: this.REFRESH_TOKEN_EXPIRY
        });
    }

    /**
     * Verify and decode a token
     */
    static async verifyToken(token: string): Promise<JwtPayload> {
        if (!fastifyInstance) {
            throw new Error('Fastify instance not set. Call setFastifyInstance() first.');
        }

        try {
            const payload = fastifyInstance.jwt.verify(token) as JwtPayload;
            return payload;
        } catch (error: any) {
            throw new Error(`Invalid token: ${error.message}`);
        }
    }

    /**
     * Verify an access token specifically
     */
    static async verifyAccessToken(token: string): Promise<JwtPayload> {
        const payload = await this.verifyToken(token);

        if (payload.type !== 'access') {
            throw new Error('Invalid token type. Expected access token.');
        }

        return payload;
    }

    /**
     * Create and store a refresh token in database
     */
    static async createRefreshToken(userId: string): Promise<RefreshToken> {
        const token = crypto.randomBytes(64).toString('hex');
        const expiresAt = new Date();

        // Parse refresh token expiry (e.g., "7d" -> 7 days)
        const expiryMatch = this.REFRESH_TOKEN_EXPIRY.match(/(\d+)([hdwmy])/);
        if (expiryMatch) {
            const [, value, unit] = expiryMatch;
            const num = parseInt(value);

            switch (unit) {
                case 'h': expiresAt.setHours(expiresAt.getHours() + num); break;
                case 'd': expiresAt.setDate(expiresAt.getDate() + num); break;
                case 'w': expiresAt.setDate(expiresAt.getDate() + (num * 7)); break;
                case 'm': expiresAt.setMonth(expiresAt.getMonth() + num); break;
                case 'y': expiresAt.setFullYear(expiresAt.getFullYear() + num); break;
                default: expiresAt.setDate(expiresAt.getDate() + 7); // Default 7 days
            }
        } else {
            expiresAt.setDate(expiresAt.getDate() + 7); // Default 7 days
        }

        const [refreshToken] = await knex('refresh_tokens')
            .insert({
                user_id: userId,
                token,
                expires_at: expiresAt,
                revoked: false,
            })
            .returning('*');

        return {
            id: refreshToken.id,
            userId: refreshToken.user_id,
            token: refreshToken.token,
            expiresAt: refreshToken.expires_at,
            revoked: refreshToken.revoked,
        };
    }

    /**
     * Validate and get refresh token from database
     */
    static async validateRefreshToken(token: string): Promise<RefreshToken | null> {
        const refreshToken = await knex('refresh_tokens')
            .where({ token, revoked: false })
            .where('expires_at', '>', new Date())
            .first();

        if (!refreshToken) {
            return null;
        }

        return {
            id: refreshToken.id,
            userId: refreshToken.user_id,
            token: refreshToken.token,
            expiresAt: refreshToken.expires_at,
            revoked: refreshToken.revoked,
        };
    }

    /**
     * Revoke a refresh token
     */
    static async revokeRefreshToken(token: string): Promise<boolean> {
        const updated = await knex('refresh_tokens')
            .where({ token })
            .update({ revoked: true });

        return updated > 0;
    }

    /**
     * Revoke all refresh tokens for a user
     */
    static async revokeAllUserTokens(userId: string): Promise<number> {
        return await knex('refresh_tokens')
            .where({ user_id: userId })
            .update({ revoked: true });
    }

    /**
     * Clean up expired tokens
     */
    static async cleanupExpiredTokens(): Promise<number> {
        return await knex('refresh_tokens')
            .where('expires_at', '<', new Date())
            .del();
    }

    /**
     * Get token expiry in seconds
     */
    static getAccessTokenExpirySeconds(): number {
        const expiryMatch = this.ACCESS_TOKEN_EXPIRY.match(/(\d+)([hdwmy])/);
        if (!expiryMatch) return 3600; // Default 1 hour

        const [, value, unit] = expiryMatch;
        const num = parseInt(value);

        switch (unit) {
            case 'h': return num * 3600;
            case 'd': return num * 86400;
            case 'w': return num * 604800;
            case 'm': return num * 2592000; // Approximate 30 days
            case 'y': return num * 31536000; // Approximate 365 days
            default: return 3600;
        }
    }
}
