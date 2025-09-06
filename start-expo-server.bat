@echo off
title Zyro Marketplace - Expo Server
color 0E

echo.
echo  ========================================
echo   ZYRO MARKETPLACE - EXPO SERVER
echo  ========================================
echo.
echo  🚀 Iniciando servidor Expo Web...
echo.

cd /d "%~dp0"

echo ⏳ Iniciando en puerto 19007...
echo    Esto puede tardar 1-2 minutos la primera vez
echo.

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

echo 🌐 Una vez que veas "Web Bundled" o "Web is waiting on http://localhost:19007"
echo    puedes abrir chrome-launcher.html para acceder a la app
echo.

REM Iniciar el servidor web
call npx expo start --web --port 19007

echo.
echo 👋 Servidor cerrado
pause