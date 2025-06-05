/**
 * Event Bus Configuration
 * Centralized configuration for event publishing, consumption, and error handling
 */

export interface EventBusConfig {
    // RabbitMQ Connection
    connection: {
        url: string;
        retryAttempts: number;
        retryDelay: number;
    };

    // Publishing Options
    publishing: {
        persistent: boolean;
        mandatory: boolean;
        deliveryMode: number;
        retryAttempts: number;
        retryDelay: number;
        timeout: number;
    };

    // Consumer Options
    consumption: {
        prefetch: number;
        noAck: boolean;
        retryAttempts: number;
        retryDelay: number;
    };

    // Dead Letter Queue
    deadLetter: {
        enabled: boolean;
        exchange: string;
        routingKey: string;
        ttl: number; // milliseconds
    };

    // Circuit Breaker
    circuitBreaker: {
        enabled: boolean;
        threshold: number; // failure threshold
        timeout: number; // reset timeout in ms
        monitoringPeriod: number; // monitoring window in ms
    };
}

export const defaultEventBusConfig: EventBusConfig = {
    connection: {
        url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
        retryAttempts: 5,
        retryDelay: 2000, // 2 seconds
    },

    publishing: {
        persistent: true,
        mandatory: true,
        deliveryMode: 2, // persistent messages
        retryAttempts: 3,
        retryDelay: 1000, // 1 second
        timeout: 5000, // 5 seconds
    },

    consumption: {
        prefetch: 10,
        noAck: false,
        retryAttempts: 3,
        retryDelay: 2000, // 2 seconds
    },

    deadLetter: {
        enabled: true,
        exchange: 'dlx.events',
        routingKey: 'dead-letter',
        ttl: 24 * 60 * 60 * 1000, // 24 hours
    },

    circuitBreaker: {
        enabled: true,
        threshold: 5,
        timeout: 30000, // 30 seconds
        monitoringPeriod: 60000, // 1 minute
    },
};

export const getEventBusConfig = (): EventBusConfig => {
    return {
        ...defaultEventBusConfig,
        connection: {
            ...defaultEventBusConfig.connection,
            url: process.env.RABBITMQ_URL || defaultEventBusConfig.connection.url,
        },
    };
};
