
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { knex } from '../../db/knex';
import { PasswordResetToken } from './types';
import { env } from '../../config/env';

export class PasswordService {
    static SALT_ROUNDS = env.BCRYPT_ROUNDS;
    static MIN_PASSWORD_LENGTH = env.PASSWORD_MIN_LENGTH;
    static REQUIRE_SPECIAL_CHARS = env.PASSWORD_REQUIRE_SYMBOLS;
    static RESET_TOKEN_EXPIRY_HOURS = 24;

    /**
     * Hash a password using bcrypt
     */
    static async hashPassword(password: string): Promise<string> {
        this.validatePassword(password);
        return await bcrypt.hash(password, this.SALT_ROUNDS);
    }

    /**
     * Verify a password against its hash
     */
    static async verifyPassword(password: string, hash: string): Promise<boolean> {
        return await bcrypt.compare(password, hash);
    }

    /**
     * Validate password meets requirements
     */
    static validatePassword(password: string): void {
        if (!password || password.length < this.MIN_PASSWORD_LENGTH) {
            throw new Error(`Password must be at least ${this.MIN_PASSWORD_LENGTH} characters long`);
        }

        if (this.REQUIRE_SPECIAL_CHARS) {
            const hasUpperCase = /[A-Z]/.test(password);
            const hasLowerCase = /[a-z]/.test(password);
            const hasNumbers = /\d/.test(password);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

            const missing = [];
            if (!hasUpperCase) missing.push('uppercase letter');
            if (!hasLowerCase) missing.push('lowercase letter');
            if (!hasNumbers) missing.push('number');
            if (!hasSpecialChar) missing.push('special character');

            if (missing.length > 0) {
                throw new Error(`Password must contain at least one: ${missing.join(', ')}`);
            }
        }
    }

    /**
     * Generate a secure password reset token
     */
    static async createPasswordResetToken(userId: string): Promise<PasswordResetToken> {
        // Revoke any existing reset tokens for this user
        await knex('password_reset_tokens')
            .where({ user_id: userId })
            .update({ revoked: true });

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + this.RESET_TOKEN_EXPIRY_HOURS);

        await knex('password_reset_tokens').insert({
            user_id: userId,
            token,
            expires_at: expiresAt,
            revoked: false,
        });

        return {
            userId,
            token,
            expiresAt,
        };
    }

    /**
     * Validate a password reset token
     */
    static async validatePasswordResetToken(token: string): Promise<PasswordResetToken | null> {
        const resetToken = await knex('password_reset_tokens')
            .where({
                token,
                revoked: false
            })
            .where('expires_at', '>', new Date())
            .first();

        if (!resetToken) {
            return null;
        }

        return {
            userId: resetToken.user_id,
            token: resetToken.token,
            expiresAt: resetToken.expires_at,
        };
    }

    /**
     * Use a password reset token (mark as revoked)
     */
    static async usePasswordResetToken(token: string): Promise<boolean> {
        const updated = await knex('password_reset_tokens')
            .where({ token, revoked: false })
            .update({ revoked: true });

        return updated > 0;
    }

    /**
     * Clean up expired reset tokens
     */
    static async cleanupExpiredResetTokens(): Promise<number> {
        return await knex('password_reset_tokens')
            .where('expires_at', '<', new Date())
            .del();
    }

    /**
     * Generate a secure random password
     */
    static generateRandomPassword(length: number = 12): string {
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        const specialChars = '!@#$%^&*()';

        const allChars = lowercase + uppercase + numbers + specialChars;

        let password = '';

        // Ensure at least one character from each category
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += specialChars[Math.floor(Math.random() * specialChars.length)];

        // Fill the rest randomly
        for (let i = 4; i < length; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }

        // Shuffle the password
        return password.split('').sort(() => Math.random() - 0.5).join('');
    }

    /**
     * Check if password has been recently used (optional security feature)
     */
    static async isPasswordRecentlyUsed(userId: string, password: string, checkLast: number = 3): Promise<boolean> {
        try {
            const recentPasswords = await knex('password_history')
                .where({ user_id: userId })
                .orderBy('created_at', 'desc')
                .limit(checkLast)
                .select('password_hash');

            for (const record of recentPasswords) {
                if (await this.verifyPassword(password, record.password_hash)) {
                    return true;
                }
            }

            return false;
        } catch (error) {
            // If password_history table doesn't exist, just return false
            return false;
        }
    }

    /**
     * Store password in history (for preventing reuse)
     */
    static async storePasswordHistory(userId: string, passwordHash: string): Promise<void> {
        try {
            await knex('password_history').insert({
                user_id: userId,
                password_hash: passwordHash,
                created_at: new Date(),
            });

            // Keep only last 5 passwords
            const toDelete = await knex('password_history')
                .where({ user_id: userId })
                .orderBy('created_at', 'desc')
                .offset(5)
                .select('id');

            if (toDelete.length > 0) {
                await knex('password_history')
                    .whereIn('id', toDelete.map(r => r.id))
                    .del();
            }
        } catch (error) {
            // Ignore if password_history table doesn't exist
        }
    }
}
