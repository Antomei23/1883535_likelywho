# services/auth-service/Dockerfile

# ---------- builder ----------
FROM node:20-bullseye AS builder
WORKDIR /app

# 1) Manifest (cache-friendly)
COPY package.json package-lock.json* ./

# 2) Installa deps + devDeps (serve prisma CLI e tsc qui)
#    Evita che @prisma/client faccia generate in postinstall
#    e salta eventuale tuo script postinstall (prisma generate).
ENV PRISMA_SKIP_POSTINSTALL_GENERATE=1 \
    SKIP_DOCKER_POSTINSTALL=1
RUN npm ci --legacy-peer-deps --include=dev

# 3) Copia prisma e sorgenti
COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

# 4) Genera Prisma Client (scegline UNA)
RUN npx prisma generate --schema=./prisma/schema.prisma
# RUN npx -y prisma@5.22.0 generate --schema=./prisma/schema.prisma

# 5) Build TS (assicurati che "build": "tsc -p tsconfig.json" esista)
RUN npm run build

# ---------- runner ----------
FROM node:20-bullseye AS runner
WORKDIR /app
ENV NODE_ENV=production

# 6) Copia artefatti necessari a runtime
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist         ./dist
COPY --from=builder /app/prisma       ./prisma
COPY package.json package-lock.json*  ./

# 7) Tieni solo prod deps (pulizia opzionale)
RUN npm prune --omit=dev

# 8) Avvio
EXPOSE 4001
CMD ["node", "dist/index.js"]
