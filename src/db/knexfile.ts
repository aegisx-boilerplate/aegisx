import type { Knex } from 'knex';
import { env } from '../config/env';

// Parse DATABASE_URL or use individual components
const parseDbConnection = (url: string) => {
  if (url) {
    try {
      const parsed = new URL(url);
      return {
        host: parsed.hostname,
        port: parseInt(parsed.port) || 5432,
        user: parsed.username,
        password: parsed.password,
        database: parsed.pathname.slice(1), // Remove leading slash
      };
    } catch (error) {
      console.warn('Could not parse DATABASE_URL, using connection string directly');
      return url;
    }
  }

  // Fallback to individual env vars
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'user',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'aegisx',
  };
};

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: parseDbConnection(env.DATABASE_URL),
    pool: { min: 2, max: 10 },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations',
      extension: 'js',
    },
    seeds: {
      directory: './seeds',
      extension: 'js',
    },
  },
  production: {
    client: 'pg',
    connection: parseDbConnection(env.DATABASE_URL),
    pool: { min: 2, max: 10 },
    migrations: {
      directory: './migrations',
      tableName: 'knex_migrations',
      extension: 'js',
    },
    seeds: {
      directory: './seeds',
      extension: 'js',
    },
  },
};

export default config;
