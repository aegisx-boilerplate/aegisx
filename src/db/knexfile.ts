import type { Knex } from 'knex';
import { env } from '../config/env';

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: env.DATABASE_URL,
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
    connection: env.DATABASE_URL,
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
