/**
 * Circuit Breaker Implementation for Event Bus
 * Prevents cascade failures when RabbitMQ is unavailable
 */

export enum CircuitState {
    CLOSED = 'CLOSED',
    OPEN = 'OPEN',
    HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerOptions {
    threshold: number;
    timeout: number;
    monitoringPeriod: number;
}

export class CircuitBreaker {
    private state: CircuitState = CircuitState.CLOSED;
    private failures: number = 0;
    private nextAttempt: number = 0;
    private requests: number = 0;
    private monitoringStart: number = Date.now();

    constructor(private options: CircuitBreakerOptions) { }

    async call<T>(fn: () => Promise<T>): Promise<T> {
        if (this.state === CircuitState.OPEN) {
            if (Date.now() < this.nextAttempt) {
                throw new Error('Circuit breaker is OPEN');
            }
            this.state = CircuitState.HALF_OPEN;
        }

        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    private onSuccess(): void {
        this.failures = 0;
        this.state = CircuitState.CLOSED;
        this.resetMonitoring();
    }

    private onFailure(): void {
        this.failures++;
        this.requests++;

        if (this.failures >= this.options.threshold) {
            this.state = CircuitState.OPEN;
            this.nextAttempt = Date.now() + this.options.timeout;
        }
    }

    private resetMonitoring(): void {
        if (Date.now() - this.monitoringStart > this.options.monitoringPeriod) {
            this.failures = 0;
            this.requests = 0;
            this.monitoringStart = Date.now();
        }
    }

    getState(): CircuitState {
        return this.state;
    }

    getMetrics() {
        return {
            state: this.state,
            failures: this.failures,
            requests: this.requests,
            uptime: Date.now() - this.monitoringStart,
        };
    }
}
