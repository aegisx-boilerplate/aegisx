"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var config_exports = {};
__export(config_exports, {
  createKnexConfig: () => createKnexConfig,
  defaultDatabaseConfig: () => defaultDatabaseConfig,
  testDatabaseConfig: () => testDatabaseConfig
});
module.exports = __toCommonJS(config_exports);
function createKnexConfig(dbConfig) {
  return {
    client: "postgresql",
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
      directory: "./migrations",
      tableName: "aegisx_migrations"
    },
    seeds: {
      directory: "./seeds"
    }
  };
}
const defaultDatabaseConfig = {
  host: process.env["DB_HOST"] || "localhost",
  port: parseInt(process.env["DB_PORT"] || "5432"),
  database: process.env["DB_NAME"] || "aegisx_dev",
  user: process.env["DB_USER"] || "postgres",
  password: process.env["DB_PASSWORD"] || "password",
  ssl: process.env["DB_SSL"] === "true",
  pool: {
    min: 2,
    max: 10
  }
};
const testDatabaseConfig = {
  host: process.env["DB_TEST_HOST"] || "localhost",
  port: parseInt(process.env["DB_TEST_PORT"] || "5432"),
  database: process.env["DB_TEST_NAME"] || "aegisx_test",
  user: process.env["DB_TEST_USER"] || "postgres",
  password: process.env["DB_TEST_PASSWORD"] || "password",
  ssl: false,
  pool: {
    min: 1,
    max: 5
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createKnexConfig,
  defaultDatabaseConfig,
  testDatabaseConfig
});
//# sourceMappingURL=config.js.map
