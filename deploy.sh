#!/bin/bash

# ZYRO Marketplace - Script de Deployment Automatizado
# Uso: ./deploy.sh [ios|android|all] [preview|production]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
log() {
    echo -e "${BLUE}[ZYRO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Verificar parámetros
PLATFORM=${1:-all}
PROFILE=${2:-preview}

if [[ ! "$PLATFORM" =~ ^(ios|android|all)$ ]]; then
    error "Plataforma inválida. Usa: ios, android, o all"
fi

if [[ ! "$PROFILE" =~ ^(preview|production)$ ]]; then
    error "Profile inválido. Usa: preview o production"
fi

log "🚀 Iniciando deployment de ZYRO Marketplace"
log "📱 Plataforma: $PLATFORM"
log "🏗️  Profile: $PROFILE"

# Verificar dependencias
log "🔍 Verificando dependencias..."

if ! command -v node &> /dev/null; then
    error "Node.js no está instalado"
fi

if ! command -v npm &> /dev/null; then
    error "npm no está instalado"
fi

if ! command -v eas &> /dev/null; then
    error "EAS CLI no está instalado. Ejecuta: npm install -g eas-cli"
fi

success "✅ Dependencias verificadas"

# Verificar que estamos en el directorio correcto
if [[ ! -f "app.json" ]]; then
    error "No se encontró app.json. Asegúrate de estar en el directorio del proyecto"
fi

# Instalar dependencias si es necesario
if [[ ! -d "node_modules" ]]; then
    log "📦 Instalando dependencias..."
    npm install
    success "✅ Dependencias instaladas"
fi

# Ejecutar tests si es production
if [[ "$PROFILE" == "production" ]]; then
    log "🧪 Ejecutando tests..."
    npm test -- --watchAll=false --coverage=false
    success "✅ Tests completados"
fi

# Verificar login en EAS
log "🔐 Verificando autenticación EAS..."
if ! eas whoami &> /dev/null; then
    warning "No estás autenticado en EAS"
    log "Ejecutando eas login..."
    eas login
fi

success "✅ Autenticado en EAS"

# Limpiar caché si es necesario
if [[ "$PROFILE" == "production" ]]; then
    log "🧹 Limpiando caché..."
    npm start -- --clear &
    sleep 3
    pkill -f "expo start" || true
    success "✅ Caché limpiado"
fi

# Función para build
build_platform() {
    local platform=$1
    log "🏗️  Iniciando build para $platform ($PROFILE)..."
    
    if [[ "$PROFILE" == "production" ]]; then
        eas build --profile production --platform $platform --non-interactive
    else
        eas build --profile preview --platform $platform --non-interactive
    fi
    
    success "✅ Build completado para $platform"
}

# Ejecutar builds
case $PLATFORM in
    "ios")
        build_platform ios
        ;;
    "android")
        build_platform android
        ;;
    "all")
        build_platform ios
        build_platform android
        ;;
esac

# Mostrar información post-build
log "📋 Build completado exitosamente!"

if [[ "$PROFILE" == "production" ]]; then
    log "🎯 Próximos pasos para producción:"
    echo "   1. Revisar los builds en: https://expo.dev/accounts/[tu-cuenta]/projects/zyro-marketplace/builds"
    echo "   2. Para iOS: eas submit --platform ios"
    echo "   3. Para Android: eas submit --platform android"
    echo "   4. Configurar metadata en App Store Connect / Google Play Console"
    echo "   5. Subir screenshots y descripción"
    echo "   6. Enviar para revisión"
else
    log "🧪 Build de preview completado:"
    echo "   1. Descargar desde: https://expo.dev/accounts/[tu-cuenta]/projects/zyro-marketplace/builds"
    echo "   2. Instalar en dispositivos para testing"
    echo "   3. Compartir con testers beta"
fi

log "📚 Documentación completa en: BUILD_AND_DEPLOY_GUIDE.md"

success "🎉 ¡Deployment completado exitosamente!"

# Opcional: Abrir dashboard de Expo
read -p "¿Abrir dashboard de Expo? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v open &> /dev/null; then
        open "https://expo.dev/accounts/$(eas whoami)/projects/zyro-marketplace"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "https://expo.dev/accounts/$(eas whoami)/projects/zyro-marketplace"
    else
        log "Abre manualmente: https://expo.dev/accounts/$(eas whoami)/projects/zyro-marketplace"
    fi
fi