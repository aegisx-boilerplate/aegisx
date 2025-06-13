/**
 * Authentication Module
 *
 * Provides JWT-based authentication, OAuth integration,
 * password management, and session handling.
 */

// Module
// export * from './AuthModule';

// Controllers
export * from './controllers/AuthController';

// Services
export * from './AuthService';
export * from './JwtService';
export { JwtTokens } from './JwtService';
export * from './PasswordService';
export * from './SessionService';

// Guards
export * from './guards/JwtAuthGuard';

// Interfaces
export * from './interfaces/JwtPayload';

// DTOs
export * from './dto/LoginDto';
export * from './dto/RegisterDto';
export * from './dto/RefreshTokenDto';

// Middleware
// TODO: Phase 2.3 - Implement authentication middleware
// export * from './middleware';

// Types
// TODO: Phase 2.3 - Implement auth types
// export * from './types'; 