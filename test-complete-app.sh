#!/bin/bash

# 🧪 SCRIPT DE TESTING COMPLETO - ZYRO MARKETPLACE
# ================================================

echo "🚀 INICIANDO TESTING COMPLETO DE ZYRO MARKETPLACE"
echo "================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes con colores
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Limpiar cache y reinstalar dependencias si es necesario
print_status "Limpiando cache de Metro..."
npx expo start --clear &
EXPO_PID=$!
sleep 3
kill $EXPO_PID 2>/dev/null

# 2. Verificar que todas las dependencias estén instaladas
print_status "Verificando dependencias..."
if ! npm list crypto-js >/dev/null 2>&1; then
    print_warning "Instalando crypto-js..."
    npm install crypto-js --legacy-peer-deps
fi

if ! npm list @types/crypto-js >/dev/null 2>&1; then
    print_warning "Instalando @types/crypto-js..."
    npm install @types/crypto-js --save-dev --legacy-peer-deps
fi

# 3. Verificar configuración de Expo
print_status "Verificando configuración de Expo..."
if npx expo doctor >/dev/null 2>&1; then
    print_success "Configuración de Expo OK"
else
    print_warning "Hay algunos warnings en la configuración de Expo"
fi

# 4. Ejecutar tests unitarios
print_status "Ejecutando tests unitarios..."
if npm test -- --passWithNoTests; then
    print_success "Tests unitarios pasaron"
else
    print_warning "Algunos tests fallaron o no hay tests configurados"
fi

# 5. Verificar TypeScript
print_status "Verificando TypeScript..."
if npm run type-check; then
    print_success "TypeScript OK"
else
    print_error "Errores de TypeScript encontrados"
fi

# 6. Función para iniciar en diferentes plataformas
start_platform() {
    local platform=$1
    print_status "Iniciando en $platform..."
    
    case $platform in
        "ios")
            npx expo start --ios --clear
            ;;
        "android")
            npx expo start --android --clear
            ;;
        "web")
            npx expo start --web --clear
            ;;
        *)
            npx expo start --clear
            ;;
    esac
}

# 7. Menú interactivo
echo ""
echo "🎯 OPCIONES DE TESTING:"
echo "======================"
echo "1) Iniciar en iOS Simulator"
echo "2) Iniciar en Android Emulator"
echo "3) Iniciar en Web"
echo "4) Iniciar servidor (escanear QR)"
echo "5) Ejecutar todos los tests"
echo "6) Verificar vulnerabilidades"
echo "7) Salir"
echo ""

read -p "Selecciona una opción (1-7): " choice

case $choice in
    1)
        print_status "Iniciando en iOS Simulator..."
        start_platform "ios"
        ;;
    2)
        print_status "Iniciando en Android Emulator..."
        start_platform "android"
        ;;
    3)
        print_status "Iniciando en Web..."
        start_platform "web"
        ;;
    4)
        print_status "Iniciando servidor para escanear QR..."
        start_platform "server"
        ;;
    5)
        print_status "Ejecutando todos los tests..."
        npm run test-full
        ;;
    6)
        print_status "Verificando vulnerabilidades..."
        npm audit
        ;;
    7)
        print_success "¡Hasta luego!"
        exit 0
        ;;
    *)
        print_error "Opción inválida"
        exit 1
        ;;
esac

print_success "Script completado!"