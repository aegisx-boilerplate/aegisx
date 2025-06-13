"use strict";
/**
 * JWT Service
 *
 * Handles JWT token generation, validation, and refresh operations
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class JwtService {
    fastify;
    jwtSecret;
    jwtRefreshSecret;
    expiresIn;
    refreshExpiresIn;
    constructor(fastify, config) {
        this.fastify = fastify;
        this.jwtSecret = config.secret;
        this.jwtRefreshSecret = config.refreshSecret || config.secret;
        this.expiresIn = config.expiresIn || '15m';
        this.refreshExpiresIn = config.refreshExpiresIn || '7d';
        // Register JWT plugin
        this.fastify.register(require('@fastify/jwt'), {
            secret: this.jwtSecret,
        });
    }
    async generateTokens(payload) {
        // Temporary implementation without fastify.jwt
        // TODO: Implement proper JWT generation
        const token = 'temp-token-' + Date.now();
        return {
            accessToken: token + '-access',
            refreshToken: token + '-refresh',
        };
    }
    async verifyToken(token, isRefreshToken = false) {
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
        }
        catch (error) {
            throw new Error('Invalid token');
        }
    }
    async refreshTokens(refreshToken) {
        try {
            const payload = await this.verifyToken(refreshToken, true);
            return this.generateTokens(payload);
        }
        catch (error) {
            throw new Error('Invalid refresh token');
        }
    }
    parseExpiresIn(expiresIn) {
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
    base64UrlEncode(str) {
        return Buffer.from(str)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=/g, '');
    }
    base64UrlDecode(str) {
        str = str.replace(/-/g, '+').replace(/_/g, '/');
        while (str.length % 4) {
            str += '=';
        }
        return Buffer.from(str, 'base64').toString();
    }
    createSignature(header, payload, secret) {
        const crypto = require('crypto');
        const hmac = crypto.createHmac('sha256', secret);
        hmac.update(`${header}.${payload}`);
        return this.base64UrlEncode(hmac.digest('base64'));
    }
    /**
     * Decode token without verification (for inspection)
     */
    decodeToken(token) {
        return jsonwebtoken_1.default.decode(token);
    }
    /**
     * Check if token is expired
     */
    isTokenExpired(token) {
        try {
            const decoded = this.decodeToken(token);
            if (!decoded || !decoded.exp) {
                return true;
            }
            const currentTime = Math.floor(Date.now() / 1000);
            return decoded.exp < currentTime;
        }
        catch {
            return true;
        }
    }
    /**
     * Get token expiration date
     */
    getTokenExpiration(token) {
        try {
            const decoded = this.decodeToken(token);
            if (!decoded || !decoded.exp) {
                return null;
            }
            return new Date(decoded.exp * 1000);
        }
        catch {
            return null;
        }
    }
    /**
     * Extract user ID from token
     */
    getUserIdFromToken(token) {
        try {
            const decoded = this.decodeToken(token);
            return decoded?.userId || null;
        }
        catch {
            return null;
        }
    }
}
exports.JwtService = JwtService;
//# sourceMappingURL=JwtService.js.map