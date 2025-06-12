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
exports.createAegisX = void 0;
// === Authentication System ===
__exportStar(require("./auth"), exports);
// === Authorization System (RBAC) ===
__exportStar(require("./rbac"), exports);
// === User Management ===
__exportStar(require("./user"), exports);
// === Database Layer ===
__exportStar(require("./database"), exports);
// === Utilities ===
__exportStar(require("./utils"), exports);
// === TypeScript Types ===
__exportStar(require("./types"), exports);
// === Core Configuration ===
var core_1 = require("./core");
Object.defineProperty(exports, "createAegisX", { enumerable: true, get: function () { return core_1.createAegisX; } });
