#!/usr/bin/env node

/**
 * Configuration System Demo
 * Demonstrates the new type-safe configuration system
 */

import { config, validateEnvironment } from '../src/config/config.js';

console.log('🎯 AegisX Configuration System Demo\n');

// Demonstrate organized configuration structure
console.log('📋 Configuration Structure:');
console.log(`Environment: ${config.NODE_ENV} (${config.isDevelopment ? 'Development' : 'Production'})`);
console.log(`Server Port: ${config.PORT}`);
console.log(`Database: ${config.database.url.replace(/\/\/.*@/, '//***:***@')}`); // Hide credentials
console.log(`JWT Issuer: ${config.jwt.issuer}`);
console.log(`Password Policy: Min ${config.passwordPolicy.minLength} chars, Uppercase: ${config.passwordPolicy.requireUppercase}`);
console.log(`Rate Limiting: Auth ${config.rateLimiting.auth.maxAttempts} attempts per ${config.rateLimiting.auth.windowMs}ms`);
console.log(`Event Bus: Exchange "${config.eventBus.exchange}" (${config.eventBus.exchangeType})`);

// Demonstrate validation
console.log('\n✅ Environment Validation:');
const currentEnv = validateEnvironment(process.env);
if (currentEnv.success) {
  console.log('Current environment configuration is valid');
} else {
  console.log('❌ Current environment has validation errors:');
  currentEnv.error.issues.forEach(issue => {
    console.log(`   • ${issue.path.join('.')}: ${issue.message}`);
  });
}

// Show type safety benefits
console.log('\n🔒 Type Safety Examples:');
console.log(`PORT is ${typeof config.PORT}: ${config.PORT}`);
console.log(`PASSWORD_REQUIRE_UPPERCASE is ${typeof config.passwordPolicy.requireUppercase}: ${config.passwordPolicy.requireUppercase}`);
console.log(`BCRYPT_ROUNDS is ${typeof config.security.bcryptRounds}: ${config.security.bcryptRounds}`);

console.log('\n💡 Migration Benefits:');
console.log('• ✅ Runtime validation with clear error messages');
console.log('• ✅ Full TypeScript type safety');
console.log('• ✅ Organized configuration structure');
console.log('• ✅ Production-specific validation');
console.log('• ✅ Automatic type conversion');
console.log('• ✅ Format validation (URLs, emails, durations)');

console.log('\n📖 Next Steps:');
console.log('1. Import { config } from "./config/config.js" in your files');
console.log('2. Replace env.JWT_SECRET with config.jwt.secret');
console.log('3. Use organized groups: config.passwordPolicy, config.rateLimiting, etc.');
console.log('4. See docs/config-migration-guide.md for detailed instructions');

console.log('\n🎉 Configuration system ready for production!');
