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

# Production stage with Nginx
FROM nginx:alpine AS production

# Install envsubst for environment variable substitution
RUN apk add --no-cache gettext

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration template
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create non-root user
RUN addgroup -g 1001 -S nginx-app
RUN adduser -S nginx-app -u 1001 -G nginx-app

# Set permissions
RUN chown -R nginx-app:nginx-app /usr/share/nginx/html
RUN chown -R nginx-app:nginx-app /var/cache/nginx
RUN chown -R nginx-app:nginx-app /var/log/nginx
RUN chown -R nginx-app:nginx-app /etc/nginx/conf.d
RUN chown -R nginx-app:nginx-app /run

# Switch to non-root user
USER nginx-app

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]