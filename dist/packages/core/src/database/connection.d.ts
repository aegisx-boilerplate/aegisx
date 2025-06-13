/**
 * Database Connection
 *
 * Manages database connections using Knex.js
 */
import { type Knex } from 'knex';
import type { DatabaseConfig } from '../types/config';
/**
 * Initialize database connection
 */
export declare function initializeDatabase(config: DatabaseConfig): Promise<Knex>;
/**
 * Get the current database instance
 */
export declare function getDatabase(): Knex;
/**
 * Close database connection
 */
export declare function closeDatabase(): Promise<void>;
/**
 * Check if database is connected
 */
export declare function isDatabaseConnected(): boolean;
/**
 * Run database migrations
 */
export declare function runMigrations(): Promise<void>;
/**
 * Rollback last migration
 */
export declare function rollbackMigration(): Promise<void>;
/**
 * Run database seeds
 */
export declare function runSeeds(): Promise<void>;
//# sourceMappingURL=connection.d.ts.map