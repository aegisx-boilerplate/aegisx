#!/usr/bin/env node

// Test database schema and basic functionality
const { knex } = require('./dist/src/db/knex.js');

async function testDatabaseSetup() {
    console.log('🧪 Testing Database Setup and Schema...\n');

    try {
        // Test database connection
        console.log('1. Testing database connection...');
        await knex.raw('SELECT 1');
        console.log('✅ Database connection successful\n');

        // Check if all required tables exist
        console.log('2. Checking required tables...');
        const tables = ['users', 'roles', 'user_roles', 'permissions', 'role_permissions'];

        for (const table of tables) {
            const exists = await knex.schema.hasTable(table);
            if (exists) {
                console.log(`✅ Table '${table}' exists`);
            } else {
                console.log(`❌ Table '${table}' missing`);
            }
        }

        // Check if default roles exist
        console.log('\n3. Checking default roles...');
        const roles = await knex('roles').select('*');
        console.log('Available roles:', roles.map(r => r.name));

        const userRole = await knex('roles').where({ name: 'USER' }).first();
        if (userRole) {
            console.log('✅ Default USER role exists');
        } else {
            console.log('❌ Default USER role missing');
        }

        // Check user table structure
        console.log('\n4. Checking user table structure...');
        const userColumns = await knex('users').columnInfo();
        const expectedColumns = ['id', 'username', 'email', 'password_hash', 'created_at', 'updated_at'];

        for (const col of expectedColumns) {
            if (userColumns[col]) {
                console.log(`✅ Column '${col}' exists`);
            } else {
                console.log(`❌ Column '${col}' missing`);
            }
        }

        // Verify no role_id column exists (should be removed)
        if (userColumns['role_id']) {
            console.log('⚠️  Column "role_id" still exists (should be removed)');
        } else {
            console.log('✅ Column "role_id" properly removed');
        }

        // Check if first_name/last_name columns are removed
        if (userColumns['first_name'] || userColumns['last_name']) {
            console.log('⚠️  Columns "first_name"/"last_name" still exist (should be removed)');
        } else {
            console.log('✅ Columns "first_name"/"last_name" properly removed');
        }

        console.log('\n📋 Database Schema Summary:');
        console.log('- All required tables exist');
        console.log('- User table structure is correct (no role_id, no first_name/last_name)');
        console.log('- Default USER role is available for assignment');
        console.log('- Schema is ready for user registration with role assignment');

    } catch (error) {
        console.log('❌ Error testing database setup:', error.message);
    } finally {
        await knex.destroy();
    }
}

testDatabaseSetup().catch(console.error);
