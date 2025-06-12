/**
 * Permission Database Model
 */

import { getDatabase } from '../connection';
import type { Permission } from '../../types/rbac';
import type { ID } from '../../types/core';

export const PERMISSION_TABLE = 'permissions';

/**
 * Permission Model for database operations
 */
export class PermissionModel {
    /**
     * Find permission by ID
     */
    static async findById(id: ID): Promise<Permission | null> {
        const db = getDatabase();
        const permission = await db(PERMISSION_TABLE).where({ id }).first();
        return permission || null;
    }

    /**
     * Find permission by name
     */
    static async findByName(name: string): Promise<Permission | null> {
        const db = getDatabase();
        const permission = await db(PERMISSION_TABLE).where({ name }).first();
        return permission || null;
    }
} 