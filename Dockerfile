# Multi-stage build for Machine Spirit Altar & Servitor

# Stage 1: Build Altar (Frontend) - pnpm is fine here, no native deps
FROM node:20 AS altar-builder
WORKDIR /app/altar
COPY altar/package*.json ./
COPY altar/pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile
COPY altar/ .
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN pnpm run build
# Prepare production deps
RUN rm -rf node_modules && pnpm install --prod --frozen-lockfile

# Stage 2: Build Kernel (Backend) - Use npm for reliable native module handling
FROM node:20 AS kernel-builder
WORKDIR /app
# Convert pnpm-lock to package-lock for npm (or just use package.json)
COPY package.json ./
# Install all deps with npm (compiles native modules correctly)
RUN npm install
COPY kernel/ ./kernel/
COPY tsconfig.json ./
RUN npm run build
# Rebuild with production only
RUN rm -rf node_modules && npm install --production

# Stage 3: Runner
FROM node:20-slim AS runner
WORKDIR /app

# Copy Backend Build and production node_modules (npm-based, flat structure)
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

# Start script - Servitor on 3001, Altar on 3000
RUN echo 'PORT=3001 node dist/kernel/servitor/index.js & cd altar && ./node_modules/.bin/next start' > start.sh
RUN chmod +x start.sh

CMD ["sh", "start.sh"]
