/**
 * Migration: Create Users Table
 */

import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('users', (table) => {
        table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
        table.string('email').unique().notNullable();
        table.string('firstName').notNullable();
        table.string('lastName').notNullable();
        table.string('passwordHash').notNullable();
        table.boolean('isActive').defaultTo(true);
        table.timestamp('lastLoginAt').nullable();
        table.timestamp('createdAt').defaultTo(knex.fn.now());
        table.timestamp('updatedAt').defaultTo(knex.fn.now());

        // Indexes
        table.index(['email']);
        table.index(['isActive']);
        table.index(['createdAt']);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('users');
} 