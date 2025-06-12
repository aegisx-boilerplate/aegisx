"use strict";
/**
 * Role Database Model
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleModel = exports.ROLE_TABLE = void 0;
const connection_1 = require("../connection");
exports.ROLE_TABLE = 'roles';
/**
 * Role Model for database operations
 */
class RoleModel {
    /**
     * Find role by ID
     */
    static async findById(id) {
        const db = (0, connection_1.getDatabase)();
        const role = await db(exports.ROLE_TABLE).where({ id }).first();
        return role || null;
    }
    /**
     * Find role by name
     */
    static async findByName(name) {
        const db = (0, connection_1.getDatabase)();
        const role = await db(exports.ROLE_TABLE).where({ name }).first();
        return role || null;
    }
}
exports.RoleModel = RoleModel;
