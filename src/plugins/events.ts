import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

// Import all event plugins
import authEventsPlugin from '../core/auth/auth.events';
import apiKeyEventsPlugin from '../core/api-key/api-key.events';
import userEventsPlugin from '../core/user/user.events';
import rbacEventsPlugin from '../core/rbac/rbac.events';
// import budgetEventsPlugin from '../modules/budget/budget.events';
// import inventoryEventsPlugin from '../modules/inventory/inventory.events';
// import requisitionEventsPlugin from '../modules/requisition/requisition.events';

/**
 * Master Events Plugin
 *
 * รวมทุก event plugins ไว้ในที่เดียวเพื่อง่ายต่อการจัดการ
 * Plugin นี้จะ register ทุก event plugins ที่มีในระบบ
 *
 * Features:
 * - ลงทะเบียน event plugins ทั้งหมดในครั้งเดียว
 * - จัดการ event-driven architecture แบบ centralized
 * - ง่ายต่อการ enable/disable specific event plugins
 * - Logging สำหรับ debugging และ monitoring
 *
 * Event Plugins ที่ register:
 * - Auth Events (login/logout tracking)
 * - API Key Events (key management tracking)
 * - User Events (user management tracking)
 * - RBAC Events (role/permission tracking)
 * - Budget Events (financial tracking)
 * - Inventory Events (stock tracking)
 * - Requisition Events (workflow tracking)
 */
const masterEventsPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.log.info('[MASTER-EVENTS] Starting event plugins registration...');

  try {
    // Core module events
    await fastify.register(authEventsPlugin);
    fastify.log.info('[MASTER-EVENTS] ✓ Auth events plugin registered');

    await fastify.register(apiKeyEventsPlugin);
    fastify.log.info('[MASTER-EVENTS] ✓ API Key events plugin registered');

    await fastify.register(userEventsPlugin);
    fastify.log.info('[MASTER-EVENTS] ✓ User events plugin registered');

    await fastify.register(rbacEventsPlugin);
    fastify.log.info('[MASTER-EVENTS] ✓ RBAC events plugin registered');

    // Business module events
    // await fastify.register(budgetEventsPlugin);
    // fastify.log.info('[MASTER-EVENTS] ✓ Budget events plugin registered');

    // await fastify.register(inventoryEventsPlugin);
    // fastify.log.info('[MASTER-EVENTS] ✓ Inventory events plugin registered');

    // await fastify.register(requisitionEventsPlugin);
    // fastify.log.info('[MASTER-EVENTS] ✓ Requisition events plugin registered');

    fastify.log.info('[MASTER-EVENTS] All event plugins registered successfully! 🎉');

    // Add a route to get event system status
    fastify.get('/events/status', async () => {
      return {
        status: 'active',
        plugins: [
          'auth-events',
          'api-key-events',
          'user-events',
          'rbac-events',
          // 'budget-events',
          // 'inventory-events',
          // 'requisition-events'
        ],
        timestamp: new Date().toISOString(),
        message: 'Event-driven architecture is running',
      };
    });
  } catch (error) {
    fastify.log.error('[MASTER-EVENTS] Failed to register event plugins:', error);
    throw error;
  }
};

// Export with fastify-plugin wrapper
export default fp(masterEventsPlugin);

// Also export the function directly for backward compatibility
export { masterEventsPlugin };
