/**
 * User Types
 */
import type { BaseEntity } from './core';
import type { Role } from './rbac';
export interface User extends BaseEntity {
    email: string;
    firstName: string;
    lastName: string;
    roles: Role[];
    isActive: boolean;
    lastLoginAt?: Date;
}
