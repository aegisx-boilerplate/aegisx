/**
 * Permission Database Model
 */
import type { Permission } from '../../types/rbac';
import type { ID } from '../../types/core';
export declare const PERMISSION_TABLE = "permissions";
/**
 * Permission Model for database operations
 */
export declare class PermissionModel {
    /**
     * Find permission by ID
     */
    static findById(id: ID): Promise<Permission | null>;
    /**
     * Find permission by name
     */
    static findByName(name: string): Promise<Permission | null>;
}
