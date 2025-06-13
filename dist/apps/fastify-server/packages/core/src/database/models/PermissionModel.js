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
var PermissionModel_exports = {};
__export(PermissionModel_exports, {
  PERMISSION_TABLE: () => PERMISSION_TABLE,
  PermissionModel: () => PermissionModel
});
module.exports = __toCommonJS(PermissionModel_exports);
var import_connection = require("../connection");
const PERMISSION_TABLE = "permissions";
class PermissionModel {
  /**
   * Find permission by ID
   */
  static async findById(id) {
    const db = (0, import_connection.getDatabase)();
    const permission = await db(PERMISSION_TABLE).where({ id }).first();
    return permission || null;
  }
  /**
   * Find permission by name
   */
  static async findByName(name) {
    const db = (0, import_connection.getDatabase)();
    const permission = await db(PERMISSION_TABLE).where({ name }).first();
    return permission || null;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PERMISSION_TABLE,
  PermissionModel
});
//# sourceMappingURL=PermissionModel.js.map
