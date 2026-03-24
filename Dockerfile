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


# ═══════════════════════════════════════════════════════════════════
#  Stage 2 – Build Frontend (Next.js standalone)
# ═══════════════════════════════════════════════════════════════════
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .

ENV BACKEND_URL=http://localhost:9001
RUN npm run build


# ═══════════════════════════════════════════════════════════════════
#  Stage 3 – Imagen final (app + base de datos todo en uno)
# ═══════════════════════════════════════════════════════════════════
FROM node:20-alpine AS runner

# Instalar MariaDB (compatible MySQL) + supervisord
RUN apk add --no-cache supervisor mariadb mariadb-client

# Directorios de MySQL
RUN mkdir -p /var/lib/mysql /run/mysqld && \
    chown -R mysql:mysql /var/lib/mysql /run/mysqld

# ── Backend ──────────────────────────────────────────────────────────
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY --from=backend-builder /app/backend/dist                  ./dist
COPY --from=backend-builder /app/backend/node_modules/.prisma  ./node_modules/.prisma
COPY --from=backend-builder /app/backend/node_modules/@prisma  ./node_modules/@prisma
COPY backend/prisma ./prisma

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

# Frontend: 9002 | Backend: 9001 | MySQL: 9003 (acceso externo opcional)
EXPOSE 9001 9002 9003

ENTRYPOINT ["/init.sh"]
