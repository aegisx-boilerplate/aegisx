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
var AuthController_exports = {};
__export(AuthController_exports, {
  authSchemas: () => authSchemas,
  default: () => AuthController
});
module.exports = __toCommonJS(AuthController_exports);
var import_type_provider_typebox = require("@fastify/type-provider-typebox");
var import_auth2 = require("../schemas/auth.schema");
class AuthController {
  constructor(authService) {
    this.authService = authService;
  }
  async register(request, reply) {
    try {
      const result = await this.authService.register(request.body);
      await reply.code(201).send(result);
    } catch (error) {
      const statusCode = error?.statusCode || 400;
      const message = error?.message || "Registration failed";
      await reply.code(statusCode).send({ message });
    }
  }
  async login(request, reply) {
    try {
      const result = await this.authService.login(request.body);
      await reply.code(200).send(result);
    } catch (error) {
      const statusCode = error?.statusCode || 401;
      const message = error?.message || "Invalid credentials";
      await reply.code(statusCode).send({ message });
    }
  }
  async refreshToken(request, reply) {
    try {
      const result = await this.authService.refreshToken(request.body.refreshToken);
      await reply.code(200).send(result);
    } catch (error) {
      const statusCode = error?.statusCode || 401;
      const message = error?.message || "Invalid refresh token";
      await reply.code(statusCode).send({ message });
    }
  }
  async logout(request, reply) {
    try {
      const token = request.headers.authorization?.split(" ")[1];
      if (!token) {
        throw new Error("No token provided");
      }
      await this.authService.logout(token);
      await reply.code(200).send({ message: "Logged out successfully" });
    } catch (error) {
      const statusCode = error?.statusCode || 400;
      const message = error?.message || "Logout failed";
      await reply.code(statusCode).send({ message });
    }
  }
  async getProfile(request, reply) {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader) {
        throw new Error("User not authenticated");
      }
      const userId = "temp-user-id";
      const profile = await this.authService.getProfile(userId);
      if (!profile) {
        throw new Error("User not found");
      }
      await reply.code(200).send(profile);
    } catch (error) {
      const statusCode = error?.message === "User not found" ? 404 : 401;
      const message = error?.message || "Failed to get user profile";
      await reply.code(statusCode).send({ message });
    }
  }
}
const authSchemas = {
  register: {
    schema: {
      body: import_auth2.RegisterSchema,
      response: {
        201: import_auth2.RegisterResponseSchema,
        400: import_auth2.ErrorResponseSchema
      }
    }
  },
  login: {
    schema: {
      body: import_auth2.LoginSchema,
      response: {
        200: import_auth2.LoginResponseSchema,
        401: import_auth2.ErrorResponseSchema
      }
    }
  },
  refreshToken: {
    schema: {
      body: import_auth2.RefreshTokenSchema,
      response: {
        200: import_auth2.RefreshTokenResponseSchema,
        401: import_auth2.ErrorResponseSchema
      }
    }
  },
  logout: {
    schema: {
      response: {
        200: import_type_provider_typebox.Type.Object({ message: import_type_provider_typebox.Type.String() }),
        400: import_auth2.ErrorResponseSchema
      }
    }
  },
  getProfile: {
    schema: {
      response: {
        200: import_auth2.ProfileResponseSchema,
        401: import_auth2.ErrorResponseSchema,
        404: import_auth2.ErrorResponseSchema
      }
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  authSchemas
});
//# sourceMappingURL=AuthController.js.map
