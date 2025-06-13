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
var AuthService_exports = {};
__export(AuthService_exports, {
  AuthService: () => AuthService
});
module.exports = __toCommonJS(AuthService_exports);
var import_UserModel = require("../database/models/UserModel");
var import_JwtService = require("./JwtService");
var import_PasswordService = require("./PasswordService");
var import_SessionService = require("./SessionService");
class AuthService {
  jwtService;
  passwordService;
  sessionService;
  constructor(jwtConfig, passwordPolicy, fastify) {
    this.jwtService = new import_JwtService.JwtService(fastify, jwtConfig);
    this.passwordService = new import_PasswordService.PasswordService(passwordPolicy);
    this.sessionService = new import_SessionService.SessionService(jwtConfig, fastify);
  }
  /**
   * Register a new user
   */
  async register(request) {
    const existingUser = await import_UserModel.UserModel.findByEmail(request.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }
    const passwordHash = await this.passwordService.hash(request.password);
    const user = await import_UserModel.UserModel.create({
      email: request.email,
      firstName: request.firstName,
      lastName: request.lastName,
      passwordHash,
      isActive: true
    });
    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      message: "User registered successfully"
    };
  }
  /**
   * Login user
   */
  async login(request, metadata) {
    const user = await import_UserModel.UserModel.findByEmail(request.email);
    if (!user) {
      throw new Error("Invalid email or password");
    }
    if (!user.isActive) {
      throw new Error("Account is deactivated");
    }
    const isPasswordValid = await this.passwordService.compare(
      request.password,
      user.passwordHash
    );
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }
    const tokens = await this.jwtService.generateTokens({
      userId: user.id,
      email: user.email,
      roles: [],
      // TODO: Add roles when RBAC is implemented
      type: "access"
    });
    const session = await this.sessionService.createSession({
      userId: user.id,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      deviceInfo: metadata?.deviceInfo,
      ipAddress: metadata?.ipAddress,
      userAgent: metadata?.userAgent,
      location: metadata?.location
    });
    await import_UserModel.UserModel.update(user.id, {
      lastLoginAt: /* @__PURE__ */ new Date()
    });
    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      session: {
        id: session.id
      }
    };
  }
  /**
   * Logout user
   */
  async logout(refreshToken) {
    const session = await this.sessionService.findSessionByToken(refreshToken);
    if (session) {
      await this.sessionService.terminateSession(session.id);
    }
    return {
      message: "Logged out successfully"
    };
  }
  /**
   * Refresh access token
   */
  async refreshToken(refreshToken) {
    const result = await this.sessionService.refreshSession(refreshToken);
    if (!result) {
      return null;
    }
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    };
  }
  /**
   * Validate authentication
   */
  async validateAuth(accessToken, refreshToken) {
    const validation = await this.sessionService.validateSession(accessToken, refreshToken);
    if (!validation.isValid) {
      return { isValid: false };
    }
    let user = null;
    if (validation.user) {
      user = await import_UserModel.UserModel.findById(validation.user.userId);
      if (!user || !user.isActive) {
        return { isValid: false };
      }
    }
    const { passwordHash: _, ...userWithoutPassword } = user || {};
    return {
      isValid: true,
      user: user ? userWithoutPassword : void 0,
      needsRefresh: validation.needsRefresh
    };
  }
  /**
   * Change password
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await import_UserModel.UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    const isCurrentPasswordValid = await this.passwordService.compare(
      currentPassword,
      user.passwordHash
    );
    if (!isCurrentPasswordValid) {
      throw new Error("Current password is incorrect");
    }
    const newPasswordHash = await this.passwordService.hash(newPassword);
    await import_UserModel.UserModel.update(userId, {
      passwordHash: newPasswordHash,
      updatedAt: /* @__PURE__ */ new Date()
    });
    await this.sessionService.terminateAllUserSessions(userId);
    return {
      message: "Password changed successfully"
    };
  }
  /**
   * Request password reset (placeholder)
   */
  async requestPasswordReset(email) {
    const user = await import_UserModel.UserModel.findByEmail(email);
    if (!user) {
      return {
        message: "If the email exists, a password reset link has been sent"
      };
    }
    console.log(`Password reset requested for: ${email}`);
    return {
      message: "If the email exists, a password reset link has been sent"
    };
  }
  /**
   * Reset password (placeholder)
   */
  async resetPassword(resetToken, newPassword) {
    throw new Error("Password reset not implemented yet");
  }
  /**
   * Get user profile
   */
  async getProfile(userId) {
    const user = await import_UserModel.UserModel.findById(userId);
    if (!user) {
      return null;
    }
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AuthService
});
//# sourceMappingURL=AuthService.js.map
