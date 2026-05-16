# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy root workspace configs
COPY package*.json ./
COPY turbo.json ./

# Copy specific app and dependencies
COPY apps/backend ./apps/backend
COPY packages/shared-types ./packages/shared-types

# Install dependencies (using clean install for production)
RUN npm ci

# Build the backend
RUN npx turbo run build --filter=@supplylink/backend

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy built artifacts from build stage
COPY --from=build /app/apps/backend/dist ./dist
COPY --from=build /app/apps/backend/package*.json ./
COPY --from=build /app/node_modules ./node_modules

# Expose API port
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]
