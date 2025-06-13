/**
 * JWT Service
 *
 * Handles JWT token generation, validation, and refresh operations
 */
import { FastifyInstance } from 'fastify';
import { JwtPayload } from '../types/auth';
import { ID } from '../types/core';
export interface JwtTokens {
    accessToken: string;
    refreshToken: string;
}
export declare class JwtService {
    private readonly fastify;
    private readonly jwtSecret;
    private readonly jwtRefreshSecret;
    private readonly expiresIn;
    private readonly refreshExpiresIn;
    constructor(fastify: FastifyInstance, config: {
        secret: string;
        refreshSecret?: string;
        expiresIn?: string;
        refreshExpiresIn?: string;
    });
    generateTokens(payload: JwtPayload): Promise<JwtTokens>;
    verifyToken(token: string, isRefreshToken?: boolean): Promise<JwtPayload>;
    refreshTokens(refreshToken: string): Promise<JwtTokens>;
    private parseExpiresIn;
    private base64UrlEncode;
    private base64UrlDecode;
    private createSignature;
    /**
     * Decode token without verification (for inspection)
     */
    decodeToken(token: string): any;
    /**
     * Check if token is expired
     */
    isTokenExpired(token: string): boolean;
    /**
     * Get token expiration date
     */
    getTokenExpiration(token: string): Date | null;
    /**
     * Extract user ID from token
     */
    getUserIdFromToken(token: string): ID | null;
}
//# sourceMappingURL=JwtService.d.ts.map