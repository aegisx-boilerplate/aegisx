#!/usr/bin/env node

/**
 * Event Bus Setup Script
 * This script helps setup RabbitMQ for development
 */

import { eventBus, QUEUES } from '../src/utils/event-bus';

async function setupEventBus() {
  try {
    console.log('🚀 Setting up Event Bus...');

    // Connect to RabbitMQ
    await eventBus.connect();
    console.log('✅ Connected to RabbitMQ');

    // Pre-create queues (optional, they'll be created automatically when used)
    const queuesToCreate = Object.values(QUEUES);

    for (const queue of queuesToCreate) {
      try {
        await eventBus.consumeEvent(queue, async () => {}, {
          durable: true,
          autoDelete: false,
        });
        console.log(`✅ Queue '${queue}' is ready`);
      } catch (error) {
        console.error(`❌ Failed to setup queue '${queue}':`, error);
      }
    }

    console.log('🎉 Event Bus setup completed!');
    console.log('\nAvailable queues:');
    queuesToCreate.forEach((queue) => {
      console.log(`  - ${queue}`);
    });

    console.log('\nRabbitMQ Management UI: http://localhost:15672');
    console.log('Default credentials: admin/password');
  } catch (error) {
    console.error('❌ Event Bus setup failed:', error);
    console.log('\n💡 Make sure RabbitMQ is running:');
    console.log(
      '   docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management'
    );
    process.exit(1);
  } finally {
    await eventBus.disconnect();
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  setupEventBus().catch(console.error);
}

export { setupEventBus };
