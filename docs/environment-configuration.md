# Environment Variables Configuration Guide

## Quick Setup

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Update the values in `.env` file for your environment**

## Environment Variables Reference

### 🚀 Application Settings

```bash
NODE_ENV=development          # Environment: development, production, test
PORT=3000                    # Server port (default: 3000)
```

### 🗄️ Database Configuration

```bash
DATABASE_URL=postgres://user:password@localhost:5432/aegisx
POSTGRES_USER=user           # PostgreSQL username
POSTGRES_PASSWORD=password   # PostgreSQL password
POSTGRES_DB=aegisx          # Database name
```

**Production Notes:**
- Use strong passwords for database
- Consider using connection pooling
- Enable SSL in production

### 🔴 Redis Configuration

```bash
REDIS_URL=redis://localhost:6379    # Redis connection string
```

**Production Notes:**
- Use Redis AUTH for security
- Consider Redis Cluster for high availability

### 🐰 RabbitMQ Configuration

```bash
RABBITMQ_URL=amqp://admin:password@localhost:5672
RABBITMQ_DEFAULT_USER=admin
RABBITMQ_DEFAULT_PASS=password
```

**Production Notes:**
- Change default credentials
- Enable SSL/TLS
- Use proper user permissions

### 🔐 JWT Configuration

```bash
JWT_SECRET=your-secret-key-change-in-production-minimum-32-characters
JWT_ACCESS_TOKEN_EXPIRY=15m      # Access token expiry (15 minutes)
JWT_REFRESH_TOKEN_EXPIRY=7d      # Refresh token expiry (7 days)
JWT_ISSUER=aegisx               # JWT issuer name
```

**⚠️ Security Requirements:**
- **JWT_SECRET**: Must be at least 32 characters long
- Use cryptographically strong random values
- Different secrets for different environments
- Consider rotating secrets periodically

**Expiry Format:**
- `s` = seconds (e.g., `30s`)
- `m` = minutes (e.g., `15m`)
- `h` = hours (e.g., `2h`)
- `d` = days (e.g., `7d`)

### 🔒 Password Policy

```bash
PASSWORD_MIN_LENGTH=8           # Minimum password length
PASSWORD_REQUIRE_UPPERCASE=true # Require uppercase letters
PASSWORD_REQUIRE_LOWERCASE=true # Require lowercase letters
PASSWORD_REQUIRE_NUMBERS=true   # Require numbers
PASSWORD_REQUIRE_SYMBOLS=true   # Require special characters
PASSWORD_HISTORY_COUNT=5        # Number of previous passwords to remember
PASSWORD_RESET_TOKEN_EXPIRY=1h  # Password reset token expiry
```

### 🔐 Bcrypt Configuration

```bash
BCRYPT_ROUNDS=12               # Bcrypt salt rounds (10-15 recommended)
```

**Performance vs Security:**
- `10`: Fast, moderate security
- `12`: Balanced (recommended)
- `14+`: Slow, high security

### 🚦 Rate Limiting

```bash
RATE_LIMIT_AUTH_WINDOW_MS=900000      # 15 minutes window
RATE_LIMIT_AUTH_MAX_ATTEMPTS=5        # Max login attempts
RATE_LIMIT_AUTH_BLOCK_DURATION_MS=1800000  # 30 minutes block
```

**Calculation:**
- `900000` ms = 15 minutes
- `1800000` ms = 30 minutes

### 📧 Email Configuration

```bash
SMTP_HOST=smtp.gmail.com       # SMTP server hostname
SMTP_PORT=587                  # SMTP port (587 for TLS, 465 for SSL)
SMTP_SECURE=false             # Use SSL (true for port 465)
SMTP_USER=your-email@gmail.com # SMTP username
SMTP_PASS=your-app-password    # SMTP password (app password for Gmail)
EMAIL_FROM=noreply@aegisx.com  # Default sender email
```

**Email Provider Examples:**

#### Gmail
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

#### Outlook/Hotmail
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### SendGrid
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### 🔑 API Key Configuration

```bash
API_KEY_LENGTH=32              # Length of generated API keys
API_KEY_PREFIX=ak_             # Prefix for API keys (e.g., ak_abc123...)
```

### 📊 Event Analytics

```bash
EVENT_STORAGE_ADAPTER=hybrid   # Storage adapter: memory, database, hybrid
EVENT_MEMORY_LIMIT=1000       # Max events in memory
EVENT_BATCH_SIZE=100          # Batch size for database operations
```

### 🔄 Event Bus

```bash
EVENT_BUS_EXCHANGE=aegisx_events
EVENT_BUS_EXCHANGE_TYPE=topic
EVENT_BUS_DURABLE=true
EVENT_BUS_QUEUE_PREFIX=aegisx
```

### 📝 Logging

```bash
LOG_LEVEL=debug               # Logging level: error, warn, info, debug
```

## Environment-Specific Configurations

### 🧪 Development Environment

```bash
NODE_ENV=development
LOG_LEVEL=debug
JWT_ACCESS_TOKEN_EXPIRY=1h    # Longer for development convenience
BCRYPT_ROUNDS=10              # Lower for faster development
```

### 🚀 Production Environment

```bash
NODE_ENV=production
LOG_LEVEL=warn
JWT_SECRET=<STRONG-RANDOM-SECRET-AT-LEAST-32-CHARS>
BCRYPT_ROUNDS=12
SMTP_SECURE=true
# Use production database URLs
# Enable all security features
```

### 🧪 Test Environment

```bash
NODE_ENV=test
LOG_LEVEL=error
JWT_ACCESS_TOKEN_EXPIRY=1m    # Short for testing
BCRYPT_ROUNDS=8               # Faster for tests
```

## Security Checklist

### ✅ Before Production

- [ ] Change all default passwords
- [ ] Generate strong JWT secret (32+ characters)
- [ ] Use production database credentials
- [ ] Enable SSL/TLS for all services
- [ ] Set appropriate rate limits
- [ ] Configure proper email service
- [ ] Set secure bcrypt rounds (12+)
- [ ] Use environment-specific secrets
- [ ] Enable audit logging
- [ ] Review password policies

### ⚠️ Never Do

- ❌ Commit `.env` file to git
- ❌ Use default passwords in production
- ❌ Use weak JWT secrets
- ❌ Share environment variables publicly
- ❌ Use development settings in production

## Troubleshooting

### Common Issues

1. **Server won't start:**
   - Check database connection
   - Verify Redis is running
   - Check port availability

2. **JWT errors:**
   - Ensure JWT_SECRET is set
   - Check token expiry settings
   - Verify issuer configuration

3. **Email not working:**
   - Check SMTP credentials
   - Verify email provider settings
   - Test SMTP connection

4. **Rate limiting issues:**
   - Check Redis connection
   - Verify rate limit values
   - Check time window settings

### Validation Commands

```bash
# Test database connection
npm run db:setup

# Test services
npm run services:status

# Test email configuration
# (Will be added in email testing script)

# Test authentication
./test-auth-manual.sh
```
