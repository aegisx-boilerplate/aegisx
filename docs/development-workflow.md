# Development Workflow Guide

## 🚀 Quick Start

### First Time Setup
```bash
npm run dev:full
```
This single command will:
- Start Docker services (PostgreSQL, Redis, RabbitMQ)
- Wait for services to be healthy
- Run database migrations and seeds
- Start the development server with hot reload

### Daily Development
Once services are running, you can just start the dev server:
```bash
npm run dev
```

## 📋 Available Scripts

### Development Scripts
- `npm run dev:setup` - Setup services and database only (no dev server)
- `npm run dev:full` - Full setup + start dev server
- `npm run dev` - Start development server only (requires services to be running)

### Database Scripts
- `npm run db:setup` - Build + run migrations + seeds
- `npm run knex:migrate` - Run database migrations
- `npm run knex:seed` - Run database seeds

### Service Management
- `npm run setup:local` - Start Docker services
- `npm run stop:local` - Stop Docker services

### Testing & Validation
- `npm run test:events` - Test event system status
- `npm run check` - Run linting, type-checking, and build

## 🔧 Environment Configuration

### Database Connection
The project uses PostgreSQL with the following configuration:
- Host: `localhost:5432`
- Database: `aegisx`
- User: `user`
- Password: `password`

### Redis Configuration
- URL: `redis://localhost:6379`

### RabbitMQ Configuration
- URL: `amqp://admin:password@localhost:5672`
- Management UI: `http://localhost:15672`

## 🐳 Docker Services

All services include health checks and persistent volumes:

### PostgreSQL
- Port: `5432`
- Volume: `postgres_data`
- Health check: `pg_isready`

### Redis
- Port: `6379`
- Volume: `redis_data`
- Health check: `redis-cli ping`

### RabbitMQ
- AMQP Port: `5672`
- Management Port: `15672`
- Volume: `rabbitmq_data`
- Health check: `rabbitmq-diagnostics ping`

## 🌐 API Endpoints

### Health Check
```bash
curl http://localhost:3000/health
```

### Event System Status
```bash
curl http://localhost:3000/events/status
```

### API Documentation
Visit: `http://localhost:3000/docs`

## 🔄 Common Workflows

### 1. Starting Fresh
```bash
# Stop any running services
npm run stop:local

# Start everything from scratch
npm run dev:full
```

### 2. Reset Database
```bash
# Rebuild and re-migrate
npm run db:setup
```

### 3. Development with Hot Reload
Services are already running:
```bash
npm run dev
```

### 4. Debugging Services
Check if services are healthy:
```bash
docker ps
```

### 5. View Logs
```bash
# View application logs
docker logs aegisx-app-1

# View database logs
docker logs aegisx-db-1

# View Redis logs
docker logs aegisx-redis-1

# View RabbitMQ logs
docker logs aegisx-rabbitmq-1
```

## 🛠 Troubleshooting

### Database Connection Issues
1. Ensure Docker services are healthy: `docker ps`
2. Check environment variables in `.env`
3. Rebuild the project: `npm run build`
4. Re-run migrations: `npm run knex:migrate`

### Port Conflicts
If ports are already in use:
1. Stop conflicting services
2. Or modify ports in `docker-compose.yml`

### Service Health Checks
The setup script waits for services to be healthy before proceeding. If it times out:
1. Check Docker logs for errors
2. Restart Docker services
3. Try running `npm run setup:local` separately

## 📚 Next Steps

1. **API Development**: Use the Swagger UI at `http://localhost:3000/docs`
2. **Database Changes**: Create new migrations in `src/db/migrations/`
3. **Event System**: Add new events in module-specific `*.events.ts` files
4. **Testing**: Add tests and run with the testing framework

## 🎯 Production Deployment

See the main README.md for production deployment checklist and guidelines.
