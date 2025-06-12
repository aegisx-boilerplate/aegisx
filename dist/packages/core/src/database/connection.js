"use strict";
/**
 * Database Connection
 *
 * Manages database connections using Knex.js
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = initializeDatabase;
exports.getDatabase = getDatabase;
exports.closeDatabase = closeDatabase;
exports.isDatabaseConnected = isDatabaseConnected;
exports.runMigrations = runMigrations;
exports.rollbackMigration = rollbackMigration;
exports.runSeeds = runSeeds;
const knex_1 = __importDefault(require("knex"));
const config_1 = require("./config");
let database = null;
/**
 * Initialize database connection
 */
async function initializeDatabase(config) {
    if (database) {
        console.warn('Database connection already initialized');
        return database;
    }
    try {
        const knexConfig = (0, config_1.createKnexConfig)(config);
        database = (0, knex_1.default)(knexConfig);
        // Test the connection
        await database.raw('SELECT 1');
        console.log('✅ Database connection established successfully');
        return database;
    }
    catch (error) {
        console.error('❌ Failed to connect to database:', error);
        throw new Error(`Database connection failed: ${error}`);
    }
}
/**
 * Get the current database instance
 */
function getDatabase() {
    if (!database) {
        throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return database;
}
/**
 * Close database connection
 */
async function closeDatabase() {
    if (database) {
        await database.destroy();
        database = null;
        console.log('📡 Database connection closed');
    }
}
/**
 * Check if database is connected
 */
function isDatabaseConnected() {
    return database !== null;
}
/**
 * Run database migrations
 */
async function runMigrations() {
    const db = getDatabase();
    await db.migrate.latest();
    console.log('🔄 Database migrations completed');
}
/**
 * Rollback last migration
 */
async function rollbackMigration() {
    const db = getDatabase();
    await db.migrate.rollback();
    console.log('⏪ Database migration rolled back');
}
/**
 * Run database seeds
 */
async function runSeeds() {
    const db = getDatabase();
    await db.seed.run();
    console.log('🌱 Database seeds completed');
}
