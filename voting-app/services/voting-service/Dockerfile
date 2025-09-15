# services/voting-service/Dockerfile

# --------------------
# STEP 1: Builder
# --------------------
FROM node:20-bullseye AS builder
WORKDIR /app

# 1) Manifest (cache-friendly)
COPY package.json package-lock.json* ./

# 2) Install deps + devDeps (need prisma CLI and tsc here)
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=1 \
    SKIP_DOCKER_POSTINSTALL=1
RUN npm ci --legacy-peer-deps --include=dev

# 3) Copy prisma + source
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

# 4) Generate Prisma Client (pick ONE line)
RUN npx prisma generate --schema=./prisma/schema.prisma
# RUN npx -y prisma@5.22.0 generate --schema=./prisma/schema.prisma

# 5) Build TS
RUN npm run build

# --------------------
# STEP 2: Runner
# --------------------
FROM node:20-bullseye AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy runtime artifacts (EVERY COPY has src AND dest)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist         ./dist
COPY --from=builder /app/prisma       ./prisma
COPY package.json package-lock.json*  ./

RUN npm prune --omit=dev

EXPOSE 4003
CMD ["node", "dist/index.js"]
