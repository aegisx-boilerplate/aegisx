import { Type } from '@fastify/type-provider-typebox';

export const RegisterSchema = Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String({ minLength: 8 }),
    firstName: Type.String({ minLength: 1 }),
    lastName: Type.String({ minLength: 1 }),
    phoneNumber: Type.Optional(Type.String())
});

export const LoginSchema = Type.Object({
    email: Type.String({ format: 'email' }),
    password: Type.String()
});

export const RefreshTokenSchema = Type.Object({
    refreshToken: Type.String()
});

export const RegisterResponseSchema = Type.Object({
    user: Type.Object({
        id: Type.String(),
        email: Type.String(),
        firstName: Type.String(),
        lastName: Type.String(),
        phoneNumber: Type.Optional(Type.String()),
        isActive: Type.Boolean(),
        createdAt: Type.String(),
        updatedAt: Type.String()
    }),
    message: Type.String()
});

export const LoginResponseSchema = Type.Object({
    user: Type.Object({
        id: Type.String(),
        email: Type.String(),
        firstName: Type.String(),
        lastName: Type.String(),
        roles: Type.Array(Type.String())
    }),
    accessToken: Type.String(),
    refreshToken: Type.String()
});

export const RefreshTokenResponseSchema = Type.Object({
    accessToken: Type.String(),
    refreshToken: Type.String()
});

export const ProfileResponseSchema = Type.Object({
    id: Type.String(),
    email: Type.String(),
    firstName: Type.String(),
    lastName: Type.String(),
    phoneNumber: Type.Optional(Type.String()),
    roles: Type.Array(Type.String()),
    isActive: Type.Boolean(),
    lastLoginAt: Type.Optional(Type.String()),
    createdAt: Type.String(),
    updatedAt: Type.String()
});

export const ErrorResponseSchema = Type.Object({
    message: Type.String()
}); 