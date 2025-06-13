/**
 * Password Service
 * 
 * High-level password management service
 */

import {
    hashPassword,
    comparePassword,
    validatePassword,
    generateRandomPassword,
    isPasswordCompromised,
    type PasswordPolicy,
    defaultPasswordPolicy
} from '../utils/password';

/**
 * Password Service Class
 */
export class PasswordService {
    private policy: PasswordPolicy;

    constructor(policy: PasswordPolicy = defaultPasswordPolicy) {
        this.policy = policy;
    }

    /**
     * Hash a password
     */
    async hash(password: string): Promise<string> {
        // Validate password before hashing
        const validation = this.validate(password);
        if (!validation.isValid) {
            throw new Error(`Password validation failed: ${validation.errors.join(', ')}`);
        }

        // Check if password is compromised (if enabled)
        if (await isPasswordCompromised(password)) {
            throw new Error('Password has been found in data breaches. Please choose a different password.');
        }

        return await hashPassword(password);
    }

    /**
     * Compare password with hash
     */
    async compare(password: string, hashedPassword: string): Promise<boolean> {
        return await comparePassword(password, hashedPassword);
    }

    /**
     * Validate password against policy
     */
    validate(password: string): { isValid: boolean; errors: string[] } {
        return validatePassword(password, this.policy);
    }

    /**
     * Generate a random password
     */
    generate(length: number = 12): string {
        return generateRandomPassword(length);
    }

    /**
     * Update password policy
     */
    updatePolicy(newPolicy: Partial<PasswordPolicy>): void {
        this.policy = { ...this.policy, ...newPolicy };
    }

    /**
     * Get current password policy
     */
    getPolicy(): PasswordPolicy {
        return { ...this.policy };
    }

    /**
     * Check if password needs to be rehashed (for bcrypt cost updates)
     */
    needsRehash(hashedPassword: string): boolean {
        // Simple check - if the hash doesn't start with expected bcrypt format
        // In production, you might want to check the cost factor
        return !hashedPassword.startsWith('$2b$12$');
    }
} 