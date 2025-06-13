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
var simple_exports = {};
__export(simple_exports, {
  createAegisXSimple: () => createAegisXSimple,
  getFeatures: () => getFeatures,
  getPackageName: () => getPackageName,
  getVersion: () => getVersion,
  isAegisXAvailable: () => isAegisXAvailable
});
module.exports = __toCommonJS(simple_exports);
function getVersion() {
  return "0.0.1";
}
function getPackageName() {
  return "@aegisx/core";
}
async function createAegisXSimple(config) {
  console.log("\u{1F527} Initializing AegisX (Simple)...");
  console.log("\u{1F4CB} Config received:", config ? "Yes" : "No");
  await new Promise((resolve) => setTimeout(resolve, 100));
  console.log("\u2705 AegisX (Simple) initialized successfully!");
}
function isAegisXAvailable() {
  return true;
}
function getFeatures() {
  return [
    "Simple Authentication",
    "Basic JWT Support",
    "Core Configuration",
    "Module Loading"
  ];
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createAegisXSimple,
  getFeatures,
  getPackageName,
  getVersion,
  isAegisXAvailable
});
//# sourceMappingURL=simple.js.map
