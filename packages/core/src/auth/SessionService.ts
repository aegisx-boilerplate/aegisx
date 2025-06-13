/**
 * Session Service
 * 
 * Manages user sessions for JWT + Session hybrid approach
 * Provides session tracking, multi-device support, and security controls
 */

import { SessionModel, type Session } from '../database/models/SessionModel';
import { JwtService } from './JwtService';
import type { ID } from '../types/core';
import type { JwtConfig } from '../types/config';

/**
 * Extended session interface with additional metadata
 */
export interface ExtendedSession extends Session {
    deviceInfo?: string;
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    isActive: boolean;
}

/**
 * Session creation data
 */
export interface CreateSessionData {
    userId: ID;
    accessToken: string;
    refreshToken: string;
    deviceInfo?: string;
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    expiresAt?: Date;
}

/**
 * Session Service Class
 */
export class SessionService {
    private jwtService: JwtService;

    constructor(jwtConfig: JwtConfig, fastify?: any) {
        this.jwtService = new JwtService(fastify, jwtConfig);
    }

    /**
     * Create a new session
     */
    async createSession(data: CreateSessionData): Promise<ExtendedSession> {
        // Calculate expiration time (default 7 days for refresh token)
        const expiresAt = data.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const session = await SessionModel.create({
            userId: data.userId,
            token: data.refreshToken,
            expiresAt
        });

        return {
            ...session,
            deviceInfo: data.deviceInfo,
            ipAddress: data.ipAddress,
            userAgent: data.userAgent,
            location: data.location,
            isActive: true
        };
    }

    /**
     * Find session by refresh token
     */
    async findSessionByToken(refreshToken: string): Promise<ExtendedSession | null> {
        const session = await SessionModel.findByToken(refreshToken);
        if (!session) {
            return null;
        }

        // Check if session is expired
        const isExpired = new Date() > session.expiresAt;
        if (isExpired) {
            await this.terminateSession(session.id);
            return null;
        }

        return {
            ...session,
            isActive: true
        };
    }

    /**
     * Validate session and access token
     */
    async validateSession(accessToken: string, refreshToken?: string): Promise<{
        isValid: boolean;
        session?: ExtendedSession;
        user?: { userId: ID; email: string; roles: string[] };
        needsRefresh?: boolean;
    }> {
        try {
            // First, try to validate access token
            const tokenPayload = await this.jwtService.verifyToken(accessToken, false);

            // If refresh token is provided, validate session
            if (refreshToken) {
                const session = await this.findSessionByToken(refreshToken);
                if (!session || session.userId !== tokenPayload.userId) {
                    return { isValid: false };
                }

                return {
                    isValid: true,
                    session,
                    user: {
                        userId: tokenPayload.userId,
                        email: tokenPayload.email,
                        roles: tokenPayload.roles
                    }
                };
            }

            // Access token valid, no session check needed
            return {
                isValid: true,
                user: {
                    userId: tokenPayload.userId,
                    email: tokenPayload.email,
                    roles: tokenPayload.roles
                }
            };

        } catch (error: any) {
            // Access token expired or invalid
            if (error.message.includes('expired') && refreshToken) {
                // Try to refresh using refresh token
                const session = await this.findSessionByToken(refreshToken);
                if (session) {
                    return {
                        isValid: true,
                        session,
                        needsRefresh: true
                    };
                }
            }

            return { isValid: false };
        }
    }

    /**
     * Refresh session tokens
     */
    async refreshSession(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        session: ExtendedSession;
    } | null> {
        const session = await this.findSessionByToken(refreshToken);
        if (!session) {
            return null;
        }

        try {
            // Generate new token pair
            const tokenPayload = await this.jwtService.verifyToken(refreshToken, true);
            const newTokens = await this.jwtService.generateTokens({
                userId: tokenPayload.userId,
                email: tokenPayload.email,
                roles: tokenPayload.roles,
                type: 'access'
            });

            // Update session with new refresh token
            const updatedSession = await SessionModel.update(session.id, {
                token: newTokens.refreshToken,
                updatedAt: new Date()
            });

            if (!updatedSession) {
                return null;
            }

            return {
                accessToken: newTokens.accessToken,
                refreshToken: newTokens.refreshToken,
                session: {
                    ...updatedSession,
                    isActive: true
                }
            };

        } catch (error) {
            // Refresh token invalid, terminate session
            await this.terminateSession(session.id);
            return null;
        }
    }

    /**
     * Terminate a specific session
     */
    async terminateSession(sessionId: ID): Promise<boolean> {
        return await SessionModel.delete(sessionId);
    }

    /**
     * Terminate all sessions for a user
     */
    async terminateAllUserSessions(userId: ID): Promise<void> {
        // TODO: Implement when we have more advanced SessionModel methods
        // For now, we'll need to implement this in SessionModel
        console.log(`Terminating all sessions for user: ${userId}`);
    }

    /**
     * Get all active sessions for a user
     */
    async getUserSessions(userId: ID): Promise<ExtendedSession[]> {
        // TODO: Implement when we have more advanced SessionModel methods
        // For now, return empty array
        return [];
    }

    /**
     * Terminate other sessions (keep current one)
     */
    async terminateOtherSessions(userId: ID, currentSessionId: ID): Promise<void> {
        // TODO: Implement when we have more advanced SessionModel methods
        console.log(`Terminating other sessions for user: ${userId}, keeping: ${currentSessionId}`);
    }

    /**
     * Cleanup expired sessions (for cron job)
     */
    async cleanupExpiredSessions(): Promise<number> {
        // TODO: Implement when we have more advanced SessionModel methods
        console.log('Cleaning up expired sessions...');
        return 0;
    }

    /**
     * Check if session is valid
     */
    async isSessionValid(sessionId: ID): Promise<boolean> {
        try {
            const session = await SessionModel.findById?.(sessionId);
            if (!session) {
                return false;
            }

            return new Date() <= session.expiresAt;
        } catch {
            return false;
        }
    }

    /**
     * Extend session expiration
     */
    async extendSession(sessionId: ID, extendBy: number = 7 * 24 * 60 * 60 * 1000): Promise<boolean> {
        try {
            const newExpiresAt = new Date(Date.now() + extendBy);
            const updated = await SessionModel.update(sessionId, {
                expiresAt: newExpiresAt,
                updatedAt: new Date()
            });

            return !!updated;
        } catch {
            return false;
        }
    }
} 