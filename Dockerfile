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

# En el mismo contenedor el backend corre en localhost:9001
ENV BACKEND_URL=http://localhost:9001
RUN npm run build


# ═══════════════════════════════════════════════════════════════════
#  Stage 3 – Imagen final
# ═══════════════════════════════════════════════════════════════════
FROM node:20-alpine AS runner

# supervisord para correr backend + frontend en paralelo
RUN apk add --no-cache supervisor

# ── Backend ─────────────────────────────────────────────────────────
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev

COPY --from=backend-builder /app/backend/dist            ./dist
COPY --from=backend-builder /app/backend/node_modules/.prisma  ./node_modules/.prisma
COPY --from=backend-builder /app/backend/node_modules/@prisma  ./node_modules/@prisma
COPY backend/prisma ./prisma

# ── Frontend ─────────────────────────────────────────────────────────
WORKDIR /app/frontend
COPY --from=frontend-builder /app/frontend/.next/standalone ./
COPY --from=frontend-builder /app/frontend/.next/static     ./.next/static
COPY --from=frontend-builder /app/frontend/public           ./public

# ── Supervisord config ───────────────────────────────────────────────
COPY supervisord.conf /etc/supervisord.conf

WORKDIR /app

# Backend: 9001  |  Frontend: 9002
EXPOSE 9001 9002

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
