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
var root_exports = {};
__export(root_exports, {
  default: () => root_default
});
module.exports = __toCommonJS(root_exports);
async function root_default(fastify) {
  fastify.get("/", async function() {
    return { message: "Hello Fastify Server!" };
  });
  fastify.get("/test", async function() {
    return {
      status: "ok",
      message: "Fastify server is working!",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  });
}
//# sourceMappingURL=root.js.map
