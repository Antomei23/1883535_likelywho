# --------------------
# STEP 1: Builder
# --------------------
FROM node:20-bullseye AS builder
WORKDIR /app

# 1) Installa deps (anche devDeps: ci serve il CLI prisma locale)
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# 2) Copia il codice (inclusa /prisma)
COPY . .

# 3) Genera Prisma Client usando il CLI locale (NO globale)
RUN npx prisma generate

# 4) Compila TypeScript
RUN npm run build

# --------------------
# STEP 2: Runner
# --------------------
FROM node:20-bullseye AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copia tutto ciò che serve a runtime
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

EXPOSE 4001
CMD ["node", "dist/index.js"]
