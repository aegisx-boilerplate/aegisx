import { configSchema } from '../schema';

// Test just the schema without loading config
describe('Configuration Schema', () => {
    it('should be able to import schema', () => {
        expect(configSchema).toBeDefined();
    });

    it('should validate basic environment', () => {

        const testEnv = {
            NODE_ENV: 'test',
            PORT: '3001',
            DATABASE_URL: 'postgresql://localhost:5432/test',
            REDIS_URL: 'redis://localhost:6379',
            RABBITMQ_URL: 'amqp://localhost:5672',
            JWT_SECRET: 'test-secret-key-minimum-32-characters'
        };

        const result = configSchema.safeParse(testEnv);
        expect(result.success).toBe(true);
    });

    it('should fail validation for missing required variables', () => {
        const testEnv = {
            NODE_ENV: 'test'
            // Missing required variables
        };

        const result = configSchema.safeParse(testEnv);
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues.length).toBeGreaterThan(0);
        }
    });

    it('should validate PORT as number', () => {
        const testEnv = {
            NODE_ENV: 'test',
            PORT: '3001',
            DATABASE_URL: 'postgresql://localhost:5432/test',
            REDIS_URL: 'redis://localhost:6379',
            RABBITMQ_URL: 'amqp://localhost:5672',
            JWT_SECRET: 'test-secret-key-minimum-32-characters'
        };

        const result = configSchema.safeParse(testEnv);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(typeof result.data.PORT).toBe('number');
            expect(result.data.PORT).toBe(3001);
        }
    });

    it('should validate DATABASE_URL format', () => {
        const testEnv = {
            NODE_ENV: 'test',
            PORT: '3001',
            DATABASE_URL: 'invalid-url',
            REDIS_URL: 'redis://localhost:6379',
            RABBITMQ_URL: 'amqp://localhost:5672',
            JWT_SECRET: 'test-secret-key-minimum-32-characters'
        };

        const result = configSchema.safeParse(testEnv);
        expect(result.success).toBe(false);
    });
});

describe('Configuration Environment Flags', () => {
    it('should correctly identify development environment', () => {
        const testEnv = {
            NODE_ENV: 'development',
            PORT: '3001',
            DATABASE_URL: 'postgresql://localhost:5432/test',
            REDIS_URL: 'redis://localhost:6379',
            RABBITMQ_URL: 'amqp://localhost:5672',
            JWT_SECRET: 'test-secret-key-minimum-32-characters'
        };

        const result = configSchema.safeParse(testEnv);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.isDevelopment).toBe(true);
            expect(result.data.isProduction).toBe(false);
            expect(result.data.isTest).toBe(false);
        }
    });

    it('should correctly identify production environment', () => {
        const testEnv = {
            NODE_ENV: 'production',
            PORT: '3001',
            DATABASE_URL: 'postgresql://localhost:5432/test',
            REDIS_URL: 'redis://localhost:6379',
            RABBITMQ_URL: 'amqp://localhost:5672',
            JWT_SECRET: 'production-secret-key-minimum-32-characters-very-secure'
        };

        const result = configSchema.safeParse(testEnv);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.isDevelopment).toBe(false);
            expect(result.data.isProduction).toBe(true);
            expect(result.data.isTest).toBe(false);
        }
    });
});
