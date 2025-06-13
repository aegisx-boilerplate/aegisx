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
var auth_routes_exports = {};
__export(auth_routes_exports, {
  default: () => authRoutes
});
module.exports = __toCommonJS(auth_routes_exports);
var import_AuthController = __toESM(require("../controllers/AuthController"));
async function authRoutes(fastify, authService) {
  const controller = new import_AuthController.default(authService);
  fastify.post("/auth/register", {
    ...import_AuthController.authSchemas.register,
    handler: controller.register.bind(controller)
  });
  fastify.post("/auth/login", {
    ...import_AuthController.authSchemas.login,
    handler: controller.login.bind(controller)
  });
  fastify.post("/auth/refresh-token", {
    ...import_AuthController.authSchemas.refreshToken,
    handler: controller.refreshToken.bind(controller)
  });
  fastify.post("/auth/logout", {
    ...import_AuthController.authSchemas.logout,
    handler: controller.logout.bind(controller)
  });
  fastify.get("/auth/profile", {
    ...import_AuthController.authSchemas.getProfile,
    handler: controller.getProfile.bind(controller)
  });
}
//# sourceMappingURL=auth.routes.js.map
