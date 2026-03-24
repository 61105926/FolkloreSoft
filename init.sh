#!/bin/sh
set -e

# ── Contraseña de la base de datos (puede cambiarse desde Coolify) ──────────
DB_PASSWORD="${DB_PASSWORD:-folklosoft_2024}"
DB_NAME="folklosoft"
DB_USER="folklosoft"

# Construir DATABASE_URL para el backend
export DATABASE_URL="mysql://${DB_USER}:${DB_PASSWORD}@127.0.0.1:3306/${DB_NAME}"

echo "==> [init] DATABASE_URL configurado"

# ── Inicializar MariaDB solo la primera vez ──────────────────────────────────
if [ ! -d "/var/lib/mysql/mysql" ]; then
  echo "==> [init] Primera ejecución: inicializando base de datos..."

  mysql_install_db --user=mysql --datadir=/var/lib/mysql --skip-test-db > /dev/null 2>&1

  # Arrancar MariaDB temporalmente sin red para configurarla
  mysqld --user=mysql --skip-networking --socket=/run/mysqld/mysqld.sock &
  MYSQL_PID=$!

  # Esperar a que esté lista
  echo "==> [init] Esperando a MariaDB..."
  until mysqladmin --socket=/run/mysqld/mysqld.sock ping --silent 2>/dev/null; do
    sleep 1
  done

  # Crear base de datos y usuario
  mysql --socket=/run/mysqld/mysqld.sock -u root <<SQL
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost'  IDENTIFIED BY '${DB_PASSWORD}';
CREATE USER IF NOT EXISTS '${DB_USER}'@'127.0.0.1' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'localhost';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'127.0.0.1';
FLUSH PRIVILEGES;
SQL

  # Apagar MariaDB temporal
  mysqladmin --socket=/run/mysqld/mysqld.sock -u root shutdown
  wait $MYSQL_PID

  echo "==> [init] Base de datos inicializada correctamente."
else
  echo "==> [init] Base de datos ya existe, omitiendo inicialización."
fi

# ── Pasar DATABASE_URL a supervisord ────────────────────────────────────────
# supervisord hereda el entorno del proceso que lo inicia
export DATABASE_URL
export JWT_SECRET="${JWT_SECRET:-cambia_este_secreto}"
export JWT_ACCESS_EXPIRES_IN="${JWT_ACCESS_EXPIRES_IN:-15m}"
export FRONTEND_URL="${FRONTEND_URL:-http://localhost:9002}"

echo "==> [init] Iniciando servicios con supervisord..."
exec /usr/bin/supervisord -c /etc/supervisord.conf
