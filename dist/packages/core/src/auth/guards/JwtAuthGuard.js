"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = JwtAuthGuard;
const JwtService_1 = require("../JwtService");
async function JwtAuthGuard(request, reply) {
    try {
        const token = request.headers.authorization?.split(' ')[1];
        if (!token) {
            throw new Error('No token provided');
        }
        const jwtService = new JwtService_1.JwtService(request.server, { secret: 'temp-secret' });
        const payload = await jwtService.verifyToken(token);
        // TODO: Implement proper user attachment to request
        // request.user = payload;
        // Temporary implementation - store in headers or context
    }
    catch (error) {
        await reply.code(401).send({ message: 'Invalid token' });
    }
}
//# sourceMappingURL=JwtAuthGuard.js.map