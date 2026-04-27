@echo off
title Construyendo DANZA CON ALTURA...
set ROOT=%~dp0..

echo =============================================================
echo   DANZA CON ALTURA - Build para instalador
echo =============================================================

REM ── 1. Build Backend ─────────────────────────────────────────
echo.
echo [1/4] Compilando backend...
cd /d "%ROOT%\backend"
call npm run build
if errorlevel 1 ( echo ERROR en backend. & pause & exit /b 1 )

REM ── 2. Build Frontend ────────────────────────────────────────
echo.
echo [2/4] Compilando frontend...
cd /d "%ROOT%\frontend"
call npm run build
if errorlevel 1 ( echo ERROR en frontend. & pause & exit /b 1 )

REM ── 3. Copiar archivos al directorio de distribución ─────────
echo.
echo [3/4] Copiando archivos...
set DIST=%ROOT%\installer\dist
if exist "%DIST%" rd /s /q "%DIST%"
mkdir "%DIST%"

REM Backend: solo dist + node_modules + prisma
mkdir "%DIST%\backend"
xcopy /e /i /q "%ROOT%\backend\dist"          "%DIST%\backend\dist"
xcopy /e /i /q "%ROOT%\backend\node_modules"  "%DIST%\backend\node_modules"
xcopy /e /i /q "%ROOT%\backend\prisma"        "%DIST%\backend\prisma"
copy  "%ROOT%\backend\.env.production"        "%DIST%\backend\.env" >nul 2>&1
copy  "%ROOT%\backend\.env"                   "%DIST%\backend\.env" >nul 2>&1

REM Frontend: standalone output
mkdir "%DIST%\frontend"
xcopy /e /i /q "%ROOT%\frontend\.next\standalone\." "%DIST%\frontend"
xcopy /e /i /q "%ROOT%\frontend\.next\static"       "%DIST%\frontend\.next\static"
xcopy /e /i /q "%ROOT%\frontend\public"             "%DIST%\frontend\public"

REM Scripts de arranque
copy "%ROOT%\installer\start.bat" "%DIST%\start.bat" >nul
copy "%ROOT%\installer\stop.bat"  "%DIST%\stop.bat"  >nul

REM ── 4. Listo ─────────────────────────────────────────────────
echo.
echo [4/4] Listo! Archivos en: %DIST%
echo.
echo Proximos pasos:
echo   1. Descarga Node.js 20 portable y colocalo en dist\node\
echo   2. Abre installer\setup.iss con Inno Setup y compila
echo.
pause
