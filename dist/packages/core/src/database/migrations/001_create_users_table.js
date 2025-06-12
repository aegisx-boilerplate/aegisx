"use strict";
/**
 * Migration: Create Users Table
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
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
async function down(knex) {
    return knex.schema.dropTable('users');
}
