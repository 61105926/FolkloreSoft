@echo off
title DANZA CON ALTURA - Sistema
setlocal

set "DIR=%~dp0"
set "NODE=%DIR%node\node.exe"
set "BACKEND_PORT=4002"
set "FRONTEND_PORT=3000"

if not exist "%NODE%" (
  echo [ERROR] No se encontro Node.js portable en "%DIR%node\"
  echo Ejecuta primero build.bat para generarlo.
  pause
  exit /b 1
)

if not exist "%DIR%backend\.env" (
  echo [ERROR] No se encontro backend\.env con DATABASE_URL.
  echo Configura la base de datos en %DIR%backend\.env y volve a intentar.
  pause
  exit /b 1
)

echo Sistema iniciado...
for /f "usebackq tokens=2 delims=@" %%a in ("%DIR%backend\.env") do set "DB_TARGET=%%a"
echo Conectando a la base de datos: %DB_TARGET% ...

REM ── Backend (espera DB, migraciones + seed, y arranca) ─────────────────────
set "PORT=%BACKEND_PORT%"
pushd "%DIR%backend"
start "Backend" /min cmd /c ""%NODE%" "%DIR%backend\dist\src\start.js""
popd

echo Esperando backend en el puerto %BACKEND_PORT%...
call :wait "http://127.0.0.1:%BACKEND_PORT%/health" backend_ok
echo [ERROR] El backend no arranco en 60 segundos.
echo.
echo 1. Abri la ventana "Backend" de la barra de tareas y mire el error exacto.
echo 2. Motivo mas comun: esta PC no puede llegar a la base de datos: %DB_TARGET%
echo    Probalo en PowerShell:  Test-NetConnection 192.168.0.123 -Port 9003
echo    Si dice False, la base no es accesible desde esta red. Son 2 casos:
echo      - PC fuera de la LAN del servidor: se necesita una DB publica o tunel.
echo      - PC en la misma LAN: abrir el puerto en el firewall de la maquina
echo        que tiene PostgreSQL, o permitir la IP de esta PC en pg_hba.conf.
pause
goto :fin

:backend_ok
echo Backend OK.

REM ── Frontend (Next.js standalone) ──────────────────────────────────────────
set "PORT=%FRONTEND_PORT%"
set "HOSTNAME=127.0.0.1"
set "BACKEND_URL=http://127.0.0.1:%BACKEND_PORT%"
start "Frontend" /min cmd /c ""%NODE%" "%DIR%frontend\server.js""

echo Esperando frontend en el puerto %FRONTEND_PORT%...
for /l %%i in (1,1,60) do (
  curl -s -f -o nul "http://127.0.0.1:%FRONTEND_PORT%/login" >nul 2>&1 && goto :frontend_ok
  timeout /t 1 /nobreak >nul
)
echo [ERROR] El frontend no respondio en el puerto %FRONTEND_PORT%.
goto :fin

:frontend_ok
echo Frontend OK.

REM ── Abrir navegador ─────────────────────────────────────────────────────────
start "" "http://localhost:%FRONTEND_PORT%/login"
echo.
echo Sistema iniciado. Cerrar esta ventana no detiene el sistema.
echo Para detenerlo ejecuta "Detener sistema".
goto :fin

REM ── Subrutina: espera HTTP hasta 60s; si OK salta al label dado ────────────
:wait
for /l %%i in (1,1,60) do (
  curl -s -f -o nul "%~1" >nul 2>&1 && goto %~2
  timeout /t 1 /nobreak >nul
)
exit /b 1

:fin
timeout /t 3 /nobreak >nul