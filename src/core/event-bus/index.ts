// Core classes
export { EventBus } from './EventBus';
export { EventPublisher } from './EventPublisher';
export { EventConsumer } from './EventConsumer';

// Types and interfaces
export * from './types';

// Queue constants
export { QUEUES, getQueues } from './queues';
export type { QueueNames } from './queues';

// Singleton instance
import { EventBus } from './EventBus';
import { EventPublisher } from './EventPublisher';
import { EventConsumer } from './EventConsumer';

export const eventBus = new EventBus();

// Initialize publishers and consumers with the singleton instance
EventPublisher.setEventBus(eventBus);
EventConsumer.setEventBus(eventBus);
