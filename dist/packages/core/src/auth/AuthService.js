"use strict";
/**
 * Authentication Service
 *
 * Main authentication service combining JWT + Session Management
 * Provides login, register, logout, and token refresh functionality
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const UserModel_1 = require("../database/models/UserModel");
const JwtService_1 = require("./JwtService");
const PasswordService_1 = require("./PasswordService");
const SessionService_1 = require("./SessionService");
/**
 * Authentication Service Class
 */
class AuthService {
    jwtService;
    passwordService;
    sessionService;
    constructor(jwtConfig, passwordPolicy, fastify) {
        this.jwtService = new JwtService_1.JwtService(fastify, jwtConfig);
        this.passwordService = new PasswordService_1.PasswordService(passwordPolicy);
        this.sessionService = new SessionService_1.SessionService(jwtConfig, fastify);
    }
    /**
     * Register a new user
     */
    async register(request) {
        // Check if user already exists
        const existingUser = await UserModel_1.UserModel.findByEmail(request.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }
        // Hash password
        const passwordHash = await this.passwordService.hash(request.password);
        // Create user
        const user = await UserModel_1.UserModel.create({
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
    async login(request, metadata) {
        // Find user by email
        const user = await UserModel_1.UserModel.findByEmail(request.email);
        if (!user) {
            throw new Error('Invalid email or password');
        }
        // Check if user is active
        if (!user.isActive) {
            throw new Error('Account is deactivated');
        }
        // Verify password
        const isPasswordValid = await this.passwordService.compare(request.password, user.passwordHash);
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
        await UserModel_1.UserModel.update(user.id, {
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
    async logout(refreshToken) {
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
    async refreshToken(refreshToken) {
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
    async validateAuth(accessToken, refreshToken) {
        const validation = await this.sessionService.validateSession(accessToken, refreshToken);
        if (!validation.isValid) {
            return { isValid: false };
        }
        let user = null;
        if (validation.user) {
            user = await UserModel_1.UserModel.findById(validation.user.userId);
            if (!user || !user.isActive) {
                return { isValid: false };
            }
        }
        const { passwordHash: _, ...userWithoutPassword } = user || {};
        return {
            isValid: true,
            user: user ? userWithoutPassword : undefined,
            needsRefresh: validation.needsRefresh
        };
    }
    /**
     * Change password
     */
    async changePassword(userId, currentPassword, newPassword) {
        // Get user
        const user = await UserModel_1.UserModel.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        // Verify current password
        const isCurrentPasswordValid = await this.passwordService.compare(currentPassword, user.passwordHash);
        if (!isCurrentPasswordValid) {
            throw new Error('Current password is incorrect');
        }
        // Hash new password
        const newPasswordHash = await this.passwordService.hash(newPassword);
        // Update user password
        await UserModel_1.UserModel.update(userId, {
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
    async requestPasswordReset(email) {
        const user = await UserModel_1.UserModel.findByEmail(email);
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
    async resetPassword(resetToken, newPassword) {
        // TODO: Verify reset token and update password
        throw new Error('Password reset not implemented yet');
    }
    /**
     * Get user profile
     */
    async getProfile(userId) {
        const user = await UserModel_1.UserModel.findById(userId);
        if (!user) {
            return null;
        }
        const { passwordHash: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=AuthService.js.map