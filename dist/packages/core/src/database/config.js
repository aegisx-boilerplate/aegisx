"use strict";
/**
 * Database Configuration
 *
 * Knex.js configuration for PostgreSQL database connection
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.testDatabaseConfig = exports.defaultDatabaseConfig = void 0;
exports.createKnexConfig = createKnexConfig;
/**
 * Create Knex configuration from AegisX database config
 */
function createKnexConfig(dbConfig) {
    return {
        client: 'postgresql',
        connection: {
            host: dbConfig.host,
            port: dbConfig.port,
            database: dbConfig.database,
            user: dbConfig.user,
            password: dbConfig.password,
            ssl: dbConfig.ssl
        },
        pool: {
            min: dbConfig.pool?.min || 2,
            max: dbConfig.pool?.max || 10
        },
        migrations: {
            directory: './migrations',
            tableName: 'aegisx_migrations'
        },
        seeds: {
            directory: './seeds'
        }
    };
}
/**
 * Default database configuration for development
 */
exports.defaultDatabaseConfig = {
    host: process.env['DB_HOST'] || 'localhost',
    port: parseInt(process.env['DB_PORT'] || '5432'),
    database: process.env['DB_NAME'] || 'aegisx_dev',
    user: process.env['DB_USER'] || 'postgres',
    password: process.env['DB_PASSWORD'] || 'password',
    ssl: process.env['DB_SSL'] === 'true',
    pool: {
        min: 2,
        max: 10
    }
};
/**
 * Test database configuration
 */
exports.testDatabaseConfig = {
    host: process.env['DB_TEST_HOST'] || 'localhost',
    port: parseInt(process.env['DB_TEST_PORT'] || '5432'),
    database: process.env['DB_TEST_NAME'] || 'aegisx_test',
    user: process.env['DB_TEST_USER'] || 'postgres',
    password: process.env['DB_TEST_PASSWORD'] || 'password',
    ssl: false,
    pool: {
        min: 1,
        max: 5
    }
};
//# sourceMappingURL=config.js.map