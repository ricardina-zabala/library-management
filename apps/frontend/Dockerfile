# Multi-stage build for React frontend
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY ../../domain/package*.json ./domain/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .
COPY ../../domain ./domain

# Build the application
RUN npm run build

# Production stage with simple HTTP server
FROM node:18-alpine AS production

WORKDIR /app

# Install a simple HTTP server
RUN npm install -g serve

# Copy built application
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S app
RUN adduser -S app -u 1001 -G app

# Set permissions
RUN chown -R app:app /app

# Switch to non-root user
USER app

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start the server
CMD ["serve", "-s", "dist", "-l", "80"]