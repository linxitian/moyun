ARG NODE_IMAGE=node:22-bookworm-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392
FROM ${NODE_IMAGE} AS deps
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund && npm cache clean --force

# === Stage 2: Build ===
FROM ${NODE_IMAGE} AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_STANDALONE=1
ENV NODE_ENV=production
ENV NODE_OPTIONS=--max-old-space-size=512
RUN npm run lint && npm run typecheck && npm run build
RUN NEXT_DIST_DIR=.next node scripts/smoke-test.mjs

# === Stage 3: Production ===
FROM ${NODE_IMAGE} AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

ARG RELEASE_ID=local
LABEL org.opencontainers.image.revision=$RELEASE_ID

# Only traced runtime dependencies are shipped, including Linux SQLite bindings.
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# Create data and uploads directories
RUN mkdir -p data uploads public/uploads .next/cache \
    && chown -R node:node data uploads public/uploads .next

USER node

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
