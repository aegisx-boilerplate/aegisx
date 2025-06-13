"use strict";
/**
 * Database Module
 *
 * Provides database connection, models, migrations,
 * and query utilities using Knex.js.
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
// Connection & Configuration
__exportStar(require("./connection"), exports);
__exportStar(require("./config"), exports);
// Models
__exportStar(require("./models"), exports);
// Migration utilities
__exportStar(require("./migrations"), exports);
// Seed utilities  
__exportStar(require("./seeds"), exports);
// Database utilities
__exportStar(require("./utils"), exports);
//# sourceMappingURL=index.js.map