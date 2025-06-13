/**
 * Authentication Service
 * 
 * Main authentication service combining JWT + Session Management
 * Provides login, register, logout, and token refresh functionality
 */

import { UserModel } from '../database/models/UserModel';
import { JwtService } from './JwtService';
import { PasswordService } from './PasswordService';
import { SessionService } from './SessionService';
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
export class AuthService {
    private jwtService: JwtService;
    private passwordService: PasswordService;
    private sessionService: SessionService;

    constructor(
        jwtConfig: JwtConfig,
        passwordPolicy?: PasswordPolicy,
        fastify?: any
    ) {
        this.jwtService = new JwtService(fastify, jwtConfig);
        this.passwordService = new PasswordService(passwordPolicy);
        this.sessionService = new SessionService(jwtConfig, fastify);
    }

    /**
     * Register a new user
     */
    async register(request: RegisterRequest): Promise<{
        user: Omit<User, 'passwordHash'>;
        message: string;
    }> {
        // Check if user already exists
        const existingUser = await UserModel.findByEmail(request.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Hash password
        const passwordHash = await this.passwordService.hash(request.password);

        // Create user
        const user = await UserModel.create({
            email: request.email,
            firstName: request.firstName,
            lastName: request.lastName,
            passwordHash,
            isActive: true
        });

        // Remove password hash from response
        const { passwordHash: _, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            message: 'User registered successfully'
        };
    }

    /**
     * Login user
     */
    async login(
        request: LoginRequest,
        metadata?: {
            deviceInfo?: string;
            ipAddress?: string;
            userAgent?: string;
            location?: string;
        }
    ): Promise<LoginResponse & { session: { id: ID } }> {
        // Find user by email
        const user = await UserModel.findByEmail(request.email);
        if (!user) {
            throw new Error('Invalid email or password');
        }

        // Check if user is active
        if (!user.isActive) {
            throw new Error('Account is deactivated');
        }

        // Verify password
        const isPasswordValid = await this.passwordService.compare(
            request.password,
            user.passwordHash
        );
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }

        // Generate tokens
        const tokens = await this.jwtService.generateTokens({
            userId: user.id,
            email: user.email,
            roles: [], // TODO: Add roles when RBAC is implemented
            type: 'access'
        });

        // Create session
        const session = await this.sessionService.createSession({
            userId: user.id,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            deviceInfo: metadata?.deviceInfo,
            ipAddress: metadata?.ipAddress,
            userAgent: metadata?.userAgent,
            location: metadata?.location
        });

        // Update last login time
        await UserModel.update(user.id, {
            lastLoginAt: new Date()
        });

        // Remove password hash from response
        const { passwordHash: _, ...userWithoutPassword } = user;

        return {
            user: userWithoutPassword,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            session: {
                id: session.id
            }
        };
    }

    /**
     * Logout user
     */
    async logout(refreshToken: string): Promise<{ message: string }> {
        const session = await this.sessionService.findSessionByToken(refreshToken);
        if (session) {
            await this.sessionService.terminateSession(session.id);
        }

        return {
            message: 'Logged out successfully'
        };
    }

    /**
     * Refresh access token
     */
    async refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    } | null> {
        const result = await this.sessionService.refreshSession(refreshToken);
        if (!result) {
            return null;
        }

        return {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken
        };
    }

    /**
     * Validate authentication
     */
    async validateAuth(accessToken: string, refreshToken?: string): Promise<{
        isValid: boolean;
        user?: Omit<User, 'passwordHash'>;
        needsRefresh?: boolean;
    }> {
        const validation = await this.sessionService.validateSession(accessToken, refreshToken);

        if (!validation.isValid) {
            return { isValid: false };
        }

        let user: User | null = null;
        if (validation.user) {
            user = await UserModel.findById(validation.user.userId);
            if (!user || !user.isActive) {
                return { isValid: false };
            }
        }

        const { passwordHash: _, ...userWithoutPassword } = user || {} as User;

        return {
            isValid: true,
            user: user ? userWithoutPassword : undefined,
            needsRefresh: validation.needsRefresh
        };
    }

    /**
     * Change password
     */
    async changePassword(
        userId: ID,
        currentPassword: string,
        newPassword: string
    ): Promise<{ message: string }> {
        // Get user
        const user = await UserModel.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Verify current password
        const isCurrentPasswordValid = await this.passwordService.compare(
            currentPassword,
            user.passwordHash
        );
        if (!isCurrentPasswordValid) {
            throw new Error('Current password is incorrect');
        }

        // Hash new password
        const newPasswordHash = await this.passwordService.hash(newPassword);

        // Update user password
        await UserModel.update(userId, {
            passwordHash: newPasswordHash,
            updatedAt: new Date()
        });

        // Terminate all other sessions (force re-login)
        await this.sessionService.terminateAllUserSessions(userId);

        return {
            message: 'Password changed successfully'
        };
    }

    /**
     * Request password reset (placeholder)
     */
    async requestPasswordReset(email: string): Promise<{ message: string }> {
        const user = await UserModel.findByEmail(email);
        if (!user) {
            // Don't reveal if email exists
            return {
                message: 'If the email exists, a password reset link has been sent'
            };
        }

        // TODO: Generate reset token and send email
        console.log(`Password reset requested for: ${email}`);

        return {
            message: 'If the email exists, a password reset link has been sent'
        };
    }

    /**
     * Reset password (placeholder)
     */
    async resetPassword(
        resetToken: string,
        newPassword: string
    ): Promise<{ message: string }> {
        // TODO: Verify reset token and update password
        throw new Error('Password reset not implemented yet');
    }

    /**
     * Get user profile
     */
    async getProfile(userId: ID): Promise<Omit<User, 'passwordHash'> | null> {
        const user = await UserModel.findById(userId);
        if (!user) {
            return null;
        }

        const { passwordHash: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
} 