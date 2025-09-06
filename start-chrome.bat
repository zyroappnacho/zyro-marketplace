@echo off
echo.
echo 🌐 ZYRO MARKETPLACE - PREVIEW EN CHROME
echo =====================================
echo.
echo 🚀 Iniciando preview web...
echo.

cd /d "%~dp0"

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
echo    Usuario: empresa_auto
echo    Contraseña: empresa123
echo.
echo 🌐 Abriendo en Chrome...
echo.

start "" "chrome.exe" "http://localhost:19006"

call npm run web

pause