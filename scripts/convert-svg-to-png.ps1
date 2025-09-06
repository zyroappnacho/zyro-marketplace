# Script para convertir archivos SVG a PNG
# Requiere tener instalado Inkscape o usar un servicio online

Write-Host "🎨 Convirtiendo assets SVG a PNG..." -ForegroundColor Green
Write-Host ""

$assetsDir = Join-Path $PSScriptRoot "..\assets"
$svgFiles = Get-ChildItem -Path $assetsDir -Filter "*.svg"

# Verificar si Inkscape está instalado
$inkscapePath = ""
$possiblePaths = @(
    "C:\Program Files\Inkscape\bin\inkscape.exe",
    "C:\Program Files (x86)\Inkscape\bin\inkscape.exe",
    "$env:LOCALAPPDATA\Programs\Inkscape\bin\inkscape.exe"
)

foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $inkscapePath = $path
        break
    }
}

if ($inkscapePath -ne "") {
    Write-Host "✅ Inkscape encontrado en: $inkscapePath" -ForegroundColor Green
    Write-Host ""
    
    foreach ($svgFile in $svgFiles) {
        $pngFile = $svgFile.FullName -replace "\.svg$", ".png"
        Write-Host "🔄 Convirtiendo: $($svgFile.Name)" -ForegroundColor Yellow
        
        & $inkscapePath --export-type=png --export-filename="$pngFile" "$($svgFile.FullName)"
        
        if (Test-Path $pngFile) {
            Write-Host "   ✅ Creado: $($svgFile.BaseName).png" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Error al crear: $($svgFile.BaseName).png" -ForegroundColor Red
        }
    }
} else {
    Write-Host "⚠️  Inkscape no encontrado. Opciones alternativas:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. 📥 Instalar Inkscape desde: https://inkscape.org/release/" -ForegroundColor Cyan
    Write-Host "2. 🌐 Usar convertidor online: https://convertio.co/svg-png/" -ForegroundColor Cyan
    Write-Host "3. 🔧 Usar ImageMagick: magick convert file.svg file.png" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Archivos SVG encontrados para convertir:" -ForegroundColor White
    
    foreach ($svgFile in $svgFiles) {
        Write-Host "   - $($svgFile.Name)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "📱 Tamaños requeridos para cada asset:" -ForegroundColor White
Write-Host "   - icon.png: 1024x1024 (App icon principal)" -ForegroundColor Gray
Write-Host "   - adaptive-icon.png: 1024x1024 (Android adaptive)" -ForegroundColor Gray
Write-Host "   - splash.png: 1284x2778 (Splash screen)" -ForegroundColor Gray
Write-Host "   - favicon.png: 48x48 (Web favicon)" -ForegroundColor Gray
Write-Host "   - adaptive-icon-foreground.png: 432x432 (Android foreground)" -ForegroundColor Gray
Write-Host "   - adaptive-icon-background.png: 432x432 (Android background)" -ForegroundColor Gray
Write-Host ""
Write-Host "✨ Una vez convertidos los PNG, ejecuta 'expo build' para generar la app" -ForegroundColor Green