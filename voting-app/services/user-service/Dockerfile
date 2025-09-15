# ---------- builder ----------
FROM node:20-bullseye AS builder
WORKDIR /app

# 1) Manifest
COPY package.json package-lock.json* ./

# 2) Install anche devDeps (serve prisma CLI QUI). NON mettere NODE_ENV=production qui.
RUN npm ci --legacy-peer-deps --include=dev

# 3) Copia prisma e codice
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

# 4) Genera Prisma Client (scegline UNA riga)
RUN npx prisma generate --schema=./prisma/schema.prisma
# RUN npx -y prisma@5.22.0 generate --schema=./prisma/schema.prisma

# 5) Compila TS
RUN npx tsc -p tsconfig.json

# ---------- runner ----------
FROM node:20-bullseye AS runner
WORKDIR /app
ENV NODE_ENV=production

# 6) Copia artefatti
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/dist ./dist
COPY package.json package-lock.json* ./

# 7) Tieni solo prod deps
RUN npm prune --omit=dev

# 8) Start
CMD ["node", "dist/index.js"]
