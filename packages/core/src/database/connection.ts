/**
 * Database Connection
 * 
 * Manages database connections using Knex.js
 */

import knex, { type Knex } from 'knex';
import type { DatabaseConfig } from '../types/config';
import { createKnexConfig } from './config';

let database: Knex | null = null;

/**
 * Initialize database connection
 */
export async function initializeDatabase(config: DatabaseConfig): Promise<Knex> {
    if (database) {
        console.warn('Database connection already initialized');
        return database;
    }

    try {
        const knexConfig = createKnexConfig(config);
        database = knex(knexConfig);

        // Test the connection
        await database.raw('SELECT 1');

        console.log('✅ Database connection established successfully');
        return database;
    } catch (error) {
        console.error('❌ Failed to connect to database:', error);
        throw new Error(`Database connection failed: ${error}`);
    }
}

/**
 * Get the current database instance
 */
export function getDatabase(): Knex {
    if (!database) {
        throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return database;
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
    if (database) {
        await database.destroy();
        database = null;
        console.log('📡 Database connection closed');
    }
}

/**
 * Check if database is connected
 */
export function isDatabaseConnected(): boolean {
    return database !== null;
}

/**
 * Run database migrations
 */
export async function runMigrations(): Promise<void> {
    const db = getDatabase();
    await db.migrate.latest();
    console.log('🔄 Database migrations completed');
}

/**
 * Rollback last migration
 */
export async function rollbackMigration(): Promise<void> {
    const db = getDatabase();
    await db.migrate.rollback();
    console.log('⏪ Database migration rolled back');
}

/**
 * Run database seeds
 */
export async function runSeeds(): Promise<void> {
    const db = getDatabase();
    await db.seed.run();
    console.log('🌱 Database seeds completed');
} 