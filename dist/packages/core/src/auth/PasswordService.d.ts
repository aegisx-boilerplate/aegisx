/**
 * Password Service
 *
 * High-level password management service
 */
import { type PasswordPolicy } from '../utils/password';
/**
 * Password Service Class
 */
export declare class PasswordService {
    private policy;
    constructor(policy?: PasswordPolicy);
    /**
     * Hash a password
     */
    hash(password: string): Promise<string>;
    /**
     * Compare password with hash
     */
    compare(password: string, hashedPassword: string): Promise<boolean>;
    /**
     * Validate password against policy
     */
    validate(password: string): {
        isValid: boolean;
        errors: string[];
    };
    /**
     * Generate a random password
     */
    generate(length?: number): string;
    /**
     * Update password policy
     */
    updatePolicy(newPolicy: Partial<PasswordPolicy>): void;
    /**
     * Get current password policy
     */
    getPolicy(): PasswordPolicy;
    /**
     * Check if password needs to be rehashed (for bcrypt cost updates)
     */
    needsRehash(hashedPassword: string): boolean;
}
//# sourceMappingURL=PasswordService.d.ts.map