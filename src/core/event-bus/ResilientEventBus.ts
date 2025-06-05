/**
 * Enhanced Event Bus with Error Handling and Circuit Breaker
 * Improved version of EventBus.ts with reliability features
 */

import { EventBus as BaseEventBus } from './EventBus';
import { CircuitBreaker, CircuitState } from './circuit-breaker';
import { EventBusConfig as ResilientEventBusConfig, getEventBusConfig } from './config';
import { EventBusConfig } from './types';

// Use console.log for now instead of the logger import to avoid import issues
const logger = {
    warn: (message: string, context?: any) => console.log(`[WARN] ${message}`, context || ''),
    error: (message: string, context?: any) => console.log(`[ERROR] ${message}`, context || ''),
    debug: (message: string, context?: any) => console.log(`[DEBUG] ${message}`, context || ''),
    info: (message: string, context?: any) => console.log(`[INFO] ${message}`, context || ''),
};

export class ResilientEventBus extends BaseEventBus {
    private circuitBreaker: CircuitBreaker | null = null;
    private resilientConfig: ResilientEventBusConfig;
    private offlineBuffer: Array<{ queue: string; event: any }> = [];
    private maxOfflineBuffer = 1000;

    constructor(config?: EventBusConfig) {
        super(config);
        this.resilientConfig = getEventBusConfig();

        if (this.resilientConfig.circuitBreaker.enabled) {
            this.circuitBreaker = new CircuitBreaker({
                threshold: this.resilientConfig.circuitBreaker.threshold,
                timeout: this.resilientConfig.circuitBreaker.timeout,
                monitoringPeriod: this.resilientConfig.circuitBreaker.monitoringPeriod,
            });
        }
    }

    async publishEvent<T = any>(
        queue: string,
        data: T,
        options: {
            persistent?: boolean;
            expiration?: string;
            priority?: number;
        } = {}
    ): Promise<boolean> {
        if (this.circuitBreaker && this.circuitBreaker.getState() === CircuitState.OPEN) {
            logger.warn('Circuit breaker is OPEN, buffering event offline', {
                queue,
                eventType: (data as any)?.type,
                circuitState: this.circuitBreaker.getState(),
            });

            this.bufferEventOffline(queue, data);
            return false;
        }

        try {
            const publishOperation = () => this.publishWithRetry(queue, data, options);

            let result: boolean;
            if (this.circuitBreaker) {
                result = await this.circuitBreaker.call(publishOperation);
            } else {
                result = await publishOperation();
            }

            // If successful and we have buffered events, try to flush them
            if (result && this.offlineBuffer.length > 0) {
                this.flushOfflineBuffer();
            }

            return result;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error('Failed to publish event after all retries', {
                queue,
                eventType: (data as any)?.type,
                error: errorMessage,
                circuitState: this.circuitBreaker?.getState(),
            });

            // Buffer event if circuit breaker is not open
            if (!this.circuitBreaker || this.circuitBreaker.getState() !== CircuitState.OPEN) {
                this.bufferEventOffline(queue, data);
            }

            return false;
        }
    }

    private async publishWithRetry<T = any>(
        queue: string,
        data: T,
        options: {
            persistent?: boolean;
            expiration?: string;
            priority?: number;
        } = {}
    ): Promise<boolean> {
        const { retryAttempts, retryDelay, timeout } = this.resilientConfig.publishing;

        for (let attempt = 1; attempt <= retryAttempts; attempt++) {
            try {
                // Add timeout to prevent hanging
                const publishPromise = super.publishEvent(queue, data, options);
                const timeoutPromise = new Promise<boolean>((_, reject) =>
                    setTimeout(() => reject(new Error('Publish timeout')), timeout)
                );

                const result = await Promise.race([publishPromise, timeoutPromise]);

                logger.debug('Event published successfully', {
                    queue,
                    eventType: (data as any)?.type,
                    attempt,
                });

                return result;

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                logger.warn(`Publish attempt ${attempt} failed`, {
                    queue,
                    eventType: (data as any)?.type,
                    attempt,
                    maxAttempts: retryAttempts,
                    error: errorMessage,
                });

                if (attempt === retryAttempts) {
                    throw error;
                }

                // Exponential backoff delay
                const delay = retryDelay * Math.pow(2, attempt - 1);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        return false;
    }

    private bufferEventOffline<T = any>(queue: string, event: T): void {
        if (this.offlineBuffer.length >= this.maxOfflineBuffer) {
            // Remove oldest event if buffer is full
            this.offlineBuffer.shift();
            logger.warn('Offline buffer full, removed oldest event', {
                bufferSize: this.offlineBuffer.length,
                maxSize: this.maxOfflineBuffer,
            });
        }

        this.offlineBuffer.push({ queue, event });
        logger.debug('Event buffered offline', {
            queue,
            eventType: (event as any)?.type,
            bufferSize: this.offlineBuffer.length,
        });
    }

    private async flushOfflineBuffer(): Promise<void> {
        if (this.offlineBuffer.length === 0) {
            return;
        }

        logger.info('Attempting to flush offline buffer', {
            bufferSize: this.offlineBuffer.length,
        });

        const eventsToFlush = [...this.offlineBuffer];
        this.offlineBuffer = [];

        for (const { queue, event } of eventsToFlush) {
            try {
                await super.publishEvent(queue, event);
                logger.debug('Buffered event flushed successfully', {
                    queue,
                    eventType: event?.type,
                });
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                logger.error('Failed to flush buffered event', {
                    queue,
                    eventType: event?.type,
                    error: errorMessage,
                });

                // Re-buffer the failed event
                this.bufferEventOffline(queue, event);
            }
        }
    }

    async checkConnection(): Promise<boolean> {
        try {
            await this.connect();
            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error('Connection check failed', { error: errorMessage });
            return false;
        }
    }

    async healthCheck(): Promise<{
        connected: boolean;
        circuitState?: CircuitState;
        bufferedEvents: number;
        metrics?: any;
    }> {
        try {
            const connected = await this.checkConnection();

            return {
                connected,
                circuitState: this.circuitBreaker?.getState(),
                bufferedEvents: this.offlineBuffer.length,
                metrics: this.circuitBreaker?.getMetrics(),
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            logger.error('Health check failed', { error: errorMessage });
            return {
                connected: false,
                circuitState: this.circuitBreaker?.getState(),
                bufferedEvents: this.offlineBuffer.length,
                metrics: this.circuitBreaker?.getMetrics(),
            };
        }
    }

    getMetrics() {
        return {
            circuitBreakerState: this.circuitBreaker?.getState() || 'DISABLED',
            offlineBufferSize: this.offlineBuffer.length,
            maxOfflineBuffer: this.maxOfflineBuffer,
        };
    }

    getCircuitBreakerState(): CircuitState | null {
        return this.circuitBreaker?.getState() || null;
    }

    resetCircuitBreaker(): void {
        if (this.circuitBreaker) {
            // CircuitBreaker resets automatically when timeout expires
            logger.info('Circuit breaker state checked', {
                state: this.circuitBreaker.getState(),
                metrics: this.circuitBreaker.getMetrics(),
            });
        }
    }
}
