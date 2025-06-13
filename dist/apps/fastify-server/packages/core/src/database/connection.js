"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var connection_exports = {};
__export(connection_exports, {
  closeDatabase: () => closeDatabase,
  getDatabase: () => getDatabase,
  initializeDatabase: () => initializeDatabase,
  isDatabaseConnected: () => isDatabaseConnected,
  rollbackMigration: () => rollbackMigration,
  runMigrations: () => runMigrations,
  runSeeds: () => runSeeds
});
module.exports = __toCommonJS(connection_exports);
var import_knex = __toESM(require("knex"));
var import_config = require("./config");
let database = null;
async function initializeDatabase(config) {
  if (database) {
    console.warn("Database connection already initialized");
    return database;
  }
  try {
    const knexConfig = (0, import_config.createKnexConfig)(config);
    database = (0, import_knex.default)(knexConfig);
    await database.raw("SELECT 1");
    console.log("\u2705 Database connection established successfully");
    return database;
  } catch (error) {
    console.error("\u274C Failed to connect to database:", error);
    throw new Error(`Database connection failed: ${error}`);
  }
}
function getDatabase() {
  if (!database) {
    throw new Error("Database not initialized. Call initializeDatabase() first.");
  }
  return database;
}
async function closeDatabase() {
  if (database) {
    await database.destroy();
    database = null;
    console.log("\u{1F4E1} Database connection closed");
  }
}
function isDatabaseConnected() {
  return database !== null;
}
async function runMigrations() {
  const db = getDatabase();
  await db.migrate.latest();
  console.log("\u{1F504} Database migrations completed");
}
async function rollbackMigration() {
  const db = getDatabase();
  await db.migrate.rollback();
  console.log("\u23EA Database migration rolled back");
}
async function runSeeds() {
  const db = getDatabase();
  await db.seed.run();
  console.log("\u{1F331} Database seeds completed");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  closeDatabase,
  getDatabase,
  initializeDatabase,
  isDatabaseConnected,
  rollbackMigration,
  runMigrations,
  runSeeds
});
//# sourceMappingURL=connection.js.map
