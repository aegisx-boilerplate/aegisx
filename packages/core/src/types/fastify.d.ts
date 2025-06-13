import '@fastify/jwt';
import { JwtPayload } from '../auth/types/jwt.types';

declare module 'fastify' {
    interface FastifyRequest {
        user?: JwtPayload;
    }

    interface FastifyInstance {
        jwt: {
            sign(payload: JwtPayload, options?: { expiresIn?: string }): Promise<string>;
            verify<T = JwtPayload>(token: string): Promise<T>;
        };
    }
} 