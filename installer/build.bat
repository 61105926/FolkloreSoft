@echo off
title Construyendo DANZA CON ALTURA...
setlocal
set "ROOT=%~dp0.."
set "DIST=%~dp0dist"

set "NODE_VER=20.19.0"
set "NODE_URL=https://nodejs.org/dist/v%NODE_VER%/node-v%NODE_VER%-win-x64.zip"

echo =============================================================
echo   DANZA CON ALTURA - Build para instalador (Windows)
echo =============================================================

if not exist "%ROOT%\backend\node_modules" (
  echo [IMPORTANTE] Instalando dependencias del backend...
  pushd "%ROOT%\backend"
  call npm ci
  popd
  if errorlevel 1 ( echo ERROR en npm ci backend. & pause & exit /b 1 )
)
if not exist "%ROOT%\frontend\node_modules" (
  echo [IMPORTANTE] Instalando dependencias del frontend...
  pushd "%ROOT%\frontend"
  call npm ci
  popd
  if errorlevel 1 ( echo ERROR en npm ci frontend. & pause & exit /b 1 )
)

REM ── 1. Backend: prisma client + compilacion ─────────────────────
echo.
echo [1/4] Preparando backend (Prisma + TypeScript)...
pushd "%ROOT%\backend"
call npx prisma generate
if errorlevel 1 ( echo ERROR en prisma generate. & popd & pause & exit /b 1 )
call npm run build
if errorlevel 1 ( echo ERROR en build backend. & popd & pause & exit /b 1 )
call npx tsc prisma\seed.ts --outDir dist\prisma --module commonjs --target ES2020 --esModuleInterop --skipLibCheck
popd

REM ── 2/3. Build frontend ─────────────────────────────────────────
echo.
echo [2/4] Compilando frontend...
pushd "%ROOT%\frontend"
call npm run build
if errorlevel 1 ( echo ERROR en build frontend. & popd & pause & exit /b 1 )
popd

REM ── 3/4. Copiar archivos al directorio de distribucion ──────────
echo.
echo [3/4] Copiando archivos...
if exist "%DIST%" rd /s /q "%DIST%"
mkdir "%DIST%"

REM Backend: dist + node_modules + prisma + .env (desktop > production)
mkdir "%DIST%\backend"
xcopy /e /i /q "%ROOT%\backend\dist"          "%DIST%\backend\dist"
xcopy /e /i /q "%ROOT%\backend\node_modules"  "%DIST%\backend\node_modules"
xcopy /e /i /q "%ROOT%\backend\prisma"        "%DIST%\backend\prisma"
if exist "%ROOT%\backend\.env.desktop" copy "%ROOT%\backend\.env.desktop" "%DIST%\backend\.env" >nul
if not exist "%DIST%\backend\.env" if exist "%ROOT%\backend\.env.production" copy "%ROOT%\backend\.env.production" "%DIST%\backend\.env" >nul

REM Frontend: standalone output
mkdir "%DIST%\frontend"
xcopy /e /i /q "%ROOT%\frontend\.next\standalone\." "%DIST%\frontend"
xcopy /e /i /q "%ROOT%\frontend\.next\static"       "%DIST%\frontend\.next\static"
xcopy /e /i /q "%ROOT%\frontend\public"             "%DIST%\frontend\public"

REM Scripts de arranque
copy "%~dp0start.bat" "%DIST%\start.bat" >nul
copy "%~dp0stop.bat"  "%DIST%\stop.bat"  >nul

REM ── 4/4. Node.js portable ───────────────────────────────────────
echo.
echo [4/4] Descargando Node.js %NODE_VER% portable...
if not exist "%DIST%\node\node.exe" (
  if not exist "%~dp0node-win.zip" (
    powershell -Command "Invoke-WebRequest -Uri '%NODE_URL%' -OutFile '%~dp0node-win.zip'"
    if errorlevel 1 ( echo ERROR al descargar Node.js. Descargalo manual en %NODE_URL% y guardalo como installer\node-win.zip. & pause & exit /b 1 )
  )
  powershell -Command "Expand-Archive -Path '%~dp0node-win.zip' -DestinationPath '%~dp0node-tmp' -Force"
  if errorlevel 1 ( echo ERROR al descomprimir Node.js. & pause & exit /b 1 )
  xcopy /e /i /q "%~dp0node-tmp\node-v%NODE_VER%-win-x64" "%DIST%\node"
  rd /s /q "%~dp0node-tmp"
)

echo =============================================================
echo   LISTO! Archivos en: %DIST%
echo.
echo Configuracion de BD (IMPORTANTE):
echo   El archivo %DIST%\backend\.env llegara con DATABASE_URL de produccion (Coolify).
echo   Para una instalacion local cambiala a tu PostgreSQL (ej. postgresql://user:pass@localhost:5432/nombre).
echo =============================================================
echo.
pause