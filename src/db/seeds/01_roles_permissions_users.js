const bcrypt = require('bcryptjs');

exports.seed = async function (knex) {
    // Delete all
    await knex('user_roles').del();
    await knex('users').del();
    await knex('role_permissions').del();
    await knex('permissions').del();
    await knex('roles').del();

    // Insert roles
    const [adminRole] = await knex('roles').insert([
        { name: 'ADMIN' },
        { name: 'USER' }
    ]).returning('*');

    // Insert permissions
    const permissions = [
        'user:manage',
        'inventory:create',
        'inventory:read',
        'inventory:update',
        'inventory:delete',
        'budget:read',
        'budget:update',
        'api-key:manage',
        'events:read',
        'events:export',
    ];
    const permissionRows = await knex('permissions').insert(
        permissions.map(name => ({ name }))
    ).returning('*');

    // Assign all permissions to ADMIN
    await knex('role_permissions').insert(
        permissionRows.map(p => ({ role_id: adminRole.id, permission_id: p.id }))
    );

    // Create admin user
    const passwordHash = await bcrypt.hash('admin1', 10);
    const [adminUser] = await knex('users').insert({
        username: 'admin1',
        password_hash: passwordHash,
        name: 'Admin One',
        is_active: true
    }).returning('*');

    // Assign admin role to admin user using user_roles table
    await knex('user_roles').insert({
        user_id: adminUser.id,
        role_id: adminRole.id
    });
};
