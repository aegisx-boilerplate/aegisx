/**
 * Database Types
 */

export interface DatabaseConnectionOptions {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
}

// TODO: Add Knex types and database model types 