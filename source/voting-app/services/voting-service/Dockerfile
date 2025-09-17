# services/voting-service/Dockerfile

# --------------------
# STEP 1: Builder
# --------------------
FROM node:20-bullseye AS builder
WORKDIR /app

# 0) Assicura che lo schema Prisma sia disponibile PRIMA di npm ci
COPY prisma ./prisma

# 1) Installa deps (devDeps incluse)
#    Disattivo il "generate" nel postinstall di @prisma/client,
#    lo faremo manualmente dopo.
COPY package.json package-lock.json* ./
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=1
RUN npm ci --legacy-peer-deps

# 2) Genera Prisma Client ora che lo schema c'è
RUN npx prisma generate

# 3) Copia il resto del codice e builda
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# --------------------
# STEP 2: Runner
# --------------------
FROM node:20-bullseye AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copia ciò che serve a runtime
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

EXPOSE 4003
CMD ["node", "dist/index.js"]
