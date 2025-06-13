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
var SessionModel_exports = {};
__export(SessionModel_exports, {
  SESSION_TABLE: () => SESSION_TABLE,
  SessionModel: () => SessionModel
});
module.exports = __toCommonJS(SessionModel_exports);
var import_connection = require("../connection");
const SESSION_TABLE = "sessions";
class SessionModel {
  /**
   * Find session by token
   */
  static async findByToken(token) {
    const db = (0, import_connection.getDatabase)();
    const session = await db(SESSION_TABLE).where({ token }).first();
    return session || null;
  }
  /**
  * Create new session
  */
  static async create(sessionData) {
    const db = (0, import_connection.getDatabase)();
    const [session] = await db(SESSION_TABLE).insert({
      ...sessionData,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).returning("*");
    return session;
  }
  /**
   * Update session
   */
  static async update(id, sessionData) {
    const db = (0, import_connection.getDatabase)();
    const [session] = await db(SESSION_TABLE).where({ id }).update({
      ...sessionData,
      updatedAt: /* @__PURE__ */ new Date()
    }).returning("*");
    return session || null;
  }
  /**
   * Delete session
   */
  static async delete(id) {
    const db = (0, import_connection.getDatabase)();
    const deleted = await db(SESSION_TABLE).where({ id }).del();
    return deleted > 0;
  }
  /**
   * Find session by ID
   */
  static async findById(id) {
    const db = (0, import_connection.getDatabase)();
    const session = await db(SESSION_TABLE).where({ id }).first();
    return session || null;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SESSION_TABLE,
  SessionModel
});
//# sourceMappingURL=SessionModel.js.map
