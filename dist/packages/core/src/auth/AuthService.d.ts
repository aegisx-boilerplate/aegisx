/**
 * Authentication Service
 *
 * Main authentication service combining JWT + Session Management
 * Provides login, register, logout, and token refresh functionality
 */
import type { LoginRequest, LoginResponse } from '../types/auth';
import type { User } from '../types/user';
import type { ID } from '../types/core';
import type { JwtConfig } from '../types/config';
import type { PasswordPolicy } from '../utils/password';
/**
 * Registration request interface
 */
export interface RegisterRequest {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}
/**
 * Authentication Service Class
 */
export declare class AuthService {
    private jwtService;
    private passwordService;
    private sessionService;
    constructor(jwtConfig: JwtConfig, passwordPolicy?: PasswordPolicy, fastify?: any);
    /**
     * Register a new user
     */
    register(request: RegisterRequest): Promise<{
        user: Omit<User, 'passwordHash'>;
        message: string;
    }>;
    /**
     * Login user
     */
    login(request: LoginRequest, metadata?: {
        deviceInfo?: string;
        ipAddress?: string;
        userAgent?: string;
        location?: string;
    }): Promise<LoginResponse & {
        session: {
            id: ID;
        };
    }>;
    /**
     * Logout user
     */
    logout(refreshToken: string): Promise<{
        message: string;
    }>;
    /**
     * Refresh access token
     */
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    } | null>;
    /**
     * Validate authentication
     */
    validateAuth(accessToken: string, refreshToken?: string): Promise<{
        isValid: boolean;
        user?: Omit<User, 'passwordHash'>;
        needsRefresh?: boolean;
    }>;
    /**
     * Change password
     */
    changePassword(userId: ID, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    /**
     * Request password reset (placeholder)
     */
    requestPasswordReset(email: string): Promise<{
        message: string;
    }>;
    /**
     * Reset password (placeholder)
     */
    resetPassword(resetToken: string, newPassword: string): Promise<{
        message: string;
    }>;
    /**
     * Get user profile
     */
    getProfile(userId: ID): Promise<Omit<User, 'passwordHash'> | null>;
}
//# sourceMappingURL=AuthService.d.ts.map