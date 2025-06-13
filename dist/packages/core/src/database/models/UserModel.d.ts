/**
 * User Database Model
 */
import type { User } from '../../types/user';
import type { ID } from '../../types/core';
export declare const USER_TABLE = "users";
/**
 * User Model for database operations
 */
export declare class UserModel {
    /**
     * Find user by ID
     */
    static findById(id: ID): Promise<User | null>;
    /**
     * Find user by email
     */
    static findByEmail(email: string): Promise<User | null>;
    /**
     * Create new user
     */
    static create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
    /**
     * Update user
     */
    static update(id: ID, userData: Partial<User>): Promise<User | null>;
    /**
     * Delete user
     */
    static delete(id: ID): Promise<boolean>;
    /**
     * List users with pagination
     */
    static list(offset?: number, limit?: number): Promise<User[]>;
    /**
     * Count total users
     */
    static count(): Promise<number>;
}
//# sourceMappingURL=UserModel.d.ts.map