# Multi-stage build for Machine Spirit Altar & Servitor

# Stage 1: Build Altar (Frontend)
FROM node:20 AS altar-builder
WORKDIR /app/altar
COPY altar/package*.json ./
COPY pnpm-lock.yaml ../
RUN corepack enable && pnpm install --frozen-lockfile
COPY altar/ .
COPY kernel/ ../kernel/
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm run build
# Prepare production-only node_modules with hoisted linker (for portability)
RUN rm -rf node_modules && pnpm install --prod --frozen-lockfile --config.node-linker=hoisted

# Stage 2: Build Kernel (Backend)
FROM node:20 AS kernel-builder
WORKDIR /app
COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build
# Prepare production-only node_modules with hoisted linker (for portability)
RUN rm -rf node_modules && pnpm install --prod --frozen-lockfile --config.node-linker=hoisted

# Stage 3: Runner
FROM node:20-slim AS runner
WORKDIR /app

# Copy Backend Build and production node_modules
COPY --from=kernel-builder /app/node_modules ./node_modules
COPY --from=kernel-builder /app/dist ./dist
COPY --from=kernel-builder /app/package.json ./package.json

# Copy Frontend Build and production node_modules
COPY --from=altar-builder /app/altar/.next ./altar/.next
COPY --from=altar-builder /app/altar/public ./altar/public
COPY --from=altar-builder /app/altar/package.json ./altar/package.json
COPY --from=altar-builder /app/altar/node_modules ./altar/node_modules

# Ensure data directory for persistent SQLite
RUN mkdir -p /data && chmod 777 /data
ENV DB_PATH=/data/soul.db

EXPOSE 3000 3001

# Start script
RUN echo 'node dist/kernel/servitor/index.js & cd altar && ./node_modules/.bin/next start' > start.sh
RUN chmod +x start.sh

CMD ["sh", "start.sh"]
