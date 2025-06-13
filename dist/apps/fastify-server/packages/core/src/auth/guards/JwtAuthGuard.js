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
var JwtAuthGuard_exports = {};
__export(JwtAuthGuard_exports, {
  JwtAuthGuard: () => JwtAuthGuard
});
module.exports = __toCommonJS(JwtAuthGuard_exports);
var import_JwtService = require("../JwtService");
async function JwtAuthGuard(request, reply) {
  try {
    const token = request.headers.authorization?.split(" ")[1];
    if (!token) {
      throw new Error("No token provided");
    }
    const jwtService = new import_JwtService.JwtService(request.server, { secret: "temp-secret" });
    const payload = await jwtService.verifyToken(token);
  } catch (error) {
    await reply.code(401).send({ message: "Invalid token" });
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  JwtAuthGuard
});
//# sourceMappingURL=JwtAuthGuard.js.map
