# --------------------
# STEP 1: Builder
# --------------------
FROM node:20-bullseye AS builder
WORKDIR /app

# Copia package.json e package-lock.json
COPY package.json package-lock.json* ./

# Installa tutte le dipendenze e TypeScript/Prisma globalmente
RUN npm ci --legacy-peer-deps
RUN npm install -g typescript
RUN npm install -g prisma@5.18.0

# Copia Prisma e tutto il codice
COPY prisma ./prisma
COPY . .

# Genera Prisma Client
RUN prisma generate

# Compila TypeScript
RUN tsc -p tsconfig.json

# --------------------
# STEP 2: Runner
# --------------------
FROM node:20-bullseye AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copia dipendenze di produzione, dist e prisma dal builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package.json ./

# Avvio dell'app
CMD ["node", "dist/index.js"]
