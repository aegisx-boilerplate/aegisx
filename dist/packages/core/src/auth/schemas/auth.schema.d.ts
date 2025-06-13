export declare const RegisterSchema: import("@sinclair/typebox").TObject<{
    email: import("@sinclair/typebox").TString<"email">;
    password: import("@sinclair/typebox").TString<string>;
    firstName: import("@sinclair/typebox").TString<string>;
    lastName: import("@sinclair/typebox").TString<string>;
    phoneNumber: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
}>;
export declare const LoginSchema: import("@sinclair/typebox").TObject<{
    email: import("@sinclair/typebox").TString<"email">;
    password: import("@sinclair/typebox").TString<string>;
}>;
export declare const RefreshTokenSchema: import("@sinclair/typebox").TObject<{
    refreshToken: import("@sinclair/typebox").TString<string>;
}>;
export declare const RegisterResponseSchema: import("@sinclair/typebox").TObject<{
    user: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString<string>;
        email: import("@sinclair/typebox").TString<string>;
        firstName: import("@sinclair/typebox").TString<string>;
        lastName: import("@sinclair/typebox").TString<string>;
        phoneNumber: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
        isActive: import("@sinclair/typebox").TBoolean;
        createdAt: import("@sinclair/typebox").TString<string>;
        updatedAt: import("@sinclair/typebox").TString<string>;
    }>;
    message: import("@sinclair/typebox").TString<string>;
}>;
export declare const LoginResponseSchema: import("@sinclair/typebox").TObject<{
    user: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString<string>;
        email: import("@sinclair/typebox").TString<string>;
        firstName: import("@sinclair/typebox").TString<string>;
        lastName: import("@sinclair/typebox").TString<string>;
        roles: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString<string>>;
    }>;
    accessToken: import("@sinclair/typebox").TString<string>;
    refreshToken: import("@sinclair/typebox").TString<string>;
}>;
export declare const RefreshTokenResponseSchema: import("@sinclair/typebox").TObject<{
    accessToken: import("@sinclair/typebox").TString<string>;
    refreshToken: import("@sinclair/typebox").TString<string>;
}>;
export declare const ProfileResponseSchema: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString<string>;
    email: import("@sinclair/typebox").TString<string>;
    firstName: import("@sinclair/typebox").TString<string>;
    lastName: import("@sinclair/typebox").TString<string>;
    phoneNumber: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
    roles: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString<string>>;
    isActive: import("@sinclair/typebox").TBoolean;
    lastLoginAt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
    createdAt: import("@sinclair/typebox").TString<string>;
    updatedAt: import("@sinclair/typebox").TString<string>;
}>;
export declare const ErrorResponseSchema: import("@sinclair/typebox").TObject<{
    message: import("@sinclair/typebox").TString<string>;
}>;
//# sourceMappingURL=auth.schema.d.ts.map