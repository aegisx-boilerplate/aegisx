# @aegisx/core

Core authentication and authorization package for AegisX.

## Installation

```bash
npm install @aegisx/core
```

## Usage

### Basic Setup

```typescript
import { FastifyInstance } from 'fastify';
import { AuthModule } from '@aegisx/core';

const app: FastifyInstance = fastify();

// Register auth module
const authModule = new AuthModule();
await authModule.registerRoutes(app);

// Start server
await app.listen({ port: 3000 });
```

### Available Endpoints

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login with email and password
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout (requires authentication)
- `GET /auth/me` - Get user profile (requires authentication)

### Environment Variables

```env
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-jwt-refresh-secret
```

## API Reference

### AuthModule

Main module for authentication.

```typescript
const authModule = new AuthModule();
await authModule.registerRoutes(fastifyInstance);
```

### AuthService

Service for handling authentication logic.

```typescript
const authService = new AuthService();
const result = await authService.login({ email, password });
```

### JwtService

Service for JWT token management.

```typescript
const jwtService = new JwtService();
const tokens = await jwtService.generateTokens(payload);
```

## License

MIT
