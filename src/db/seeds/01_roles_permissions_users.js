const bcrypt = require('bcryptjs');

exports.seed = async function (knex) {
    // Delete all
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
    await knex('users').insert({
        username: 'admin1',
        password_hash: passwordHash,
        name: 'Admin One',
        role_id: adminRole.id,
        is_active: true
    });
};
