# --------------------
# STEP 1: Builder
# --------------------
FROM node:20-bullseye AS builder
WORKDIR /app

# Copia package.json e package-lock.json
COPY package.json package-lock.json* ./

# Installa tutte le dipendenze (prod + dev) e TypeScript globale
RUN npm ci --legacy-peer-deps
RUN npm install -g typescript

# Copia cartella Prisma e tutto il codice sorgente
COPY prisma ./prisma
COPY . .

# Installa Prisma CLI globale
RUN npm install -g prisma@5.18.0

# Genera il client Prisma
RUN prisma generate

# Compila TypeScript
RUN tsc -p tsconfig.json

# --------------------
# STEP 2: Runner
# --------------------
FROM node:20-bullseye AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copia dipendenze di produzione e dist dal builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package.json ./

# Installa Prisma CLI globale nel runner se vuoi usare migrate deploy
RUN npm install -g prisma@5.18.0

# Comando di avvio
CMD ["node", "dist/index.js"]
