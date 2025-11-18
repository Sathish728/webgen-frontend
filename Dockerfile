# webgen-frontend/Dockerfile
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies for builds
RUN apk add --no-cache libc6-compat curl

# ============= Dependencies Stage =============
FROM base AS dependencies

COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm install --legacy-peer-deps && \
    npm cache clean --force

# ============= Build Stage =============
FROM base AS build

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Accept build arguments
ARG VITE_API_URL
ARG REACT_APP_STRIPE_PUBLIC_KEY
ARG REACT_APP_ENV=production

# Set environment variables for build
ENV VITE_API_URL=$VITE_API_URL
ENV REACT_APP_STRIPE_PUBLIC_KEY=$REACT_APP_STRIPE_PUBLIC_KEY
ENV REACT_APP_ENV=$REACT_APP_ENV
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=2048"

# Build the application
RUN npm run build

# Verify build output
RUN test -d dist || (echo "Build failed - no dist directory" && exit 1)

# ============= Production Stage =============
FROM node:20-alpine AS production

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built files from build stage
COPY --from=build /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Start server
CMD ["serve", "-s", "dist", "-l", "3000"]