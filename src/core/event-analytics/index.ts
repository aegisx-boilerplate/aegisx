/**
 * Events Core Module
 *
 * ระบบ Event Analytics และ Storage Adapters สำหรับ AegisX
 * ย้ายจาก utils มาเป็น core module เพื่อแสดงความสำคัญของ event system
 */

// Event Analytics Service และ Routes
export { EventAnalyticsService, registerEventAnalyticsRoutes } from './event-analytics';

// Event Storage Adapters
export {
  IEventStorageAdapter,
  MemoryStorageAdapter,
  DatabaseStorageAdapter,
  HybridStorageAdapter,
  EventData,
  TimeRangeFilter,
} from './adapters/event-storage.adapter';

// Storage Adapter Factory
export {
  EventStorageAdapterFactory,
  StorageAdapterType,
  StorageAdapterConfig,
} from './adapters/event-storage.factory';

// Event Analytics Schemas
export * from './event-analytics.schema';
