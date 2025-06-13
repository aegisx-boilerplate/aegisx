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
var UserModel_exports = {};
__export(UserModel_exports, {
  USER_TABLE: () => USER_TABLE,
  UserModel: () => UserModel
});
module.exports = __toCommonJS(UserModel_exports);
var import_connection = require("../connection");
const USER_TABLE = "users";
class UserModel {
  /**
   * Find user by ID
   */
  static async findById(id) {
    const db = (0, import_connection.getDatabase)();
    const user = await db(USER_TABLE).where({ id }).first();
    return user || null;
  }
  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const db = (0, import_connection.getDatabase)();
    const user = await db(USER_TABLE).where({ email }).first();
    return user || null;
  }
  /**
   * Create new user
   */
  static async create(userData) {
    const db = (0, import_connection.getDatabase)();
    const [user] = await db(USER_TABLE).insert({
      ...userData,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).returning("*");
    return user;
  }
  /**
   * Update user
   */
  static async update(id, userData) {
    const db = (0, import_connection.getDatabase)();
    const [user] = await db(USER_TABLE).where({ id }).update({
      ...userData,
      updatedAt: /* @__PURE__ */ new Date()
    }).returning("*");
    return user || null;
  }
  /**
   * Delete user
   */
  static async delete(id) {
    const db = (0, import_connection.getDatabase)();
    const deleted = await db(USER_TABLE).where({ id }).del();
    return deleted > 0;
  }
  /**
   * List users with pagination
   */
  static async list(offset = 0, limit = 10) {
    const db = (0, import_connection.getDatabase)();
    return await db(USER_TABLE).offset(offset).limit(limit).orderBy("createdAt", "desc");
  }
  /**
   * Count total users
   */
  static async count() {
    const db = (0, import_connection.getDatabase)();
    const [{ count }] = await db(USER_TABLE).count("* as count");
    return parseInt(count);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  USER_TABLE,
  UserModel
});
//# sourceMappingURL=UserModel.js.map
