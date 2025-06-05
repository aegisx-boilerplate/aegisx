exports.up = async function (knex) {
    // Create user_roles table for many-to-many relationship
    await knex.schema.createTable('user_roles', table => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
        table.uuid('role_id').notNullable().references('id').inTable('roles').onDelete('CASCADE');
        table.unique(['user_id', 'role_id']);
        table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    });

    // Migrate existing role_id from users table to user_roles table
    const usersWithRoles = await knex('users').where('role_id', '!=', null).select('id', 'role_id');
    
    if (usersWithRoles.length > 0) {
        const userRoleInserts = usersWithRoles.map(user => ({
            user_id: user.id,
            role_id: user.role_id
        }));
        
        await knex('user_roles').insert(userRoleInserts);
    }

    // Remove role_id column from users table since we now use user_roles
    await knex.schema.alterTable('users', table => {
        table.dropColumn('role_id');
    });
};

exports.down = async function (knex) {
    // Add role_id column back to users table
    await knex.schema.alterTable('users', table => {
        table.uuid('role_id').references('id').inTable('roles');
    });

    // Migrate data back from user_roles to users.role_id (taking the first role if multiple)
    const userRoles = await knex('user_roles').select('user_id', 'role_id');
    
    for (const userRole of userRoles) {
        await knex('users')
            .where('id', userRole.user_id)
            .update({ role_id: userRole.role_id });
    }

    // Drop user_roles table
    await knex.schema.dropTableIfExists('user_roles');
};
