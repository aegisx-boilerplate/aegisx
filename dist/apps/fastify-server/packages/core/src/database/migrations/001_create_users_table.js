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
var create_users_table_exports = {};
__export(create_users_table_exports, {
  down: () => down,
  up: () => up
});
module.exports = __toCommonJS(create_users_table_exports);
async function up(knex) {
  return knex.schema.createTable("users", (table) => {
    table.uuid("id").primary().defaultTo(knex.raw("gen_random_uuid()"));
    table.string("email").unique().notNullable();
    table.string("firstName").notNullable();
    table.string("lastName").notNullable();
    table.string("passwordHash").notNullable();
    table.boolean("isActive").defaultTo(true);
    table.timestamp("lastLoginAt").nullable();
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.index(["email"]);
    table.index(["isActive"]);
    table.index(["createdAt"]);
  });
}
async function down(knex) {
  return knex.schema.dropTable("users");
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  down,
  up
});
//# sourceMappingURL=001_create_users_table.js.map
