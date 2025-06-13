import { FastifyInstance } from 'fastify';
export interface AppOptions {
}
export declare function app(fastify: FastifyInstance, opts: AppOptions): Promise<void>;
