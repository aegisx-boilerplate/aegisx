import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../AuthService';
import { LoginDto } from '../dto/LoginDto';
import { RegisterDto } from '../dto/RegisterDto';
import { RefreshTokenDto } from '../dto/RefreshTokenDto';
export default class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(request: FastifyRequest<{
        Body: RegisterDto;
    }>, reply: FastifyReply): Promise<void>;
    login(request: FastifyRequest<{
        Body: LoginDto;
    }>, reply: FastifyReply): Promise<void>;
    refreshToken(request: FastifyRequest<{
        Body: RefreshTokenDto;
    }>, reply: FastifyReply): Promise<void>;
    logout(request: FastifyRequest, reply: FastifyReply): Promise<void>;
    getProfile(request: FastifyRequest, reply: FastifyReply): Promise<void>;
}
export declare const authSchemas: {
    register: {
        schema: {
            body: import("@sinclair/typebox").TObject<{
                email: import("@sinclair/typebox").TString<"email">;
                password: import("@sinclair/typebox").TString<string>;
                firstName: import("@sinclair/typebox").TString<string>;
                lastName: import("@sinclair/typebox").TString<string>;
                phoneNumber: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString<string>>;
            }>;
            response: {
                201: import("@sinclair/typebox").TObject<{
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
                400: import("@sinclair/typebox").TObject<{
                    message: import("@sinclair/typebox").TString<string>;
                }>;
            };
        };
    };
    login: {
        schema: {
            body: import("@sinclair/typebox").TObject<{
                email: import("@sinclair/typebox").TString<"email">;
                password: import("@sinclair/typebox").TString<string>;
            }>;
            response: {
                200: import("@sinclair/typebox").TObject<{
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
                401: import("@sinclair/typebox").TObject<{
                    message: import("@sinclair/typebox").TString<string>;
                }>;
            };
        };
    };
    refreshToken: {
        schema: {
            body: import("@sinclair/typebox").TObject<{
                refreshToken: import("@sinclair/typebox").TString<string>;
            }>;
            response: {
                200: import("@sinclair/typebox").TObject<{
                    accessToken: import("@sinclair/typebox").TString<string>;
                    refreshToken: import("@sinclair/typebox").TString<string>;
                }>;
                401: import("@sinclair/typebox").TObject<{
                    message: import("@sinclair/typebox").TString<string>;
                }>;
            };
        };
    };
    logout: {
        schema: {
            response: {
                200: import("@sinclair/typebox").TObject<{
                    message: import("@sinclair/typebox").TString<string>;
                }>;
                400: import("@sinclair/typebox").TObject<{
                    message: import("@sinclair/typebox").TString<string>;
                }>;
            };
        };
    };
    getProfile: {
        schema: {
            response: {
                200: import("@sinclair/typebox").TObject<{
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
                401: import("@sinclair/typebox").TObject<{
                    message: import("@sinclair/typebox").TString<string>;
                }>;
                404: import("@sinclair/typebox").TObject<{
                    message: import("@sinclair/typebox").TString<string>;
                }>;
            };
        };
    };
};
//# sourceMappingURL=AuthController.d.ts.map