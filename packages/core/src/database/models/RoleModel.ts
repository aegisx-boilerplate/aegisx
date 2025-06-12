/**
 * Role Database Model
 */

import { getDatabase } from '../connection';
import type { Role } from '../../types/rbac';
import type { ID } from '../../types/core';

export const ROLE_TABLE = 'roles';

/**
 * Role Model for database operations
 */
export class RoleModel {
    /**
     * Find role by ID
     */
    static async findById(id: ID): Promise<Role | null> {
        const db = getDatabase();
        const role = await db(ROLE_TABLE).where({ id }).first();
        return role || null;
    }

    /**
     * Find role by name
     */
    static async findByName(name: string): Promise<Role | null> {
        const db = getDatabase();
        const role = await db(ROLE_TABLE).where({ name }).first();
        return role || null;
    }
} 