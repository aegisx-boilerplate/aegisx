"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var models_exports = {};
module.exports = __toCommonJS(models_exports);
__reExport(models_exports, require("./UserModel"), module.exports);
__reExport(models_exports, require("./RoleModel"), module.exports);
__reExport(models_exports, require("./PermissionModel"), module.exports);
__reExport(models_exports, require("./SessionModel"), module.exports);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ...require("./UserModel"),
  ...require("./RoleModel"),
  ...require("./PermissionModel"),
  ...require("./SessionModel")
});
//# sourceMappingURL=index.js.map
