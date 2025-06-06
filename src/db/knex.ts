import Knex from 'knex';
import { config } from '../config/config';

const knex = Knex({
  client: 'pg',
  connection: config.database.url,
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
