# Quick Setup Guide

## Prerequisites Check

Before starting development, ensure you have:
- ✅ Node.js 18+
- ✅ PostgreSQL 14+  
- ✅ Redis 6+
- ✅ RabbitMQ 3.8+

## Quick Start Commands

```bash
# Clone and setup
git clone <your-repo-url>
cd aegisx
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configurations

# Start with Docker (recommended)
npm run setup:local

# Or run migrations manually
npm run build
npm run knex:migrate
npm run knex:seed

# Start development
npm run dev
```

## Available Scripts

- `npm run dev` - Development server with hot reload
- `npm run build` - Build for production with SWC
- `npm run commit` - Interactive conventional commits
- `npm run lint` - Code quality check
- `npm run format` - Code formatting

## First Steps

1. Start local services: `npm run setup:local`
2. Run migrations: `npm run knex:migrate`
3. Start development: `npm run dev`
4. Visit: http://localhost:3000/docs

Happy coding! 🚀
