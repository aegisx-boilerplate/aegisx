"use strict";
/**
 * User Database Model
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = exports.USER_TABLE = void 0;
const connection_1 = require("../connection");
exports.USER_TABLE = 'users';
/**
 * User Model for database operations
 */
class UserModel {
    /**
     * Find user by ID
     */
    static async findById(id) {
        const db = (0, connection_1.getDatabase)();
        const user = await db(exports.USER_TABLE).where({ id }).first();
        return user || null;
    }
    /**
     * Find user by email
     */
    static async findByEmail(email) {
        const db = (0, connection_1.getDatabase)();
        const user = await db(exports.USER_TABLE).where({ email }).first();
        return user || null;
    }
    /**
     * Create new user
     */
    static async create(userData) {
        const db = (0, connection_1.getDatabase)();
        const [user] = await db(exports.USER_TABLE)
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
    static async update(id, userData) {
        const db = (0, connection_1.getDatabase)();
        const [user] = await db(exports.USER_TABLE)
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
    static async delete(id) {
        const db = (0, connection_1.getDatabase)();
        const deleted = await db(exports.USER_TABLE).where({ id }).del();
        return deleted > 0;
    }
    /**
     * List users with pagination
     */
    static async list(offset = 0, limit = 10) {
        const db = (0, connection_1.getDatabase)();
        return await db(exports.USER_TABLE)
            .offset(offset)
            .limit(limit)
            .orderBy('createdAt', 'desc');
    }
    /**
     * Count total users
     */
    static async count() {
        const db = (0, connection_1.getDatabase)();
        const [{ count }] = await db(exports.USER_TABLE).count('* as count');
        return parseInt(count);
    }
}
exports.UserModel = UserModel;
//# sourceMappingURL=UserModel.js.map