/**
 * Session Service
 *
 * Manages user sessions for JWT + Session hybrid approach
 * Provides session tracking, multi-device support, and security controls
 */
import { type Session } from '../database/models/SessionModel';
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
export declare class SessionService {
    private jwtService;
    constructor(jwtConfig: JwtConfig, fastify?: any);
    /**
     * Create a new session
     */
    createSession(data: CreateSessionData): Promise<ExtendedSession>;
    /**
     * Find session by refresh token
     */
    findSessionByToken(refreshToken: string): Promise<ExtendedSession | null>;
    /**
     * Validate session and access token
     */
    validateSession(accessToken: string, refreshToken?: string): Promise<{
        isValid: boolean;
        session?: ExtendedSession;
        user?: {
            userId: ID;
            email: string;
            roles: string[];
        };
        needsRefresh?: boolean;
    }>;
    /**
     * Refresh session tokens
     */
    refreshSession(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
        session: ExtendedSession;
    } | null>;
    /**
     * Terminate a specific session
     */
    terminateSession(sessionId: ID): Promise<boolean>;
    /**
     * Terminate all sessions for a user
     */
    terminateAllUserSessions(userId: ID): Promise<void>;
    /**
     * Get all active sessions for a user
     */
    getUserSessions(userId: ID): Promise<ExtendedSession[]>;
    /**
     * Terminate other sessions (keep current one)
     */
    terminateOtherSessions(userId: ID, currentSessionId: ID): Promise<void>;
    /**
     * Cleanup expired sessions (for cron job)
     */
    cleanupExpiredSessions(): Promise<number>;
    /**
     * Check if session is valid
     */
    isSessionValid(sessionId: ID): Promise<boolean>;
    /**
     * Extend session expiration
     */
    extendSession(sessionId: ID, extendBy?: number): Promise<boolean>;
}
//# sourceMappingURL=SessionService.d.ts.map