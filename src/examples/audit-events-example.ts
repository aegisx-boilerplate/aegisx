// Example: Using Audit Events in Core vs Feature Modules
// filepath: /Users/sathitseethaphon/projects/aegisx/src/examples/audit-events-example.ts

import { auditEvents, AuditEventBuilder } from '../core/audit/audit.events';

// ========================================
// CORE MODULES - Use Legacy Methods
// ========================================

export class CoreModuleExamples {
  // User Service Example
  static async userServiceExample(req: any) {
    // Simple user creation audit
    await auditEvents.recordUserCreated({
      actorId: req.user.id,
      userId: 'new-user-123',
      username: 'john.doe',
      email: 'john@example.com',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Using categorized syntax (new way)
    await auditEvents.user.recordUpdated({
      actorId: req.user.id,
      userId: 'user-123',
      changes: ['email', 'profile'],
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  // Auth Service Example
  static async authServiceExample(req: any) {
    // Login audit
    await auditEvents.auth.recordLogin({
      userId: 'user-123',
      success: true,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Failed login with reason
    await auditEvents.auth.recordLogin({
      userId: 'user-123',
      success: false,
      reason: 'invalid_password',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  // API Key Service Example
  static async apiKeyServiceExample(req: any) {
    await auditEvents.apiKey.recordCreated({
      actorId: req.user.id,
      keyId: 'key-456',
      name: 'Production API Key',
      scopes: ['users:read', 'users:write'],
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }

  // RBAC Service Example
  static async rbacServiceExample(req: any) {
    await auditEvents.rbac.recordRoleAssigned({
      actorId: req.user.id,
      userId: 'user-123',
      roleId: 'role-456',
      roleName: 'Manager',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }
}

// ========================================
// FEATURE MODULES - Use AuditEventBuilder
// ========================================

export class FeatureModuleExamples {
  // Budget Module Example
  static async budgetModuleExample(req: any) {
    // Simple budget creation
    await AuditEventBuilder.create()
      .actor(req.user.id)
      .action('budget.created')
      .resource('budget', 'budget-123')
      .details({
        name: 'Q1 2025 Marketing Budget',
        amount: 150000,
        currency: 'USD',
        departmentId: 'marketing',
        fiscalYear: '2025',
      })
      .metadata(req.ip, req.headers['user-agent'])
      .publish();

    // Complex budget approval workflow
    await AuditEventBuilder.create()
      .actor(req.user.id)
      .action('budget.approved')
      .resource('budget', 'budget-123')
      .details({
        previousStatus: 'pending_approval',
        newStatus: 'approved',
        approvedAmount: 150000,
        originalAmount: 175000,
        adjustmentReason: 'Reduced scope for Q1',
        approverLevel: 'director',
        approvalNotes: 'Approved with scope adjustments discussed in meeting',
        effectiveDate: '2025-01-01',
      })
      .metadata(req.ip, req.headers['user-agent'])
      .publish();
  }

  // Inventory Module Example
  static async inventoryModuleExample(req: any) {
    // Stock movement tracking
    await AuditEventBuilder.create()
      .actor(req.user.id)
      .action('inventory.stock_adjustment')
      .resource('inventory', 'item-456')
      .details({
        itemName: 'MacBook Pro 16"',
        sku: 'MBP16-256-SLV',
        previousQuantity: 25,
        newQuantity: 22,
        adjustmentType: 'damage_writeoff',
        reason: 'Water damage during inspection',
        adjustmentValue: -7500, // 3 units × $2500
        locationId: 'warehouse-main',
        categoryId: 'electronics',
        batchNumber: 'BATCH-2025-001',
      })
      .metadata(req.ip, req.headers['user-agent'])
      .publish();

    // Bulk inventory update
    await AuditEventBuilder.create()
      .actor('system')
      .action('inventory.bulk_update')
      .resource('inventory', 'bulk-operation-789')
      .details({
        operation: 'annual_audit_correction',
        affected_items: 150,
        total_value_change: -12500,
        corrections: {
          positive_adjustments: 75,
          negative_adjustments: 75,
          value_increase: 5000,
          value_decrease: 17500,
        },
        audit_period: '2024-Q4',
        auditor: req.user.id,
      })
      .metadata(req.ip, req.headers['user-agent'])
      .publish();
  }

  // Requisition Module Example
  static async requisitionModuleExample(req: any) {
    // Requisition submission
    await AuditEventBuilder.create()
      .actor(req.user.id)
      .action('requisition.submitted')
      .resource('requisition', 'req-789')
      .details({
        title: 'Office Equipment for New Hires',
        description: 'Laptops, monitors, and peripherals for 5 new developers',
        departmentId: 'engineering',
        urgency: 'medium',
        totalAmount: 25000,
        currency: 'USD',
        itemCount: 15,
        expectedDelivery: '2025-02-15',
        budgetCode: 'ENG-2025-Q1-EQUIP',
      })
      .metadata(req.ip, req.headers['user-agent'])
      .publish();

    // Complex approval workflow
    await AuditEventBuilder.create()
      .actor(req.user.id)
      .action('requisition.approved')
      .resource('requisition', 'req-789')
      .details({
        approvalLevel: 'manager',
        previousStatus: 'pending_manager_approval',
        newStatus: 'pending_finance_approval',
        approverRole: 'Engineering Manager',
        approvalComments: 'Approved for critical hiring needs',
        nextApprover: 'finance-team',
        approvalChain: ['manager', 'finance', 'procurement'],
        autoAdvanced: true,
        escalationRules: {
          amount_threshold: 20000,
          requires_finance: true,
          requires_cfo: false,
        },
      })
      .metadata(req.ip, req.headers['user-agent'])
      .publish();
  }

  // Advanced Pattern: Contextual Audit Events
  static async advancedPatternExample(req: any, context: any) {
    // Multi-step business process with context
    await AuditEventBuilder.create()
      .actor(req.user.id)
      .action('workflow.step_completed')
      .resource('workflow', context.workflowId)
      .details({
        workflowType: 'budget_planning',
        stepName: 'department_review',
        stepNumber: 3,
        totalSteps: 7,
        completionPercentage: 43,
        stepResult: 'approved',
        timeSpent: 1800, // seconds
        previousStep: 'manager_review',
        nextStep: 'finance_review',
        participants: ['dept-head', 'budget-analyst'],
        documents: ['budget-proposal.pdf', 'justification.doc'],
        compliance: {
          regulatory_check: 'passed',
          policy_violation: false,
          approval_authority: 'department_head',
        },
      })
      .metadata(req.ip, req.headers['user-agent'])
      .publish();
  }
}

// ========================================
// COMPARISON EXAMPLES
// ========================================

export class ComparisonExamples {
  // Same audit event using both approaches
  static async comparisonExample(req: any) {
    // Core Module Style (Legacy Method)
    // ✅ Simple, direct, type-safe
    await auditEvents.recordUserCreated({
      actorId: req.user.id,
      userId: 'user-123',
      username: 'john.doe',
      email: 'john@example.com',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Feature Module Style (Builder Pattern)
    // ✅ Flexible, extensible, feature-rich
    await AuditEventBuilder.create()
      .actor(req.user.id)
      .action('user.created')
      .resource('user', 'user-123')
      .details({
        username: 'john.doe',
        email: 'john@example.com',
        // Additional complex details for business logic
        onboarding_flow: 'enterprise',
        initial_roles: ['employee'],
        department_assignment: 'engineering',
        cost_center: 'ENG-001',
        manager_id: 'manager-456',
        start_date: '2025-02-01',
      })
      .metadata(req.ip, req.headers['user-agent'])
      .publish();
  }
}

// Usage in Controllers:
/*
// Core Module Controller
class UserController {
  static async createUser(req: FastifyRequest, reply: FastifyReply) {
    const user = await UserService.create(req.body);
    
    // Simple audit
    await auditEvents.recordUserCreated({
      actorId: req.user.id,
      userId: user.id,
      username: user.username,
      email: user.email,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    return user;
  }
}

// Feature Module Controller
class BudgetController {
  static async approveBudget(req: FastifyRequest, reply: FastifyReply) {
    const budget = await BudgetService.approve(req.params.id, req.body);
    
    // Complex audit
    await AuditEventBuilder.create()
      .actor(req.user.id)
      .action('budget.approved')
      .resource('budget', budget.id)
      .details({
        previousStatus: budget.previousStatus,
        newStatus: budget.status,
        amount: budget.amount,
        currency: budget.currency,
        department: budget.department,
        fiscalYear: budget.fiscalYear,
        approvalNotes: req.body.notes,
        businessJustification: req.body.justification
      })
      .metadata(req.ip, req.headers['user-agent'])
      .publish();
    
    return budget;
  }
}
*/
