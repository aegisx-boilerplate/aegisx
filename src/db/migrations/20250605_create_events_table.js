exports.up = async function (knex) {
    // Check if table already exists
    const tableExists = await knex.schema.hasTable('events');

    if (!tableExists) {
        await knex.schema.createTable('events', table => {
            table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
            table.string('type').notNullable().index();
            table.string('queue').notNullable().index();
            table.uuid('user_id').nullable().references('id').inTable('users').onDelete('SET NULL');
            table.jsonb('data').nullable();
            table.timestamp('created_at').notNullable().defaultTo(knex.fn.now()).index();
            table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

            // Indexes for analytics queries
            table.index(['type', 'created_at']);
            table.index(['queue', 'created_at']);
            table.index(['user_id', 'created_at']);
            // Note: created_at index is already created above with .index()
        });
    } else {
        console.log('Events table already exists, skipping creation');

        // Check and create missing indexes if needed
        const hasTypeCreatedAtIndex = await knex.raw(`
            SELECT 1 FROM pg_indexes 
            WHERE tablename = 'events' 
            AND indexname = 'events_type_created_at_index'
        `).then(result => result.rows.length > 0);

        const hasQueueCreatedAtIndex = await knex.raw(`
            SELECT 1 FROM pg_indexes 
            WHERE tablename = 'events' 
            AND indexname = 'events_queue_created_at_index'
        `).then(result => result.rows.length > 0);

        const hasUserCreatedAtIndex = await knex.raw(`
            SELECT 1 FROM pg_indexes 
            WHERE tablename = 'events' 
            AND indexname = 'events_user_id_created_at_index'
        `).then(result => result.rows.length > 0);

        // Create missing composite indexes
        if (!hasTypeCreatedAtIndex) {
            await knex.schema.alterTable('events', table => {
                table.index(['type', 'created_at']);
            });
        }

        if (!hasQueueCreatedAtIndex) {
            await knex.schema.alterTable('events', table => {
                table.index(['queue', 'created_at']);
            });
        }

        if (!hasUserCreatedAtIndex) {
            await knex.schema.alterTable('events', table => {
                table.index(['user_id', 'created_at']);
            });
        }
    }
};

exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('events');
};
