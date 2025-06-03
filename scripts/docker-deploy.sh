#!/bin/bash
# ==============================================================================
# Docker Deployment Script for AegisX API Boilerplate
# ==============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-"development"}
COMPOSE_FILE=""

case $ENVIRONMENT in
    "development"|"dev")
        COMPOSE_FILE="docker-compose.yml"
        echo -e "${BLUE}🚀 Deploying AegisX API - Development Environment${NC}"
        ;;
    "production"|"prod")
        COMPOSE_FILE="docker-compose.prod.yml"
        echo -e "${BLUE}🚀 Deploying AegisX API - Production Environment${NC}"
        ;;
    *)
        echo -e "${RED}❌ Invalid environment: ${ENVIRONMENT}${NC}"
        echo -e "${YELLOW}Usage: ./scripts/docker-deploy.sh [development|production]${NC}"
        exit 1
        ;;
esac

echo -e "${YELLOW}Compose file: ${COMPOSE_FILE}${NC}"
echo ""

# Check if .env file exists
if [[ $ENVIRONMENT == "production" && ! -f ".env.production" ]]; then
    echo -e "${YELLOW}⚠️  Creating .env.production from .env.example...${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env.production
        echo -e "${YELLOW}📝 Please update .env.production with production values${NC}"
    else
        echo -e "${RED}❌ .env.example not found${NC}"
        exit 1
    fi
fi

# Pull latest images (for production)
if [[ $ENVIRONMENT == "production" ]]; then
    echo -e "${BLUE}📥 Pulling latest images...${NC}"
    docker-compose -f ${COMPOSE_FILE} pull
fi

# Stop existing containers
echo -e "${BLUE}🛑 Stopping existing containers...${NC}"
docker-compose -f ${COMPOSE_FILE} down --remove-orphans

# Start services
echo -e "${BLUE}🚀 Starting services...${NC}"
docker-compose -f ${COMPOSE_FILE} up -d

# Wait for services to be healthy
echo -e "${BLUE}⏳ Waiting for services to be healthy...${NC}"
sleep 10

# Check service health
echo -e "${BLUE}🩺 Checking service health...${NC}"
docker-compose -f ${COMPOSE_FILE} ps

# Test API health endpoint
echo -e "${BLUE}🔍 Testing API health...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ API is healthy!${NC}"
        break
    else
        echo -e "${YELLOW}⏳ Waiting for API (attempt $i/30)...${NC}"
        sleep 2
    fi
    
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ API health check failed${NC}"
        echo -e "${BLUE}📋 Checking logs...${NC}"
        docker-compose -f ${COMPOSE_FILE} logs app
        exit 1
    fi
done

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📋 Service Information:${NC}"
echo -e "   • API: ${YELLOW}http://localhost:3000${NC}"
echo -e "   • API Health: ${YELLOW}http://localhost:3000/health${NC}"
echo -e "   • API Docs: ${YELLOW}http://localhost:3000/docs${NC}"
echo -e "   • RabbitMQ Management: ${YELLOW}http://localhost:15672${NC} (admin/password)"
echo ""
echo -e "${BLUE}💡 Useful commands:${NC}"
echo -e "   • View logs: ${YELLOW}docker-compose -f ${COMPOSE_FILE} logs -f${NC}"
echo -e "   • Stop services: ${YELLOW}docker-compose -f ${COMPOSE_FILE} down${NC}"
echo -e "   • Restart API: ${YELLOW}docker-compose -f ${COMPOSE_FILE} restart app${NC}"
