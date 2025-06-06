/**
 * Configuration Schema
 * Type-safe configuration validation using Zod
 * Validates environment variables and transforms them into structured config
 */

import { z } from 'zod';

// Helper schemas for common validation patterns
const booleanFromString = z
  .string()
  .transform((val) => val.toLowerCase() === 'true')
  .or(z.boolean());

const numberFromString = z
  .string()
  .transform((val) => {
    const num = Number(val);
    if (isNaN(num)) {
      throw new Error(`Invalid number: ${val}`);
    }
    return num;
  })
  .or(z.number());

const urlSchema = z.string().url().or(z.string().min(1));
const emailSchema = z.string().email();
const durationSchema = z
  .string()
  .regex(/^\d+[smhd]$/, 'Invalid duration format (e.g., 15m, 1h, 7d)');

// Main configuration schema
export const configSchema = z.object({
  // Core Application
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: numberFromString.default(3000),

  // Database Configuration
  DATABASE_URL: z.string().min(1, 'Database URL is required'),
  REDIS_URL: z.string().min(1, 'Redis URL is required'),
  RABBITMQ_URL: z.string().min(1, 'RabbitMQ URL is required'),

  // JWT Configuration
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_ACCESS_TOKEN_EXPIRY: durationSchema.default('15m'),
  JWT_REFRESH_TOKEN_EXPIRY: durationSchema.default('7d'),
  JWT_ISSUER: z.string().default('aegisx'),

  // Password Policy
  PASSWORD_MIN_LENGTH: numberFromString.refine((val) => val >= 8, 'Must be at least 8').default(8),
  PASSWORD_REQUIRE_UPPERCASE: booleanFromString.default(true),
  PASSWORD_REQUIRE_LOWERCASE: booleanFromString.default(true),
  PASSWORD_REQUIRE_NUMBERS: booleanFromString.default(true),
  PASSWORD_REQUIRE_SYMBOLS: booleanFromString.default(false),
  PASSWORD_HISTORY_COUNT: numberFromString
    .refine((val) => val >= 1, 'Must be at least 1')
    .default(5),
  PASSWORD_RESET_TOKEN_EXPIRY: durationSchema.default('1h'),

  // Rate Limiting
  RATE_LIMIT_AUTH_WINDOW_MS: numberFromString.default(15 * 60 * 1000), // 15 minutes
  RATE_LIMIT_AUTH_MAX_ATTEMPTS: numberFromString
    .refine((val) => val >= 1, 'Must be at least 1')
    .default(5),
  RATE_LIMIT_AUTH_BLOCK_DURATION_MS: numberFromString.default(30 * 60 * 1000), // 30 minutes
  RATE_LIMIT_API_WINDOW_MS: numberFromString.default(60 * 1000), // 1 minute
  RATE_LIMIT_API_MAX_REQUESTS: numberFromString
    .refine((val) => val >= 1, 'Must be at least 1')
    .default(100),

  // Security
  BCRYPT_ROUNDS: numberFromString
    .refine((val) => val >= 10 && val <= 15, 'Must be between 10-15')
    .default(12),
  API_KEY_LENGTH: numberFromString.refine((val) => val >= 16, 'Must be at least 16').default(32),
  SESSION_TIMEOUT_MS: numberFromString.default(24 * 60 * 60 * 1000), // 24 hours

  // Event Bus
  EVENT_BUS_EXCHANGE: z.string().default('aegisx_events'),
  EVENT_BUS_EXCHANGE_TYPE: z.enum(['direct', 'topic', 'fanout', 'headers']).default('topic'),
  EVENT_BUS_DURABLE: booleanFromString.default(true),
  EVENT_BUS_QUEUE_PREFIX: z.string().default('aegisx'),

  // Email Configuration
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: numberFromString
    .refine((val) => val >= 1 && val <= 65535, 'Must be valid port')
    .default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  FROM_EMAIL: emailSchema.default('noreply@aegisx.com'),

  // Frontend
  FRONTEND_URL: urlSchema.default('http://localhost:3000'),
});

// Type inference for the validated config
export type ConfigType = z.infer<typeof configSchema>;

// Environment-specific validation rules
const productionRefinements = (data: ConfigType) => {
  const errors: string[] = [];

  if (data.NODE_ENV === 'production') {
    if (
      data.JWT_SECRET.includes('your-secret') ||
      data.JWT_SECRET.includes('change-in-production')
    ) {
      errors.push('JWT_SECRET must be changed from default value in production');
    }

    if (data.DATABASE_URL.includes('localhost')) {
      errors.push('DATABASE_URL should not use localhost in production');
    }

    if (data.BCRYPT_ROUNDS < 12) {
      errors.push('BCRYPT_ROUNDS should be at least 12 in production');
    }

    if (!data.SMTP_USER || !data.SMTP_PASSWORD) {
      errors.push('SMTP credentials are required in production');
    }
  }

  return errors;
};

// Enhanced schema with production validation
export const enhancedConfigSchema = configSchema.refine(
  (data) => {
    const errors = productionRefinements(data);
    return errors.length === 0;
  },
  (data) => ({
    message: `Production validation failed: ${productionRefinements(data).join(', ')}`,
  })
);
