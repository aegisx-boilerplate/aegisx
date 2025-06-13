/**
 * JWT Service
 * 
 * Handles JWT token generation, validation, and refresh operations
 */

import jwt from 'jsonwebtoken';
import { FastifyInstance } from 'fastify';
import { JwtPayload } from '../types/auth';
import { ID } from '../types/core';

export interface JwtTokens {
    accessToken: string;
    refreshToken: string;
}

export class JwtService {
    private readonly jwtSecret: string;
    private readonly jwtRefreshSecret: string;
    private readonly expiresIn: string;
    private readonly refreshExpiresIn: string;

    constructor(
        private readonly fastify: FastifyInstance,
        config: {
            secret: string;
            refreshSecret?: string;
            expiresIn?: string;
            refreshExpiresIn?: string;
        }
    ) {
        this.jwtSecret = config.secret;
        this.jwtRefreshSecret = config.refreshSecret || config.secret;
        this.expiresIn = config.expiresIn || '15m';
        this.refreshExpiresIn = config.refreshExpiresIn || '7d';

        // Register JWT plugin
        this.fastify.register(require('@fastify/jwt'), {
            secret: this.jwtSecret,
        });
    }

    async generateTokens(payload: JwtPayload): Promise<JwtTokens> {
        // Temporary implementation without fastify.jwt
        // TODO: Implement proper JWT generation
        const token = 'temp-token-' + Date.now();

        return {
            accessToken: token + '-access',
            refreshToken: token + '-refresh',
        };
    }

    async verifyToken(token: string, isRefreshToken = false): Promise<JwtPayload> {
        try {
            // Temporary implementation without fastify.jwt
            // TODO: Implement proper JWT verification
            if (token.includes('temp-token-')) {
                return {
                    userId: 'temp-user-id',
                    email: 'temp@example.com',
                    roles: ['user'],
                    type: isRefreshToken ? 'refresh' : 'access'
                };
            }
            throw new Error('Invalid token');
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    async refreshTokens(refreshToken: string): Promise<JwtTokens> {
        try {
            const payload = await this.verifyToken(refreshToken, true);
            return this.generateTokens(payload);
        } catch (error) {
            throw new Error('Invalid refresh token');
        }
    }

    private parseExpiresIn(expiresIn: string): number {
        const match = expiresIn.match(/^(\d+)([smhd])$/);
        if (!match) {
            throw new Error('Invalid expiresIn format');
        }

        const [, value, unit] = match;
        const numValue = parseInt(value, 10);

        switch (unit) {
            case 's':
                return numValue;
            case 'm':
                return numValue * 60;
            case 'h':
                return numValue * 60 * 60;
            case 'd':
                return numValue * 60 * 60 * 24;
            default:
                throw new Error('Invalid time unit');
        }
    }

    private base64UrlEncode(str: string): string {
        return Buffer.from(str)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }

    private base64UrlDecode(str: string): string {
        str = str.replace(/-/g, '+').replace(/_/g, '/');
        while (str.length % 4) {
            str += '=';
        }
        return Buffer.from(str, 'base64').toString();
    }

    private createSignature(header: string, payload: string, secret: string): string {
        const crypto = require('crypto');
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(`${header}.${payload}`);
        return this.base64UrlEncode(hmac.digest('base64'));
    }

    /**
     * Decode token without verification (for inspection)
     */
    decodeToken(token: string): any {
        return jwt.decode(token);
    }

    /**
     * Check if token is expired
     */
    isTokenExpired(token: string): boolean {
        try {
            const decoded = this.decodeToken(token);
            if (!decoded || !decoded.exp) {
                return true;
            }

            const currentTime = Math.floor(Date.now() / 1000);
            return decoded.exp < currentTime;
        } catch {
            return true;
        }
    }

    /**
     * Get token expiration date
     */
    getTokenExpiration(token: string): Date | null {
        try {
            const decoded = this.decodeToken(token);
            if (!decoded || !decoded.exp) {
                return null;
            }

            return new Date(decoded.exp * 1000);
        } catch {
            return null;
        }
    }

    /**
     * Extract user ID from token
     */
    getUserIdFromToken(token: string): ID | null {
        try {
            const decoded = this.decodeToken(token);
            return decoded?.userId || null;
        } catch {
            return null;
        }
    }
} 