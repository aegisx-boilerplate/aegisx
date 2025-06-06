/**
 * Configuration System Validation Script
 * Validates the new environment configuration system
 */

import { envSchema, enhancedEnvSchema } from './env-schema';
import { validateEnvironment } from './config';

console.log('🧪 Testing Environment Configuration System...\n');

// Test 1: Basic validation with valid data
console.log('📋 Test 1: Basic Validation');
const validEnv = {
  NODE_ENV: 'development',
  DATABASE_URL: 'postgresql://localhost:5432/aegisx',
  REDIS_URL: 'redis://localhost:6379',
  RABBITMQ_URL: 'amqp://localhost:5672',
  JWT_SECRET: 'development-secret-key-that-is-long-enough-for-validation-requirements',
};

const result1 = validateEnvironment(validEnv);
if (result1.success) {
  console.log('✅ Basic validation passed');
  console.log(`   PORT default: ${result1.data.PORT}`);
  console.log(`   JWT_ISSUER default: ${result1.data.JWT_ISSUER}`);
} else {
  console.log('❌ Basic validation failed');
  result1.error.issues.forEach((issue) => {
    console.log(`   • ${issue.path.join('.')}: ${issue.message}`);
  });
}

// Test 2: Type conversion
console.log('\n🔄 Test 2: Type Conversion');
const envWithStrings = {
  ...validEnv,
  PORT: '8080',
  PASSWORD_MIN_LENGTH: '10',
  PASSWORD_REQUIRE_UPPERCASE: 'true',
  PASSWORD_REQUIRE_SYMBOLS: 'false',
};

const result2 = envSchema.safeParse(envWithStrings);
if (result2.success) {
  console.log('✅ Type conversion passed');
  console.log(`   PORT: ${typeof result2.data.PORT} = ${result2.data.PORT}`);
  console.log(
    `   PASSWORD_MIN_LENGTH: ${typeof result2.data.PASSWORD_MIN_LENGTH} = ${result2.data.PASSWORD_MIN_LENGTH}`
  );
  console.log(
    `   PASSWORD_REQUIRE_UPPERCASE: ${typeof result2.data.PASSWORD_REQUIRE_UPPERCASE} = ${result2.data.PASSWORD_REQUIRE_UPPERCASE}`
  );
} else {
  console.log('❌ Type conversion failed');
}

// Test 3: Validation errors
console.log('\n❌ Test 3: Validation Errors');
const invalidEnv = {
  NODE_ENV: 'invalid',
  DATABASE_URL: '', // Empty
  JWT_SECRET: 'short', // Too short
  PASSWORD_MIN_LENGTH: '4', // Too low
};

const result3 = envSchema.safeParse(invalidEnv);
if (!result3.success) {
  console.log('✅ Error handling works correctly:');
  result3.error.issues.forEach((issue) => {
    console.log(`   • ${issue.path.join('.')}: ${issue.message}`);
  });
} else {
  console.log('❌ Should have failed validation');
}

// Test 4: Production validation
console.log('\n🏭 Test 4: Production Validation');
const prodEnv = {
  NODE_ENV: 'production',
  DATABASE_URL: 'postgresql://prod-db.example.com:5432/aegisx',
  REDIS_URL: 'redis://prod-redis.example.com:6379',
  RABBITMQ_URL: 'amqp://prod-rabbit.example.com:5672',
  JWT_SECRET: 'production-secret-that-is-definitely-long-enough-and-secure',
  BCRYPT_ROUNDS: '14',
  SMTP_USER: 'noreply@company.com',
  SMTP_PASSWORD: 'secure-password',
};

const result4 = enhancedEnvSchema.safeParse(prodEnv);
if (result4.success) {
  console.log('✅ Production validation passed');
} else {
  console.log('❌ Production validation failed:');
  result4.error.issues.forEach((issue) => {
    console.log(`   • ${issue.message}`);
  });
}

// Test 5: Production validation failure
console.log('\n🚨 Test 5: Production Validation Failure');
const badProdEnv = {
  NODE_ENV: 'production',
  DATABASE_URL: 'postgresql://localhost:5432/aegisx', // localhost in prod
  REDIS_URL: 'redis://localhost:6379',
  RABBITMQ_URL: 'amqp://localhost:5672',
  JWT_SECRET: 'your-secret-key-change-in-production', // default secret
  BCRYPT_ROUNDS: '10', // too low for prod
};

const result5 = enhancedEnvSchema.safeParse(badProdEnv);
if (!result5.success) {
  console.log('✅ Production validation correctly failed:');
  result5.error.issues.forEach((issue) => {
    console.log(`   • ${issue.message}`);
  });
} else {
  console.log('❌ Should have failed production validation');
}

// Test 6: Duration and email validation
console.log('\n📧 Test 6: Format Validation');
const formatTest = {
  ...validEnv,
  JWT_ACCESS_TOKEN_EXPIRY: 'invalid-duration',
  FROM_EMAIL: 'invalid-email',
};

const result6 = envSchema.safeParse(formatTest);
if (!result6.success) {
  console.log('✅ Format validation works:');
  result6.error.issues.forEach((issue) => {
    console.log(`   • ${issue.path.join('.')}: ${issue.message}`);
  });
} else {
  console.log('❌ Should have failed format validation');
}

console.log('\n🎉 Configuration validation tests completed!');
console.log('\n💡 To use the new configuration system:');
console.log('   import { config } from "./config/config.js";');
console.log('   const { jwt, database, passwordPolicy } = config;');
