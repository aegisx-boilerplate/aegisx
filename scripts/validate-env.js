#!/usr/bin/env node

/**
 * Environment Variables Validation Script
 * This script validates that all required environment variables are set correctly
 */

import fs from 'fs';
import path from 'path';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env');

  if (!fs.existsSync(envPath)) {
    log('❌ .env file not found!', colors.red);
    log('💡 Run: cp .env.example .env', colors.yellow);
    process.exit(1);
  }

  // Load .env file manually for validation
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    const cleanLine = line.trim();
    if (cleanLine && !cleanLine.startsWith('#')) {
      const [key, ...valueParts] = cleanLine.split('=');
      if (key && valueParts.length > 0) {
        envVars[key] = valueParts.join('=');
      }
    }
  });

  return envVars;
}

function validateRequired(envVars) {
  log('\n📋 Validating Required Environment Variables:', colors.bold);

  const required = [
    'NODE_ENV',
    'PORT',
    'DATABASE_URL',
    'REDIS_URL',
    'RABBITMQ_URL',
    'JWT_SECRET'
  ];

  let allValid = true;

  required.forEach(key => {
    if (envVars[key] && envVars[key].trim() !== '') {
      log(`✅ ${key}: Set`, colors.green);
    } else {
      log(`❌ ${key}: Missing or empty`, colors.red);
      allValid = false;
    }
  });

  return allValid;
}

function validateJWT(envVars) {
  log('\n🔐 Validating JWT Configuration:', colors.bold);

  let valid = true;

  // JWT Secret validation
  const jwtSecret = envVars['JWT_SECRET'];
  if (!jwtSecret) {
    log('❌ JWT_SECRET: Not set', colors.red);
    valid = false;
  } else if (jwtSecret.length < 32) {
    log(`⚠️  JWT_SECRET: Too short (${jwtSecret.length} chars, minimum 32)`, colors.yellow);
  } else if (jwtSecret === 'your-secret-key-change-in-production' ||
    jwtSecret === 'your-secret-key-change-in-production-minimum-32-characters') {
    log('⚠️  JWT_SECRET: Still using default value', colors.yellow);
  } else {
    log('✅ JWT_SECRET: Properly configured', colors.green);
  }

  // Token expiry validation
  const accessExpiry = envVars['JWT_ACCESS_TOKEN_EXPIRY'] || '15m';
  const refreshExpiry = envVars['JWT_REFRESH_TOKEN_EXPIRY'] || '7d';

  log(`✅ JWT_ACCESS_TOKEN_EXPIRY: ${accessExpiry}`, colors.green);
  log(`✅ JWT_REFRESH_TOKEN_EXPIRY: ${refreshExpiry}`, colors.green);

  return valid;
}

function validatePasswords(envVars) {
  log('\n🔒 Validating Password Configuration:', colors.bold);

  const minLength = parseInt(envVars['PASSWORD_MIN_LENGTH']) || 8;
  const bcryptRounds = parseInt(envVars['BCRYPT_ROUNDS']) || 12;

  log(`✅ Password minimum length: ${minLength}`, colors.green);

  if (bcryptRounds < 10) {
    log(`⚠️  BCRYPT_ROUNDS: ${bcryptRounds} (consider 10-15 for security)`, colors.yellow);
  } else if (bcryptRounds > 15) {
    log(`⚠️  BCRYPT_ROUNDS: ${bcryptRounds} (might be slow for performance)`, colors.yellow);
  } else {
    log(`✅ BCRYPT_ROUNDS: ${bcryptRounds} (good balance)`, colors.green);
  }

  // Password policy
  const policies = [
    'PASSWORD_REQUIRE_UPPERCASE',
    'PASSWORD_REQUIRE_LOWERCASE',
    'PASSWORD_REQUIRE_NUMBERS',
    'PASSWORD_REQUIRE_SYMBOLS'
  ];

  policies.forEach(policy => {
    const value = envVars[policy];
    if (value === 'true') {
      log(`✅ ${policy}: Enabled`, colors.green);
    } else {
      log(`⚠️  ${policy}: Disabled`, colors.yellow);
    }
  });
}

function validateDatabase(envVars) {
  log('\n🗄️ Validating Database Configuration:', colors.bold);

  const dbUrl = envVars['DATABASE_URL'];
  if (!dbUrl) {
    log('❌ DATABASE_URL: Not set', colors.red);
    return false;
  }

  try {
    const url = new URL(dbUrl);

    if (url.protocol !== 'postgres:' && url.protocol !== 'postgresql:') {
      log(`⚠️  DATABASE_URL: Protocol should be postgres:// (found: ${url.protocol})`, colors.yellow);
    } else {
      log('✅ DATABASE_URL: Protocol is correct', colors.green);
    }

    if (url.username === 'user' && url.password === 'password') {
      log('⚠️  DATABASE_URL: Using default credentials', colors.yellow);
    } else {
      log('✅ DATABASE_URL: Custom credentials configured', colors.green);
    }

    log(`✅ Database host: ${url.hostname}:${url.port}`, colors.green);
    log(`✅ Database name: ${url.pathname.substring(1)}`, colors.green);

    return true;
  } catch (error) {
    log(`❌ DATABASE_URL: Invalid format (${error.message})`, colors.red);
    return false;
  }
}

function validateEmail(envVars) {
  log('\n📧 Validating Email Configuration:', colors.bold);

  const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'EMAIL_FROM'];
  let configured = 0;

  required.forEach(key => {
    if (envVars[key] && envVars[key].trim() !== '') {
      configured++;
      log(`✅ ${key}: Set`, colors.green);
    } else {
      log(`⚠️  ${key}: Not configured`, colors.yellow);
    }
  });

  if (configured === required.length) {
    log('✅ Email service fully configured', colors.green);
  } else if (configured > 0) {
    log('⚠️  Email service partially configured', colors.yellow);
  } else {
    log('⚠️  Email service not configured (optional for development)', colors.yellow);
  }

  // Check for default values
  if (envVars['SMTP_USER'] === 'your-email@gmail.com') {
    log('⚠️  SMTP_USER: Still using example value', colors.yellow);
  }
  if (envVars['SMTP_PASS'] === 'your-app-password') {
    log('⚠️  SMTP_PASS: Still using example value', colors.yellow);
  }
}

function validateRateLimit(envVars) {
  log('\n🚦 Validating Rate Limiting Configuration:', colors.bold);

  const windowMs = parseInt(envVars['RATE_LIMIT_AUTH_WINDOW_MS']) || 900000;
  const maxAttempts = parseInt(envVars['RATE_LIMIT_AUTH_MAX_ATTEMPTS']) || 5;
  const blockDuration = parseInt(envVars['RATE_LIMIT_AUTH_BLOCK_DURATION_MS']) || 1800000;

  log(`✅ Auth window: ${windowMs / 1000 / 60} minutes`, colors.green);
  log(`✅ Max attempts: ${maxAttempts}`, colors.green);
  log(`✅ Block duration: ${blockDuration / 1000 / 60} minutes`, colors.green);

  if (maxAttempts > 10) {
    log('⚠️  Max attempts is quite high, consider reducing for security', colors.yellow);
  }
}

function validateSecurity(envVars) {
  log('\n🛡️ Security Recommendations:', colors.bold);

  const nodeEnv = envVars['NODE_ENV'];

  if (nodeEnv === 'production') {
    let securityIssues = 0;

    // Check for default values in production
    if (envVars['JWT_SECRET'] && envVars['JWT_SECRET'].includes('your-secret-key')) {
      log('🚨 CRITICAL: Using default JWT secret in production!', colors.red);
      securityIssues++;
    }

    if (envVars['DATABASE_URL'] && envVars['DATABASE_URL'].includes('user:password@localhost')) {
      log('🚨 WARNING: Using default database credentials in production!', colors.red);
      securityIssues++;
    }

    if (envVars['RABBITMQ_URL'] && envVars['RABBITMQ_URL'].includes('admin:password@localhost')) {
      log('🚨 WARNING: Using default RabbitMQ credentials in production!', colors.red);
      securityIssues++;
    }

    if (securityIssues === 0) {
      log('✅ No obvious security issues found', colors.green);
    }
  } else {
    log(`✅ Environment: ${nodeEnv} (development settings OK)`, colors.green);
  }
}

function generateSecretSuggestion() {
  log('\n🔑 JWT Secret Generation Suggestions:', colors.bold);
  log('Generate a secure JWT secret using one of these methods:', colors.blue);
  log('');
  log('Node.js:', colors.yellow);
  log('  import crypto from "crypto"; crypto.randomBytes(64).toString("hex")', colors.blue);
  log('');
  log('OpenSSL:', colors.yellow);
  log('  openssl rand -hex 64', colors.blue);
  log('');
  log('Online (use with caution):', colors.yellow);
  log('  https://generate-secret.vercel.app/64', colors.blue);
}

function main() {
  log('🔍 AegisX Environment Variables Validation', colors.bold);
  log('=========================================\n');

  const envVars = loadEnvFile();

  let allValid = true;

  allValid &= validateRequired(envVars);
  allValid &= validateJWT(envVars);
  validatePasswords(envVars);
  allValid &= validateDatabase(envVars);
  validateEmail(envVars);
  validateRateLimit(envVars);
  validateSecurity(envVars);

  log('\n' + '='.repeat(50));

  if (allValid) {
    log('\n🎉 Environment validation completed successfully!', colors.green);
    log('Your .env file is properly configured.', colors.green);
  } else {
    log('\n⚠️  Environment validation found issues!', colors.yellow);
    log('Please fix the issues above before running the application.', colors.yellow);
    generateSecretSuggestion();
  }

  log('\n💡 Quick Start Commands:', colors.bold);
  log('  npm run services:up     # Start services');
  log('  npm run db:setup        # Setup database');
  log('  npm run dev             # Start development server');
  log('  ./test-auth-manual.sh   # Test authentication');
}

// In ESM, check if this file is being run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

// ESM exports
export { loadEnvFile, validateRequired, validateJWT };
