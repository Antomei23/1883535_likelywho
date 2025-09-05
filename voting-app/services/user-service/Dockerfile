FROM node:20-bullseye AS builder
WORKDIR /app

COPY package.json package-lock.json* ./

# Installa tutte le dipendenze (anche dev) e TypeScript globalmente
RUN npm ci --legacy-peer-deps
RUN npm install -g typescript

COPY prisma ./prisma
COPY . .

# Installa Prisma CLI globalmente
RUN npm install -g prisma@5.18.0

# Genera il client Prisma
RUN prisma generate

# Compila TypeScript
RUN tsc -p tsconfig.json

# --------------------
# FASE DI RUNTIME
FROM node:20-bullseye AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copia le dipendenze e il dist dal builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package.json ./

# Installa Prisma CLI globalmente nel container finale
RUN npm install -g prisma@5.18.0

# Comando di avvio
CMD ["node", "dist/index.js"]
