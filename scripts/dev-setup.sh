#!/bin/bash
set -e

echo "🚀 Starting AegisX Development Environment..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if services are ready
wait_for_service() {
    local service=$1
    local port=$2
    local max_attempts=30
    local attempt=1
    
    echo -e "${BLUE}⏳ Waiting for $service to be ready...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if nc -z localhost $port 2>/dev/null; then
            echo -e "${GREEN}✅ $service is ready!${NC}"
            return 0
        fi
        
        echo -e "${YELLOW}   Attempt $attempt/$max_attempts - $service not ready yet...${NC}"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ $service failed to start after $max_attempts attempts${NC}"
    return 1
}

# Start Docker services
echo -e "${BLUE}🐳 Starting Docker services...${NC}"
docker-compose up -d

# Wait for services to be ready
wait_for_service "PostgreSQL" 5432
wait_for_service "Redis" 6379
wait_for_service "RabbitMQ" 5672

# Run migrations
echo -e "${BLUE}📄 Building project for migrations...${NC}"
npm run build

echo -e "${BLUE}🗄️ Running database migrations...${NC}"
npm run knex:migrate

echo -e "${BLUE}🌱 Running database seeds...${NC}"
npm run knex:seed

echo -e "${GREEN}✅ All services are ready!${NC}"
echo -e "${BLUE}🔗 Available services:${NC}"
echo "   - API: http://localhost:3000"
echo "   - API Docs: http://localhost:3000/docs"
echo "   - PostgreSQL: localhost:5432"
echo "   - Redis: localhost:6379"
echo "   - RabbitMQ Management: http://localhost:15672 (admin/password)"

echo -e "${BLUE}🎯 Now you can run:${NC}"
echo "   npm run dev"
