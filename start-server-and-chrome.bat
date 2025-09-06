@echo off
title Zyro Marketplace - Iniciando Preview
color 0E

echo.
echo  ========================================
echo   ZYRO MARKETPLACE - PREVIEW EN CHROME
echo  ========================================
echo.
echo  🚀 Iniciando servidor web...
echo.

cd /d "%~dp0"

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no está instalado
    echo    Descarga desde: https://nodejs.org/
    pause
    exit /b 1
)

REM Instalar dependencias si no existen
if not exist "node_modules" (
    echo 📦 Instalando dependencias...
    call npm install
    if errorlevel 1 (
        echo ❌ Error instalando dependencias
        pause
        exit /b 1
    )
    echo ✅ Dependencias instaladas
    echo.
)

echo 👥 USUARIOS DE PRUEBA:
echo.
echo 👑 ADMINISTRADOR:
echo    Usuario: admin_zyrovip
echo    Contraseña: xarrec-2paqra-guftoN
echo.
echo 📱 INFLUENCER:
echo    Usuario: pruebainflu
echo    Contraseña: 12345
echo.
echo 🏢 EMPRESA:
echo    Hacer clic en "SOY EMPRESA"
echo.

echo ⏳ Iniciando servidor Expo Web...
echo    Esto puede tardar 1-2 minutos la primera vez
echo.

REM Iniciar el servidor en segundo plano y abrir Chrome después de un delay
start /B cmd /c "timeout /t 15 /nobreak >nul && start chrome http://localhost:19006"

REM Iniciar el servidor web
call npx expo start --web

echo.
echo 👋 Servidor cerrado
pause