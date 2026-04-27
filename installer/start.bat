@echo off
title DANZA CON ALTURA - Sistema

set DIR=%~dp0
set NODE=%DIR%node\node.exe

echo Iniciando sistema...

REM ── Backend ──────────────────────────────────────────────────────────────────
start "Backend" /min cmd /c "%NODE% %DIR%backend\dist\src\main.js"

REM Esperar que el backend levante
timeout /t 4 /nobreak >nul

REM ── Frontend ─────────────────────────────────────────────────────────────────
start "Frontend" /min cmd /c "%NODE% %DIR%frontend\server.js"

REM Esperar que el frontend levante
timeout /t 5 /nobreak >nul

REM ── Abrir navegador ──────────────────────────────────────────────────────────
start http://localhost:3000

echo Sistema iniciado. Podes cerrar esta ventana si el navegador abrio correctamente.
timeout /t 3 /nobreak >nul
