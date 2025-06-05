import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 3000,
  DATABASE_URL: process.env.DATABASE_URL || '',
  REDIS_URL: process.env.REDIS_URL || '',
  RABBITMQ_URL: process.env.RABBITMQ_URL || 'amqp://localhost',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-here',

  // Event Bus Configuration
  EVENT_BUS_EXCHANGE: process.env.EVENT_BUS_EXCHANGE || 'aegisx_events',
  EVENT_BUS_EXCHANGE_TYPE: process.env.EVENT_BUS_EXCHANGE_TYPE || 'topic',
  EVENT_BUS_DURABLE: process.env.EVENT_BUS_DURABLE || 'true',
  EVENT_BUS_QUEUE_PREFIX: process.env.EVENT_BUS_QUEUE_PREFIX || 'aegisx',

  // Environment flags
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};
