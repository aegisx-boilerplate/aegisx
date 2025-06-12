/**
 * Configuration Types
 * 
 * Type definitions for AegisX configuration options.
 */

export interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    ssl?: boolean;
    pool?: {
        min: number;
        max: number;
    };
}

export interface JwtConfig {
    secret: string;
    algorithm?: 'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512';
    expiresIn: string;
    refreshExpiresIn?: string;
    issuer?: string;
    audience?: string;
}

export interface SecurityConfig {
    bcryptRounds?: number;
    rateLimiting?: boolean;
    sessionTimeout?: string;
    maxLoginAttempts?: number;
    lockoutDuration?: string;
}

export interface MultiTenantConfig {
    enabled: boolean;
    defaultTenant?: string;
    tenantIdField?: string;
}

export interface AegisXConfig {
    database: DatabaseConfig;
    jwt: JwtConfig;
    security?: SecurityConfig;
    multiTenant?: MultiTenantConfig;
    debug?: boolean;
} 