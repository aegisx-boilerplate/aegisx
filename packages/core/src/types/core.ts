/**
 * Core Types
 * 
 * Basic type definitions used throughout AegisX.
 */

export type ID = string | number;

export interface BaseEntity {
    id: ID;
    createdAt: Date;
    updatedAt: Date;
}

export interface PaginationOptions {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// TODO: Add more core types as needed 