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
    /**
     * Update session
     */
    static update(id: ID, sessionData: Partial<Session>): Promise<Session | null>;
    /**
     * Delete session
     */
    static delete(id: ID): Promise<boolean>;
    /**
     * Find session by ID
     */
    static findById(id: ID): Promise<Session | null>;
}
//# sourceMappingURL=SessionModel.d.ts.map