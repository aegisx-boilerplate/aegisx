import amqp, { Connection, Channel, ConsumeMessage } from 'amqplib';
import { env } from '../config/env';

export interface EventHandler<T = any> {
  (data: T): Promise<void> | void;
}

export interface EventBusConfig {
  exchange?: string;
  exchangeType?: string;
  durable?: boolean;
}

class EventBus {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private config: EventBusConfig;
  private isConnected = false;

  constructor(config: EventBusConfig = {}) {
    this.config = {
      exchange: 'aegisx_events',
      exchangeType: 'topic',
      durable: true,
      ...config,
    };
  }

  /**
   * Connect to RabbitMQ
   */
  async connect(): Promise<void> {
    try {
      if (this.isConnected) {
        return;
      }

      console.log('Connecting to RabbitMQ...');
      const connection = await amqp.connect(env.RABBITMQ_URL);
      this.connection = connection as any; // Type assertion to handle amqplib type issues
      this.channel = await (this.connection as any).createChannel();

      // Create exchange
      if (this.channel && this.config.exchange && this.config.exchangeType && this.config.durable !== undefined) {
        await this.channel.assertExchange(this.config.exchange, this.config.exchangeType, {
          durable: this.config.durable,
        });
      }

      // Handle connection events
      if (this.connection) {
        this.connection.on('error', (err: Error) => {
          console.error('RabbitMQ connection error:', err);
          this.isConnected = false;
        });

        this.connection.on('close', () => {
          console.log('RabbitMQ connection closed');
          this.isConnected = false;
        });
      }

      this.isConnected = true;
      console.log('Connected to RabbitMQ successfully');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  /**
   * Disconnect from RabbitMQ
   */
  async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await (this.connection as any).close(); // Type assertion for amqplib
      }
      this.isConnected = false;
      console.log('Disconnected from RabbitMQ');
    } catch (error) {
      console.error('Error disconnecting from RabbitMQ:', error);
    }
  }

  /**
   * Ensure connection is established
   */
  private async ensureConnection(): Promise<void> {
    if (!this.isConnected || !this.channel) {
      await this.connect();
    }
  }

  /**
   * Publish an event to a queue
   * @param queue - Queue name (routing key)
   * @param data - Event data
   * @param options - Publishing options
   */
  async publishEvent<T = any>(
    queue: string,
    data: T,
    options: {
      persistent?: boolean;
      expiration?: string;
      priority?: number;
    } = {}
  ): Promise<boolean> {
    try {
      await this.ensureConnection();

      if (!this.channel) {
        throw new Error('No channel available');
      }

      const message = Buffer.from(JSON.stringify(data));
      const publishOptions = {
        persistent: options.persistent ?? true,
        timestamp: Date.now(),
        ...options,
      };

      const result = this.channel.publish(this.config.exchange!, queue, message, publishOptions);

      // console.log(`Event published to queue "${queue}":`, data);
      return result;
    } catch (error) {
      console.error(`Failed to publish event to queue "${queue}":`, error);
      throw error;
    }
  }

  /**
   * Consume events from a queue
   * @param queue - Queue name
   * @param handler - Event handler function
   * @param options - Consumer options
   */
  async consumeEvent<T = any>(
    queue: string,
    handler: EventHandler<T>,
    options: {
      durable?: boolean;
      exclusive?: boolean;
      autoDelete?: boolean;
      noAck?: boolean;
      prefetch?: number;
    } = {}
  ): Promise<void> {
    try {
      await this.ensureConnection();

      if (!this.channel) {
        throw new Error('No channel available');
      }

      // Set prefetch count for better load balancing
      if (options.prefetch) {
        await this.channel.prefetch(options.prefetch);
      }

      // Assert queue
      const queueOptions = {
        durable: options.durable ?? true,
        exclusive: options.exclusive ?? false,
        autoDelete: options.autoDelete ?? false,
      };

      await this.channel.assertQueue(queue, queueOptions);

      // Bind queue to exchange
      await this.channel.bindQueue(queue, this.config.exchange!, queue);

      // Consume messages
      await this.channel.consume(
        queue,
        async (msg: ConsumeMessage | null) => {
          if (!msg) {
            return;
          }

          try {
            const data = JSON.parse(msg.content.toString()) as T;

            await handler(data);

            // Acknowledge message if not in noAck mode
            if (!options.noAck) {
              this.channel!.ack(msg);
            }
          } catch (error) {
            console.error(`Error processing message from queue "${queue}":`, error);

            // Reject message and don't requeue to avoid infinite loops
            if (!options.noAck) {
              this.channel!.nack(msg, false, false);
            }
          }
        },
        {
          noAck: options.noAck ?? false,
        }
      );

      console.log(`Started consuming events from queue "${queue}"`);
    } catch (error) {
      console.error(`Failed to consume events from queue "${queue}":`, error);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  isConnectionOpen(): boolean {
    return this.isConnected && this.connection !== null && this.channel !== null;
  }
}

// Export singleton instance
export const eventBus = new EventBus();

// Event type definitions for type safety
export interface AuditLogEvent {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  timestamp: string;
  ip?: string;
  userAgent?: string;
}

export interface UserEvent {
  type: 'user.created' | 'user.updated' | 'user.deleted' | 'user.login' | 'user.logout';
  userId: string;
  data?: Record<string, any>;
  timestamp: string;
}

export interface ApiKeyEvent {
  type: 'api_key.created' | 'api_key.revoked' | 'api_key.used';
  apiKeyId: string;
  userId?: string;
  data?: Record<string, any>;
  timestamp: string;
}

// RBAC Events
export interface RBACEvent {
  type: 'user.role.assign' | 'user.role.revoke' | 'role.created' | 'role.updated' | 'permission.granted' | 'permission.revoked';
  userId?: string;
  roleId?: string;
  permissionId?: string;
  data?: Record<string, any>;
  timestamp: string;
}

// Queue constants
export const QUEUES = {
  AUDIT_LOG: 'audit.log',
  USER_EVENTS: 'user.events',
  API_KEY_EVENTS: 'api_key.events',
  RBAC_EVENTS: 'rbac.events',
  EMAIL_NOTIFICATIONS: 'email.notifications',
  SYSTEM_ALERTS: 'system.alerts',
} as const;

// Helper functions for common event types
export class EventPublisher {
  /**
   * Publish audit log event
   */
  static async auditLog(event: AuditLogEvent): Promise<void> {
    const fullEvent = {
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
    };
    try {
      await eventBus.publishEvent(QUEUES.AUDIT_LOG, fullEvent);
    } catch (err) {
      // Fallback: write to durable offline log
      const fs = await import('fs');
      const path = await import('path');
      const logDir = path.resolve(__dirname, '../../logs');
      const logFile = path.join(logDir, 'audit-offline.jsonl');
      try {
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
        fs.appendFileSync(logFile, JSON.stringify(fullEvent) + '\n');
        console.error('[AUDIT] RabbitMQ unavailable, event written to offline log:', logFile);
      } catch (fileErr) {
        console.error('[AUDIT] Failed to write offline audit log:', fileErr);
      }
    }
  }

  /**
   * Publish user event
   */
  static async userEvent(event: UserEvent): Promise<void> {
    await eventBus.publishEvent(QUEUES.USER_EVENTS, {
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
    });
  }

  /**
   * Publish API key event
   */
  static async apiKeyEvent(event: ApiKeyEvent): Promise<void> {
    await eventBus.publishEvent(QUEUES.API_KEY_EVENTS, {
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
    });
  }

  /**
   * Publish RBAC event
   */
  static async rbacEvent(event: RBACEvent): Promise<void> {
    await eventBus.publishEvent(QUEUES.RBAC_EVENTS, {
      ...event,
      timestamp: event.timestamp || new Date().toISOString(),
    });
  }
}

// Helper functions for common consumers
export class EventConsumer {
  /**
   * Start audit log consumer
   */
  static async startAuditLogConsumer(handler: EventHandler<AuditLogEvent>): Promise<void> {
    await eventBus.consumeEvent(QUEUES.AUDIT_LOG, handler, {
      prefetch: 10,
    });
  }

  /**
   * Start user events consumer
   */
  static async startUserEventsConsumer(handler: EventHandler<UserEvent>): Promise<void> {
    await eventBus.consumeEvent(QUEUES.USER_EVENTS, handler, {
      prefetch: 5,
    });
  }

  /**
   * Start API key events consumer
   */
  static async startApiKeyEventsConsumer(handler: EventHandler<ApiKeyEvent>): Promise<void> {
    await eventBus.consumeEvent(QUEUES.API_KEY_EVENTS, handler, {
      prefetch: 5,
    });
  }
}
