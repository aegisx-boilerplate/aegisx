"use strict";
/**
 * Session Database Model
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionModel = exports.SESSION_TABLE = void 0;
const connection_1 = require("../connection");
exports.SESSION_TABLE = 'sessions';
/**
 * Session Model for database operations
 */
class SessionModel {
    /**
     * Find session by token
     */
    static async findByToken(token) {
        const db = (0, connection_1.getDatabase)();
        const session = await db(exports.SESSION_TABLE).where({ token }).first();
        return session || null;
    }
    /**
     * Create new session
     */
    static async create(sessionData) {
        const db = (0, connection_1.getDatabase)();
        const [session] = await db(exports.SESSION_TABLE)
            .insert({
            ...sessionData,
            createdAt: new Date(),
            updatedAt: new Date()
        })
            .returning('*');
        return session;
    }
}
exports.SessionModel = SessionModel;
