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
var test_core_exports = {};
__export(test_core_exports, {
  default: () => test_core_default
});
module.exports = __toCommonJS(test_core_exports);
async function test_core_default(fastify) {
  fastify.get("/test-core", async function() {
    try {
      const coreModule = require("@aegisx/core");
      return {
        success: true,
        message: "Successfully imported @aegisx/core!",
        availableExports: Object.keys(coreModule),
        exportTypes: Object.keys(coreModule).reduce((acc, key) => {
          acc[key] = typeof coreModule[key];
          return acc;
        }, {})
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to import @aegisx/core",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  });
  fastify.get("/test-core/simple", async function() {
    try {
      const {
        getVersion,
        getPackageName,
        isAegisXAvailable,
        getFeatures
      } = require("@aegisx/core");
      return {
        success: true,
        message: "Successfully called simple functions!",
        data: {
          version: getVersion(),
          packageName: getPackageName(),
          isAvailable: isAegisXAvailable(),
          features: getFeatures()
        }
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to call simple functions",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  });
  fastify.get("/test-core/init", async function() {
    try {
      const { createAegisXSimple } = require("@aegisx/core");
      const config = {
        database: {
          host: "localhost",
          port: 5432,
          database: "test_db"
        },
        jwt: {
          secret: "test-secret-key",
          expiresIn: "15m"
        }
      };
      await createAegisXSimple(config);
      return {
        success: true,
        message: "AegisX Simple initialization completed successfully!",
        config: "provided"
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to initialize AegisX Simple",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  });
}
//# sourceMappingURL=test-core.js.map
