#!/bin/sh
set -e

PGDATA=/var/lib/postgresql/data

# ── Detectar si se usa base de datos externa o interna ──────────────────────
# Si DATABASE_URL ya está definida y no apunta a localhost/127.0.0.1 → externa
if [ -n "${DATABASE_URL:-}" ] && ! echo "$DATABASE_URL" | grep -qE '(localhost|127\.0\.0\.1)'; then
  echo "==> [init] Base de datos EXTERNA detectada. Omitiendo PostgreSQL interno."
  export START_DB=false
  export DB_PASSWORD=""
else
  # ── Modo interno: PostgreSQL dentro del contenedor ─────────────────────────
  export DB_PASSWORD="${DB_PASSWORD:-folklosoft_2024}"
  DB_NAME="folklosoft"
  DB_USER="folklosoft"
  export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@127.0.0.1:5432/${DB_NAME}?schema=public"
  export START_DB=true

  echo "==> [init] Base de datos INTERNA. DATABASE_URL configurado."

  # Inicializar PostgreSQL solo la primera vez
  if [ ! -f "$PGDATA/PG_VERSION" ]; then
    echo "==> [init] Primera ejecución: inicializando PostgreSQL..."

    su postgres -c "initdb -D '$PGDATA' --username=postgres --encoding=UTF8 --auth-local=trust --auth-host=scram-sha-256"

    # Permitir conexiones TCP con contraseña
    echo "listen_addresses = '*'" >> "$PGDATA/postgresql.conf"
    echo "host all all 0.0.0.0/0 scram-sha-256" >> "$PGDATA/pg_hba.conf"

    # Arrancar temporalmente (solo socket local) para crear usuario y BD
    su postgres -c "pg_ctl -D '$PGDATA' -o '-c listen_addresses=' -w start"

    cat > /tmp/init-db.sql <<SQL
CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';
CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
SQL
    chown postgres /tmp/init-db.sql
    su postgres -c "psql --no-psqlrc -v ON_ERROR_STOP=1 -f /tmp/init-db.sql"
    rm -f /tmp/init-db.sql

    su postgres -c "pg_ctl -D '$PGDATA' -w stop"

    echo "==> [init] Base de datos inicializada correctamente."
  else
    echo "==> [init] Base de datos ya existe, omitiendo inicialización."
  fi
fi

# ── Exportar variables para supervisord ────────────────────────────────────
export JWT_SECRET="${JWT_SECRET:-cambia_este_secreto}"
export JWT_ACCESS_EXPIRES_IN="${JWT_ACCESS_EXPIRES_IN:-15m}"
export FRONTEND_URL="${FRONTEND_URL:-http://localhost:3001}"

echo "==> [init] Iniciando servicios con supervisord... (PostgreSQL interno: ${START_DB})"
exec /usr/bin/supervisord -c /etc/supervisord.conf
