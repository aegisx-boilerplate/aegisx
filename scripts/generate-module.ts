#!/usr/bin/env ts-node
/**
 * Module Generator Script
 * Generates a new feature module with audit integration
 */

import fs from 'fs';
import path from 'path';

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

function capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

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
    static async create(data: Partial<${capitalizeFirst(moduleName)}>): Promise<${capitalizeFirst(moduleName)}> {
        const [${moduleName}] = await knex('${moduleName}s')
            .insert({
                ...data,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .returning('*');

        return ${moduleName};
    }

    static async findById(id: string): Promise<${capitalizeFirst(moduleName)} | null> {
        const ${moduleName} = await knex('${moduleName}s').where({ id }).first();
        return ${moduleName} || null;
    }

    static async list(filters: {
        status?: string;
        page?: number;
        limit?: number;
    }) {
        const { status, page = 1, limit = 20 } = filters;

        let query = knex('${moduleName}s').select('*');

        if (status) {
            query = query.where('status', status);
        }

        // Get total count
        const totalQuery = query.clone();
        const [{ count }] = await totalQuery.count('* as count');
        const total = parseInt(count as string);

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

    static async update(id: string, data: Partial<${capitalizeFirst(moduleName)}>): Promise<${capitalizeFirst(moduleName)} | null> {
        const [${moduleName}] = await knex('${moduleName}s')
            .where({ id })
            .update({
                ...data,
                updated_at: new Date().toISOString(),
            })
            .returning('*');

        return ${moduleName} || null;
    }

    static async delete(id: string): Promise<boolean> {
        const deletedCount = await knex('${moduleName}s').where({ id }).del();
        return deletedCount > 0;
    }
}
`,

    events: `import { AuditLogger, AuditEventBuilder } from '../../utils/audit-logger';

export class ${capitalizeFirst(moduleName)}Events {
    /**
     * Record ${moduleName} creation
     */
    static async recordCreated(params: {
        actorId: string;
        ${moduleName}Id: string;
        ${moduleName}Data: Record<string, any>;
        ip?: string;
        userAgent?: string;
    }) {
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
    static async recordUpdated(params: {
        actorId: string;
        ${moduleName}Id: string;
        changes: Record<string, any>;
        ip?: string;
        userAgent?: string;
    }) {
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
    static async recordDeleted(params: {
        actorId: string;
        ${moduleName}Id: string;
        ${moduleName}Data: Record<string, any>;
        ip?: string;
        userAgent?: string;
    }) {
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
    static async create(request: FastifyRequest, reply: FastifyReply) {
        try {
            const data = request.body as any;
            const userId = (request.user as any)?.id;
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

    static async list(request: FastifyRequest, reply: FastifyReply) {
        try {
            const query = request.query as any;
            const result = await ${capitalizeFirst(moduleName)}Service.list(query);

            return reply.send({
                success: true,
                message: '${capitalizeFirst(moduleName)}s retrieved successfully',
                data: result
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

    static async getById(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as any;
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

    static async update(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as any;
            const data = request.body as any;
            const userId = (request.user as any)?.id;
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

    static async delete(request: FastifyRequest, reply: FastifyReply) {
        try {
            const { id } = request.params as any;
            const userId = (request.user as any)?.id;
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
import {
    Create${capitalizeFirst(moduleName)}Schema,
    Update${capitalizeFirst(moduleName)}Schema,
    ${capitalizeFirst(moduleName)}ResponseSchema,
    ${capitalizeFirst(moduleName)}ListResponseSchema
} from './${moduleName}.schema';

export async function ${moduleName}Routes(fastify: FastifyInstance) {
    // Create ${moduleName}
    fastify.post('/${moduleName}s', {
        preHandler: [authenticate, authorize(['${moduleName}:create'])],
        schema: {
            tags: ['${capitalizeFirst(moduleName)}s'],
            summary: 'Create a new ${moduleName}',
            body: Create${capitalizeFirst(moduleName)}Schema,
            response: {
                201: ${capitalizeFirst(moduleName)}ResponseSchema
            }
        }
    }, ${capitalizeFirst(moduleName)}Controller.create);

    // List ${moduleName}s
    fastify.get('/${moduleName}s', {
        preHandler: [authenticate, authorize(['${moduleName}:read'])],
        schema: {
            tags: ['${capitalizeFirst(moduleName)}s'],
            summary: 'List ${moduleName}s',
            response: {
                200: ${capitalizeFirst(moduleName)}ListResponseSchema
            }
        }
    }, ${capitalizeFirst(moduleName)}Controller.list);

    // Get ${moduleName} by ID
    fastify.get('/${moduleName}s/:id', {
        preHandler: [authenticate, authorize(['${moduleName}:read'])],
        schema: {
            tags: ['${capitalizeFirst(moduleName)}s'],
            summary: 'Get ${moduleName} by ID',
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' }
                },
                required: ['id']
            },
            response: {
                200: ${capitalizeFirst(moduleName)}ResponseSchema
            }
        }
    }, ${capitalizeFirst(moduleName)}Controller.getById);

    // Update ${moduleName}
    fastify.put('/${moduleName}s/:id', {
        preHandler: [authenticate, authorize(['${moduleName}:update'])],
        schema: {
            tags: ['${capitalizeFirst(moduleName)}s'],
            summary: 'Update ${moduleName}',
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' }
                },
                required: ['id']
            },
            body: Update${capitalizeFirst(moduleName)}Schema,
            response: {
                200: ${capitalizeFirst(moduleName)}ResponseSchema
            }
        }
    }, ${capitalizeFirst(moduleName)}Controller.update);

    // Delete ${moduleName}
    fastify.delete('/${moduleName}s/:id', {
        preHandler: [authenticate, authorize(['${moduleName}:delete'])],
        schema: {
            tags: ['${capitalizeFirst(moduleName)}s'],
            summary: 'Delete ${moduleName}',
            params: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' }
                },
                required: ['id']
            }
        }
    }, ${capitalizeFirst(moduleName)}Controller.delete);
}
`,

    test: `import tap from 'tap';
import { ${capitalizeFirst(moduleName)}Service } from './${moduleName}.service';

tap.test('${capitalizeFirst(moduleName)}Service', async (t) => {
    t.test('create', async (t) => {
        // Mock test - replace with actual implementation
        t.ok(typeof ${capitalizeFirst(moduleName)}Service.create === 'function', 'create method exists');
    });

    t.test('findById', async (t) => {
        // Mock test - replace with actual implementation  
        t.ok(typeof ${capitalizeFirst(moduleName)}Service.findById === 'function', 'findById method exists');
    });

    t.test('list', async (t) => {
        // Mock test - replace with actual implementation
        t.ok(typeof ${capitalizeFirst(moduleName)}Service.list === 'function', 'list method exists');
    });

    t.test('update', async (t) => {
        // Mock test - replace with actual implementation
        t.ok(typeof ${capitalizeFirst(moduleName)}Service.update === 'function', 'update method exists');
    });

    t.test('delete', async (t) => {
        // Mock test - replace with actual implementation
        t.ok(typeof ${capitalizeFirst(moduleName)}Service.delete === 'function', 'delete method exists');
    });
});
`,
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
   app.register(${moduleName}Routes);
3. Add permissions to RBAC system
4. Update tests with actual database operations
`);
