/**
 * User Types
 */

import type { ID, BaseEntity } from './core';
import type { Role } from './rbac';

export interface User extends BaseEntity {
    email: string;
    firstName: string;
    lastName: string;
    passwordHash: string;
    roles?: Role[];
    isActive: boolean;
    lastLoginAt?: Date;
}

// TODO: Add more user types 