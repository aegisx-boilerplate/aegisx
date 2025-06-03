#!/usr/bin/env node
/**
 * Module Generator Script
 * Generates a new feature module with audit integration
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting module generator...');
const moduleName = process.argv[2];
console.log('📋 Module name:', moduleName);

if (!moduleName) {
    console.error('❌ Please provide a module name');
    console.log('Usage: npm run generate:module <module-name>');
    process.exit(1);
}

console.log('✅ Module name validated');
const moduleDir = path.join(__dirname, '..', 'src', 'modules', moduleName);
console.log('📁 Target directory:', moduleDir);

// Check if module already exists
if (fs.existsSync(moduleDir)) {
    console.error(`❌ Module "${moduleName}" already exists`);
    process.exit(1);
}

console.log('✅ Module does not exist, proceeding...');

// Create module directory
fs.mkdirSync(moduleDir, { recursive: true });
console.log('📁 Created module directory');

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

console.log('📝 Creating templates...');

// Template files
const templates = {
    model: `import { Type } from '@sinclair/typebox';

export const ${capitalizeFirst(moduleName)}Model = Type.Object({
    id: Type.String({ format: 'uuid' }),
    name: Type.String({ minLength: 1, maxLength: 255 }),
    status: Type.Union([
        Type.Literal('active'),
        Type.Literal('inactive'),
        Type.Literal('pending')
    ]),
    created_at: Type.String({ format: 'date-time' }),
    updated_at: Type.String({ format: 'date-time' }),
});

export type ${capitalizeFirst(moduleName)} = typeof ${capitalizeFirst(moduleName)}Model.static;
`,

    schema: `import { Type } from '@sinclair/typebox';
import { BaseResponseSchema, PaginationSchema } from '../../schemas/base.schema';

export const Create${capitalizeFirst(moduleName)}Schema = Type.Object({
    name: Type.String({ minLength: 1, maxLength: 255 }),
    status: Type.Optional(Type.Union([
        Type.Literal('active'),
        Type.Literal('inactive'), 
        Type.Literal('pending')
    ])),
});

export const Update${capitalizeFirst(moduleName)}Schema = Type.Partial(Create${capitalizeFirst(moduleName)}Schema);

export const ${capitalizeFirst(moduleName)}ResponseSchema = BaseResponseSchema(Type.Object({
    id: Type.String({ format: 'uuid' }),
    name: Type.String(),
    status: Type.String(),
    created_at: Type.String({ format: 'date-time' }),
    updated_at: Type.String({ format: 'date-time' }),
}));

export const ${capitalizeFirst(moduleName)}ListResponseSchema = BaseResponseSchema(Type.Object({
    ${moduleName}s: Type.Array(${capitalizeFirst(moduleName)}ResponseSchema.properties.data),
    pagination: PaginationSchema,
}));
`,

    service: `import { knex } from '../../db/knex';
import { ${capitalizeFirst(moduleName)} } from './${moduleName}.model';

export class ${capitalizeFirst(moduleName)}Service {
    static async create(data) {
        const [${moduleName}] = await knex('${moduleName}s')
            .insert({
                ...data,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .returning('*');

        return ${moduleName};
    }

    static async findById(id) {
        const ${moduleName} = await knex('${moduleName}s').where({ id }).first();
        return ${moduleName} || null;
    }

    static async list(filters = {}) {
        const { status, page = 1, limit = 20 } = filters;

        let query = knex('${moduleName}s').select('*');

        if (status) {
            query = query.where('status', status);
        }

        // Get total count
        const totalQuery = query.clone();
        const [{ count }] = await totalQuery.count('* as count');
        const total = parseInt(count);

        // Apply pagination
        const offset = (page - 1) * limit;
        const ${moduleName}s = await query
            .orderBy('created_at', 'desc')
            .limit(limit)
            .offset(offset);

        return {
            ${moduleName}s,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    static async update(id, data) {
        const [${moduleName}] = await knex('${moduleName}s')
            .where({ id })
            .update({
                ...data,
                updated_at: new Date().toISOString(),
            })
            .returning('*');

        return ${moduleName} || null;
    }

    static async delete(id) {
        const deletedCount = await knex('${moduleName}s').where({ id }).del();
        return deletedCount > 0;
    }
}
`,

    events: `import { AuditEventBuilder } from '../../core/audit/audit.events';

export class ${capitalizeFirst(moduleName)}Events {
    /**
     * Record ${moduleName} creation
     */
    static async recordCreated(params) {
        const { actorId, ${moduleName}Id, ${moduleName}Data, ip, userAgent } = params;

        await AuditEventBuilder.create()
            .actor(actorId)
            .action('${moduleName}.created')
            .resource('${moduleName}', ${moduleName}Id)
            .details({
                name: ${moduleName}Data.name,
                status: ${moduleName}Data.status,
                created_at: new Date().toISOString()
            })
            .metadata(ip, userAgent)
            .publish();
    }

    /**
     * Record ${moduleName} update
     */
    static async recordUpdated(params) {
        const { actorId, ${moduleName}Id, changes, ip, userAgent } = params;

        await AuditEventBuilder.create()
            .actor(actorId)
            .action('${moduleName}.updated')
            .resource('${moduleName}', ${moduleName}Id)
            .details({
                changes,
                updated_at: new Date().toISOString()
            })
            .metadata(ip, userAgent)
            .publish();
    }

    /**
     * Record ${moduleName} deletion
     */
    static async recordDeleted(params) {
        const { actorId, ${moduleName}Id, ${moduleName}Data, ip, userAgent } = params;

        await AuditEventBuilder.create()
            .actor(actorId)
            .action('${moduleName}.deleted')
            .resource('${moduleName}', ${moduleName}Id)
            .details({
                name: ${moduleName}Data.name,
                status: ${moduleName}Data.status,
                deleted_at: new Date().toISOString()
            })
            .metadata(ip, userAgent)
            .publish();
    }
}
`,

    controller: `import { FastifyRequest, FastifyReply } from 'fastify';
import { ${capitalizeFirst(moduleName)}Service } from './${moduleName}.service';
import { ${capitalizeFirst(moduleName)}Events } from './${moduleName}.events';

export class ${capitalizeFirst(moduleName)}Controller {
    static async create(request, reply) {
        try {
            const data = request.body;
            const userId = request.user?.id;
            const ip = request.ip;
            const userAgent = request.headers['user-agent'];

            const ${moduleName} = await ${capitalizeFirst(moduleName)}Service.create(data);

            // Record audit event
            await ${capitalizeFirst(moduleName)}Events.recordCreated({
                actorId: userId,
                ${moduleName}Id: ${moduleName}.id,
                ${moduleName}Data: ${moduleName},
                ip,
                userAgent
            });

            return reply.code(201).send({
                success: true,
                message: '${capitalizeFirst(moduleName)} created successfully',
                data: ${moduleName}
            });
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({
                success: false,
                message: 'Failed to create ${moduleName}',
                error: error.message
            });
        }
    }

    static async list(request, reply) {
        try {
            const filters = request.query || {};
            const result = await ${capitalizeFirst(moduleName)}Service.list(filters);

            return reply.send({
                success: true,
                message: '${capitalizeFirst(moduleName)}s retrieved successfully',
                data: result.${moduleName}s,
                pagination: result.pagination
            });
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({
                success: false,
                message: 'Failed to retrieve ${moduleName}s',
                error: error.message
            });
        }
    }

    static async getById(request, reply) {
        try {
            const { id } = request.params;
            const ${moduleName} = await ${capitalizeFirst(moduleName)}Service.findById(id);

            if (!${moduleName}) {
                return reply.code(404).send({
                    success: false,
                    message: '${capitalizeFirst(moduleName)} not found'
                });
            }

            return reply.send({
                success: true,
                message: '${capitalizeFirst(moduleName)} retrieved successfully',
                data: ${moduleName}
            });
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({
                success: false,
                message: 'Failed to retrieve ${moduleName}',
                error: error.message
            });
        }
    }

    static async update(request, reply) {
        try {
            const { id } = request.params;
            const data = request.body;
            const userId = request.user?.id;
            const ip = request.ip;
            const userAgent = request.headers['user-agent'];

            const existing = await ${capitalizeFirst(moduleName)}Service.findById(id);
            if (!existing) {
                return reply.code(404).send({
                    success: false,
                    message: '${capitalizeFirst(moduleName)} not found'
                });
            }

            const updated = await ${capitalizeFirst(moduleName)}Service.update(id, data);

            // Record audit event
            await ${capitalizeFirst(moduleName)}Events.recordUpdated({
                actorId: userId,
                ${moduleName}Id: id,
                changes: data,
                ip,
                userAgent
            });

            return reply.send({
                success: true,
                message: '${capitalizeFirst(moduleName)} updated successfully',
                data: updated
            });
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({
                success: false,
                message: 'Failed to update ${moduleName}',
                error: error.message
            });
        }
    }

    static async delete(request, reply) {
        try {
            const { id } = request.params;
            const userId = request.user?.id;
            const ip = request.ip;
            const userAgent = request.headers['user-agent'];

            const existing = await ${capitalizeFirst(moduleName)}Service.findById(id);
            if (!existing) {
                return reply.code(404).send({
                    success: false,
                    message: '${capitalizeFirst(moduleName)} not found'
                });
            }

            const deleted = await ${capitalizeFirst(moduleName)}Service.delete(id);

            if (deleted) {
                // Record audit event
                await ${capitalizeFirst(moduleName)}Events.recordDeleted({
                    actorId: userId,
                    ${moduleName}Id: id,
                    ${moduleName}Data: existing,
                    ip,
                    userAgent
                });
            }

            return reply.send({
                success: true,
                message: '${capitalizeFirst(moduleName)} deleted successfully'
            });
        } catch (error) {
            request.log.error(error);
            return reply.code(500).send({
                success: false,
                message: 'Failed to delete ${moduleName}',
                error: error.message
            });
        }
    }
}
`,

    route: `import { FastifyInstance } from 'fastify';
import { ${capitalizeFirst(moduleName)}Controller } from './${moduleName}.controller';
import { authenticate } from '../../middlewares/authenticate';
import { authorize } from '../../middlewares/authorize';

export async function ${moduleName}Routes(fastify) {
    // Authentication middleware for all routes
    fastify.addHook('preHandler', authenticate);

    // Create ${moduleName}
    fastify.post('/', {
        preHandler: [authorize(['${moduleName}:create'])],
        handler: ${capitalizeFirst(moduleName)}Controller.create
    });

    // List ${moduleName}s
    fastify.get('/', {
        preHandler: [authorize(['${moduleName}:read'])],
        handler: ${capitalizeFirst(moduleName)}Controller.list
    });

    // Get ${moduleName} by ID
    fastify.get('/:id', {
        preHandler: [authorize(['${moduleName}:read'])],
        handler: ${capitalizeFirst(moduleName)}Controller.getById
    });

    // Update ${moduleName}
    fastify.put('/:id', {
        preHandler: [authorize(['${moduleName}:update'])],
        handler: ${capitalizeFirst(moduleName)}Controller.update
    });

    // Delete ${moduleName}
    fastify.delete('/:id', {
        preHandler: [authorize(['${moduleName}:delete'])],
        handler: ${capitalizeFirst(moduleName)}Controller.delete
    });
}
`,

    test: `import { describe, test, expect } from 'vitest';
import { ${capitalizeFirst(moduleName)}Service } from './${moduleName}.service';

describe('${capitalizeFirst(moduleName)}Service', () => {
    test('create method exists', () => {
        // Mock test - replace with actual implementation
        expect(typeof ${capitalizeFirst(moduleName)}Service.create).toBe('function');
    });

    test('findById method exists', () => {
        // Mock test - replace with actual implementation  
        expect(typeof ${capitalizeFirst(moduleName)}Service.findById).toBe('function');
    });

    test('list method exists', () => {
        // Mock test - replace with actual implementation
        expect(typeof ${capitalizeFirst(moduleName)}Service.list).toBe('function');
    });

    test('update method exists', () => {
        // Mock test - replace with actual implementation
        expect(typeof ${capitalizeFirst(moduleName)}Service.update).toBe('function');
    });

    test('delete method exists', () => {
        // Mock test - replace with actual implementation
        expect(typeof ${capitalizeFirst(moduleName)}Service.delete).toBe('function');
    });
});
`
};

console.log('📝 Templates created, writing files...');

// Create files
Object.entries(templates).forEach(([type, content]) => {
    const filename = `${moduleName}.${type}.ts`;
    console.log(`📄 Writing ${filename}...`);
    fs.writeFileSync(path.join(moduleDir, filename), content);
});

console.log(`✅ Module "${moduleName}" generated successfully!`);
console.log(`📁 Created files in: src/modules/${moduleName}/`);
console.log(`
📋 Files created:
- ${moduleName}.model.ts      - TypeBox model definitions
- ${moduleName}.schema.ts     - Request/response schemas  
- ${moduleName}.service.ts    - Business logic layer
- ${moduleName}.events.ts     - Audit event integration
- ${moduleName}.controller.ts - Request handlers
- ${moduleName}.route.ts      - API route definitions
- ${moduleName}.test.ts       - Unit tests

🚀 Next steps:
1. Create database migration for ${moduleName}s table
2. Register route in app.ts:
   import { ${moduleName}Routes } from './modules/${moduleName}/${moduleName}.route';
   app.register(${moduleName}Routes, { prefix: '/api/${moduleName}s' });
3. Add permissions to RBAC system
4. Update tests with actual database operations
`);
