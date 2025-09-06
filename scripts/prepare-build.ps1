# Script de Preparación para Build
Write-Host "🚀 Preparando app para build..." -ForegroundColor Green

# Verificar Android SDK
Write-Host "📱 Verificando Android SDK..." -ForegroundColor Yellow
if (-not $env:ANDROID_HOME) {
    Write-Host "❌ ANDROID_HOME no configurado" -ForegroundColor Red
    Write-Host "Instala Android Studio y configura variables de entorno" -ForegroundColor Red
    exit 1
}

# Verificar ADB
try {
    adb version | Out-Null
    Write-Host "✅ Android SDK configurado correctamente" -ForegroundColor Green
} catch {
    Write-Host "❌ ADB no encontrado. Verifica instalación de Android SDK" -ForegroundColor Red
    exit 1
}

# Limpiar e instalar dependencias
Write-Host "📦 Instalando dependencias..." -ForegroundColor Yellow
npm install

# Verificar EAS CLI
Write-Host "🔧 Verificando EAS CLI..." -ForegroundColor Yellow
try {
    eas --version | Out-Null
    Write-Host "✅ EAS CLI instalado" -ForegroundColor Green
} catch {
    Write-Host "📥 Instalando EAS CLI..." -ForegroundColor Yellow
    npm install -g @expo/eas-cli
}

# Verificar login EAS
Write-Host "🔐 Verificando autenticación EAS..." -ForegroundColor Yellow
$easWhoami = eas whoami 2>&1
if ($easWhoami -match "Not logged in") {
    Write-Host "❌ No autenticado en EAS. Ejecuta: eas login" -ForegroundColor Red
    exit 1
} else {
    Write-Host "✅ Autenticado en EAS como: $easWhoami" -ForegroundColor Green
}

Write-Host "🎉 App lista para build!" -ForegroundColor Green
Write-Host ""
Write-Host "Comandos disponibles:" -ForegroundColor Cyan
Write-Host "  eas build --profile development --platform all" -ForegroundColor White
Write-Host "  eas build --profile preview --platform all" -ForegroundColor White
Write-Host "  eas build --profile production --platform all" -ForegroundColor White