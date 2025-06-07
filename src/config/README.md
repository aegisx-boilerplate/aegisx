# Configuration System

A modern, type-safe configuration system for AegisX built with TypeScript and Zod validation.

## Overview

This configuration system provides:

- 🔒 **Type Safety**: Full TypeScript support with structured configuration objects
- ✅ **Runtime Validation**: Comprehensive validation using Zod schemas
- 🏗️ **Organized Structure**: Grouped configuration sections for better maintainability
- 🛡️ **Production Ready**: Enhanced validation for production environments
- 🔄 **Auto Type Conversion**: Automatic conversion from environment variables to proper types
- 📝 **Clear Error Messages**: Descriptive validation errors for easy debugging

## Quick Start

```typescript
import { config } from './config/config';

// Access structured configuration
const { database, jwt, email, passwordPolicy } = config;

// Use configuration values
console.log(`Server running on port ${config.PORT}`);
console.log(`Database: ${database.url}`);
console.log(`JWT expires in: ${jwt.accessTokenExpiry}`);
```

## Configuration Structure

The configuration is organized into logical groups:

### Core Settings
- `NODE_ENV` - Application environment (development, production, test)
- `PORT` - Server port (default: 3000)
- `isDevelopment` - Boolean flag for development mode
- `isProduction` - Boolean flag for production mode

### Database
```typescript
config.database = {
  url: string;           // PostgreSQL connection URL
  poolMin: number;       // Minimum pool connections (default: 2)
  poolMax: number;       // Maximum pool connections (default: 10)
}
```

### JWT Configuration
```typescript
config.jwt = {
  secret: string;                    // JWT signing secret
  issuer: string;                   // JWT issuer (default: "aegisx")
  audience: string;                 // JWT audience (default: "aegisx-users")
  accessTokenExpiry: string;        // Access token expiry (default: "15m")
  refreshTokenExpiry: string;       // Refresh token expiry (default: "7d")
}
```

### Email Configuration
```typescript
config.email = {
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    user?: string;
    password?: string;
  };
  from: {
    name: string;                   // Sender name (default: "AegisX")
    email: string;                  // Sender email (default: "noreply@aegisx.com")
  };
}
```

### Password Policy
```typescript
config.passwordPolicy = {
  minLength: number;                // Minimum length (default: 8)
  requireUppercase: boolean;        // Require uppercase (default: true)
  requireLowercase: boolean;        // Require lowercase (default: true)
  requireNumbers: boolean;          // Require numbers (default: true)
  requireSymbols: boolean;          // Require symbols (default: true)
}
```

### Rate Limiting
```typescript
config.rateLimiting = {
  auth: {
    windowMs: number;               // Time window in ms (default: 15min)
    maxAttempts: number;            // Max attempts per window (default: 5)
  };
  api: {
    windowMs: number;               // API rate limit window (default: 15min)
    maxRequests: number;            // Max API requests (default: 100)
  };
}
```

### Security
```typescript
config.security = {
  bcryptRounds: number;             // BCrypt hash rounds (default: 12)
  apiKeyLength: number;             // API key length (default: 32)
}
```

### Event Bus
```typescript
config.eventBus = {
  url: string;                      // RabbitMQ connection URL
  exchange: string;                 // Exchange name (default: "aegisx_events")
  exchangeType: string;             // Exchange type (default: "topic")
  queuePrefix: string;              // Queue prefix (default: "aegisx")
}
```

### Redis
```typescript
config.redis = {
  url: string;                      // Redis connection URL
}
```

### Frontend
```typescript
config.frontend = {
  url: string;                      // Frontend URL (default: "http://localhost:3000")
}
```

## File Structure

```
src/config/
├── README.md              # This documentation
├── config.ts             # Main configuration loader and exports
├── schema.ts             # Zod validation schemas
└── swagger.ts            # Swagger/OpenAPI configuration
```

## Files Description

### `config.ts`
The main configuration module that:
- Loads environment variables using dotenv
- Validates configuration using Zod schemas
- Exports the validated, type-safe configuration object
- Provides helper functions for environment validation

### `schema.ts`
Contains Zod validation schemas:
- `configSchema` - Basic configuration validation
- `enhancedConfigSchema` - Enhanced validation for production
- `ConfigType` - TypeScript type derived from the schema

### `swagger.ts`
Swagger/OpenAPI configuration for API documentation.

## Environment Variables

All configuration is loaded from environment variables. Here are the key variables:

### Required Variables
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/aegisx
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost:5672
JWT_SECRET=your-secret-key-change-in-production
```

### Optional Variables (with defaults)
```bash
NODE_ENV=development
PORT=3000
JWT_ISSUER=aegisx
JWT_AUDIENCE=aegisx-users
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d
PASSWORD_MIN_LENGTH=8
PASSWORD_REQUIRE_UPPERCASE=true
BCRYPT_ROUNDS=12
RATE_LIMIT_AUTH_WINDOW_MS=900000
RATE_LIMIT_AUTH_MAX_ATTEMPTS=5
FROM_EMAIL=noreply@aegisx.com
FROM_NAME=AegisX
FRONTEND_URL=http://localhost:3000
```

### Email Configuration (Optional)
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## Validation Features

### Basic Validation
- Type conversion (string to number/boolean)
- Required field validation
- Format validation (URLs, emails, durations)
- Range validation (min/max values)

### Production Validation
Enhanced validation for production environments:
- Stronger JWT secret requirements
- No localhost URLs in production
- Higher BCrypt rounds
- SMTP configuration validation

### Custom Validation Rules
- JWT duration format (e.g., "15m", "7d", "1h")
- Email format validation
- URL format validation
- Strong password requirements

## Usage Examples

### Basic Configuration Access
```typescript
import { config } from './config/config';

// Access any configuration value
const port = config.PORT;
const dbUrl = config.database.url;
const jwtSecret = config.jwt.secret;
```

### Environment Checks
```typescript
import { config } from './config/config';

if (config.isProduction) {
  console.log('Running in production mode');
}

if (config.isDevelopment) {
  console.log('Development mode - debug logging enabled');
}
```

### Validation
```typescript
import { validateEnvironment } from './config/config';

// Validate current environment
const result = validateEnvironment(process.env);
if (!result.success) {
  console.error('Configuration validation failed:', result.error);
  process.exit(1);
}
```

### Testing Configuration
```typescript
import { validateEnvironment } from './config/config';

// Test with custom environment
const testEnv = {
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://localhost:5432/test',
  REDIS_URL: 'redis://localhost:6379',
  JWT_SECRET: 'test-secret-key-that-is-long-enough'
};

const result = validateEnvironment(testEnv);
```

## Advanced Usage

### Configuration with Destructuring
```typescript
import { config } from './config/config';

// Destructure commonly used config groups
const { database, jwt, email, passwordPolicy } = config;

// Use in your application
const db = new Database(database.url, {
  min: database.poolMin,
  max: database.poolMax
});

const jwtService = new JWTService({
  secret: jwt.secret,
  expiresIn: jwt.accessTokenExpiry
});
```

### Type-Safe Configuration Access
```typescript
import { config, type ConfigType } from './config/config';

// Use type for function parameters
function createEmailService(emailConfig: ConfigType['email']) {
  return new EmailService(emailConfig.smtp, emailConfig.from);
}

// Call with type-safe config
const emailService = createEmailService(config.email);
```

## Error Handling

The configuration system provides clear error messages:

```typescript
// If JWT_SECRET is too short
ValidationError: [
  {
    "code": "too_small",
    "minimum": 32,
    "type": "string",
    "inclusive": true,
    "exact": false,
    "message": "JWT secret must be at least 32 characters long",
    "path": ["JWT_SECRET"]
  }
]
```

## Best Practices

1. **Always use the structured config**: Access `config.database.url` instead of `process.env.DATABASE_URL`
2. **Validate early**: Configuration is validated at startup to catch issues immediately
3. **Use type safety**: Let TypeScript help you with autocompletion and type checking
4. **Environment-specific validation**: The system automatically applies stricter validation in production
5. **Document custom variables**: Add new environment variables to the schema with proper validation

## Development Tools

### Configuration Demo
```bash
node scripts/demo-config.js
```

### Validation Testing
```bash
node scripts/validate-config.cjs
node scripts/test-config.cjs
```

### Type Checking
```bash
npm run type-check
```

## Contributing

When adding new configuration options:

1. Add the environment variable to `schema.ts`
2. Update the TypeScript type
3. Add validation rules (required, format, defaults)
4. Update this README with the new configuration option
5. Test the changes using scripts in the `scripts/` directory

## Troubleshooting

### Common Issues

**"Configuration validation failed"**
- Check that all required environment variables are set
- Verify variable formats (URLs, emails, etc.)
- Check minimum length requirements

**"JWT secret too short"**
- JWT_SECRET must be at least 32 characters long
- Use a strong, random secret in production

**"Invalid database URL"**
- Ensure DATABASE_URL follows PostgreSQL format: `postgresql://user:pass@host:port/db`

**"Invalid duration format"**
- JWT expiry times must be in format like "15m", "1h", "7d"

### Debug Mode

Set `NODE_ENV=development` for additional logging and less strict validation.

---

For more detailed examples and usage guides, see the [documentation](../../docs/) folder.
