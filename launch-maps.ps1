#!/usr/bin/env pwsh

# Zyro Marketplace - Launcher con Mapas Interactivos
Write-Host "🗺️  Iniciando Zyro Marketplace con Mapas Interactivos..." -ForegroundColor Green
Write-Host ""

# Verificar si Chrome está disponible
$chromeExists = $false
try {
    $chromeCmd = Get-Command chrome -ErrorAction SilentlyContinue
    if ($chromeCmd) {
        $chromeExists = $true
    } else {
        $chromeCmd = Get-Command "C:\Program Files\Google\Chrome\Application\chrome.exe" -ErrorAction SilentlyContinue
        if ($chromeCmd) {
            $chromeExists = $true
        }
    }
} catch {
    $chromeExists = $false
}

if ($chromeExists) {
    Write-Host "✅ Google Chrome encontrado" -ForegroundColor Green
    
    # Abrir el launcher principal
    Write-Host "🚀 Abriendo Zyro Marketplace Launcher..." -ForegroundColor Yellow
    
    if (Test-Path "chrome-launcher.html") {
        Start-Process chrome "chrome-launcher.html"
        Write-Host "✅ Launcher abierto en Chrome" -ForegroundColor Green
    } else {
        Write-Host "❌ No se encontró chrome-launcher.html" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "📋 Instrucciones:" -ForegroundColor Cyan
    Write-Host "1. Haz clic en 'Iniciar Zyro Marketplace (Con Mapas)' para la versión completa" -ForegroundColor White
    Write-Host "2. Usa las credenciales de prueba mostradas en la página" -ForegroundColor White
    Write-Host "3. Explora los mapas interactivos en la segunda pestaña" -ForegroundColor White
    Write-Host ""
    Write-Host "👑 Credenciales de Administrador:" -ForegroundColor Yellow
    Write-Host "   Usuario: admin_zyrovip" -ForegroundColor White
    Write-Host "   Contraseña: xarrec-2paqra-guftoN" -ForegroundColor White
    Write-Host ""
    Write-Host "📱 Credenciales de Influencer:" -ForegroundColor Yellow
    Write-Host "   Usuario: pruebainflu" -ForegroundColor White
    Write-Host "   Contraseña: 12345" -ForegroundColor White
    
} else {
    Write-Host "❌ Google Chrome no encontrado" -ForegroundColor Red
    Write-Host "Por favor instala Google Chrome o abre manualmente:" -ForegroundColor Yellow
    Write-Host "chrome-launcher.html" -ForegroundColor White
}

Write-Host ""
Write-Host "🗺️  Funcionalidades de Mapas Implementadas:" -ForegroundColor Green
Write-Host "   ✅ Mapa interactivo de España con zoom" -ForegroundColor White
Write-Host "   ✅ Marcadores por categoría con colores únicos" -ForegroundColor White
Write-Host "   ✅ Clustering automático de marcadores" -ForegroundColor White
Write-Host "   ✅ Información emergente al hacer clic" -ForegroundColor White
Write-Host "   ✅ Filtros por ciudad y categoría" -ForegroundColor White
Write-Host "   ✅ Navegación fluida y controles intuitivos" -ForegroundColor White
Write-Host "   ✅ Diseño responsive para móvil y desktop" -ForegroundColor White
Write-Host ""
Write-Host "Presiona cualquier tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")