/**
 * Password Utilities
 * 
 * Provides secure password hashing, validation, and policy enforcement
 */

import bcrypt from 'bcrypt';

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
export const defaultPasswordPolicy: PasswordPolicy = {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    maxLength: 128
};

/**
 * Salt rounds for bcrypt (higher = more secure but slower)
 */
export const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain password with a hashed password
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
}

/**
 * Validate password against policy
 */
export function validatePassword(password: string, policy: PasswordPolicy = defaultPasswordPolicy): {
    isValid: boolean;
    errors: string[];
} {
    const errors: string[] = [];

    // Check minimum length
    if (password.length < policy.minLength) {
        errors.push(`Password must be at least ${policy.minLength} characters long`);
    }

    // Check maximum length
    if (policy.maxLength && password.length > policy.maxLength) {
        errors.push(`Password must not exceed ${policy.maxLength} characters`);
    }

    // Check uppercase requirement
    if (policy.requireUppercase && !/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    // Check lowercase requirement
    if (policy.requireLowercase && !/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    // Check numbers requirement
    if (policy.requireNumbers && !/\d/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    // Check special characters requirement
    if (policy.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Generate a random password
 */
export function generateRandomPassword(length: number = 12): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    const allChars = lowercase + uppercase + numbers + specialChars;
    let password = '';

    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Check if password has been compromised (placeholder for future implementation)
 */
export async function isPasswordCompromised(password: string): Promise<boolean> {
    // TODO: Integrate with HaveIBeenPwned API or similar service
    // For now, return false (not compromised)
    return false;
} 