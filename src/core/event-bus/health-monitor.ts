/**
 * Event Bus Health Monitor
 * Monitor and report Event Bus system health
 */

import { ResilientEventBus } from './ResilientEventBus';
import { CircuitState } from './circuit-breaker';

// Use console.log for now instead of the logger import to avoid import issues
const logger = {
    warn: (message: string, context?: any) => console.log(`[WARN] ${message}`, context || ''),
    error: (message: string, context?: any) => console.log(`[ERROR] ${message}`, context || ''),
    debug: (message: string, context?: any) => console.log(`[DEBUG] ${message}`, context || ''),
    info: (message: string, context?: any) => console.log(`[INFO] ${message}`, context || ''),
};

export interface HealthMetrics {
    timestamp: string;
    eventBus: {
        connected: boolean;
        circuitState?: CircuitState;
        bufferedEvents: number;
        uptime: number;
    };
    queues: {
        [queueName: string]: {
            consumers: number;
            messages: number;
            publishRate: number;
            consumeRate: number;
        };
    };
    system: {
        memoryUsage: NodeJS.MemoryUsage;
        uptime: number;
    };
}

export class EventBusHealthMonitor {
    private eventBus: ResilientEventBus;
    private startTime: number;
    private metrics: HealthMetrics[] = [];
    private maxMetricsHistory = 100;

    constructor(eventBus: ResilientEventBus) {
        this.eventBus = eventBus;
        this.startTime = Date.now();
    }

    async getCurrentHealth(): Promise<HealthMetrics> {
        const eventBusHealth = await this.eventBus.healthCheck();

        const metrics: HealthMetrics = {
            timestamp: new Date().toISOString(),
            eventBus: {
                connected: eventBusHealth.connected,
                circuitState: eventBusHealth.circuitState,
                bufferedEvents: eventBusHealth.bufferedEvents,
                uptime: Date.now() - this.startTime,
            },
            queues: {
                // TODO: Implement queue-specific metrics
                'user.events': {
                    consumers: 0,
                    messages: 0,
                    publishRate: 0,
                    consumeRate: 0,
                },
                'audit.log': {
                    consumers: 0,
                    messages: 0,
                    publishRate: 0,
                    consumeRate: 0,
                },
            },
            system: {
                memoryUsage: process.memoryUsage(),
                uptime: process.uptime(),
            },
        };

        // Store metrics history
        this.metrics.push(metrics);
        if (this.metrics.length > this.maxMetricsHistory) {
            this.metrics.shift();
        }

        // Log critical issues
        if (!metrics.eventBus.connected) {
            logger.error('Event Bus connection lost', metrics.eventBus);
        }

        if (metrics.eventBus.bufferedEvents > 100) {
            logger.warn('High number of buffered events', {
                bufferedEvents: metrics.eventBus.bufferedEvents,
            });
        }

        return metrics;
    }

    getMetricsHistory(): HealthMetrics[] {
        return [...this.metrics];
    }

    startPeriodicHealthCheck(intervalMs: number = 30000): NodeJS.Timeout {
        return setInterval(async () => {
            try {
                await this.getCurrentHealth();
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                logger.error('Health check failed', { error: errorMessage });
            }
        }, intervalMs);
    }

    // Health check endpoint data
    async getHealthSummary() {
        const current = await this.getCurrentHealth();
        const history = this.metrics.slice(-10); // Last 10 metrics

        return {
            status: current.eventBus.connected ? 'healthy' : 'unhealthy',
            current,
            trends: {
                avgBufferedEvents: history.reduce((sum, m) => sum + m.eventBus.bufferedEvents, 0) / history.length,
                connectionUptime: current.eventBus.uptime,
                systemUptime: current.system.uptime,
            },
        };
    }
}
