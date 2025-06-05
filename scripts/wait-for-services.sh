#!/bin/bash

# Wait for Services Script
# This script waits for all required services to be ready before proceeding

echo "⏳ Waiting for services to be ready..."

# Function to wait for a service with health check
wait_for_service() {
    local service_name=$1
    local max_attempts=30
    local attempt=1
    
    echo "🔍 Waiting for $service_name..."
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose -f docker-compose.services.yml ps | grep -q "$service_name.*healthy"; then
            echo "✅ $service_name is ready!"
            return 0
        fi
        
        echo "   Attempt $attempt/$max_attempts - $service_name not ready yet..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ $service_name failed to become ready after $max_attempts attempts"
    return 1
}

# Wait for all services
wait_for_service "aegisx-postgres"
wait_for_service "aegisx-redis" 
wait_for_service "aegisx-rabbitmq"

# Create test database
echo "🗄️ Creating test database..."
docker exec aegisx-postgres psql -U user -d aegisx -c "CREATE DATABASE IF NOT EXISTS aegisx_test;" 2>/dev/null || \
docker exec aegisx-postgres psql -U user -d aegisx -c "CREATE DATABASE aegisx_test;" 2>/dev/null || \
echo "   Test database already exists or created successfully"

echo "✅ All services are ready!"
echo ""
echo "📋 Services running:"
echo "   🐘 PostgreSQL: localhost:5432"
echo "   📦 Redis: localhost:6379"
echo "   🐰 RabbitMQ: localhost:5672"
echo "   🌐 RabbitMQ Management: http://localhost:15672 (admin/password)"
echo ""
echo "💡 Next steps:"
echo "   1. Run database migrations: npm run db:setup"
echo "   2. Setup event bus: npm run setup:eventbus"  
echo "   3. Start development: npm run dev"
echo ""
echo "🚀 Or run everything at once: npm run setup:local:full"
