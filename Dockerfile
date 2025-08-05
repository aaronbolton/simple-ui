# Use Node.js 18 Alpine as base image for smaller size and better security
FROM node:18-alpine AS base

# Install curl for health checks and security updates
RUN apk add --no-cache curl && \
    apk upgrade --no-cache

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Development stage
FROM base AS development
RUN npm install
COPY . .
EXPOSE 3000 9229
CMD ["npm", "run", "dev"]

# Production stage
FROM base AS production

# Install only production dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# Copy application files (excluding dev files via .dockerignore)
COPY . .

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S chatui -u 1001 -G nodejs

# Create logs directory and set permissions
RUN mkdir -p /app/logs && \
    chown -R chatui:nodejs /app

# Remove unnecessary files for security
RUN rm -rf /app/.git /app/README.md /app/.env.example

# Switch to non-root user
USER chatui

# Expose the port the app runs on
EXPOSE 3000

# Health check with proper error handling
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/config || exit 1

# Start the application with proper signal handling
CMD ["node", "server.js"]

# Default to production
FROM production
