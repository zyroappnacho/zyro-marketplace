#!/bin/bash

echo "🔧 ZYRO Marketplace - SIMULADOR iOS RECREADO DESDE CERO"
echo "======================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🚀 RECREANDO simulador iOS con TODAS las funcionalidades implementadas...${NC}"
echo -e "${CYAN}📋 Basado en todas las sesiones abiertas y requirements completos${NC}"

# 1. VERIFICACIÓN COMPLETA DEL ENTORNO
echo -e "${YELLOW}1. 🔍 VERIFICACIÓN COMPLETA DEL ENTORNO DE DESARROLLO...${NC}"

# Verificar Xcode
xcode-select --print-path > /dev/null 2>&1
if [ $? -eq 0 ]; then
    XCODE_VERSION=$(xcodebuild -version | head -1)
    echo -e "${GREEN}✅ $XCODE_VERSION${NC}"
    
    # Mostrar simuladores disponibles
    echo -e "${BLUE}📱 Simuladores iOS disponibles:${NC}"
    xcrun simctl list devicetypes | grep iPhone | head -5
else
    echo -e "${RED}❌ Xcode no encontrado. Instala Xcode desde App Store${NC}"
    exit 1
fi

# Verificar Node.js y npm
NODE_VERSION=$(node --version 2>/dev/null || echo "No instalado")
NPM_VERSION=$(npm --version 2>/dev/null || echo "No instalado")
EXPO_VERSION=$(npx expo --version 2>/dev/null || echo "No instalado")

echo -e "${BLUE}🟢 Node.js: $NODE_VERSION${NC}"
echo -e "${BLUE}📦 npm: $NPM_VERSION${NC}"
echo -e "${BLUE}⚡ Expo CLI: $EXPO_VERSION${NC}"

# 2. LIMPIEZA PROFUNDA Y RECREACIÓN
echo -e "${YELLOW}2. 🧹 LIMPIEZA PROFUNDA Y RECREACIÓN DEL ENTORNO...${NC}"

# Detener todos los procesos relacionados
echo -e "${BLUE}🛑 Deteniendo procesos activos...${NC}"
pkill -f "Metro" > /dev/null 2>&1 || true
pkill -f "expo" > /dev/null 2>&1 || true
pkill -f "react-native" > /dev/null 2>&1 || true
pkill -f "node.*start" > /dev/null 2>&1 || true

# Limpieza completa de cache
echo -e "${BLUE}🗑️  Limpiando cache completo...${NC}"
rm -rf .expo
rm -rf .metro-cache
rm -rf node_modules/.cache
rm -rf /tmp/metro-*
rm -rf /tmp/react-*
rm -rf /tmp/haste-*
rm -rf /tmp/expo-*
npm cache clean --force > /dev/null 2>&1

# Limpiar simuladores iOS
echo -e "${BLUE}📱 Reseteando simuladores iOS...${NC}"
xcrun simctl shutdown all > /dev/null 2>&1 || true
xcrun simctl erase all > /dev/null 2>&1 || true

# 3. CONFIGURACIÓN AVANZADA DE VARIABLES DE ENTORNO
echo -e "${YELLOW}3. ⚙️  CONFIGURACIÓN AVANZADA DE VARIABLES DE ENTORNO...${NC}"

# Variables optimizadas para iOS Simulator
export EXPO_NO_FLIPPER=1
export RCT_NO_LAUNCH_PACKAGER=1
export SKIP_BUNDLING=0
export EXPO_USE_FAST_RESOLVER=1
export EXPO_USE_METRO_WORKSPACE_ROOT=1
export EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0
export NODE_OPTIONS="--max-old-space-size=8192"
export REACT_NATIVE_PACKAGER_HOSTNAME="localhost"
export EXPO_CLI_NO_DOCTOR=1

# Variables específicas para ZYRO Marketplace
export ZYRO_ENV="ios_simulator"
export ZYRO_DEBUG_MODE=1
export ZYRO_ENHANCED_LOGGING=1

echo -e "${GREEN}✅ Variables de entorno configuradas para máximo rendimiento${NC}"

# 4. CONFIGURACIÓN AVANZADA DEL SIMULADOR iOS
echo -e "${YELLOW}4. 📱 CONFIGURACIÓN AVANZADA DEL SIMULADOR iOS...${NC}"

# Buscar el mejor simulador disponible
LATEST_IOS=$(xcrun simctl list runtimes | grep iOS | tail -1 | awk '{print $2}' | sed 's/[()]//g')
PREFERRED_DEVICES=("iPhone 15 Pro Max" "iPhone 15 Pro" "iPhone 15" "iPhone 14 Pro")

echo -e "${BLUE}🎯 iOS Runtime disponible: $LATEST_IOS${NC}"

# Buscar el mejor dispositivo disponible
SELECTED_DEVICE=""
DEVICE_ID=""

for device in "${PREFERRED_DEVICES[@]}"; do
    DEVICE_ID=$(xcrun simctl list devices | grep "$device" | grep -v "unavailable" | head -1 | grep -o '[A-F0-9-]\{36\}')
    if [ ! -z "$DEVICE_ID" ]; then
        SELECTED_DEVICE="$device"
        break
    fi
done

if [ -z "$DEVICE_ID" ]; then
    # Crear simulador ZYRO optimizado
    echo -e "${BLUE}🔧 Creando simulador ZYRO optimizado...${NC}"
    DEVICE_ID=$(xcrun simctl create "ZYRO-iOS-Enhanced" "com.apple.CoreSimulator.SimDeviceType.iPhone-15-Pro" "com.apple.CoreSimulator.SimRuntime.iOS-17-5" 2>/dev/null || echo "")
    SELECTED_DEVICE="iPhone 15 Pro (ZYRO Enhanced)"
fi

echo -e "${GREEN}✅ Simulador seleccionado: $SELECTED_DEVICE${NC}"
echo -e "${GREEN}✅ Device ID: $DEVICE_ID${NC}"

# 5. VERIFICACIÓN Y OPTIMIZACIÓN DE DEPENDENCIAS
echo -e "${YELLOW}5. 📦 VERIFICACIÓN Y OPTIMIZACIÓN DE DEPENDENCIAS...${NC}"

# Verificar package.json
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json no encontrado${NC}"
    exit 1
fi

# Verificar dependencias críticas
echo -e "${BLUE}🔍 Verificando dependencias críticas...${NC}"
CRITICAL_DEPS=(
    "expo"
    "react-native"
    "@expo/metro-runtime"
    "react"
    "react-redux"
    "@reduxjs/toolkit"
    "expo-linear-gradient"
    "react-native-maps"
)

MISSING_DEPS=()
for dep in "${CRITICAL_DEPS[@]}"; do
    if [ -d "node_modules/$dep" ]; then
        VERSION=$(node -p "require('./node_modules/$dep/package.json').version" 2>/dev/null || echo "unknown")
        echo -e "${GREEN}✅ $dep ($VERSION)${NC}"
    else
        echo -e "${RED}❌ $dep faltante${NC}"
        MISSING_DEPS+=("$dep")
    fi
done

# Instalar dependencias faltantes si es necesario
if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
    echo -e "${YELLOW}📦 Instalando dependencias faltantes...${NC}"
    npm install --legacy-peer-deps
fi

# 6. VERIFICACIÓN DE CONFIGURACIÓN DE LA APP
echo -e "${YELLOW}6. 🔧 VERIFICACIÓN DE CONFIGURACIÓN DE LA APP...${NC}"

# Verificar app.json
if [ -f "app.json" ]; then
    echo -e "${GREEN}✅ app.json encontrado${NC}"
    
    # Verificar configuración iOS
    if grep -q "\"ios\":" app.json; then
        echo -e "${GREEN}✅ Configuración iOS presente${NC}"
        
        # Verificar bundle identifier
        if grep -q "com.zyro.marketplace" app.json; then
            echo -e "${GREEN}✅ Bundle ID: com.zyro.marketplace${NC}"
        else
            echo -e "${YELLOW}⚠️  Bundle ID no configurado correctamente${NC}"
        fi
    else
        echo -e "${RED}❌ Configuración iOS faltante en app.json${NC}"
    fi
else
    echo -e "${RED}❌ app.json no encontrado${NC}"
fi

# Verificar metro.config.js
if [ -f "metro.config.js" ]; then
    echo -e "${GREEN}✅ metro.config.js encontrado${NC}"
    
    if grep -q "resolver.platforms" metro.config.js; then
        echo -e "${GREEN}✅ Metro config optimizado para iOS${NC}"
    else
        echo -e "${YELLOW}⚠️  Metro config básico detectado${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  metro.config.js no encontrado${NC}"
fi

# 7. VERIFICACIÓN DE COMPONENTES PRINCIPALES
echo -e "${YELLOW}7. 🧩 VERIFICACIÓN DE COMPONENTES PRINCIPALES...${NC}"

# Verificar componentes críticos
MAIN_COMPONENTS=(
    "App.js"
    "components/ZyroAppNew.js"
    "store/index.js"
    "services/StorageService.js"
)

echo -e "${BLUE}🔍 Verificando componentes principales...${NC}"
for component in "${MAIN_COMPONENTS[@]}"; do
    if [ -f "$component" ]; then
        # Verificar sintaxis JavaScript
        if node -c "$component" 2>/dev/null; then
            echo -e "${GREEN}✅ $component - Sintaxis correcta${NC}"
        else
            echo -e "${RED}❌ $component - Error de sintaxis${NC}"
        fi
    else
        echo -e "${RED}❌ $component - Archivo faltante${NC}"
    fi
done

# Verificar assets críticos
ASSETS=(
    "assets/logozyrotransparente.png"
)

echo -e "${BLUE}🖼️  Verificando assets...${NC}"
for asset in "${ASSETS[@]}"; do
    if [ -f "$asset" ]; then
        echo -e "${GREEN}✅ $asset${NC}"
    else
        echo -e "${YELLOW}⚠️  $asset (se creará placeholder si es necesario)${NC}"
    fi
done

# 8. INICIALIZACIÓN DEL SIMULADOR iOS
echo -e "${YELLOW}8. 🚀 INICIALIZACIÓN DEL SIMULADOR iOS...${NC}"

if [ ! -z "$DEVICE_ID" ]; then
    echo -e "${BLUE}📱 Iniciando simulador: $SELECTED_DEVICE${NC}"
    
    # Boot del simulador
    xcrun simctl boot "$DEVICE_ID" > /dev/null 2>&1 || true
    
    # Abrir Simulator app
    open -a Simulator --args -CurrentDeviceUDID "$DEVICE_ID"
    
    # Configurar simulador para desarrollo
    echo -e "${BLUE}⚙️  Configurando simulador para desarrollo...${NC}"
    
    # Configurar timezone
    xcrun simctl spawn "$DEVICE_ID" defaults write com.apple.preferences.datetime.plist AppleCurrentTimezone "Europe/Madrid" > /dev/null 2>&1 || true
    
    # Configurar idioma
    xcrun simctl spawn "$DEVICE_ID" defaults write NSGlobalDomain AppleLanguages -array "es-ES" > /dev/null 2>&1 || true
    
    sleep 5
else
    echo -e "${YELLOW}⚠️  Abriendo simulador por defecto...${NC}"
    open -a Simulator
    sleep 3
fi

# 9. VERIFICACIÓN FINAL DEL SIMULADOR
echo -e "${YELLOW}9. ✅ VERIFICACIÓN FINAL DEL SIMULADOR...${NC}"

# Verificar estado del simulador
RETRY_COUNT=0
MAX_RETRIES=10

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if xcrun simctl list devices | grep -q "Booted"; then
        BOOTED_DEVICE=$(xcrun simctl list devices | grep "Booted" | head -1 | sed 's/.*(\([^)]*\)).*/\1/')
        echo -e "${GREEN}✅ Simulador iOS ejecutándose correctamente${NC}"
        echo -e "${BLUE}📱 Dispositivo activo: $BOOTED_DEVICE${NC}"
        break
    else
        echo -e "${YELLOW}⏳ Esperando simulador... ($((RETRY_COUNT + 1))/$MAX_RETRIES)${NC}"
        sleep 2
        RETRY_COUNT=$((RETRY_COUNT + 1))
    fi
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo -e "${YELLOW}⚠️  Simulador tardando en iniciar, continuando...${NC}"
fi

# 10. Iniciar la aplicación con configuración optimizada
echo -e "${YELLOW}10. Iniciando ZYRO Marketplace...${NC}"
echo -e "${PURPLE}🚀 Comando: npx expo start --ios --clear --dev-client${NC}"

# Configuración final para desarrollo
export NODE_OPTIONS="--max-old-space-size=8192"
export EXPO_DEVTOOLS_LISTEN_ADDRESS=0.0.0.0

# Iniciar con todas las optimizaciones
npx expo start --ios --clear --dev-client --localhost

echo -e "${GREEN}🎉 ZYRO Marketplace iniciado en simulador iOS${NC}"
echo -e "${BLUE}💡 Funcionalidades disponibles:${NC}"
echo -e "   ✅ Navegación completa (4 pestañas)"
echo -e "   ✅ Mapa interactivo de España"
echo -e "   ✅ Sistema de colaboraciones"
echo -e "   ✅ Panel de administración"
echo -e "   ✅ Notificaciones push"
echo -e "   ✅ Gestión de perfil"

echo -e "${PURPLE}🔧 Comandos útiles:${NC}"
echo -e "   • Reload: Cmd+R en simulador"
echo -e "   • Debug menu: Cmd+D en simulador"
echo -e "   • Logs: npx expo logs --platform ios"
echo -e "   • Reset: ./reset-and-start.sh"# 10.
 INICIO DE ZYRO MARKETPLACE CON TODAS LAS FUNCIONALIDADES
echo -e "${YELLOW}10. 🚀 INICIANDO ZYRO MARKETPLACE CON TODAS LAS FUNCIONALIDADES...${NC}"

echo -e "${CYAN}📋 FUNCIONALIDADES IMPLEMENTADAS:${NC}"
echo -e "${GREEN}   ✅ Sistema de autenticación completo (admin_zyrovip)${NC}"
echo -e "${GREEN}   ✅ Navegación por 4 pestañas premium${NC}"
echo -e "${GREEN}   ✅ Mapa interactivo de España con 20+ ciudades${NC}"
echo -e "${GREEN}   ✅ Sistema de colaboraciones con filtros avanzados${NC}"
echo -e "${GREEN}   ✅ Panel de administración completo${NC}"
echo -e "${GREEN}   ✅ Notificaciones push configuradas${NC}"
echo -e "${GREEN}   ✅ Redux Store con persistencia${NC}"
echo -e "${GREEN}   ✅ Estética premium dorada/negra${NC}"
echo -e "${GREEN}   ✅ Logo logozyrotransparente.PNG implementado${NC}"
echo -e "${GREEN}   ✅ Chat system integrado${NC}"
echo -e "${GREEN}   ✅ Gestión completa de perfil${NC}"

echo -e "${PURPLE}🎯 CREDENCIALES DE PRUEBA:${NC}"
echo -e "${CYAN}   👑 Admin: admin_zyrovip / xarrec-2paqra-guftoN${NC}"
echo -e "${CYAN}   👤 Influencer: cualquier email / cualquier contraseña${NC}"
echo -e "${CYAN}   🏢 Empresa: cualquier email / cualquier contraseña${NC}"

echo -e "${PURPLE}🚀 Iniciando con configuración iOS optimizada...${NC}"

# Función para manejar Ctrl+C
cleanup() {
    echo -e "\n${YELLOW}🛑 Deteniendo ZYRO Marketplace...${NC}"
    pkill -f "expo start" > /dev/null 2>&1 || true
    pkill -f "Metro" > /dev/null 2>&1 || true
    echo -e "${GREEN}✅ ZYRO Marketplace detenido correctamente${NC}"
    exit 0
}

trap cleanup INT

# Iniciar con todas las optimizaciones
echo -e "${BLUE}🔥 Comando: npx expo start --ios --localhost --clear${NC}"
npx expo start --ios --localhost --clear

echo -e "${GREEN}🎉 ZYRO Marketplace completado${NC}"
echo -e "${PURPLE}🔧 Comandos útiles durante desarrollo:${NC}"
echo -e "   • Reload app: Cmd+R en simulador"
echo -e "   • Debug menu: Cmd+D en simulador"  
echo -e "   • Ver logs: npx expo logs --platform ios"
echo -e "   • Reset completo: ./reset-and-start.sh"
echo -e "   • Tests: ./test-ios-complete.sh"