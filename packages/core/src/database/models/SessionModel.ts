/**
 * Session Database Model
 */

import { getDatabase } from '../connection';
import type { ID } from '../../types/core';

export const SESSION_TABLE = 'sessions';

/**
 * Session interface
 */
export interface Session {
    id: ID;
    userId: ID;
    token: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Session Model for database operations
 */
export class SessionModel {
    /**
     * Find session by token
     */
    static async findByToken(token: string): Promise<Session | null> {
        const db = getDatabase();
        const session = await db(SESSION_TABLE).where({ token }).first();
        return session || null;
    }

    /**
 * Create new session
 */
    static async create(sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Promise<Session> {
        const db = getDatabase();
        const [session] = await db(SESSION_TABLE)
            .insert({
                ...sessionData,
                createdAt: new Date(),
                updatedAt: new Date()
            })
            .returning('*');
        return session;
    }

    /**
     * Update session
     */
    static async update(id: ID, sessionData: Partial<Session>): Promise<Session | null> {
        const db = getDatabase();
        const [session] = await db(SESSION_TABLE)
            .where({ id })
            .update({
                ...sessionData,
                updatedAt: new Date()
            })
            .returning('*');
        return session || null;
    }

    /**
     * Delete session
     */
    static async delete(id: ID): Promise<boolean> {
        const db = getDatabase();
        const deleted = await db(SESSION_TABLE).where({ id }).del();
        return deleted > 0;
    }

    /**
     * Find session by ID
     */
    static async findById(id: ID): Promise<Session | null> {
        const db = getDatabase();
        const session = await db(SESSION_TABLE).where({ id }).first();
        return session || null;
    }
} 