"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
// === Authentication System ===
// Temporarily disabled due to ES module issues
// export * from './auth';
// === Authorization System (RBAC) ===
// export * from './rbac';
// === User Management ===
// export * from './user';
// === Database Layer ===
// export * from './database';
// === Utilities ===
// export * from './utils';
// === TypeScript Types ===
// export { 
//   LoginRequest, 
//   LoginResponse, 
//   JwtPayload as JwtPayloadType 
// } from './types/auth';
// export * from './types/core';
// export * from './types/rbac';
// export * from './types/user';
// export * from './types/database';
// export * from './types/config';
// === Core Configuration ===
// Temporarily disabled
// export { createAegisX } from './core';
// === Simple Core (for testing) ===
__exportStar(require("./simple"), exports);
//# sourceMappingURL=index.js.map