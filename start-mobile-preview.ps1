# Zyro Marketplace - Mobile Preview Launcher (PowerShell)
# Ejecuta la vista previa móvil interactiva

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   ZYRO MARKETPLACE - VISTA PREVIA MOVIL" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado. Por favor instala Node.js desde https://nodejs.org" -ForegroundColor Red
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit 1
}

# Verificar si el archivo de vista previa existe
if (-not (Test-Path "mobile-preview.html")) {
    Write-Host "❌ Archivo mobile-preview.html no encontrado" -ForegroundColor Red
    Write-Host "Asegúrate de estar en el directorio correcto del proyecto" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host "🚀 Iniciando servidor de vista previa..." -ForegroundColor Green
Write-Host ""
Write-Host "📱 Características incluidas:" -ForegroundColor Cyan
Write-Host "   • Simulación iPhone 14 Pro Max" -ForegroundColor White
Write-Host "   • Sistema multirol (Influencer, Empresa, Admin)" -ForegroundColor White
Write-Host "   • Navegación completa con 4 pestañas" -ForegroundColor White
Write-Host "   • Diseño premium dorado y negro" -ForegroundColor White
Write-Host "   • Animaciones y transiciones suaves" -ForegroundColor White
Write-Host "   • Filtros funcionales por ciudad y categoría" -ForegroundColor White
Write-Host "   • Chat integrado y pantallas de detalle" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Usa los botones superiores para cambiar de rol" -ForegroundColor Yellow
Write-Host "⚡ Presiona Ctrl+C para detener el servidor" -ForegroundColor Yellow
Write-Host ""

# Ejecutar el servidor
try {
    node launch-mobile-preview.js
} catch {
    Write-Host ""
    Write-Host "❌ Error al iniciar el servidor" -ForegroundColor Red
    Write-Host "Verifica que todos los archivos estén presentes" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Presiona Enter para salir"
    exit 1
}