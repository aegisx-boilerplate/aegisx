"use strict";
/**
 * Permission Database Model
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionModel = exports.PERMISSION_TABLE = void 0;
const connection_1 = require("../connection");
exports.PERMISSION_TABLE = 'permissions';
/**
 * Permission Model for database operations
 */
class PermissionModel {
    /**
     * Find permission by ID
     */
    static async findById(id) {
        const db = (0, connection_1.getDatabase)();
        const permission = await db(exports.PERMISSION_TABLE).where({ id }).first();
        return permission || null;
    }
    /**
     * Find permission by name
     */
    static async findByName(name) {
        const db = (0, connection_1.getDatabase)();
        const permission = await db(exports.PERMISSION_TABLE).where({ name }).first();
        return permission || null;
    }
}
exports.PermissionModel = PermissionModel;
//# sourceMappingURL=PermissionModel.js.map