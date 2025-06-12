/**
 * AegisX Core Configuration
 * 
 * Main initialization function for the AegisX authentication
 * and authorization system.
 */

import type { AegisXConfig } from './types/config';

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
export async function createAegisX(config: AegisXConfig): Promise<void> {
    console.log('🔧 Initializing AegisX...');

    // Phase 2.2 - Initialize database connection
    console.log('🗄️ Connecting to database...');
    const { initializeDatabase } = await import('./database');
    await initializeDatabase(config.database);

    // TODO: Phase 2.3 - Setup JWT service
    console.log('🔑 Setting up authentication...');

    // TODO: Phase 2.4 - Initialize RBAC system
    console.log('🛡️  Setting up authorization...');

    // TODO: Phase 2.5 - Initialize user management
    console.log('👥 Setting up user management...');

    console.log('✅ AegisX initialized successfully!');
}

/**
 * Get the current AegisX version
 */
export function getVersion(): string {
    return '0.0.1';
}

/**
 * Check if AegisX is properly initialized
 */
export function isInitialized(): boolean {
    // TODO: Implement initialization check
    return false;
} 