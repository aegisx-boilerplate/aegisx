# Multi-stage Dockerfile for AegisX API Boilerplate
# Optimized for production with better security, caching, and smaller image size

# ==============================================================================
# Base Stage: Common dependencies and setup
# ==============================================================================
FROM node:20-alpine AS base

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory and set permissions
RUN addgroup -g 1001 -S nodejs && \
    adduser -S aegisx -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# ==============================================================================
# Dependencies Stage: Install all dependencies
# ==============================================================================
FROM base AS dependencies

# Install all dependencies (including dev dependencies for build)
# Use --ignore-scripts to avoid running husky in production
RUN npm ci --only=production --silent --ignore-scripts && \
    cp -R node_modules /tmp/node_modules && \
    npm ci --silent --ignore-scripts

# ==============================================================================
# Build Stage: Build the TypeScript application
# ==============================================================================
FROM dependencies AS build

# Copy source code
COPY . .

# Build the application using SWC
RUN npm run build

# ==============================================================================
# Production Stage: Final optimized image
# ==============================================================================
FROM base AS production

# Set environment to production
ENV NODE_ENV=production \
    PORT=3000 \
    LOG_LEVEL=info

# Copy production dependencies from dependencies stage
COPY --from=dependencies /tmp/node_modules ./node_modules

# Copy built application from build stage
COPY --from=build /app/dist ./dist

# Copy necessary files for runtime
COPY --from=build /app/package*.json ./

# Create logs directory
RUN mkdir -p logs && \
    chown -R aegisx:nodejs /app

# Switch to non-root user for security
USER aegisx

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/src/server.js"]
