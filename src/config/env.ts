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

  // Environment flags
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};
