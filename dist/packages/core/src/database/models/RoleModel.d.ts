/**
 * Role Database Model
 */
import type { Role } from '../../types/rbac';
import type { ID } from '../../types/core';
export declare const ROLE_TABLE = "roles";
/**
 * Role Model for database operations
 */
export declare class RoleModel {
    /**
     * Find role by ID
     */
    static findById(id: ID): Promise<Role | null>;
    /**
     * Find role by name
     */
    static findByName(name: string): Promise<Role | null>;
}
//# sourceMappingURL=RoleModel.d.ts.map