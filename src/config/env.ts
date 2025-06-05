import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 3000,
  DATABASE_URL: process.env.DATABASE_URL || '',
  REDIS_URL: process.env.REDIS_URL || '',
  RABBITMQ_URL: process.env.RABBITMQ_URL || 'amqp://localhost',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-here',

  // JWT Configuration
  JWT_ACCESS_TOKEN_EXPIRY: process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m',
  JWT_REFRESH_TOKEN_EXPIRY: process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d',
  JWT_ISSUER: process.env.JWT_ISSUER || 'aegisx',

  // Password Policy Configuration
  PASSWORD_MIN_LENGTH: Number(process.env.PASSWORD_MIN_LENGTH) || 8,
  PASSWORD_REQUIRE_UPPERCASE: process.env.PASSWORD_REQUIRE_UPPERCASE === 'true',
  PASSWORD_REQUIRE_LOWERCASE: process.env.PASSWORD_REQUIRE_LOWERCASE === 'true',
  PASSWORD_REQUIRE_NUMBERS: process.env.PASSWORD_REQUIRE_NUMBERS === 'true',
  PASSWORD_REQUIRE_SYMBOLS: process.env.PASSWORD_REQUIRE_SYMBOLS === 'true',
  PASSWORD_HISTORY_COUNT: Number(process.env.PASSWORD_HISTORY_COUNT) || 5,
  PASSWORD_RESET_TOKEN_EXPIRY: process.env.PASSWORD_RESET_TOKEN_EXPIRY || '1h',

  // Rate Limiting Configuration
  RATE_LIMIT_AUTH_WINDOW_MS: Number(process.env.RATE_LIMIT_AUTH_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_AUTH_MAX_ATTEMPTS: Number(process.env.RATE_LIMIT_AUTH_MAX_ATTEMPTS) || 5,
  RATE_LIMIT_AUTH_BLOCK_DURATION_MS: Number(process.env.RATE_LIMIT_AUTH_BLOCK_DURATION_MS) || 30 * 60 * 1000, // 30 minutes
  RATE_LIMIT_API_WINDOW_MS: Number(process.env.RATE_LIMIT_API_WINDOW_MS) || 60 * 1000, // 1 minute
  RATE_LIMIT_API_MAX_REQUESTS: Number(process.env.RATE_LIMIT_API_MAX_REQUESTS) || 100,

  // Security Configuration
  BCRYPT_ROUNDS: Number(process.env.BCRYPT_ROUNDS) || 12,
  API_KEY_LENGTH: Number(process.env.API_KEY_LENGTH) || 32,
  SESSION_TIMEOUT_MS: Number(process.env.SESSION_TIMEOUT_MS) || 24 * 60 * 60 * 1000, // 24 hours

  // Event Bus Configuration
  EVENT_BUS_EXCHANGE: process.env.EVENT_BUS_EXCHANGE || 'aegisx_events',
  EVENT_BUS_EXCHANGE_TYPE: process.env.EVENT_BUS_EXCHANGE_TYPE || 'topic',
  EVENT_BUS_DURABLE: process.env.EVENT_BUS_DURABLE || 'true',
  EVENT_BUS_QUEUE_PREFIX: process.env.EVENT_BUS_QUEUE_PREFIX || 'aegisx',

  // Email Configuration (for password reset)
  SMTP_HOST: process.env.SMTP_HOST || 'localhost',
  SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASSWORD: process.env.SMTP_PASSWORD || '',
  FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@aegisx.com',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Environment flags
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};
