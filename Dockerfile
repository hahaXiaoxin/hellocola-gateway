# Stage 1: Install dependencies
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* .npmrc ./
COPY server/package.json ./server/
COPY web/package.json ./web/
RUN pnpm install --frozen-lockfile || pnpm install

# Stage 2: Build web frontend
FROM deps AS web-build
WORKDIR /app
COPY tsconfig.base.json ./
COPY web/ ./web/
RUN pnpm --filter web build

# Stage 3: Build server
FROM deps AS server-build
WORKDIR /app
COPY tsconfig.base.json ./
COPY server/ ./server/
RUN pnpm --filter server build

# Stage 4: Production runtime
FROM node:22-alpine AS runtime
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* .npmrc ./
COPY server/package.json ./server/

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile || pnpm install --prod

# Copy build artifacts
COPY --from=server-build /app/server/dist ./server/dist
COPY --from=web-build /app/web/dist ./web/dist

# Create data directory for persistence
RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/app/data

EXPOSE 3000

CMD ["node", "server/dist/index.js"]
