# Feature Modules

This directory is for feature modules. The boilerplate includes tools and examples to help you create your own feature modules that integrate with the audit logging system.

## Quick Start

Use the module generator script to create a new feature module:

```bash
npm run generate:module <module-name>
```

## Audit Integration

Feature modules should use the `AuditEventBuilder` pattern for complex audit scenarios:

```typescript
import { AuditLogger, AuditEventBuilder } from '../../utils/audit-logger';

// Example usage in your feature module
await AuditEventBuilder.create()
  .actor(userId)
  .action('module.action.performed')
  .resource('resource_type', resourceId)
  .details({ key: 'value' })
  .metadata(ip, userAgent)
  .publish();
```

## Examples

Check the examples directory for complete implementation patterns:
- `/src/examples/audit-events-example.ts` - Full audit integration examples
- `/docs/audit-events-usage.md` - Comprehensive usage guide

## Module Structure

Feature modules should follow this structure:
```
feature-name/
├── feature-name.controller.ts
├── feature-name.service.ts
├── feature-name.events.ts     # Audit event helpers
├── feature-name.route.ts
├── feature-name.model.ts
├── feature-name.schema.ts
└── feature-name.test.ts
```
