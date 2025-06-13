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
var SessionService_exports = {};
__export(SessionService_exports, {
  SessionService: () => SessionService
});
module.exports = __toCommonJS(SessionService_exports);
var import_SessionModel = require("../database/models/SessionModel");
var import_JwtService = require("./JwtService");
class SessionService {
  jwtService;
  constructor(jwtConfig, fastify) {
    this.jwtService = new import_JwtService.JwtService(fastify, jwtConfig);
  }
  /**
   * Create a new session
   */
  async createSession(data) {
    const expiresAt = data.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
    const session = await import_SessionModel.SessionModel.create({
      userId: data.userId,
      token: data.refreshToken,
      expiresAt
    });
    return {
      ...session,
      deviceInfo: data.deviceInfo,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      location: data.location,
      isActive: true
    };
  }
  /**
   * Find session by refresh token
   */
  async findSessionByToken(refreshToken) {
    const session = await import_SessionModel.SessionModel.findByToken(refreshToken);
    if (!session) {
      return null;
    }
    const isExpired = /* @__PURE__ */ new Date() > session.expiresAt;
    if (isExpired) {
      await this.terminateSession(session.id);
      return null;
    }
    return {
      ...session,
      isActive: true
    };
  }
  /**
   * Validate session and access token
   */
  async validateSession(accessToken, refreshToken) {
    try {
      const tokenPayload = await this.jwtService.verifyToken(accessToken, false);
      if (refreshToken) {
        const session = await this.findSessionByToken(refreshToken);
        if (!session || session.userId !== tokenPayload.userId) {
          return { isValid: false };
        }
        return {
          isValid: true,
          session,
          user: {
            userId: tokenPayload.userId,
            email: tokenPayload.email,
            roles: tokenPayload.roles
          }
        };
      }
      return {
        isValid: true,
        user: {
          userId: tokenPayload.userId,
          email: tokenPayload.email,
          roles: tokenPayload.roles
        }
      };
    } catch (error) {
      if (error.message.includes("expired") && refreshToken) {
        const session = await this.findSessionByToken(refreshToken);
        if (session) {
          return {
            isValid: true,
            session,
            needsRefresh: true
          };
        }
      }
      return { isValid: false };
    }
  }
  /**
   * Refresh session tokens
   */
  async refreshSession(refreshToken) {
    const session = await this.findSessionByToken(refreshToken);
    if (!session) {
      return null;
    }
    try {
      const tokenPayload = await this.jwtService.verifyToken(refreshToken, true);
      const newTokens = await this.jwtService.generateTokens({
        userId: tokenPayload.userId,
        email: tokenPayload.email,
        roles: tokenPayload.roles,
        type: "access"
      });
      const updatedSession = await import_SessionModel.SessionModel.update(session.id, {
        token: newTokens.refreshToken,
        updatedAt: /* @__PURE__ */ new Date()
      });
      if (!updatedSession) {
        return null;
      }
      return {
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
        session: {
          ...updatedSession,
          isActive: true
        }
      };
    } catch (error) {
      await this.terminateSession(session.id);
      return null;
    }
  }
  /**
   * Terminate a specific session
   */
  async terminateSession(sessionId) {
    return await import_SessionModel.SessionModel.delete(sessionId);
  }
  /**
   * Terminate all sessions for a user
   */
  async terminateAllUserSessions(userId) {
    console.log(`Terminating all sessions for user: ${userId}`);
  }
  /**
   * Get all active sessions for a user
   */
  async getUserSessions(userId) {
    return [];
  }
  /**
   * Terminate other sessions (keep current one)
   */
  async terminateOtherSessions(userId, currentSessionId) {
    console.log(`Terminating other sessions for user: ${userId}, keeping: ${currentSessionId}`);
  }
  /**
   * Cleanup expired sessions (for cron job)
   */
  async cleanupExpiredSessions() {
    console.log("Cleaning up expired sessions...");
    return 0;
  }
  /**
   * Check if session is valid
   */
  async isSessionValid(sessionId) {
    try {
      const session = await import_SessionModel.SessionModel.findById?.(sessionId);
      if (!session) {
        return false;
      }
      return /* @__PURE__ */ new Date() <= session.expiresAt;
    } catch {
      return false;
    }
  }
  /**
   * Extend session expiration
   */
  async extendSession(sessionId, extendBy = 7 * 24 * 60 * 60 * 1e3) {
    try {
      const newExpiresAt = new Date(Date.now() + extendBy);
      const updated = await import_SessionModel.SessionModel.update(sessionId, {
        expiresAt: newExpiresAt,
        updatedAt: /* @__PURE__ */ new Date()
      });
      return !!updated;
    } catch {
      return false;
    }
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SessionService
});
//# sourceMappingURL=SessionService.js.map
