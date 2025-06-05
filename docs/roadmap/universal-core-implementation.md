# Universal Core Implementation Guide for Fastify

## 🚀 Overview

คู่มือนี้อธิบายวิธีการปรับปรุง AEGISX ให้เป็น Universal Core platform ที่สามารถใช้งานได้กับระบบต่างๆ เช่น HIS, ERP โดยใช้ Fastify เป็น core framework

## 🏗️ Current System Analysis

### Strengths of Current AEGISX Architecture
```typescript
// ปัจจุบัน AEGISX มีโครงสร้างที่ดีแล้ว
✅ Event-driven architecture with RabbitMQ
✅ Comprehensive audit logging system
✅ RBAC with role and permission management
✅ API key management with scoping
✅ TypeScript with TypeBox validation
✅ Fastify with plugin system
✅ Multi-database support (PostgreSQL + Redis)
```

### Areas for Universal Core Enhancement
```typescript
🔄 Need multi-tenant architecture
🔄 Need domain-agnostic event system
🔄 Need plugin marketplace ecosystem
🔄 Need template-based project generation
🔄 Need visual workflow designer
🔄 Need advanced analytics platform
```

## 🏢 Multi-Tenant Architecture Implementation

### 1. Database Schema Enhancement
```sql
-- Add tenant isolation to all core tables
ALTER TABLE users ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE roles ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE permissions ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE api_keys ADD COLUMN tenant_id UUID REFERENCES tenants(id);
ALTER TABLE audit_logs ADD COLUMN tenant_id UUID REFERENCES tenants(id);

-- Create tenant management table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  domain VARCHAR UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}',
  subscription_plan VARCHAR DEFAULT 'basic',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create tenant-specific configurations
CREATE TABLE tenant_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id),
  module_name VARCHAR NOT NULL,
  configuration JSONB NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Fastify Multi-Tenant Plugin
```typescript
// src/plugins/multi-tenant.ts
import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

const multiTenantPlugin: FastifyPluginAsync = async (fastify) => {
  // Register tenant context decorator
  fastify.decorateRequest('tenant', null);
  
  // Add pre-handler to extract tenant from request
  fastify.addHook('preHandler', async (request) => {
    // Extract tenant from subdomain, header, or JWT
    const tenantId = extractTenantFromRequest(request);
    const tenant = await getTenantById(tenantId);
    
    if (!tenant || !tenant.is_active) {
      throw new Error('Invalid or inactive tenant');
    }
    
    request.tenant = tenant;
    
    // Set tenant context for database queries
    await fastify.knex.raw('SET LOCAL app.current_tenant_id = ?', [tenantId]);
  });
};

function extractTenantFromRequest(request: any): string {
  // Method 1: From subdomain (hospital-a.aegisx.com)
  const subdomain = request.hostname.split('.')[0];
  if (subdomain && subdomain !== 'www') {
    return subdomain;
  }
  
  // Method 2: From header
  const tenantHeader = request.headers['x-tenant-id'];
  if (tenantHeader) {
    return tenantHeader;
  }
  
  // Method 3: From JWT token
  if (request.user?.tenantId) {
    return request.user.tenantId;
  }
  
  throw new Error('Tenant not specified');
}

export default fp(multiTenantPlugin);
```

### 3. Tenant-Aware Data Access Layer
```typescript
// src/db/tenant-knex.ts
import { knex as baseKnex } from './knex';

export class TenantKnex {
  private tenantId: string;
  
  constructor(tenantId: string) {
    this.tenantId = tenantId;
  }
  
  // Override all query methods to include tenant filter
  query(tableName: string) {
    return baseKnex(tableName).where('tenant_id', this.tenantId);
  }
  
  insert(tableName: string, data: any) {
    return baseKnex(tableName).insert({
      ...data,
      tenant_id: this.tenantId
    });
  }
  
  // ... other methods with tenant isolation
}

// Usage in services
export class TenantAwareUserService extends UserService {
  private tenantKnex: TenantKnex;
  
  constructor(tenantId: string) {
    this.tenantKnex = new TenantKnex(tenantId);
  }
  
  async list() {
    return this.tenantKnex.query('users').select('*');
  }
}
```

## 🔧 Universal Plugin System

### 1. Plugin Registry and Marketplace
```typescript
// src/plugins/registry.ts
interface PluginManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  category: 'healthcare' | 'finance' | 'inventory' | 'hr' | 'custom';
  dependencies: string[];
  permissions: string[];
  routes: RouteDefinition[];
  events: EventDefinition[];
  configurations: ConfigurationSchema[];
}

class PluginRegistry {
  private plugins: Map<string, PluginManifest> = new Map();
  
  async registerPlugin(manifest: PluginManifest) {
    // Validate plugin
    await this.validatePlugin(manifest);
    
    // Register routes
    await this.registerRoutes(manifest.routes);
    
    // Register event handlers
    await this.registerEventHandlers(manifest.events);
    
    // Store in registry
    this.plugins.set(manifest.name, manifest);
  }
  
  async loadPluginsForTenant(tenantId: string) {
    const enabledPlugins = await this.getEnabledPluginsForTenant(tenantId);
    
    for (const plugin of enabledPlugins) {
      await this.loadPlugin(plugin);
    }
  }
}
```

### 2. Domain-Specific Plugin Templates
```typescript
// Healthcare Plugin Template
// src/templates/healthcare-plugin.ts
export const healthcarePluginTemplate = {
  // Patient management routes
  routes: [
    {
      method: 'GET',
      url: '/patients',
      handler: 'listPatients',
      permissions: ['patient:read']
    },
    {
      method: 'POST',
      url: '/patients',
      handler: 'createPatient',
      permissions: ['patient:create']
    }
  ],
  
  // Healthcare-specific events
  events: [
    {
      name: 'patient.admitted',
      schema: PatientAdmissionSchema,
      handlers: ['updateBedManagement', 'notifyPhysician']
    },
    {
      name: 'patient.discharged',
      schema: PatientDischargeSchema,
      handlers: ['billing', 'cleanupBed']
    }
  ],
  
  // Healthcare data models
  models: [
    {
      name: 'Patient',
      schema: PatientSchema,
      relationships: ['MedicalRecord', 'Insurance']
    }
  ]
};

// ERP Plugin Template
// src/templates/erp-plugin.ts
export const erpPluginTemplate = {
  routes: [
    {
      method: 'GET',
      url: '/purchase-orders',
      handler: 'listPurchaseOrders',
      permissions: ['purchase:read']
    }
  ],
  
  events: [
    {
      name: 'purchase.order.created',
      schema: PurchaseOrderSchema,
      handlers: ['updateInventory', 'notifySupplier']
    }
  ],
  
  models: [
    {
      name: 'PurchaseOrder',
      schema: PurchaseOrderSchema,
      relationships: ['Supplier', 'Product']
    }
  ]
};
```

## 📊 Universal Event System Enhancement

### 1. Domain-Agnostic Event Structure
```typescript
// src/events/universal-event.ts
interface UniversalEvent {
  // Core metadata
  id: string;
  version: '1.0';
  timestamp: string;
  
  // Tenant and context
  tenantId: string;
  userId?: string;
  sessionId?: string;
  
  // Domain and classification
  domain: string; // 'healthcare', 'finance', 'inventory'
  category: string; // 'patient', 'accounting', 'stock'
  action: string; // 'created', 'updated', 'approved'
  
  // Flexible payload
  payload: {
    entityType: string;
    entityId: string;
    data: Record<string, any>;
    previousData?: Record<string, any>;
  };
  
  // Routing and processing
  metadata: {
    correlationId?: string;
    causationId?: string;
    source: string;
    priority: 'high' | 'medium' | 'low';
    ttl?: number;
  };
}

class UniversalEventBus {
  async publish(event: UniversalEvent) {
    // Add event metadata
    event.id = generateEventId();
    event.timestamp = new Date().toISOString();
    
    // Route to appropriate queues based on domain and category
    const queues = this.getRoutingQueues(event);
    
    for (const queue of queues) {
      await this.publishToQueue(queue, event);
    }
    
    // Store in event store for replay
    await this.storeEvent(event);
  }
  
  private getRoutingQueues(event: UniversalEvent): string[] {
    const baseQueue = `${event.domain}.${event.category}`;
    const auditQueue = 'audit.events';
    const analyticsQueue = 'analytics.events';
    
    return [baseQueue, auditQueue, analyticsQueue];
  }
}
```

### 2. Event Analytics and Monitoring
```typescript
// src/services/event-analytics.ts
class EventAnalyticsService {
  async getEventMetrics(tenantId: string, filters: EventFilters) {
    const events = await this.queryEvents(tenantId, filters);
    
    return {
      totalEvents: events.length,
      eventsByDomain: this.groupByDomain(events),
      eventsByCategory: this.groupByCategory(events),
      eventTrends: this.calculateTrends(events),
      performance: this.calculatePerformance(events),
      anomalies: await this.detectAnomalies(events)
    };
  }
  
  async createRealTimeDashboard(tenantId: string) {
    return {
      eventStream: this.getEventStream(tenantId),
      alerts: this.getActiveAlerts(tenantId),
      systemHealth: this.getSystemHealth(tenantId),
      performance: this.getPerformanceMetrics(tenantId)
    };
  }
}
```

## 🎯 Domain-Specific Implementations

### 1. Healthcare Domain Implementation
```typescript
// src/domains/healthcare/index.ts
export const HealthcareDomain = {
  name: 'healthcare',
  
  // Core entities
  entities: [
    'Patient',
    'Provider',
    'Appointment',
    'MedicalRecord',
    'Prescription',
    'Insurance'
  ],
  
  // Standard workflows
  workflows: [
    'patient-registration',
    'appointment-scheduling',
    'clinical-documentation',
    'medication-administration',
    'billing-process'
  ],
  
  // Compliance requirements
  compliance: [
    'HIPAA',
    'HL7-FHIR',
    'HITECH',
    'Thai-PDPA'
  ],
  
  // Integration standards
  integrations: [
    'HL7-FHIR-R4',
    'DICOM',
    'HL7-v2',
    'X12-EDI'
  ]
};

// Healthcare-specific services
export class HealthcareWorkflowEngine {
  async executePatientAdmission(patientData: PatientAdmissionData) {
    // 1. Validate patient data against FHIR schema
    await this.validateFHIRCompliance(patientData);
    
    // 2. Check insurance eligibility
    const eligibility = await this.checkInsuranceEligibility(patientData.insurance);
    
    // 3. Assign bed and room
    const bedAssignment = await this.assignBed(patientData.preferences);
    
    // 4. Create medical record
    const medicalRecord = await this.createMedicalRecord(patientData);
    
    // 5. Notify care team
    await this.notifyCareTeam(patientData, bedAssignment);
    
    // 6. Publish events
    await this.publishEvent({
      domain: 'healthcare',
      category: 'patient',
      action: 'admitted',
      payload: { patientData, bedAssignment, medicalRecord }
    });
  }
}
```

### 2. ERP Domain Implementation
```typescript
// src/domains/erp/index.ts
export const ERPDomain = {
  name: 'erp',
  
  // Core modules
  modules: [
    'financial-accounting',
    'supply-chain',
    'human-resources',
    'manufacturing',
    'sales-crm'
  ],
  
  // Financial workflows
  workflows: [
    'purchase-to-pay',
    'order-to-cash',
    'record-to-report',
    'hire-to-retire'
  ],
  
  // Compliance standards
  compliance: [
    'SOX',
    'GAAP',
    'IFRS',
    'Tax-Regulations'
  ]
};

export class ERPWorkflowEngine {
  async processPurchaseOrder(poData: PurchaseOrderData) {
    // 1. Validate business rules
    await this.validatePurchaseRules(poData);
    
    // 2. Check budget availability
    const budgetCheck = await this.checkBudgetAvailability(poData);
    
    // 3. Route for approval
    const approvalWorkflow = await this.routeForApproval(poData);
    
    // 4. Update inventory projections
    await this.updateInventoryProjections(poData.items);
    
    // 5. Publish events
    await this.publishEvent({
      domain: 'erp',
      category: 'procurement',
      action: 'purchase-order-created',
      payload: { poData, budgetCheck, approvalWorkflow }
    });
  }
}
```

## 🛠️ CLI Tool for Universal Core

### 1. Project Generator
```typescript
// src/cli/generator.ts
class UniversalCoreGenerator {
  async generateProject(config: ProjectConfig) {
    const template = await this.loadTemplate(config.template);
    
    // Create base structure
    await this.createBaseStructure(config.projectName);
    
    // Install core dependencies
    await this.installCoreDependencies();
    
    // Generate domain-specific modules
    await this.generateDomainModules(template.modules);
    
    // Setup database schemas
    await this.generateDatabaseSchemas(template.entities);
    
    // Configure authentication
    await this.setupAuthentication(template.auth);
    
    // Setup event routing
    await this.setupEventRouting(template.events);
    
    console.log(`✅ Universal Core project "${config.projectName}" created successfully!`);
  }
}

// CLI commands
program
  .command('init <project-name>')
  .option('-t, --template <template>', 'Project template (healthcare, erp, retail)', 'basic')
  .option('-db, --database <db>', 'Database type (postgresql, mysql)', 'postgresql')
  .action(async (projectName, options) => {
    const generator = new UniversalCoreGenerator();
    await generator.generateProject({
      projectName,
      template: options.template,
      database: options.database
    });
  });

program
  .command('module add <module-name>')
  .option('-t, --template <template>', 'Module template')
  .action(async (moduleName, options) => {
    const moduleGenerator = new ModuleGenerator();
    await moduleGenerator.addModule(moduleName, options.template);
  });
```

### 2. Configuration Management
```typescript
// aegisx.config.ts
export interface UniversalCoreConfig {
  project: {
    name: string;
    version: string;
    description: string;
    domain: string[];
  };
  
  tenancy: {
    mode: 'single' | 'multi';
    isolation: 'schema' | 'database' | 'row-level';
  };
  
  modules: ModuleConfig[];
  
  integrations: IntegrationConfig[];
  
  compliance: ComplianceConfig[];
  
  deployment: DeploymentConfig;
}

const config: UniversalCoreConfig = {
  project: {
    name: "City Hospital HIS",
    version: "1.0.0",
    description: "Hospital Information System built on AEGISX Universal Core",
    domain: ["healthcare"]
  },
  
  tenancy: {
    mode: "multi",
    isolation: "database"
  },
  
  modules: [
    {
      name: "patient-management",
      enabled: true,
      template: "healthcare-patient",
      config: "./modules/patient/config.ts"
    },
    {
      name: "pharmacy",
      enabled: true,
      template: "healthcare-pharmacy",
      config: "./modules/pharmacy/config.ts"
    }
  ],
  
  integrations: [
    {
      type: "hl7-fhir",
      version: "R4",
      endpoint: "https://fhir.hospital.com",
      authentication: "oauth2"
    }
  ]
};
```

## 📈 Implementation Roadmap

### Phase 1: Foundation (2-3 months)
1. **Multi-tenant Architecture**
   - ✅ Database schema modification
   - ✅ Tenant isolation middleware
   - ✅ Tenant-aware services

2. **Universal Event System**
   - ✅ Domain-agnostic event structure
   - ✅ Event routing and analytics
   - ✅ Event replay and debugging

3. **Plugin Architecture**
   - ✅ Plugin registry and loader
   - ✅ Route and handler registration
   - ✅ Configuration management

### Phase 2: Domain Specialization (3-4 months)
1. **Healthcare Domain**
   - ✅ FHIR R4 compliance
   - ✅ Clinical workflows
   - ✅ Medical device integration

2. **ERP Domain**
   - ✅ Financial accounting core
   - ✅ Supply chain management
   - ✅ HR management

3. **CLI and Tooling**
   - ✅ Project generator
   - ✅ Module templates
   - ✅ Development tools

### Phase 3: Advanced Features (2-3 months)
1. **AI and Analytics**
   - ✅ ML pipeline integration
   - ✅ Predictive analytics
   - ✅ Real-time dashboards

2. **Visual Tools**
   - ✅ Workflow designer
   - ✅ Schema designer
   - ✅ Dashboard builder

3. **Marketplace**
   - ✅ Plugin marketplace
   - ✅ Template gallery
   - ✅ Integration catalog

## 🚀 Quick Start Guide

### 1. Install Universal Core CLI
```bash
npm install -g @aegisx/universal-core-cli
```

### 2. Create Healthcare Project
```bash
# Initialize HIS project
aegisx init city-hospital-his --template=healthcare

cd city-hospital-his

# Add modules
aegisx module add patient-management
aegisx module add pharmacy
aegisx module add laboratory

# Setup development environment
npm run dev:setup

# Start development server
npm run dev
```

### 3. Create ERP Project
```bash
# Initialize ERP project
aegisx init manufacturing-erp --template=erp

cd manufacturing-erp

# Add modules
aegisx module add financial-accounting
aegisx module add inventory-management
aegisx module add procurement

# Start development
npm run dev
```

---

ด้วย Universal Core concept นี้ AEGISX จะกลายเป็น platform ที่ทรงพลังสำหรับการพัฒนาระบบองค์กรแบบ full-stack โดยรองรับหลากหลาย business domain และสามารถปรับแต่งได้ตามความต้องการเฉพาะของแต่ละองค์กร
