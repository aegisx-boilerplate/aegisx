/**
 * User Database Model
 */

import { getDatabase } from '../connection';
import type { User } from '../../types/user';
import type { ID } from '../../types/core';

export const USER_TABLE = 'users';

/**
 * User Model for database operations
 */
export class UserModel {
    /**
     * Find user by ID
     */
    static async findById(id: ID): Promise<User | null> {
        const db = getDatabase();
        const user = await db(USER_TABLE).where({ id }).first();
        return user || null;
    }

    /**
     * Find user by email
     */
    static async findByEmail(email: string): Promise<User | null> {
        const db = getDatabase();
        const user = await db(USER_TABLE).where({ email }).first();
        return user || null;
    }

    /**
     * Create new user
     */
    static async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
        const db = getDatabase();
        const [user] = await db(USER_TABLE)
            .insert({
                ...userData,
                createdAt: new Date(),
                updatedAt: new Date()
            })
            .returning('*');
        return user;
    }

    /**
     * Update user
     */
    static async update(id: ID, userData: Partial<User>): Promise<User | null> {
        const db = getDatabase();
        const [user] = await db(USER_TABLE)
            .where({ id })
            .update({
                ...userData,
                updatedAt: new Date()
            })
            .returning('*');
        return user || null;
    }

    /**
     * Delete user
     */
    static async delete(id: ID): Promise<boolean> {
        const db = getDatabase();
        const deleted = await db(USER_TABLE).where({ id }).del();
        return deleted > 0;
    }

    /**
     * List users with pagination
     */
    static async list(offset = 0, limit = 10): Promise<User[]> {
        const db = getDatabase();
        return await db(USER_TABLE)
            .offset(offset)
            .limit(limit)
            .orderBy('createdAt', 'desc');
    }

    /**
     * Count total users
     */
    static async count(): Promise<number> {
        const db = getDatabase();
        const [{ count }] = await db(USER_TABLE).count('* as count');
        return parseInt(count as string);
    }
} 