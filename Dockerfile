# Multi-stage Dockerfile for Angular 20 SSR (Angular Universal)
# Stage 1: Build the application
FROM node:20-alpine AS build
WORKDIR /app

# Install build dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy sources and build
COPY . .
# Build the project (production). The Angular config in angular.json is set to production by default.
RUN npm run build -- --configuration=production

# Stage 2: Create minimal runtime image
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Only install production dependencies
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev --no-audit --no-fund

# Copy built output from the build stage
COPY --from=build /app/dist ./dist

# Expose default server port (matches src/server.ts default)
EXPOSE 4000

# Default command: run the built server bundle
CMD ["node", "dist/front-login-profile/server/server.mjs"]
