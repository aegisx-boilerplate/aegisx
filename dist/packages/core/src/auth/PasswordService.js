"use strict";
/**
 * Password Service
 *
 * High-level password management service
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordService = void 0;
const password_1 = require("../utils/password");
/**
 * Password Service Class
 */
class PasswordService {
    policy;
    constructor(policy = password_1.defaultPasswordPolicy) {
        this.policy = policy;
    }
    /**
     * Hash a password
     */
    async hash(password) {
        // Validate password before hashing
        const validation = this.validate(password);
        if (!validation.isValid) {
            throw new Error(`Password validation failed: ${validation.errors.join(', ')}`);
        }
        // Check if password is compromised (if enabled)
        if (await (0, password_1.isPasswordCompromised)(password)) {
            throw new Error('Password has been found in data breaches. Please choose a different password.');
        }
        return await (0, password_1.hashPassword)(password);
    }
    /**
     * Compare password with hash
     */
    async compare(password, hashedPassword) {
        return await (0, password_1.comparePassword)(password, hashedPassword);
    }
    /**
     * Validate password against policy
     */
    validate(password) {
        return (0, password_1.validatePassword)(password, this.policy);
    }
    /**
     * Generate a random password
     */
    generate(length = 12) {
        return (0, password_1.generateRandomPassword)(length);
    }
    /**
     * Update password policy
     */
    updatePolicy(newPolicy) {
        this.policy = { ...this.policy, ...newPolicy };
    }
    /**
     * Get current password policy
     */
    getPolicy() {
        return { ...this.policy };
    }
    /**
     * Check if password needs to be rehashed (for bcrypt cost updates)
     */
    needsRehash(hashedPassword) {
        // Simple check - if the hash doesn't start with expected bcrypt format
        // In production, you might want to check the cost factor
        return !hashedPassword.startsWith('$2b$12$');
    }
}
exports.PasswordService = PasswordService;
//# sourceMappingURL=PasswordService.js.map