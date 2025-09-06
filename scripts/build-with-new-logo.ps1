# Script completo para construir ZYRO con el nuevo logo
# Este script prepara todos los assets y construye la aplicación

Write-Host "🚀 ZYRO - Script de construcción con nuevo logo" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

# Verificar que estamos en el directorio correcto
$currentDir = Get-Location
$expectedPath = "ZyroMarketplace"

if (-not $currentDir.Path.EndsWith($expectedPath)) {
    Write-Host "❌ Error: Ejecuta este script desde el directorio ZyroMarketplace" -ForegroundColor Red
    exit 1
}

# Paso 1: Verificar dependencias
Write-Host "📋 Paso 1: Verificando dependencias..." -ForegroundColor Cyan

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-Host "   ✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js no encontrado. Instala Node.js desde https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Verificar Expo CLI
try {
    $expoVersion = npx expo --version
    Write-Host "   ✅ Expo CLI: $expoVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Expo CLI no encontrado. Instalando..." -ForegroundColor Yellow
    npm install -g @expo/cli
}

# Verificar EAS CLI
try {
    $easVersion = npx eas --version
    Write-Host "   ✅ EAS CLI: $easVersion" -ForegroundColor Green
} catch {
    Write-Host "   ❌ EAS CLI no encontrado. Instalando..." -ForegroundColor Yellow
    npm install -g eas-cli
}

Write-Host ""

# Paso 2: Instalar dependencias del proyecto
Write-Host "📦 Paso 2: Instalando dependencias del proyecto..." -ForegroundColor Cyan
npm install
Write-Host "   ✅ Dependencias instaladas" -ForegroundColor Green
Write-Host ""

# Paso 3: Verificar assets del logo
Write-Host "🎨 Paso 3: Verificando assets del nuevo logo..." -ForegroundColor Cyan

$requiredAssets = @(
    "assets/icon.png",
    "assets/adaptive-icon.png", 
    "assets/splash.png",
    "assets/favicon.png",
    "assets/adaptive-icon-foreground.png",
    "assets/adaptive-icon-background.png"
)

$missingAssets = @()
foreach ($asset in $requiredAssets) {
    if (Test-Path $asset) {
        Write-Host "   ✅ $asset" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $asset (falta)" -ForegroundColor Red
        $missingAssets += $asset
    }
}

if ($missingAssets.Count -gt 0) {
    Write-Host ""
    Write-Host "⚠️  Assets faltantes detectados. Opciones:" -ForegroundColor Yellow
    Write-Host "1. Convertir archivos SVG existentes a PNG" -ForegroundColor Cyan
    Write-Host "2. Usar herramientas online como https://convertio.co/svg-png/" -ForegroundColor Cyan
    Write-Host ""
    
    $response = Read-Host "¿Quieres continuar sin estos assets? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Host "❌ Construcción cancelada. Convierte los assets SVG a PNG primero." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Paso 4: Limpiar caché
Write-Host "🧹 Paso 4: Limpiando caché..." -ForegroundColor Cyan
npx expo r -c
Write-Host "   ✅ Caché limpiado" -ForegroundColor Green
Write-Host ""

# Paso 5: Verificar configuración
Write-Host "⚙️  Paso 5: Verificando configuración..." -ForegroundColor Cyan

# Verificar app.config.js
if (Test-Path "app.config.js") {
    Write-Host "   ✅ app.config.js encontrado" -ForegroundColor Green
} else {
    Write-Host "   ❌ app.config.js no encontrado" -ForegroundColor Red
    exit 1
}

# Verificar eas.json
if (Test-Path "eas.json") {
    Write-Host "   ✅ eas.json encontrado" -ForegroundColor Green
} else {
    Write-Host "   ❌ eas.json no encontrado" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Paso 6: Mostrar opciones de construcción
Write-Host "🏗️  Paso 6: Opciones de construcción disponibles:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 📱 Construcción de desarrollo (APK para testing)" -ForegroundColor White
Write-Host "   Comando: npx eas build --platform android --profile development" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 🔍 Construcción de preview (APK para revisión)" -ForegroundColor White  
Write-Host "   Comando: npx eas build --platform android --profile preview" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 🚀 Construcción de producción Android (AAB para Google Play)" -ForegroundColor White
Write-Host "   Comando: npx eas build --platform android --profile production" -ForegroundColor Gray
Write-Host ""
Write-Host "4. 🍎 Construcción de producción iOS (para App Store)" -ForegroundColor White
Write-Host "   Comando: npx eas build --platform ios --profile production" -ForegroundColor Gray
Write-Host ""
Write-Host "5. 📦 Construcción de ambas plataformas" -ForegroundColor White
Write-Host "   Comando: npx eas build --platform all --profile production" -ForegroundColor Gray
Write-Host ""

$buildChoice = Read-Host "Selecciona una opción (1-5) o presiona Enter para salir"

switch ($buildChoice) {
    "1" {
        Write-Host "🔨 Iniciando construcción de desarrollo para Android..." -ForegroundColor Green
        npx eas build --platform android --profile development
    }
    "2" {
        Write-Host "🔨 Iniciando construcción de preview para Android..." -ForegroundColor Green
        npx eas build --platform android --profile preview
    }
    "3" {
        Write-Host "🔨 Iniciando construcción de producción para Android..." -ForegroundColor Green
        npx eas build --platform android --profile production
    }
    "4" {
        Write-Host "🔨 Iniciando construcción de producción para iOS..." -ForegroundColor Green
        npx eas build --platform ios --profile production
    }
    "5" {
        Write-Host "🔨 Iniciando construcción de producción para ambas plataformas..." -ForegroundColor Green
        npx eas build --platform all --profile production
    }
    default {
        Write-Host "👋 Construcción cancelada. Puedes ejecutar los comandos manualmente." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host ""
Write-Host "✨ ¡Construcción completada!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor White
Write-Host "1. Descargar el archivo generado desde https://expo.dev/" -ForegroundColor Gray
Write-Host "2. Para Android: Subir el AAB a Google Play Console" -ForegroundColor Gray
Write-Host "3. Para iOS: Subir el IPA a App Store Connect" -ForegroundColor Gray
Write-Host "4. Completar la información de la tienda (descripción, capturas, etc.)" -ForegroundColor Gray
Write-Host "5. Enviar para revisión" -ForegroundColor Gray
Write-Host ""
Write-Host "🎉 ¡Tu app ZYRO con el nuevo logo estará lista para publicar!" -ForegroundColor Green