import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance) {
    // Test importing simple functions from @aegisx/core
    fastify.get('/test-core', async function () {
        try {
            // Import simple functions that should be available  
            const coreModule = require('@aegisx/core');

            return {
                success: true,
                message: 'Successfully imported @aegisx/core!',
                availableExports: Object.keys(coreModule),
                exportTypes: Object.keys(coreModule).reduce((acc, key) => {
                    acc[key] = typeof (coreModule as any)[key];
                    return acc;
                }, {} as any)
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to import @aegisx/core',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    });

    // Test specific simple functions
    fastify.get('/test-core/simple', async function () {
        try {
            const {
                getVersion,
                getPackageName,
                isAegisXAvailable,
                getFeatures
            } = require('@aegisx/core');

            return {
                success: true,
                message: 'Successfully called simple functions!',
                data: {
                    version: getVersion(),
                    packageName: getPackageName(),
                    isAvailable: isAegisXAvailable(),
                    features: getFeatures()
                }
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to call simple functions',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    });

    // Test createAegisXSimple function
    fastify.get('/test-core/init', async function () {
        try {
            const { createAegisXSimple } = require('@aegisx/core');

            const config = {
                database: {
                    host: 'localhost',
                    port: 5432,
                    database: 'test_db'
                },
                jwt: {
                    secret: 'test-secret-key',
                    expiresIn: '15m'
                }
            };

            await createAegisXSimple(config);

            return {
                success: true,
                message: 'AegisX Simple initialization completed successfully!',
                config: 'provided'
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed to initialize AegisX Simple',
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    });
} 