/**
 * Authentication Types
 */
import type { ID } from './core';
export interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
}
export interface LoginResponse {
    user: any;
    accessToken: string;
    refreshToken: string;
}
export interface JwtPayload {
    userId: ID;
    email: string;
    roles: string[];
    type: 'access' | 'refresh';
    iat?: number;
    exp?: number;
}
//# sourceMappingURL=auth.d.ts.map