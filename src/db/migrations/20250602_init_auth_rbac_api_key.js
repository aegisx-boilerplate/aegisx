exports.up = async function (knex) {
    await knex.schema.createTable('roles', table => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('name').notNullable().unique();
    });

    await knex.schema.createTable('permissions', table => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('name').notNullable().unique();
    });

    await knex.schema.createTable('role_permissions', table => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('role_id').notNullable().references('id').inTable('roles').onDelete('CASCADE');
        table.uuid('permission_id').notNullable().references('id').inTable('permissions').onDelete('CASCADE');
        table.unique(['role_id', 'permission_id']);
    });

    await knex.schema.createTable('users', table => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('username').notNullable().unique();
        table.string('password_hash').notNullable();
        table.string('name');
        table.uuid('role_id').references('id').inTable('roles');
        table.boolean('is_active').notNullable().defaultTo(true);
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
        table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    });

    await knex.schema.createTable('api_keys', table => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('key').notNullable().unique();
        table.string('name').notNullable();
        table.jsonb('scopes').notNullable();
        table.jsonb('ip_whitelist');
        table.timestamp('expires_at');
        table.boolean('is_active').notNullable().defaultTo(true);
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    });

    await knex.schema.createTable('audit_logs', table => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('actor_type').notNullable();
        table.uuid('actor_id').notNullable();
        table.string('action').notNullable();
        table.string('target');
        table.string('ip_address');
        table.string('user_agent');
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    });
};

exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('audit_logs');
    await knex.schema.dropTableIfExists('api_keys');
    await knex.schema.dropTableIfExists('users');
    await knex.schema.dropTableIfExists('role_permissions');
    await knex.schema.dropTableIfExists('permissions');
    await knex.schema.dropTableIfExists('roles');
};
