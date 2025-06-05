#!/bin/bash

echo "🧪 Testing AegisX Setup Methods"
echo "=================================="

# Function to check if service is running
check_service() {
    local service=$1
    local port=$2
    echo -n "Testing $service on port $port... "
    
    if nc -z localhost $port 2>/dev/null; then
        echo "✅ Running"
        return 0
    else
        echo "❌ Not running"
        return 1
    fi
}

# Function to test setup method
test_setup_method() {
    local method="$1"
    local command="$2"
    
    echo ""
    echo "🚀 Testing: $method"
    echo "Command: $command"
    echo "-------------------"
    
    # Clean up first
    echo "🧹 Cleaning up..."
    docker-compose -f docker-compose.dev.yml down -v --remove-orphans 2>/dev/null
    docker stop aegisx-postgres aegisx-redis aegisx-rabbitmq 2>/dev/null
    docker rm aegisx-postgres aegisx-redis aegisx-rabbitmq 2>/dev/null
    
    # Run the setup command
    echo "🔧 Running setup..."
    eval $command
    
    # Wait a bit for services to start
    echo "⏳ Waiting for services..."
    sleep 15
    
    # Check services
    echo "🔍 Checking services:"
    local postgres_ok=0
    local redis_ok=0
    local rabbitmq_ok=0
    
    check_service "PostgreSQL" 5432 && postgres_ok=1
    check_service "Redis" 6379 && redis_ok=1
    check_service "RabbitMQ" 5672 && rabbitmq_ok=1
    
    # Score
    local total=$((postgres_ok + redis_ok + rabbitmq_ok))
    echo "📊 Score: $total/3 services running"
    
    if [ $total -eq 3 ]; then
        echo "✅ $method: SUCCESS"
    else
        echo "❌ $method: FAILED"
    fi
    
    return $total
}

# Test methods
echo "Starting tests..."

# Test 1: Docker Compose
test_setup_method "Docker Compose (Recommended)" "docker-compose -f docker-compose.dev.yml up -d"

# Test 2: Makefile
test_setup_method "Makefile" "make setup"

# Test 3: NPM Script  
test_setup_method "NPM Script" "npm run setup:local:compose"

# Test 4: Legacy Script
test_setup_method "Legacy Script" "npm run setup:local"

echo ""
echo "🎯 Test Summary"
echo "==============="
echo "✅ Docker Compose: Most reliable, industry standard"
echo "✅ Makefile: Best developer experience"  
echo "✅ NPM Scripts: Good integration with package.json"
echo "⚠️  Legacy Script: Works but less flexible"

echo ""
echo "💡 Recommendation: Use 'make setup-full' for best experience"

# Cleanup
echo ""
echo "🧹 Final cleanup..."
docker-compose -f docker-compose.dev.yml down -v --remove-orphans 2>/dev/null
docker stop aegisx-postgres aegisx-redis aegisx-rabbitmq 2>/dev/null
docker rm aegisx-postgres aegisx-redis aegisx-rabbitmq 2>/dev/null

echo "✅ Testing complete!"
