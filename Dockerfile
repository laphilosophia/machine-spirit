# Multi-stage build for Machine Spirit Altar & Servitor
# Stage 1: Build Altar (Frontend)
FROM node:20-slim AS altar-builder
WORKDIR /app/altar
COPY altar/package*.json ./
COPY pnpm-lock.yaml ../
RUN corepack enable && pnpm install
COPY altar/ .
COPY kernel/ ../kernel/
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm run build

# Stage 2: Build Kernel (Backend)
FROM node:20-slim AS kernel-builder
WORKDIR /app
COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN corepack enable && pnpm install
COPY . .
RUN pnpm run build

# Stage 3: Runner
FROM node:20-slim AS runner
WORKDIR /app

# Install production dependencies
COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN corepack enable && pnpm install --prod

# Copy Backend Build
COPY --from=kernel-builder /app/dist ./dist

# Copy Frontend Build
COPY --from=altar-builder /app/altar/.next ./altar/.next
COPY --from=altar-builder /app/altar/public ./altar/public
COPY --from=altar-builder /app/altar/package.json ./altar/package.json
COPY --from=altar-builder /app/altar/node_modules ./altar/node_modules

# Ensure data directory for persistent SQLite
RUN mkdir -p /data && chmod 777 /data
ENV DB_PATH=/data/soul.db

EXPOSE 3000 3001

# Use a small script to start both Servitor and Altar
RUN echo 'node dist/kernel/servitor/index.js & cd altar && pnpm run start' > start.sh
RUN chmod +x start.sh

CMD ["sh", "start.sh"]
