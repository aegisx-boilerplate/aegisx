/**
 * Modern Config Loader
 * Type-safe environment configuration with runtime validation
 */

import dotenv from 'dotenv';
import { configSchema, enhancedConfigSchema, type ConfigType } from './schema';

// Load environment variables from .env file
dotenv.config();

/**
 * Validates and loads environment configuration
 * @param strict - Whether to use enhanced validation (includes production checks)
 * @returns Validated configuration object
 */
function loadConfig(strict: boolean = true): ConfigType {
  try {
    const schema = strict ? enhancedConfigSchema : configSchema;
    const config = schema.parse(process.env);

    // Log successful validation in development
    if (config.NODE_ENV === 'development') {
      console.log('✅ Environment configuration loaded and validated successfully');
    }

    return config;
  } catch (error) {
    console.error('❌ Environment configuration validation failed:');

    if (error instanceof Error) {
      // Parse and display Zod validation errors nicely
      try {
        const zodError = JSON.parse(error.message);
        if (Array.isArray(zodError)) {
          zodError.forEach((err: any) => {
            console.error(`  • ${err.path?.join('.') || 'root'}: ${err.message}`);
          });
        } else {
          console.error(`  • ${error.message}`);
        }
      } catch {
        console.error(`  • ${error.message}`);
      }
    }

    console.error('\n💡 Check your .env file and ensure all required variables are set correctly.');
    console.error('📖 See docs/environment-configuration.md for detailed requirements.\n');

    process.exit(1);
  }
}

// Load the validated configuration
const env = loadConfig();

// Export derived configuration for convenience
export const config = {
  ...env,

  // Computed properties
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',

  // Database configuration object
  database: {
    url: env.DATABASE_URL,
  },

  // Redis configuration object
  redis: {
    url: env.REDIS_URL,
  },

  // RabbitMQ configuration object
  rabbitmq: {
    url: env.RABBITMQ_URL,
  },

  // JWT configuration object
  jwt: {
    secret: env.JWT_SECRET,
    accessTokenExpiry: env.JWT_ACCESS_TOKEN_EXPIRY,
    refreshTokenExpiry: env.JWT_REFRESH_TOKEN_EXPIRY,
    issuer: env.JWT_ISSUER,
  },

  // Password policy configuration object
  passwordPolicy: {
    minLength: env.PASSWORD_MIN_LENGTH,
    requireUppercase: env.PASSWORD_REQUIRE_UPPERCASE,
    requireLowercase: env.PASSWORD_REQUIRE_LOWERCASE,
    requireNumbers: env.PASSWORD_REQUIRE_NUMBERS,
    requireSymbols: env.PASSWORD_REQUIRE_SYMBOLS,
    historyCount: env.PASSWORD_HISTORY_COUNT,
    resetTokenExpiry: env.PASSWORD_RESET_TOKEN_EXPIRY,
  },

  // Rate limiting configuration object
  rateLimiting: {
    auth: {
      windowMs: env.RATE_LIMIT_AUTH_WINDOW_MS,
      maxAttempts: env.RATE_LIMIT_AUTH_MAX_ATTEMPTS,
      blockDurationMs: env.RATE_LIMIT_AUTH_BLOCK_DURATION_MS,
    },
    api: {
      windowMs: env.RATE_LIMIT_API_WINDOW_MS,
      maxRequests: env.RATE_LIMIT_API_MAX_REQUESTS,
    },
  },

  // Security configuration object
  security: {
    bcryptRounds: env.BCRYPT_ROUNDS,
    apiKeyLength: env.API_KEY_LENGTH,
    sessionTimeoutMs: env.SESSION_TIMEOUT_MS,
  },

  // Event bus configuration object
  eventBus: {
    exchange: env.EVENT_BUS_EXCHANGE,
    exchangeType: env.EVENT_BUS_EXCHANGE_TYPE,
    durable: env.EVENT_BUS_DURABLE,
    queuePrefix: env.EVENT_BUS_QUEUE_PREFIX,
  },

  // Email configuration object
  email: {
    smtp: {
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      user: env.SMTP_USER,
      password: env.SMTP_PASSWORD,
    },
    fromEmail: env.FROM_EMAIL,
  },

  // Frontend configuration
  frontend: {
    url: env.FRONTEND_URL,
  },
};

// Export type for TypeScript consumers
export type Config = typeof config;

// Utility function for environment-specific configuration
export function getConfigForEnvironment(environment: string) {
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = environment;

  try {
    return loadConfig(false); // Don't use strict validation for this utility
  } finally {
    process.env.NODE_ENV = originalEnv;
  }
}

// Validation utility that can be used standalone
export function validateEnvironment(variables: Record<string, string | undefined>) {
  return configSchema.safeParse(variables);
}
