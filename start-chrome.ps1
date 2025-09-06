# Zyro Marketplace - Chrome Preview Launcher
# PowerShell script para iniciar la preview en Chrome

Write-Host ""
Write-Host "🌐 ZYRO MARKETPLACE - PREVIEW EN CHROME" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Cambiar al directorio del script
Set-Location $PSScriptRoot

# Verificar si Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado. Por favor instala Node.js primero." -ForegroundColor Red
    Write-Host "   Descarga desde: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Verificar si npm está disponible
try {
    $npmVersion = npm --version
    Write-Host "✅ npm detectado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm no está disponible" -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host ""

# Instalar dependencias si no existen
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
    try {
        npm install
        Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor Green
    } catch {
        Write-Host "❌ Error instalando dependencias" -ForegroundColor Red
        Read-Host "Presiona Enter para salir"
        exit 1
    }
    Write-Host ""
}

# Mostrar información de usuarios de prueba
Write-Host "👥 USUARIOS DE PRUEBA CONFIGURADOS:" -ForegroundColor Magenta
Write-Host ""
Write-Host "👑 ADMINISTRADOR:" -ForegroundColor Yellow
Write-Host "   Usuario: admin_zyrovip" -ForegroundColor White
Write-Host "   Contraseña: xarrec-2paqra-guftoN" -ForegroundColor White
Write-Host ""
Write-Host "📱 INFLUENCER:" -ForegroundColor Yellow
Write-Host "   Usuario: pruebainflu" -ForegroundColor White
Write-Host "   Contraseña: 12345" -ForegroundColor White
Write-Host ""
Write-Host "🏢 EMPRESA:" -ForegroundColor Yellow
Write-Host "   Hacer clic en 'SOY EMPRESA' para auto-crear" -ForegroundColor White
Write-Host "   Usuario: empresa_auto" -ForegroundColor White
Write-Host "   Contraseña: empresa123" -ForegroundColor White
Write-Host ""

# Mostrar funcionalidades
Write-Host "🎨 FUNCIONALIDADES IMPLEMENTADAS:" -ForegroundColor Magenta
Write-Host "   ✅ 4 pestañas de navegación completas" -ForegroundColor Green
Write-Host "   ✅ Estética premium con colores dorados" -ForegroundColor Green
Write-Host "   ✅ Sistema de colaboraciones" -ForegroundColor Green
Write-Host "   ✅ Filtros por ciudad y categoría" -ForegroundColor Green
Write-Host "   ✅ Panel de administración" -ForegroundColor Green
Write-Host "   ✅ Gestión de perfil completa" -ForegroundColor Green
Write-Host "   ✅ 6 campañas de ejemplo" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Iniciando servidor web..." -ForegroundColor Cyan
Write-Host ""

# Función para abrir Chrome
function Open-Chrome {
    param($url)
    
    $chromePaths = @(
        "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe",
        "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
        "${env:LOCALAPPDATA}\Google\Chrome\Application\chrome.exe"
    )
    
    $chromeFound = $false
    foreach ($path in $chromePaths) {
        if (Test-Path $path) {
            Write-Host "🌐 Abriendo Chrome..." -ForegroundColor Green
            Start-Process $path -ArgumentList $url
            $chromeFound = $true
            break
        }
    }
    
    if (-not $chromeFound) {
        Write-Host "⚠️  Chrome no encontrado. Abre manualmente: $url" -ForegroundColor Yellow
        # Intentar abrir con el navegador predeterminado
        Start-Process $url
    }
}

# Iniciar el servidor web
try {
    Write-Host "⏳ Iniciando Expo Web Server..." -ForegroundColor Yellow
    
    # Abrir Chrome después de un delay
    Start-Job -ScriptBlock {
        Start-Sleep -Seconds 8
        $url = "http://localhost:19006"
        
        # Verificar si el servidor está listo
        $maxAttempts = 30
        $attempt = 0
        do {
            try {
                $response = Invoke-WebRequest -Uri $url -TimeoutSec 2 -ErrorAction Stop
                if ($response.StatusCode -eq 200) {
                    break
                }
            } catch {
                Start-Sleep -Seconds 2
                $attempt++
            }
        } while ($attempt -lt $maxAttempts)
        
        # Abrir Chrome
        $chromePaths = @(
            "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe",
            "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
            "${env:LOCALAPPDATA}\Google\Chrome\Application\chrome.exe"
        )
        
        foreach ($path in $chromePaths) {
            if (Test-Path $path) {
                Start-Process $path -ArgumentList $url
                break
            }
        }
    } | Out-Null
    
    Write-Host ""
    Write-Host "📋 INSTRUCCIONES:" -ForegroundColor Magenta
    Write-Host "   • Chrome se abrirá automáticamente en unos segundos" -ForegroundColor White
    Write-Host "   • Si no se abre, ve a: http://localhost:19006" -ForegroundColor White
    Write-Host "   • Usa Ctrl+C para cerrar el servidor" -ForegroundColor White
    Write-Host "   • Refresca la página si hay errores de carga" -ForegroundColor White
    Write-Host ""
    Write-Host "🎯 ¡Disfruta la preview de Zyro Marketplace!" -ForegroundColor Green
    Write-Host ""
    
    # Crear un job para abrir Chrome después de que el servidor esté listo
    $chromeJob = Start-Job -ScriptBlock {
        param($url)
        
        # Esperar a que el servidor esté listo
        $maxAttempts = 60
        $attempt = 0
        
        do {
            try {
                $response = Invoke-WebRequest -Uri $url -TimeoutSec 5 -ErrorAction Stop
                if ($response.StatusCode -eq 200) {
                    # Servidor listo, abrir Chrome
                    $chromePaths = @(
                        "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe",
                        "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe",
                        "${env:LOCALAPPDATA}\Google\Chrome\Application\chrome.exe"
                    )
                    
                    foreach ($path in $chromePaths) {
                        if (Test-Path $path) {
                            Start-Process $path -ArgumentList $url
                            return
                        }
                    }
                    
                    # Si Chrome no se encuentra, usar navegador predeterminado
                    Start-Process $url
                    return
                }
            } catch {
                Start-Sleep -Seconds 3
                $attempt++
            }
        } while ($attempt -lt $maxAttempts)
    } -ArgumentList "http://localhost:19006"
    
    # Ejecutar expo start --web
    & npx expo start --web
    
    # Limpiar el job de Chrome
    Remove-Job $chromeJob -Force -ErrorAction SilentlyContinue
    
} catch {
    Write-Host ""
    Write-Host "❌ Error iniciando el servidor web" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Intenta ejecutar manualmente:" -ForegroundColor Yellow
    Write-Host "   npm install" -ForegroundColor White
    Write-Host "   npx expo start --web" -ForegroundColor White
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host ""
Write-Host "👋 Servidor cerrado. ¡Gracias por usar Zyro Marketplace!" -ForegroundColor Green
Read-Host "Presiona Enter para salir"