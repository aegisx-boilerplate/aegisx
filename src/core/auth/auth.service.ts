import { knex } from '../../db/knex';
import { env } from '../../config/env';
import Redis from 'ioredis';
import { AuditLogger } from '../../utils/audit-logger';
import { JwtService, setFastifyInstance } from './jwt.service';
import { PasswordService } from './password.service';
import { EmailService } from '../../services/email.service';
import { RbacService } from '../rbac/rbac.service';
import { ResilientEventBus } from '../event-bus';
import {
  AuthUser,
  RegisterRequest,
  AuthResponse,
  AuthMetadata,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  RefreshTokenRequest,
} from './types';

const redis = new Redis(env.REDIS_URL);

export { setFastifyInstance };

export class AuthService {
  /**
   * Login with username/email and password
   */
  static async login(
    usernameOrEmail: string,
    password: string,
    metadata?: AuthMetadata,
    eventBus?: ResilientEventBus
  ): Promise<AuthResponse> {
    // Try to find user by username first, then by email
    let user = await knex('users').where({ username: usernameOrEmail }).first();
    if (!user) {
      user = await knex('users').where({ email: usernameOrEmail }).first();
    }

    if (!user) {
      // Log failed login attempt
      if (eventBus) {
        await AuditLogger.logAuth(eventBus, {
          userId: usernameOrEmail,
          action: 'login.failed',
          reason: 'user_not_found',
          ip: metadata?.ip,
          userAgent: metadata?.userAgent,
        });
      }
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await PasswordService.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      // Log failed login attempt
      if (eventBus) {
        await AuditLogger.logAuth(eventBus, {
          userId: user.id,
          action: 'login.failed',
          reason: 'invalid_password',
          ip: metadata?.ip,
          userAgent: metadata?.userAgent,
        });
      }
      throw new Error('Invalid credentials');
    }

    // Load user permissions
    const permissions = await this.loadUserPermissions(user.id);

    // Create JWT tokens
    const jwtPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      permissions,
    };

    const accessToken = JwtService.signAccessToken(jwtPayload);
    const refreshToken = await JwtService.createRefreshToken(user.id);

    // Store session in Redis
    await redis.set(
      `user:${user.id}:session`,
      JSON.stringify({
        userId: user.id,
        username: user.username,
        email: user.email,
        sessionId: metadata?.sessionId,
        lastActivity: new Date(),
      }),
      'EX',
      JwtService.getAccessTokenExpirySeconds()
    );

    // Log successful login
    if (eventBus) {
      await AuditLogger.logAuth(eventBus, {
        userId: user.id,
        action: 'login.success',
        ip: metadata?.ip,
        userAgent: metadata?.userAgent,
      });
    }

    return {
      access_token: accessToken,
      refresh_token: refreshToken.token,
      expires_in: JwtService.getAccessTokenExpirySeconds(),
      token_type: 'Bearer',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: permissions,
      },
    };
  }

  /**
   * Register a new user
   */
  static async register(
    data: RegisterRequest,
    metadata?: AuthMetadata,
    eventBus?: ResilientEventBus
  ): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await knex('users')
      .where({ username: data.username })
      .orWhere({ email: data.email })
      .first();

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const passwordHash = await PasswordService.hashPassword(data.password);

    // Create user
    const [user] = await knex('users')
      .insert({
        username: data.username,
        email: data.email,
        password_hash: passwordHash,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');

    // Store password in history
    await PasswordService.storePasswordHistory(user.id, passwordHash);

    // Assign default USER role
    try {
      const defaultRole = await knex('roles').where({ name: 'USER' }).first();
      if (defaultRole) {
        await RbacService.assignRole(user.id, defaultRole.id);
      } else {
        console.warn('Default USER role not found. User registered without role.');
      }
    } catch (roleError) {
      console.error('Failed to assign default role:', roleError);
      // Don't fail registration if role assignment fails
    }

    // Send welcome email (optional, don't fail registration if email fails)
    try {
      await EmailService.sendWelcomeEmail(user.email, user.username);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    // Log registration
    if (eventBus) {
      await AuditLogger.logAuth(eventBus, {
        userId: user.id,
        action: 'user.registered',
        ip: metadata?.ip,
        userAgent: metadata?.userAgent,
      });
    }

    // Auto-login after registration
    return await this.login(data.username, data.password, metadata, eventBus);
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(data: RefreshTokenRequest): Promise<AuthResponse> {
    // Validate refresh token
    const refreshToken = await JwtService.validateRefreshToken(data.refresh_token);
    if (!refreshToken) {
      throw new Error('Invalid or expired refresh token');
    }

    // Get user
    const user = await knex('users').where({ id: refreshToken.userId }).first();
    if (!user) {
      throw new Error('User not found');
    }

    // Load permissions
    const permissions = await this.loadUserPermissions(user.id);

    // Create new access token
    const jwtPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role_id: user.role_id,
      permissions,
    };

    const accessToken = JwtService.signAccessToken(jwtPayload);

    return {
      access_token: accessToken,
      refresh_token: data.refresh_token, // Keep the same refresh token
      expires_in: JwtService.getAccessTokenExpirySeconds(),
      token_type: 'Bearer',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: permissions,
      },
    };
  }

  /**
   * Logout and revoke tokens
   */
  static async logout(
    userId: string,
    refreshToken?: string,
    metadata?: AuthMetadata,
    eventBus?: ResilientEventBus
  ): Promise<void> {
    // Remove session from Redis
    await redis.del(`user:${userId}:session`);

    // Revoke refresh token if provided
    if (refreshToken) {
      await JwtService.revokeRefreshToken(refreshToken);
    }

    // Log logout
    if (eventBus) {
      await AuditLogger.logAuth(eventBus, {
        userId,
        action: 'logout.success',
        ip: metadata?.ip,
        userAgent: metadata?.userAgent,
      });
    }
  }

  /**
   * Request password reset
   */
  static async forgotPassword(
    data: ForgotPasswordRequest,
    metadata?: AuthMetadata,
    eventBus?: ResilientEventBus
  ): Promise<void> {
    const user = await knex('users').where({ email: data.email }).first();

    if (!user) {
      // Don't reveal if email exists or not
      return;
    }

    // Create reset token
    const resetToken = await PasswordService.createPasswordResetToken(user.id);

    // Send password reset email
    try {
      const resetUrl = `${env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken.token}`;

      await EmailService.sendPasswordResetEmail({
        to: user.email,
        username: user.username,
        resetToken: resetToken.token,
        resetUrl,
      });
    } catch (emailError) {
      // Log email error but don't fail the request
      console.error('Failed to send password reset email:', emailError);

      // In development, log the token for testing
      if (env.NODE_ENV === 'development') {
        console.log(`Password reset token for ${user.email}: ${resetToken.token}`);
        console.log(
          `Reset URL: ${env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken.token}`
        );
      }
    }

    // Log password reset request
    if (eventBus) {
      await AuditLogger.logAuth(eventBus, {
        userId: user.id,
        action: 'password.reset_requested',
        ip: metadata?.ip,
        userAgent: metadata?.userAgent,
      });
    }
  }

  /**
   * Reset password using reset token
   */
  static async resetPassword(
    data: ResetPasswordRequest,
    metadata?: AuthMetadata,
    eventBus?: ResilientEventBus
  ): Promise<void> {
    // Validate reset token
    const resetToken = await PasswordService.validatePasswordResetToken(data.token);
    if (!resetToken) {
      throw new Error('Invalid or expired reset token');
    }

    // Check if new password was recently used
    const isRecentlyUsed = await PasswordService.isPasswordRecentlyUsed(
      resetToken.userId,
      data.newPassword
    );
    if (isRecentlyUsed) {
      throw new Error('Cannot reuse a recently used password');
    }

    // Hash new password
    const passwordHash = await PasswordService.hashPassword(data.newPassword);

    // Update password
    await knex('users').where({ id: resetToken.userId }).update({
      password_hash: passwordHash,
      updated_at: new Date(),
    });

    // Store in password history
    await PasswordService.storePasswordHistory(resetToken.userId, passwordHash);

    // Use (revoke) the reset token
    await PasswordService.usePasswordResetToken(data.token);

    // Revoke all existing refresh tokens for security
    await JwtService.revokeAllUserTokens(resetToken.userId);

    // Remove all sessions
    await redis.del(`user:${resetToken.userId}:session`);

    // Log password reset
    if (eventBus) {
      await AuditLogger.logAuth(eventBus, {
        userId: resetToken.userId,
        action: 'password.reset_completed',
        ip: metadata?.ip,
        userAgent: metadata?.userAgent,
      });
    }
  }

  /**
   * Change password (requires current password)
   */
  static async changePassword(
    userId: string,
    data: ChangePasswordRequest,
    metadata?: AuthMetadata,
    eventBus?: ResilientEventBus
  ): Promise<void> {
    // Get user
    const user = await knex('users').where({ id: userId }).first();
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await PasswordService.verifyPassword(
      data.currentPassword,
      user.password_hash
    );
    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Check if new password was recently used
    const isRecentlyUsed = await PasswordService.isPasswordRecentlyUsed(userId, data.newPassword);
    if (isRecentlyUsed) {
      throw new Error('Cannot reuse a recently used password');
    }

    // Hash new password
    const passwordHash = await PasswordService.hashPassword(data.newPassword);

    // Update password
    await knex('users').where({ id: userId }).update({
      password_hash: passwordHash,
      updated_at: new Date(),
    });

    // Store in password history
    await PasswordService.storePasswordHistory(userId, passwordHash);

    // Log password change
    if (eventBus) {
      await AuditLogger.logAuth(eventBus, {
        userId,
        action: 'password.changed',
        ip: metadata?.ip,
        userAgent: metadata?.userAgent,
      });
    }
  }

  /**
   * Get current user info
   */
  static async getCurrentUser(userId: string): Promise<AuthUser> {
    const user = await knex('users')
      .where({ id: userId })
      .select('id', 'username', 'email', 'created_at', 'updated_at')
      .first();

    if (!user) {
      throw new Error('User not found');
    }

    const permissions = await this.loadUserPermissions(user.id);

    return {
      ...user,
      permissions,
    };
  }

  /**
   * Load user permissions from RBAC
   */
  private static async loadUserPermissions(userId: string): Promise<string[]> {
    try {
      const rows = await knex('user_roles')
        .join('role_permissions', 'user_roles.role_id', 'role_permissions.role_id')
        .join('permissions', 'role_permissions.permission_id', 'permissions.id')
        .where('user_roles.user_id', userId)
        .select('permissions.name');

      return rows.map((r: any) => r.name);
    } catch {
      return [];
    }
  }
}
