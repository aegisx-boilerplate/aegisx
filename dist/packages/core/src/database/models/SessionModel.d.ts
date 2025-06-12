/**
 * Session Database Model
 */
import type { ID } from '../../types/core';
export declare const SESSION_TABLE = "sessions";
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
export declare class SessionModel {
    /**
     * Find session by token
     */
    static findByToken(token: string): Promise<Session | null>;
    /**
     * Create new session
     */
    static create(sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Promise<Session>;
}
