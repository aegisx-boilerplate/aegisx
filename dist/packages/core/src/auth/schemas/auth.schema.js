"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorResponseSchema = exports.ProfileResponseSchema = exports.RefreshTokenResponseSchema = exports.LoginResponseSchema = exports.RegisterResponseSchema = exports.RefreshTokenSchema = exports.LoginSchema = exports.RegisterSchema = void 0;
const type_provider_typebox_1 = require("@fastify/type-provider-typebox");
exports.RegisterSchema = type_provider_typebox_1.Type.Object({
    email: type_provider_typebox_1.Type.String({ format: 'email' }),
    password: type_provider_typebox_1.Type.String({ minLength: 8 }),
    firstName: type_provider_typebox_1.Type.String({ minLength: 1 }),
    lastName: type_provider_typebox_1.Type.String({ minLength: 1 }),
    phoneNumber: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.String())
});
exports.LoginSchema = type_provider_typebox_1.Type.Object({
    email: type_provider_typebox_1.Type.String({ format: 'email' }),
    password: type_provider_typebox_1.Type.String()
});
exports.RefreshTokenSchema = type_provider_typebox_1.Type.Object({
    refreshToken: type_provider_typebox_1.Type.String()
});
exports.RegisterResponseSchema = type_provider_typebox_1.Type.Object({
    user: type_provider_typebox_1.Type.Object({
        id: type_provider_typebox_1.Type.String(),
        email: type_provider_typebox_1.Type.String(),
        firstName: type_provider_typebox_1.Type.String(),
        lastName: type_provider_typebox_1.Type.String(),
        phoneNumber: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.String()),
        isActive: type_provider_typebox_1.Type.Boolean(),
        createdAt: type_provider_typebox_1.Type.String(),
        updatedAt: type_provider_typebox_1.Type.String()
    }),
    message: type_provider_typebox_1.Type.String()
});
exports.LoginResponseSchema = type_provider_typebox_1.Type.Object({
    user: type_provider_typebox_1.Type.Object({
        id: type_provider_typebox_1.Type.String(),
        email: type_provider_typebox_1.Type.String(),
        firstName: type_provider_typebox_1.Type.String(),
        lastName: type_provider_typebox_1.Type.String(),
        roles: type_provider_typebox_1.Type.Array(type_provider_typebox_1.Type.String())
    }),
    accessToken: type_provider_typebox_1.Type.String(),
    refreshToken: type_provider_typebox_1.Type.String()
});
exports.RefreshTokenResponseSchema = type_provider_typebox_1.Type.Object({
    accessToken: type_provider_typebox_1.Type.String(),
    refreshToken: type_provider_typebox_1.Type.String()
});
exports.ProfileResponseSchema = type_provider_typebox_1.Type.Object({
    id: type_provider_typebox_1.Type.String(),
    email: type_provider_typebox_1.Type.String(),
    firstName: type_provider_typebox_1.Type.String(),
    lastName: type_provider_typebox_1.Type.String(),
    phoneNumber: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.String()),
    roles: type_provider_typebox_1.Type.Array(type_provider_typebox_1.Type.String()),
    isActive: type_provider_typebox_1.Type.Boolean(),
    lastLoginAt: type_provider_typebox_1.Type.Optional(type_provider_typebox_1.Type.String()),
    createdAt: type_provider_typebox_1.Type.String(),
    updatedAt: type_provider_typebox_1.Type.String()
});
exports.ErrorResponseSchema = type_provider_typebox_1.Type.Object({
    message: type_provider_typebox_1.Type.String()
});
//# sourceMappingURL=auth.schema.js.map