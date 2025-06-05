import {
  IEventStorageAdapter,
  MemoryStorageAdapter,
  DatabaseStorageAdapter,
  HybridStorageAdapter,
} from './event-storage.adapter';

/**
 * Storage Adapter Type
 */
export type StorageAdapterType = 'memory' | 'database' | 'hybrid';

/**
 * Storage Adapter Configuration
 */
export interface StorageAdapterConfig {
  type: StorageAdapterType;
  memory?: {
    maxSize?: number;
  };
  database?: {
    tableName?: string;
  };
  hybrid?: {
    memoryCacheSize?: number;
  };
}

/**
 * Event Storage Adapter Factory
 *
 * สร้าง storage adapter ตาม configuration ที่กำหนด
 */
export class EventStorageAdapterFactory {
  /**
   * สร้าง storage adapter จาก configuration
   */
  static create(config: StorageAdapterConfig): IEventStorageAdapter {
    switch (config.type) {
      case 'memory':
        return new MemoryStorageAdapter(config.memory?.maxSize || 1000);

      case 'database':
        return new DatabaseStorageAdapter();

      case 'hybrid':
        return new HybridStorageAdapter(config.hybrid?.memoryCacheSize || 100);

      default:
        throw new Error(`Unknown storage adapter type: ${config.type}`);
    }
  }

  /**
   * สร้าง storage adapter จาก environment variables
   */
  static createFromEnv(): IEventStorageAdapter {
    const adapterType = (process.env.EVENT_STORAGE_ADAPTER || 'hybrid') as StorageAdapterType;
    const memoryCacheSize = parseInt(process.env.EVENT_MEMORY_CACHE_SIZE || '100');
    const memoryMaxSize = parseInt(process.env.EVENT_MEMORY_MAX_SIZE || '1000');

    const config: StorageAdapterConfig = {
      type: adapterType,
      memory: {
        maxSize: memoryMaxSize,
      },
      hybrid: {
        memoryCacheSize,
      },
    };

    console.log(`🏭 Creating ${adapterType} storage adapter with config:`, config);
    return this.create(config);
  }

  /**
   * Get available adapter types
   */
  static getAvailableTypes(): StorageAdapterType[] {
    return ['memory', 'database', 'hybrid'];
  }

  /**
   * Get adapter type recommendations based on use case
   */
  static getRecommendations(): Record<string, { type: StorageAdapterType; reason: string }> {
    return {
      development: {
        type: 'memory',
        reason: 'Fast and simple for development environments',
      },
      testing: {
        type: 'memory',
        reason: 'Isolated and fast for unit tests',
      },
      staging: {
        type: 'hybrid',
        reason: 'Balance between performance and persistence',
      },
      production: {
        type: 'hybrid',
        reason: 'Optimal performance with full persistence',
      },
      'high-volume': {
        type: 'database',
        reason: 'Full persistence for high-volume event logging',
      },
      'low-latency': {
        type: 'memory',
        reason: 'Maximum performance for low-latency requirements',
      },
    };
  }
}
