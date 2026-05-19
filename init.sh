#!/bin/sh
set -e

# ── Detectar si se usa base de datos externa o interna ──────────────────────
# Si DATABASE_URL ya está definida y no apunta a localhost/127.0.0.1 → externa
if [ -n "${DATABASE_URL:-}" ] && ! echo "$DATABASE_URL" | grep -qE '(localhost|127\.0\.0\.1)'; then
  echo "==> [init] Base de datos EXTERNA detectada. Omitiendo MariaDB interna."
  export START_MYSQL=false
  export DB_PASSWORD=""
else
  # ── Modo interno: MariaDB dentro del contenedor ────────────────────────────
  export DB_PASSWORD="${DB_PASSWORD:-folklosoft_2024}"
  DB_NAME="folklosoft"
  DB_USER="folklosoft"
  export DATABASE_URL="mysql://${DB_USER}:${DB_PASSWORD}@127.0.0.1:3306/${DB_NAME}"
  export START_MYSQL=true

  echo "==> [init] Base de datos INTERNA. DATABASE_URL configurado."

  # Inicializar MariaDB solo la primera vez
  if [ ! -d "/var/lib/mysql/mysql" ]; then
    echo "==> [init] Primera ejecución: inicializando base de datos..."

    mysql_install_db --user=mysql --datadir=/var/lib/mysql --skip-test-db > /dev/null 2>&1

    mysqld --user=mysql --skip-networking --socket=/run/mysqld/mysqld.sock &
    MYSQL_PID=$!

    echo "==> [init] Esperando a MariaDB..."
    until mysqladmin --socket=/run/mysqld/mysqld.sock ping --silent 2>/dev/null; do
      sleep 1
    done

    mysql --socket=/run/mysqld/mysqld.sock -u root <<SQL
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost'  IDENTIFIED BY '${DB_PASSWORD}';
CREATE USER IF NOT EXISTS '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASSWORD}';
CREATE USER IF NOT EXISTS '${DB_USER}'@'%'          IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'127.0.0.1';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'%';
FLUSH PRIVILEGES;
SQL

    mysqladmin --socket=/run/mysqld/mysqld.sock -u root shutdown
    wait $MYSQL_PID

    echo "==> [init] Base de datos inicializada correctamente."
  else
    echo "==> [init] Base de datos ya existe, omitiendo inicialización."

    # Asegurar permisos remotos por si el volumen es antiguo
    mysqld --user=mysql --skip-networking --socket=/run/mysqld/mysqld.sock &
    MYSQL_PID2=$!
    until mysqladmin --socket=/run/mysqld/mysqld.sock ping --silent 2>/dev/null; do sleep 1; done
    mysql --socket=/run/mysqld/mysqld.sock -u root <<SQL
CREATE USER IF NOT EXISTS '${DB_USER}'@'%' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'%';
FLUSH PRIVILEGES;
SQL
    mysqladmin --socket=/run/mysqld/mysqld.sock -u root shutdown
    wait $MYSQL_PID2
  fi
fi

# ── Exportar variables para supervisord ────────────────────────────────────
export JWT_SECRET="${JWT_SECRET:-cambia_este_secreto}"
export JWT_ACCESS_EXPIRES_IN="${JWT_ACCESS_EXPIRES_IN:-15m}"
export FRONTEND_URL="${FRONTEND_URL:-http://localhost:9002}"

echo "==> [init] Iniciando servicios con supervisord... (MySQL interno: ${START_MYSQL})"
exec /usr/bin/supervisord -c /etc/supervisord.conf
