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
    user: any; // TODO: Define proper User type
    accessToken: string;
    refreshToken: string;
}

export interface JwtPayload {
    userId: ID;
    email: string;
    roles: string[];
    iat?: number;
    exp?: number;
}

// TODO: Add more auth types 