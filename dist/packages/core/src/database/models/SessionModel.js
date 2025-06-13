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
    /**
     * Update session
     */
    static async update(id, sessionData) {
        const db = (0, connection_1.getDatabase)();
        const [session] = await db(exports.SESSION_TABLE)
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
    static async delete(id) {
        const db = (0, connection_1.getDatabase)();
        const deleted = await db(exports.SESSION_TABLE).where({ id }).del();
        return deleted > 0;
    }
    /**
     * Find session by ID
     */
    static async findById(id) {
        const db = (0, connection_1.getDatabase)();
        const session = await db(exports.SESSION_TABLE).where({ id }).first();
        return session || null;
    }
}
exports.SessionModel = SessionModel;
//# sourceMappingURL=SessionModel.js.map