exports.up = async function (knex) {
    // Add missing columns to api_keys table
    const apiKeysTableExists = await knex.schema.hasTable('api_keys');
    if (apiKeysTableExists) {
        // Check if columns already exist
        const hasUserId = await knex.schema.hasColumn('api_keys', 'user_id');
        const hasRevoked = await knex.schema.hasColumn('api_keys', 'revoked');

        await knex.schema.alterTable('api_keys', table => {
            if (!hasUserId) {
                table.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
            }
            if (!hasRevoked) {
                table.boolean('revoked').notNullable().defaultTo(false);
            }
        });

        // Update existing records to set revoked based on is_active
        await knex('api_keys').update({ revoked: knex.raw('NOT is_active') });
    }

    // Create refresh_tokens table
    const refreshTokensTableExists = await knex.schema.hasTable('refresh_tokens');
    if (!refreshTokensTableExists) {
        await knex.schema.createTable('refresh_tokens', table => {
            table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
            table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.string('token').notNullable().unique();
            table.timestamp('expires_at').notNullable();
            table.boolean('revoked').notNullable().defaultTo(false);
            table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
            table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

            // Indexes
            table.index(['user_id']);
            table.index(['token']);
            table.index(['expires_at']);
        });
    }

    // Create password_reset_tokens table
    const passwordResetTokensTableExists = await knex.schema.hasTable('password_reset_tokens');
    if (!passwordResetTokensTableExists) {
        await knex.schema.createTable('password_reset_tokens', table => {
            table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
            table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.string('token').notNullable().unique();
            table.timestamp('expires_at').notNullable();
            table.boolean('revoked').notNullable().defaultTo(false);
            table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

            // Indexes
            table.index(['user_id']);
            table.index(['token']);
            table.index(['expires_at']);
        });
    }

    // Create password_history table
    const passwordHistoryTableExists = await knex.schema.hasTable('password_history');
    if (!passwordHistoryTableExists) {
        await knex.schema.createTable('password_history', table => {
            table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
            table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
            table.string('password_hash').notNullable();
            table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

            // Indexes
            table.index(['user_id', 'created_at']);
        });
    }

    // Note: Removed first_name and last_name columns from users table
    // These will be handled by a separate profile system
};

exports.down = async function (knex) {
    // Drop tables in reverse order
    await knex.schema.dropTableIfExists('password_history');
    await knex.schema.dropTableIfExists('password_reset_tokens');
    await knex.schema.dropTableIfExists('refresh_tokens');

    // Remove added columns from api_keys
    const apiKeysTableExists = await knex.schema.hasTable('api_keys');
    if (apiKeysTableExists) {
        const hasUserId = await knex.schema.hasColumn('api_keys', 'user_id');
        const hasRevoked = await knex.schema.hasColumn('api_keys', 'revoked');

        await knex.schema.alterTable('api_keys', table => {
            if (hasUserId) {
                table.dropColumn('user_id');
            }
            if (hasRevoked) {
                table.dropColumn('revoked');
            }
        });
    }

    // Note: first_name and last_name columns are not used in this migration
};
