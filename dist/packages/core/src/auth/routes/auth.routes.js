"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authRoutes;
// import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
const AuthController_1 = __importStar(require("../controllers/AuthController"));
async function authRoutes(fastify, authService) {
    // Register TypeBox type provider - commented out due to compatibility issues
    // fastify.withTypeProvider<TypeBoxTypeProvider>();
    // รับ authService จาก argument
    const controller = new AuthController_1.default(authService);
    fastify.post('/auth/register', {
        ...AuthController_1.authSchemas.register,
        handler: controller.register.bind(controller)
    });
    fastify.post('/auth/login', {
        ...AuthController_1.authSchemas.login,
        handler: controller.login.bind(controller)
    });
    fastify.post('/auth/refresh-token', {
        ...AuthController_1.authSchemas.refreshToken,
        handler: controller.refreshToken.bind(controller)
    });
    fastify.post('/auth/logout', {
        ...AuthController_1.authSchemas.logout,
        handler: controller.logout.bind(controller)
    });
    fastify.get('/auth/profile', {
        ...AuthController_1.authSchemas.getProfile,
        handler: controller.getProfile.bind(controller)
    });
}
//# sourceMappingURL=auth.routes.js.map