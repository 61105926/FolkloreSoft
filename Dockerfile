# ═══════════════════════════════════════════════════════════════════
#  Stage 1 – Build Backend (NestJS)
# ═══════════════════════════════════════════════════════════════════
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci

COPY backend/ .
RUN npx prisma generate
RUN npm run build
# Compilar el seed separadamente para producción
RUN npx tsc prisma/seed.ts --outDir dist/prisma --module commonjs --target ES2020 --esModuleInterop --skipLibCheck


# ═══════════════════════════════════════════════════════════════════
#  Stage 2 – Build Frontend (Next.js standalone)
# ═══════════════════════════════════════════════════════════════════
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .

ENV BACKEND_URL=http://localhost:8001
RUN npm run build


# ═══════════════════════════════════════════════════════════════════
#  Stage 3 – Imagen final (app + base de datos todo en uno)
# ═══════════════════════════════════════════════════════════════════
FROM node:20-alpine AS runner

# Instalar PostgreSQL + supervisord + OpenSSL (requerido por Prisma)
RUN apk add --no-cache supervisor postgresql postgresql-client openssl php83 php83-pdo_pgsql php83-pgsql php83-session wget

# Directorios de PostgreSQL (datadir y socket)
RUN mkdir -p /var/lib/postgresql/data /run/postgresql && \
    chown -R postgres:postgres /var/lib/postgresql /run/postgresql && \
    chmod 0700 /var/lib/postgresql/data

# Descargar Adminer (gestor web de base de datos)
RUN mkdir -p /app/adminer && \
    wget -q -O /app/adminer/index.php https://www.adminer.org/latest.php

# ── Backend ──────────────────────────────────────────────────────────
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY --from=backend-builder /app/backend/dist                  ./dist
COPY --from=backend-builder /app/backend/node_modules/.prisma  ./node_modules/.prisma
COPY --from=backend-builder /app/backend/node_modules/@prisma  ./node_modules/@prisma
COPY backend/prisma ./prisma
# Seed compilado (dist/prisma/seed.js)
COPY --from=backend-builder /app/backend/dist/prisma/seed.js   ./dist/prisma/seed.js
COPY backend/start-backend.sh ./start-backend.sh
RUN chmod +x ./start-backend.sh

# ── Frontend ─────────────────────────────────────────────────────────
WORKDIR /app/frontend
COPY --from=frontend-builder /app/frontend/.next/standalone ./
COPY --from=frontend-builder /app/frontend/.next/static     ./.next/static
COPY --from=frontend-builder /app/frontend/public           ./public

# ── Scripts de arranque ──────────────────────────────────────────────
COPY supervisord.conf /etc/supervisord.conf
COPY init.sh /init.sh
RUN chmod +x /init.sh

WORKDIR /app

# Frontend: 3001 | Backend: 8001 | PostgreSQL: 9003 (acceso externo opcional) | Adminer: 9004
EXPOSE 8001 3001 9003 9004

ENTRYPOINT ["/init.sh"]
