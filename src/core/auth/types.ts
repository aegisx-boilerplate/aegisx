
export interface AuthUser {
    id: string;
    username: string;
    email: string;
    permissions?: string[];
    created_at: Date;
    updated_at: Date;
}

export interface LoginRequest {
    username?: string;
    email?: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    token: string;
    newPassword: string;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface RefreshTokenRequest {
    refresh_token: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: 'Bearer';
    user: {
        id: string;
        username: string;
        email: string;
        roles: string[];
    };
}

export interface ApiKeyCreateRequest {
    name: string;
    scopes: string[];
    ipWhitelist?: string[];
    expiresAt?: Date;
}

export interface ApiKeyResponse {
    id: string;
    name: string;
    key: string; // Only shown once during creation
    scopes: string[];
    ipWhitelist?: string[];
    expiresAt?: Date;
    created_at: Date;
    revoked: boolean;
}

export interface AuthMetadata {
    ip?: string;
    userAgent?: string;
    sessionId?: string;
}

export interface JwtPayload {
    id: string;
    username: string;
    email: string;
    permissions: string[];
    iat: number;
    exp: number;
    type: 'access' | 'refresh';
}

export interface PasswordResetToken {
    userId: string;
    token: string;
    expiresAt: Date;
}

export interface RefreshToken {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    revoked: boolean;
}

export interface AuthConfig {
    jwt: {
        accessTokenExpiry: string; // '1h', '24h', etc.
        refreshTokenExpiry: string; // '7d', '30d', etc.
        secret: string;
    };
    password: {
        saltRounds: number;
        minLength: number;
        requireSpecialChars: boolean;
    };
    rateLimit: {
        loginAttempts: number;
        windowMs: number;
        blockDurationMs: number;
    };
    apiKey: {
        defaultExpiry: string; // '30d', '1y', etc.
        keyLength: number;
    };
}
