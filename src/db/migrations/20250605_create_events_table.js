exports.up = async function (knex) {
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
        table.index(['created_at']);
    });
};

exports.down = async function (knex) {
    await knex.schema.dropTableIfExists('events');
};
