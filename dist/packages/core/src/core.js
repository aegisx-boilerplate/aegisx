"use strict";
/**
 * AegisX Core Configuration
 *
 * Main initialization function for the AegisX authentication
 * and authorization system.
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAegisX = createAegisX;
exports.getVersion = getVersion;
exports.isInitialized = isInitialized;
/**
 * Initialize AegisX with the provided configuration
 *
 * @param config - AegisX configuration object
 * @returns Promise that resolves when initialization is complete
 *
 * @example
 * ```typescript
 * await createAegisX({
 *   database: {
 *     host: 'localhost',
 *     port: 5432,
 *     database: 'myapp',
 *     user: 'postgres',
 *     password: 'password'
 *   },
 *   jwt: {
 *     secret: 'your-secret-key',
 *     expiresIn: '15m'
 *   }
 * });
 * ```
 */
async function createAegisX(config) {
    console.log('🔧 Initializing AegisX...');
    // Phase 2.2 - Initialize database connection
    console.log('🗄️ Connecting to database...');
    const { initializeDatabase } = await Promise.resolve().then(() => __importStar(require('./database')));
    await initializeDatabase(config.database);
    // Phase 2.3 - Setup JWT service
    console.log('🔑 Setting up authentication...');
    // Initialize default JWT config if not provided
    const jwtConfig = config.jwt || {
        secret: process.env['JWT_SECRET'] || 'aegisx-default-secret-change-in-production',
        expiresIn: '15m',
        refreshSecret: process.env['JWT_REFRESH_SECRET'],
        refreshExpiresIn: '7d'
    };
    // Create authentication service instance for initialization
    const { AuthService } = await Promise.resolve().then(() => __importStar(require('./auth')));
    const authService = new AuthService(jwtConfig, undefined, undefined);
    console.log('✓ Authentication system initialized');
    // TODO: Phase 2.4 - Initialize RBAC system
    console.log('🛡️  Setting up authorization...');
    // TODO: Phase 2.5 - Initialize user management
    console.log('👥 Setting up user management...');
    console.log('✅ AegisX initialized successfully!');
}
/**
 * Get the current AegisX version
 */
function getVersion() {
    return '0.0.1';
}
/**
 * Check if AegisX is properly initialized
 */
function isInitialized() {
    // TODO: Implement initialization check
    return false;
}
//# sourceMappingURL=core.js.map