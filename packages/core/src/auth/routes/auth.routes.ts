import { FastifyInstance } from 'fastify';
// import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import AuthController, { authSchemas } from '../controllers/AuthController';
import { AuthService } from '../AuthService';

export default async function authRoutes(fastify: FastifyInstance, authService: AuthService) {
    // Register TypeBox type provider - commented out due to compatibility issues
    // fastify.withTypeProvider<TypeBoxTypeProvider>();

    // รับ authService จาก argument
    const controller = new AuthController(authService);

    fastify.post('/auth/register', {
        ...authSchemas.register,
        handler: controller.register.bind(controller)
    });

    fastify.post('/auth/login', {
        ...authSchemas.login,
        handler: controller.login.bind(controller)
    });

    fastify.post('/auth/refresh-token', {
        ...authSchemas.refreshToken,
        handler: controller.refreshToken.bind(controller)
    });

    fastify.post('/auth/logout', {
        ...authSchemas.logout,
        handler: controller.logout.bind(controller)
    });

    fastify.get('/auth/profile', {
        ...authSchemas.getProfile,
        handler: controller.getProfile.bind(controller)
    });
} 