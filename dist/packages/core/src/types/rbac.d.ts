/**
 * RBAC Types
 */
import type { BaseEntity } from './core';
export interface Role extends BaseEntity {
    name: string;
    description?: string;
    permissions: Permission[];
}
export interface Permission extends BaseEntity {
    name: string;
    resource: string;
    action: string;
    scope?: 'own' | 'dept' | 'all';
}
