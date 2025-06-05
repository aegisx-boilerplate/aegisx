// Core classes
export { EventBus } from './EventBus';
export { EventPublisher } from './EventPublisher';
export { EventConsumer } from './EventConsumer';
export { ResilientEventBus } from './ResilientEventBus';
export { CircuitBreaker, CircuitState } from './circuit-breaker';
export { EventBusHealthMonitor } from './health-monitor';
export { getEventBusConfig, defaultEventBusConfig } from './config';

// Types and interfaces
export * from './types';

// Queue constants
export { QUEUES, getQueues } from './queues';
export type { QueueNames } from './queues';

// Enhanced singleton instance with resilience features
import { ResilientEventBus } from './ResilientEventBus';
import { EventPublisher } from './EventPublisher';
import { EventConsumer } from './EventConsumer';
import { EventBusHealthMonitor } from './health-monitor';

export const eventBus = new ResilientEventBus();
export const healthMonitor = new EventBusHealthMonitor(eventBus);

// Initialize publishers and consumers with the singleton instance
EventPublisher.setEventBus(eventBus);
EventConsumer.setEventBus(eventBus);
