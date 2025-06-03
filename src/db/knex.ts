import Knex from 'knex';
import { env } from '../config/env';

const knex = Knex({
  client: 'pg',
  connection: env.DATABASE_URL,
  pool: { min: 2, max: 10 },
  migrations: {
    directory: __dirname + '/migrations',
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: __dirname + '/seeds',
  },
});

export { knex };
