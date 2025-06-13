/**
 * Password Utilities
 *
 * Provides secure password hashing, validation, and policy enforcement
 */
/**
 * Password policy configuration
 */
export interface PasswordPolicy {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    maxLength?: number;
}
/**
 * Default password policy
 */
export declare const defaultPasswordPolicy: PasswordPolicy;
/**
 * Salt rounds for bcrypt (higher = more secure but slower)
 */
export declare const SALT_ROUNDS = 12;
/**
 * Hash a password using bcrypt
 */
export declare function hashPassword(password: string): Promise<string>;
/**
 * Compare a plain password with a hashed password
 */
export declare function comparePassword(password: string, hashedPassword: string): Promise<boolean>;
/**
 * Validate password against policy
 */
export declare function validatePassword(password: string, policy?: PasswordPolicy): {
    isValid: boolean;
    errors: string[];
};
/**
 * Generate a random password
 */
export declare function generateRandomPassword(length?: number): string;
/**
 * Check if password has been compromised (placeholder for future implementation)
 */
export declare function isPasswordCompromised(password: string): Promise<boolean>;
//# sourceMappingURL=password.d.ts.map