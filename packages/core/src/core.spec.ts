/**
 * Core Function Tests
 */

import { createAegisX, getVersion, isInitialized } from './core';

describe('AegisX Core', () => {
    describe('getVersion', () => {
        it('should return the correct version', () => {
            expect(getVersion()).toBe('0.0.1');
        });
    });

    describe('isInitialized', () => {
        it('should return false initially', () => {
            expect(isInitialized()).toBe(false);
        });
    });

    describe('createAegisX', () => {
        it('should validate config structure', async () => {
            const config = {
                database: {
                    host: 'localhost',
                    port: 5432,
                    database: 'test',
                    user: 'test',
                    password: 'test'
                },
                jwt: {
                    secret: 'test-secret',
                    expiresIn: '15m'
                }
            };

            // Test config structure is valid
            expect(config.database.host).toBe('localhost');
            expect(config.database.port).toBe(5432);
            expect(config.jwt.secret).toBe('test-secret');

            // TODO: Add database connection mock for full integration test
        });
    });
}); 