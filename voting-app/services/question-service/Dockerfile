# ---------- builder ----------
FROM node:20-bullseye AS builder
WORKDIR /app

# Manifest
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps --include=dev

# Copia prisma e codice
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

# Prisma Client (scegline una riga)
RUN npx prisma generate --schema=./prisma/schema.prisma
# RUN npx -y prisma@5.22.0 generate --schema=./prisma/schema.prisma

# Build TS
RUN npx tsc -p tsconfig.json

# ---------- runner ----------
FROM node:20-bullseye AS runner
WORKDIR /app
ENV NODE_ENV=production

# ✅ OGNI COPY HA SORGENTE E DESTINAZIONE
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma       ./prisma
COPY --from=builder /app/dist         ./dist
COPY package.json package-lock.json* ./

RUN npm prune --omit=dev

CMD ["node", "dist/index.js"]
