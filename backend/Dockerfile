# ── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# OpenSSL es requerido por Prisma para generar/usar el query engine
RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build
# Compilar el seed para producción (dist/prisma/seed.js)
RUN npx tsc prisma/seed.ts --outDir dist/prisma --module commonjs --target ES2020 --esModuleInterop --skipLibCheck

# ── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# OpenSSL es requerido por Prisma en runtime (migrate deploy / query engine)
RUN apk add --no-cache openssl

ENV NODE_ENV=production

# Only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Compiled output (incluye dist/prisma/seed.js)
COPY --from=builder /app/dist ./dist

# Prisma client binaries + schema + migrations
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY prisma ./prisma

EXPOSE 4002

# Aplicar migraciones, ejecutar seed (no bloqueante) y arrancar el servidor
CMD ["sh", "-c", "npx prisma migrate deploy && (node dist/prisma/seed.js || true) && node dist/src/main.js"]
