exports.up = async function (knex) {
    await knex.schema.alterTable('audit_logs', table => {
        // Add the actor column (single string instead of actor_type/actor_id)
        table.string('actor').notNullable();

        // Add the details column for storing additional information
        table.jsonb('details').nullable();

        // Drop the old columns after adding new ones
        table.dropColumn('actor_type');
        table.dropColumn('actor_id');
    });
};

exports.down = async function (knex) {
    await knex.schema.alterTable('audit_logs', table => {
        // Restore the original columns
        table.string('actor_type').notNullable();
        table.uuid('actor_id').notNullable();

        // Drop the new columns
        table.dropColumn('actor');
        table.dropColumn('details');
    });
};
