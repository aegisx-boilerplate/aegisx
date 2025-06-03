#!/bin/bash
# ==============================================================================
# Docker Build Script for AegisX API Boilerplate
# ==============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="aegisx-api"
VERSION=${1:-"latest"}
BUILD_TARGET=${2:-"production"}

echo -e "${BLUE}🐳 Building AegisX API Docker Image${NC}"
echo -e "${YELLOW}Image: ${IMAGE_NAME}:${VERSION}${NC}"
echo -e "${YELLOW}Target: ${BUILD_TARGET}${NC}"
echo ""

# Build the image
echo -e "${BLUE}📦 Building Docker image...${NC}"
docker build \
    --target ${BUILD_TARGET} \
    --tag ${IMAGE_NAME}:${VERSION} \
    --tag ${IMAGE_NAME}:latest \
    --build-arg NODE_ENV=production \
    --file Dockerfile \
    .

echo -e "${GREEN}✅ Docker image built successfully!${NC}"
echo ""

# Show image details
echo -e "${BLUE}📊 Image Information:${NC}"
docker images ${IMAGE_NAME}:${VERSION}
echo ""

# Show image size
IMAGE_SIZE=$(docker images --format "table {{.Size}}" ${IMAGE_NAME}:${VERSION} | tail -n 1)
echo -e "${GREEN}📏 Image Size: ${IMAGE_SIZE}${NC}"

# Optional: Run security scan if trivy is available
if command -v trivy &> /dev/null; then
    echo -e "${BLUE}🔍 Running security scan...${NC}"
    trivy image ${IMAGE_NAME}:${VERSION}
else
    echo -e "${YELLOW}⚠️  Install trivy for security scanning: https://github.com/aquasecurity/trivy${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Build completed successfully!${NC}"
echo -e "${BLUE}💡 Next steps:${NC}"
echo -e "   • Run locally: ${YELLOW}docker run -p 3000:3000 ${IMAGE_NAME}:${VERSION}${NC}"
echo -e "   • Deploy with compose: ${YELLOW}docker-compose -f docker-compose.prod.yml up -d${NC}"
echo -e "   • Push to registry: ${YELLOW}docker push ${IMAGE_NAME}:${VERSION}${NC}"
