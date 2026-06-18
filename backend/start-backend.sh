#!/bin/sh
cd /app/backend

# Esperar PostgreSQL interno si aplica
if echo "${DATABASE_URL:-}" | grep -qE '(localhost|127\.0\.0\.1)'; then
  echo "==> [backend] Esperando PostgreSQL interno..."
  until pg_isready -h 127.0.0.1 -p 5432 -U folklosoft -d folklosoft >/dev/null 2>&1; do
    sleep 2
  done
fi

echo "==> [backend] Aplicando migraciones..."
i=0
while [ $i -lt 5 ]; do
  OUTPUT=$(./node_modules/.bin/prisma migrate deploy 2>&1)
  EXIT_CODE=$?
  echo "$OUTPUT"

  if [ $EXIT_CODE -eq 0 ]; then
    echo "==> [backend] Migraciones OK"
    break
  fi

  # P3005: tablas existentes sin historial de migraciones → reset limpio
  if echo "$OUTPUT" | grep -q "P3005"; then
    echo "==> [backend] DB sin historial de migraciones. Aplicando reset..."
    ./node_modules/.bin/prisma migrate reset --force
    break
  fi

  # P3009: migración fallida → marcarla como revertida y reintentar
  FAILED=$(echo "$OUTPUT" | grep "The \`" | head -1 | sed "s/.*The \`//;s/\` migration.*//")
  if [ -n "$FAILED" ]; then
    echo "==> [backend] Resolviendo migración fallida: $FAILED"
    ./node_modules/.bin/prisma migrate resolve --rolled-back "$FAILED" || true
    i=$((i + 1))
  else
    echo "==> [backend] Error inesperado en migraciones"
    exit 1
  fi
done

echo "==> [backend] Ejecutando seed..."
node dist/prisma/seed.js || true

echo "==> [backend] Iniciando NestJS..."
exec node dist/src/main.js
