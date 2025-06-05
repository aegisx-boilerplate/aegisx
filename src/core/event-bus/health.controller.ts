/**
 * Event Bus Health Controller
 * REST API endpoints for monitoring Event Bus health
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { healthMonitor } from '../event-bus';

// Use console.log for now instead of the logger import to avoid import issues
const logger = {
    warn: (message: string, context?: any) => console.log(`[WARN] ${message}`, context || ''),
    error: (message: string, context?: any) => console.log(`[ERROR] ${message}`, context || ''),
    debug: (message: string, context?: any) => console.log(`[DEBUG] ${message}`, context || ''),
    info: (message: string, context?: any) => console.log(`[INFO] ${message}`, context || ''),
};

export async function eventBusHealthRoutes(fastify: FastifyInstance) {
    // Health check endpoint
    fastify.get('/health/event-bus', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const healthSummary = await healthMonitor.getHealthSummary();
            const statusCode = healthSummary.status === 'healthy' ? 200 : 503;

            reply.code(statusCode).send({
                success: true,
                data: healthSummary,
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error('Health check endpoint failed', { error: errorMessage });

            reply.code(503).send({
                success: false,
                error: 'Health check failed',
                message: errorMessage,
            });
        }
    });

    // Detailed metrics endpoint
    fastify.get('/health/event-bus/metrics', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const currentHealth = await healthMonitor.getCurrentHealth();
            const metricsHistory = healthMonitor.getMetricsHistory();

            reply.send({
                success: true,
                data: {
                    current: currentHealth,
                    history: metricsHistory,
                },
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error('Metrics endpoint failed', { error: errorMessage });

            reply.code(500).send({
                success: false,
                error: 'Failed to retrieve metrics',
                message: errorMessage,
            });
        }
    });

    // Circuit breaker status
    fastify.get('/health/event-bus/circuit-breaker', async (request: FastifyRequest, reply: FastifyReply) => {
        try {
            const currentHealth = await healthMonitor.getCurrentHealth();

            reply.send({
                success: true,
                data: {
                    state: currentHealth.eventBus.circuitState,
                    bufferedEvents: currentHealth.eventBus.bufferedEvents,
                    uptime: currentHealth.eventBus.uptime,
                },
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error('Circuit breaker status endpoint failed', { error: errorMessage });

            reply.code(500).send({
                success: false,
                error: 'Failed to retrieve circuit breaker status',
                message: errorMessage,
            });
        }
    });
}
