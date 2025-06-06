# Config Loader Migration Guide

## Overview
This guide explains how to migrate from the current config system to the improved, type-safe configuration system.

## What's Changed

### Before (Old System)
```typescript
// src/config/env.ts
export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 3000,
  // ... manual type conversion and defaults
};
```

### After (New System)
```typescript
// src/config/config.ts
import { config } from './config.js';

// Fully typed, validated configuration
const { isDevelopment, jwt, database } = config;
```

## Benefits of the New System

1. **Type Safety**: Full TypeScript support with inferred types
2. **Runtime Validation**: Zod schemas validate all environment variables at startup
3. **Better Error Messages**: Clear validation errors with specific field information
4. **Production Safety**: Enhanced validation for production environments
5. **Organized Structure**: Grouped configuration objects for better organization
6. **Default Values**: Consistent and safe default values for all variables
7. **Format Validation**: Validates URLs, emails, durations, etc.

## Migration Steps

### Step 1: Update Import Statements
Replace imports of the old env object:

```typescript
// OLD
import { env } from '../config/env.js';

// NEW
import { config } from '../config/config.js';
```

### Step 2: Update Property Access
The new system provides organized configuration objects:

```typescript
// OLD
const jwtSecret = env.JWT_SECRET;
const dbUrl = env.DATABASE_URL;
const isProduction = env.isProduction;

// NEW
const jwtSecret = config.jwt.secret;
const dbUrl = config.database.url;
const isProduction = config.isProduction;
```

### Step 3: Use Grouped Configuration Objects
Take advantage of the organized structure:

```typescript
// Password policy
const { minLength, requireUppercase } = config.passwordPolicy;

// Rate limiting
const authLimits = config.rateLimiting.auth;
const apiLimits = config.rateLimiting.api;

// Email settings
const emailConfig = config.email;
```

## Error Handling

The new system provides much better error messages:

### Before
```
TypeError: Cannot read property 'length' of undefined
```

### After
```
❌ Environment configuration validation failed:
  • JWT_SECRET: String must contain at least 32 character(s)
  • DATABASE_URL: Required
  • PASSWORD_MIN_LENGTH: Expected number, received string

💡 Check your .env file and ensure all required variables are set correctly.
📖 See docs/environment-configuration.md for detailed requirements.
```

## Testing

### Unit Tests
```typescript
import { validateEnvironment } from '../config/config.js';

describe('Environment Configuration', () => {
  it('should validate correct environment variables', () => {
    const result = validateEnvironment({
      NODE_ENV: 'test',
      DATABASE_URL: 'postgresql://localhost:5432/test',
      JWT_SECRET: 'a-very-long-secret-key-for-testing-purposes',
      // ... other required variables
    });
    
    expect(result.success).toBe(true);
  });
  
  it('should reject invalid environment variables', () => {
    const result = validateEnvironment({
      NODE_ENV: 'invalid',
      JWT_SECRET: 'short',
    });
    
    expect(result.success).toBe(false);
  });
});
```

### Environment-Specific Configuration
```typescript
import { getConfigForEnvironment } from '../config/config.js';

// Get configuration for a specific environment
const testConfig = getConfigForEnvironment('test');
```

## Production Checklist

The new system includes production-specific validation:

- ✅ JWT_SECRET is not a default value
- ✅ DATABASE_URL doesn't use localhost
- ✅ BCRYPT_ROUNDS is at least 12
- ✅ SMTP credentials are provided
- ✅ All required environment variables are set

## Rollback Plan

If you need to rollback to the old system:

1. Revert import statements to use `env` instead of `config`
2. Update property access to use flat structure
3. The old `env.ts` file will remain functional

## Common Patterns

### Accessing Nested Configuration
```typescript
// JWT configuration
const jwtConfig = config.jwt;
app.register(fastifyJwt, {
  secret: jwtConfig.secret,
  sign: {
    expiresIn: jwtConfig.accessTokenExpiry,
    issuer: jwtConfig.issuer,
  },
});

// Database configuration
const dbConfig = config.database;
const knex = Knex({
  client: 'postgresql',
  connection: dbConfig.url,
});
```

### Environment-Specific Logic
```typescript
if (config.isDevelopment) {
  // Development-only code
}

if (config.isProduction) {
  // Production-only code
}
```

### Rate Limiting Configuration
```typescript
// Auth rate limiting
app.register(rateLimit, {
  max: config.rateLimiting.auth.maxAttempts,
  timeWindow: config.rateLimiting.auth.windowMs,
});

// API rate limiting
app.register(rateLimit, {
  max: config.rateLimiting.api.maxRequests,
  timeWindow: config.rateLimiting.api.windowMs,
});
```

## Troubleshooting

### Common Issues

1. **Import Errors**: Make sure to update all import statements
2. **Property Access**: Use the new grouped structure
3. **Type Errors**: The new system is strictly typed, update property access accordingly
4. **Validation Errors**: Check .env file against the schema requirements

### Getting Help

- Check the validation error messages for specific field issues
- Review `docs/environment-configuration.md` for required variables
- Use the validation utility to test configuration before deployment
