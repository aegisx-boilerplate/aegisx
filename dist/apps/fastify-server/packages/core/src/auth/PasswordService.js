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
var PasswordService_exports = {};
__export(PasswordService_exports, {
  PasswordService: () => PasswordService
});
module.exports = __toCommonJS(PasswordService_exports);
var import_password = require("../utils/password");
class PasswordService {
  policy;
  constructor(policy = import_password.defaultPasswordPolicy) {
    this.policy = policy;
  }
  /**
   * Hash a password
   */
  async hash(password) {
    const validation = this.validate(password);
    if (!validation.isValid) {
      throw new Error(`Password validation failed: ${validation.errors.join(", ")}`);
    }
    if (await (0, import_password.isPasswordCompromised)(password)) {
      throw new Error("Password has been found in data breaches. Please choose a different password.");
    }
    return await (0, import_password.hashPassword)(password);
  }
  /**
   * Compare password with hash
   */
  async compare(password, hashedPassword) {
    return await (0, import_password.comparePassword)(password, hashedPassword);
  }
  /**
   * Validate password against policy
   */
  validate(password) {
    return (0, import_password.validatePassword)(password, this.policy);
  }
  /**
   * Generate a random password
   */
  generate(length = 12) {
    return (0, import_password.generateRandomPassword)(length);
  }
  /**
   * Update password policy
   */
  updatePolicy(newPolicy) {
    this.policy = { ...this.policy, ...newPolicy };
  }
  /**
   * Get current password policy
   */
  getPolicy() {
    return { ...this.policy };
  }
  /**
   * Check if password needs to be rehashed (for bcrypt cost updates)
   */
  needsRehash(hashedPassword) {
    return !hashedPassword.startsWith("$2b$12$");
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PasswordService
});
//# sourceMappingURL=PasswordService.js.map
