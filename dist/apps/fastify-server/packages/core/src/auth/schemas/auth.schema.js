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
var auth_schema_exports = {};
__export(auth_schema_exports, {
  ErrorResponseSchema: () => ErrorResponseSchema,
  LoginResponseSchema: () => LoginResponseSchema,
  LoginSchema: () => LoginSchema,
  ProfileResponseSchema: () => ProfileResponseSchema,
  RefreshTokenResponseSchema: () => RefreshTokenResponseSchema,
  RefreshTokenSchema: () => RefreshTokenSchema,
  RegisterResponseSchema: () => RegisterResponseSchema,
  RegisterSchema: () => RegisterSchema
});
module.exports = __toCommonJS(auth_schema_exports);
var import_type_provider_typebox = require("@fastify/type-provider-typebox");
const RegisterSchema = import_type_provider_typebox.Type.Object({
  email: import_type_provider_typebox.Type.String({ format: "email" }),
  password: import_type_provider_typebox.Type.String({ minLength: 8 }),
  firstName: import_type_provider_typebox.Type.String({ minLength: 1 }),
  lastName: import_type_provider_typebox.Type.String({ minLength: 1 }),
  phoneNumber: import_type_provider_typebox.Type.Optional(import_type_provider_typebox.Type.String())
});
const LoginSchema = import_type_provider_typebox.Type.Object({
  email: import_type_provider_typebox.Type.String({ format: "email" }),
  password: import_type_provider_typebox.Type.String()
});
const RefreshTokenSchema = import_type_provider_typebox.Type.Object({
  refreshToken: import_type_provider_typebox.Type.String()
});
const RegisterResponseSchema = import_type_provider_typebox.Type.Object({
  user: import_type_provider_typebox.Type.Object({
    id: import_type_provider_typebox.Type.String(),
    email: import_type_provider_typebox.Type.String(),
    firstName: import_type_provider_typebox.Type.String(),
    lastName: import_type_provider_typebox.Type.String(),
    phoneNumber: import_type_provider_typebox.Type.Optional(import_type_provider_typebox.Type.String()),
    isActive: import_type_provider_typebox.Type.Boolean(),
    createdAt: import_type_provider_typebox.Type.String(),
    updatedAt: import_type_provider_typebox.Type.String()
  }),
  message: import_type_provider_typebox.Type.String()
});
const LoginResponseSchema = import_type_provider_typebox.Type.Object({
  user: import_type_provider_typebox.Type.Object({
    id: import_type_provider_typebox.Type.String(),
    email: import_type_provider_typebox.Type.String(),
    firstName: import_type_provider_typebox.Type.String(),
    lastName: import_type_provider_typebox.Type.String(),
    roles: import_type_provider_typebox.Type.Array(import_type_provider_typebox.Type.String())
  }),
  accessToken: import_type_provider_typebox.Type.String(),
  refreshToken: import_type_provider_typebox.Type.String()
});
const RefreshTokenResponseSchema = import_type_provider_typebox.Type.Object({
  accessToken: import_type_provider_typebox.Type.String(),
  refreshToken: import_type_provider_typebox.Type.String()
});
const ProfileResponseSchema = import_type_provider_typebox.Type.Object({
  id: import_type_provider_typebox.Type.String(),
  email: import_type_provider_typebox.Type.String(),
  firstName: import_type_provider_typebox.Type.String(),
  lastName: import_type_provider_typebox.Type.String(),
  phoneNumber: import_type_provider_typebox.Type.Optional(import_type_provider_typebox.Type.String()),
  roles: import_type_provider_typebox.Type.Array(import_type_provider_typebox.Type.String()),
  isActive: import_type_provider_typebox.Type.Boolean(),
  lastLoginAt: import_type_provider_typebox.Type.Optional(import_type_provider_typebox.Type.String()),
  createdAt: import_type_provider_typebox.Type.String(),
  updatedAt: import_type_provider_typebox.Type.String()
});
const ErrorResponseSchema = import_type_provider_typebox.Type.Object({
  message: import_type_provider_typebox.Type.String()
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ErrorResponseSchema,
  LoginResponseSchema,
  LoginSchema,
  ProfileResponseSchema,
  RefreshTokenResponseSchema,
  RefreshTokenSchema,
  RegisterResponseSchema,
  RegisterSchema
});
//# sourceMappingURL=auth.schema.js.map
