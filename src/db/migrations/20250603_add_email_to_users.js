exports.up = async function (knex) {
    await knex.schema.alterTable('users', table => {
        table.string('email').unique().nullable();
    });
};

exports.down = async function (knex) {
    await knex.schema.alterTable('users', table => {
        table.dropColumn('email');
    });
};
