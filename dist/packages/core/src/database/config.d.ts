/**
 * Database Configuration
 *
 * Knex.js configuration for PostgreSQL database connection
 */
import type { Knex } from 'knex';
import type { DatabaseConfig } from '../types/config';
/**
 * Create Knex configuration from AegisX database config
 */
export declare function createKnexConfig(dbConfig: DatabaseConfig): Knex.Config;
/**
 * Default database configuration for development
 */
export declare const defaultDatabaseConfig: DatabaseConfig;
/**
 * Test database configuration
 */
export declare const testDatabaseConfig: DatabaseConfig;
