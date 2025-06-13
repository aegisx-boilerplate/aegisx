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
var core_exports = {};
__export(core_exports, {
  createAegisX: () => createAegisX,
  getVersion: () => getVersion,
  isInitialized: () => isInitialized
});
module.exports = __toCommonJS(core_exports);
async function createAegisX(config) {
  console.log("\u{1F527} Initializing AegisX...");
  console.log("\u{1F5C4}\uFE0F Connecting to database...");
  const { initializeDatabase } = await import("./database");
  await initializeDatabase(config.database);
  console.log("\u{1F511} Setting up authentication...");
  const jwtConfig = config.jwt || {
    secret: process.env["JWT_SECRET"] || "aegisx-default-secret-change-in-production",
    expiresIn: "15m",
    refreshSecret: process.env["JWT_REFRESH_SECRET"],
    refreshExpiresIn: "7d"
  };
  const { AuthService } = await import("./auth");
  const authService = new AuthService(jwtConfig, void 0, void 0);
  console.log("\u2713 Authentication system initialized");
  console.log("\u{1F6E1}\uFE0F  Setting up authorization...");
  console.log("\u{1F465} Setting up user management...");
  console.log("\u2705 AegisX initialized successfully!");
}
function getVersion() {
  return "0.0.1";
}
function isInitialized() {
  return false;
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createAegisX,
  getVersion,
  isInitialized
});
//# sourceMappingURL=core.js.map
