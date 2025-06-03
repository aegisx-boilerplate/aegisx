#!/bin/bash

# Stop Local Development Services Script

echo "🛑 Stopping local development services..."

# Stop and remove containers
containers=("aegisx-postgres" "aegisx-redis" "aegisx-rabbitmq")

for container in "${containers[@]}"; do
    if docker ps -q -f name="$container" | grep -q .; then
        echo "🛑 Stopping $container..."
        docker stop "$container"
        echo "🗑️ Removing $container..."
        docker rm "$container"
    else
        echo "ℹ️ $container is not running"
    fi
done

echo "✅ All local development services stopped!"
