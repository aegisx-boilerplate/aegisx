import { FastifyRequest, FastifyReply } from 'fastify';
import { JwtService } from '../JwtService';

export async function JwtAuthGuard(
    request: FastifyRequest,
    reply: FastifyReply
): Promise<void> {
    try {
        const token = request.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new Error('No token provided');
        }

        const jwtService = new JwtService(request.server, { secret: 'temp-secret' });
        const payload = await jwtService.verifyToken(token);

        // TODO: Implement proper user attachment to request
        // request.user = payload;
        // Temporary implementation - store in headers or context
    } catch (error) {
        await reply.code(401).send({ message: 'Invalid token' });
    }
} 