#!/bin/bash

# Local Development Services Setup Script
# This script helps you set up local services for development and testing

echo "🚀 Setting up local development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

echo "✅ Docker is running"

# Start only the required services for local development
echo "🐘 Starting PostgreSQL database..."
docker run -d \
    --name aegisx-postgres \
    -p 5432:5432 \
    -e POSTGRES_USER=user \
    -e POSTGRES_PASSWORD=password \
    -e POSTGRES_DB=aegisx \
    postgres:15-alpine

echo "📦 Starting Redis..."
docker run -d \
    --name aegisx-redis \
    -p 6379:6379 \
    redis:7-alpine

echo "🐰 Starting RabbitMQ..."
docker run -d \
    --name aegisx-rabbitmq \
    -p 5672:5672 \
    -p 15672:15672 \
    -e RABBITMQ_DEFAULT_USER=admin \
    -e RABBITMQ_DEFAULT_PASS=password \
    rabbitmq:3-management

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Create test database
echo "🗄️ Creating test database..."
docker exec aegisx-postgres psql -U user -d aegisx -c "CREATE DATABASE aegisx_test;"

echo "✅ Local development environment is ready!"
echo ""
echo "📋 Services running:"
echo "   🐘 PostgreSQL: localhost:5432"
echo "   📦 Redis: localhost:6379"
echo "   🐰 RabbitMQ: localhost:5672"
echo "   🌐 RabbitMQ Management: http://localhost:15672 (admin/password)"
echo ""
echo "💡 To run the application:"
echo "   npm run dev"
echo ""
echo "🧪 To run tests:"
echo "   npm test"
echo ""
echo "🛑 To stop services:"
echo "   ./scripts/stop-local-services.sh"
