/**
 * Legacy Environment Configuration
 * @deprecated Use the new config system from './config' instead
 * This file is maintained for backward compatibility
 */

import { config } from './config';

console.warn('⚠️  Using deprecated env.ts - Consider migrating to the new config system');
console.warn('📖 See docs/config-migration-guide.md for migration instructions');

// Re-export the new config in the old format for backward compatibility
export const env = {
  NODE_ENV: config.NODE_ENV,
  PORT: config.PORT,
  DATABASE_URL: config.DATABASE_URL,
  REDIS_URL: config.REDIS_URL,
  RABBITMQ_URL: config.RABBITMQ_URL,
  JWT_SECRET: config.JWT_SECRET,

  // JWT Configuration
  JWT_ACCESS_TOKEN_EXPIRY: config.JWT_ACCESS_TOKEN_EXPIRY,
  JWT_REFRESH_TOKEN_EXPIRY: config.JWT_REFRESH_TOKEN_EXPIRY,
  JWT_ISSUER: config.JWT_ISSUER,

  // Password Policy Configuration
  PASSWORD_MIN_LENGTH: config.PASSWORD_MIN_LENGTH,
  PASSWORD_REQUIRE_UPPERCASE: config.PASSWORD_REQUIRE_UPPERCASE,
  PASSWORD_REQUIRE_LOWERCASE: config.PASSWORD_REQUIRE_LOWERCASE,
  PASSWORD_REQUIRE_NUMBERS: config.PASSWORD_REQUIRE_NUMBERS,
  PASSWORD_REQUIRE_SYMBOLS: config.PASSWORD_REQUIRE_SYMBOLS,
  PASSWORD_HISTORY_COUNT: config.PASSWORD_HISTORY_COUNT,
  PASSWORD_RESET_TOKEN_EXPIRY: config.PASSWORD_RESET_TOKEN_EXPIRY,

  // Rate Limiting Configuration
  RATE_LIMIT_AUTH_WINDOW_MS: config.RATE_LIMIT_AUTH_WINDOW_MS,
  RATE_LIMIT_AUTH_MAX_ATTEMPTS: config.RATE_LIMIT_AUTH_MAX_ATTEMPTS,
  RATE_LIMIT_AUTH_BLOCK_DURATION_MS: config.RATE_LIMIT_AUTH_BLOCK_DURATION_MS,
  RATE_LIMIT_API_WINDOW_MS: config.RATE_LIMIT_API_WINDOW_MS,
  RATE_LIMIT_API_MAX_REQUESTS: config.RATE_LIMIT_API_MAX_REQUESTS,

  // Security Configuration
  BCRYPT_ROUNDS: config.BCRYPT_ROUNDS,
  API_KEY_LENGTH: config.API_KEY_LENGTH,
  SESSION_TIMEOUT_MS: config.SESSION_TIMEOUT_MS,

  // Event Bus Configuration
  EVENT_BUS_EXCHANGE: config.EVENT_BUS_EXCHANGE,
  EVENT_BUS_EXCHANGE_TYPE: config.EVENT_BUS_EXCHANGE_TYPE,
  EVENT_BUS_DURABLE: config.EVENT_BUS_DURABLE,
  EVENT_BUS_QUEUE_PREFIX: config.EVENT_BUS_QUEUE_PREFIX,

  // Email Configuration
  SMTP_HOST: config.SMTP_HOST,
  SMTP_PORT: config.SMTP_PORT,
  SMTP_USER: config.SMTP_USER,
  SMTP_PASSWORD: config.SMTP_PASSWORD,
  FROM_EMAIL: config.FROM_EMAIL,
  FRONTEND_URL: config.FRONTEND_URL,

  // Environment flags
  isDevelopment: config.isDevelopment,
  isProduction: config.isProduction,
};
