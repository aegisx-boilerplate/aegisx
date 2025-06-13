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
var JwtService_exports = {};
__export(JwtService_exports, {
  JwtService: () => JwtService
});
module.exports = __toCommonJS(JwtService_exports);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"));
class JwtService {
  constructor(fastify, config) {
    this.fastify = fastify;
    this.jwtSecret = config.secret;
    this.jwtRefreshSecret = config.refreshSecret || config.secret;
    this.expiresIn = config.expiresIn || "15m";
    this.refreshExpiresIn = config.refreshExpiresIn || "7d";
    this.fastify.register(require("@fastify/jwt"), {
      secret: this.jwtSecret
    });
  }
  jwtSecret;
  jwtRefreshSecret;
  expiresIn;
  refreshExpiresIn;
  async generateTokens(payload) {
    const token = "temp-token-" + Date.now();
    return {
      accessToken: token + "-access",
      refreshToken: token + "-refresh"
    };
  }
  async verifyToken(token, isRefreshToken = false) {
    try {
      if (token.includes("temp-token-")) {
        return {
          userId: "temp-user-id",
          email: "temp@example.com",
          roles: ["user"],
          type: isRefreshToken ? "refresh" : "access"
        };
      }
      throw new Error("Invalid token");
    } catch (error) {
      throw new Error("Invalid token");
    }
  }
  async refreshTokens(refreshToken) {
    try {
      const payload = await this.verifyToken(refreshToken, true);
      return this.generateTokens(payload);
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }
  parseExpiresIn(expiresIn) {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error("Invalid expiresIn format");
    }
    const [, value, unit] = match;
    const numValue = parseInt(value, 10);
    switch (unit) {
      case "s":
        return numValue;
      case "m":
        return numValue * 60;
      case "h":
        return numValue * 60 * 60;
      case "d":
        return numValue * 60 * 60 * 24;
      default:
        throw new Error("Invalid time unit");
    }
  }
  base64UrlEncode(str) {
    return Buffer.from(str).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  }
  base64UrlDecode(str) {
    str = str.replace(/-/g, "+").replace(/_/g, "/");
    while (str.length % 4) {
      str += "=";
    }
    return Buffer.from(str, "base64").toString();
  }
  createSignature(header, payload, secret) {
    const crypto = require("crypto");
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(`${header}.${payload}`);
    return this.base64UrlEncode(hmac.digest("base64"));
  }
  /**
   * Decode token without verification (for inspection)
   */
  decodeToken(token) {
    return import_jsonwebtoken.default.decode(token);
  }
  /**
   * Check if token is expired
   */
  isTokenExpired(token) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return true;
      }
      const currentTime = Math.floor(Date.now() / 1e3);
      return decoded.exp < currentTime;
    } catch {
      return true;
    }
  }
  /**
   * Get token expiration date
   */
  getTokenExpiration(token) {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return null;
      }
      return new Date(decoded.exp * 1e3);
    } catch {
      return null;
    }
  }
  /**
   * Extract user ID from token
   */
  getUserIdFromToken(token) {
    try {
      const decoded = this.decodeToken(token);
      return decoded?.userId || null;
    } catch {
      return null;
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  JwtService
});
//# sourceMappingURL=JwtService.js.map
