export interface JwtPayload {
    sub: string; // User ID
    email: string;
    roles: string[];
    iat?: number; // Issued at
    exp?: number; // Expiration time
} 