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
export declare function createAegisX(config: AegisXConfig): Promise<void>;
/**
 * Get the current AegisX version
 */
export declare function getVersion(): string;
/**
 * Check if AegisX is properly initialized
 */
export declare function isInitialized(): boolean;
//# sourceMappingURL=core.d.ts.map