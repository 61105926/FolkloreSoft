#!/bin/sh
set -e
cd /app/backend

# Esperar MySQL interno si aplica
if echo "${DATABASE_URL:-}" | grep -qE '(localhost|127\.0\.0\.1)'; then
  echo "==> [backend] Esperando MySQL interno..."
  until mariadb -h 127.0.0.1 -P 3306 -u folklosoft -p"${DB_PASSWORD}" folklosoft -e 'SELECT 1' 2>/dev/null; do
    sleep 2
  done
fi

# Aplicar migraciones — resuelve automáticamente si hay una fallida
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

  # Extraer nombre de migración fallida y marcarla como revertida
  FAILED=$(echo "$OUTPUT" | grep "The \`" | head -1 | sed "s/.*The \`//;s/\` migration.*//")
  if [ -n "$FAILED" ]; then
    echo "==> [backend] Resolviendo migración fallida: $FAILED"
    ./node_modules/.bin/prisma migrate resolve --rolled-back "$FAILED" || true
    i=$((i + 1))
  else
    echo "==> [backend] Error inesperado en migraciones"
    exit $EXIT_CODE
  fi
done

echo "==> [backend] Ejecutando seed..."
node dist/prisma/seed.js || true

echo "==> [backend] Iniciando NestJS..."
exec node dist/src/main.js
