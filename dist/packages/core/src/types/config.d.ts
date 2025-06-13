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
    expiresIn: string;
    refreshSecret?: string;
    refreshExpiresIn?: string;
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
    jwt?: JwtConfig;
    security?: SecurityConfig;
    multiTenant?: MultiTenantConfig;
    debug?: boolean;
    auth?: {
        passwordPolicy?: {
            minLength?: number;
            requireUppercase?: boolean;
            requireLowercase?: boolean;
            requireNumbers?: boolean;
            requireSpecialChars?: boolean;
        };
        sessionTimeout?: string;
        maxFailedAttempts?: number;
        lockoutDuration?: string;
    };
}
//# sourceMappingURL=config.d.ts.map