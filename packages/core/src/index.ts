/**
 * @aegisx/core - Enterprise Authentication & Authorization Core Package
 * 
 * Main exports for the AegisX authentication and authorization system.
 * This package provides reusable authentication, RBAC, and user management
 * functionality that can be integrated into any Node.js application.
 * 
 * @author AegisX Team
 * @version 0.0.1
 */

// === Authentication System ===
export * from './auth';

// === Authorization System (RBAC) ===
export * from './rbac';

// === User Management ===
export * from './user';

// === Database Layer ===
export * from './database';

// === Utilities ===
export * from './utils';

// === TypeScript Types ===
export * from './types';

// === Core Configuration ===
export { createAegisX } from './core';
