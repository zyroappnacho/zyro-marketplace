#!/bin/bash

echo "🚀 ZYRO Marketplace - iOS Enhanced Startup (RECREADO)"
echo "====================================================="

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${PURPLE}📱 Iniciando ZYRO con TODAS las funcionalidades implementadas...${NC}"
echo -e "${CYAN}🔥 Basado en todas las sesiones abiertas y requirements completos${NC}"

# 1. Verificación rápida del entorno
echo -e "${YELLOW}1. 🔍 Verificación rápida del entorno...${NC}"

# Verificar herramientas esenciales
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no encontrado${NC}"
    exit 1
fi

if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ npx no encontrado${NC}"
    exit 1
fi

if ! xcode-select --print-path &> /dev/null; then
    echo -e "${RED}❌ Xcode no encontrado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Entorno verificado correctamente${NC}"

# 2. Configurar variables de entorno optimizadas para iOS
echo -e "${YELLOW}2. ⚙️  Configurando variables de entorno optimizadas...${NC}"

export EXPO_NO_FLIPPER=1
export RCT_NO_LAUNCH_PACKAGER=1
export EXPO_USE_FAST_RESOLVER=1
export EXPO_USE_METRO_WORKSPACE_ROOT=1
export NODE_OPTIONS="--max-old-space-size=8192"
export EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
export REACT_NATIVE_PACKAGER_HOSTNAME="localhost"

# Variables específicas de ZYRO
export ZYRO_ENV="ios_simulator_enhanced"
export ZYRO_DEBUG_MODE=1
export ZYRO_ENHANCED_LOGGING=1

echo -e "${GREEN}✅ Variables configuradas para máximo rendimiento${NC}"

# 3. Limpiar cache si es necesario
if [ "$1" = "--clean" ]; then
    echo -e "${YELLOW}3. 🧹 Limpiando cache completo...${NC}"
    rm -rf .expo
    rm -rf .metro-cache
    rm -rf node_modules/.cache
    npm cache clean --force > /dev/null 2>&1
    echo -e "${GREEN}✅ Cache limpiado${NC}"
else
    echo -e "${YELLOW}3. 📦 Manteniendo cache (usa --clean para limpiar)${NC}"
fi

# 4. Verificar simulador iOS
echo -e "${YELLOW}4. 📱 Verificando simulador iOS...${NC}"

if xcrun simctl list devices | grep -q "Booted"; then
    BOOTED_DEVICE=$(xcrun simctl list devices | grep "Booted" | head -1 | sed 's/.*(\([^)]*\)).*/\1/')
    echo -e "${GREEN}✅ Simulador ya activo: $BOOTED_DEVICE${NC}"
else
    echo -e "${BLUE}🚀 Iniciando simulador iOS...${NC}"
    
    # Buscar iPhone 15 Pro o similar
    DEVICE_ID=$(xcrun simctl list devices | grep "iPhone 15" | grep -v "unavailable" | head -1 | grep -o '[A-F0-9-]\{36\}')
    
    if [ ! -z "$DEVICE_ID" ]; then
        xcrun simctl boot "$DEVICE_ID" > /dev/null 2>&1 || true
        open -a Simulator --args -CurrentDeviceUDID "$DEVICE_ID"
    else
        open -a Simulator
    fi
    
    sleep 3
fi

# 5. Verificar dependencias críticas
echo -e "${YELLOW}5. 📦 Verificando dependencias críticas...${NC}"

if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    echo -e "${BLUE}📦 Instalando dependencias...${NC}"
    npm install --legacy-peer-deps
else
    echo -e "${GREEN}✅ Dependencias verificadas${NC}"
fi

# 6. Mostrar información de la app
echo -e "${YELLOW}6. 📋 Información de ZYRO Marketplace...${NC}"

echo -e "${CYAN}🏷️  INFORMACIÓN DE LA APP:${NC}"
echo -e "${BLUE}   📱 Nombre: ZYRO Marketplace${NC}"
echo -e "${BLUE}   🆔 Bundle ID: com.zyro.marketplace${NC}"
echo -e "${BLUE}   📦 Versión: 1.0.0${NC}"
echo -e "${BLUE}   🎯 Plataforma: iOS Simulator Enhanced${NC}"

echo -e "${CYAN}🚀 FUNCIONALIDADES IMPLEMENTADAS:${NC}"
echo -e "${GREEN}   ✅ Sistema de autenticación completo${NC}"
echo -e "${GREEN}   ✅ Navegación por 4 pestañas premium${NC}"
echo -e "${GREEN}   ✅ Mapa interactivo de España${NC}"
echo -e "${GREEN}   ✅ Sistema de colaboraciones avanzado${NC}"
echo -e "${GREEN}   ✅ Panel de administración${NC}"
echo -e "${GREEN}   ✅ Notificaciones push${NC}"
echo -e "${GREEN}   ✅ Redux Store con persistencia${NC}"
echo -e "${GREEN}   ✅ Estética premium dorada/negra${NC}"
echo -e "${GREEN}   ✅ Logo logozyrotransparente.PNG${NC}"
echo -e "${GREEN}   ✅ Chat system integrado${NC}"

echo -e "${CYAN}🎯 CREDENCIALES DE PRUEBA:${NC}"
echo -e "${PURPLE}   👑 Admin: admin_zyrovip / xarrec-2paqra-guftoN${NC}"
echo -e "${PURPLE}   👤 Influencer: cualquier email / cualquier contraseña${NC}"
echo -e "${PURPLE}   🏢 Empresa: cualquier email / cualquier contraseña${NC}"

# 7. Iniciar la aplicación
echo -e "${YELLOW}7. 🚀 Iniciando ZYRO Marketplace...${NC}"

# Función para manejar Ctrl+C
cleanup() {
    echo -e "\n${YELLOW}🛑 Deteniendo ZYRO Marketplace...${NC}"
    pkill -f "expo start" > /dev/null 2>&1 || true
    pkill -f "Metro" > /dev/null 2>&1 || true
    echo -e "${GREEN}✅ ZYRO Marketplace detenido correctamente${NC}"
    exit 0
}

trap cleanup INT

echo -e "${PURPLE}🔥 Ejecutando: npx expo start --ios --localhost${NC}"

# Iniciar con configuración optimizada
npx expo start --ios --localhost

echo -e "${GREEN}🎉 ZYRO Marketplace finalizado${NC}"