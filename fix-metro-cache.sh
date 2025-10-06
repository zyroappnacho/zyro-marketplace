#!/bin/bash

echo "🔧 ZYRO - Solucionando Error de Metro Cache"
echo "==========================================="

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧹 Limpiando cache de Metro completamente...${NC}"

# 1. Detener todos los procesos Metro
echo -e "${YELLOW}1. Deteniendo procesos Metro...${NC}"
pkill -f "Metro" > /dev/null 2>&1 || true
pkill -f "expo start" > /dev/null 2>&1 || true
pkill -f "react-native start" > /dev/null 2>&1 || true

# 2. Limpiar todos los caches
echo -e "${YELLOW}2. Limpiando caches...${NC}"
rm -rf .metro-cache
rm -rf .expo
rm -rf node_modules/.cache
rm -rf /tmp/metro-*
rm -rf /tmp/react-*
rm -rf /tmp/haste-*

# 3. Limpiar cache de npm
echo -e "${YELLOW}3. Limpiando cache de npm...${NC}"
npm cache clean --force > /dev/null 2>&1

# 4. Limpiar cache de Expo
echo -e "${YELLOW}4. Limpiando cache de Expo...${NC}"
npx expo install --fix > /dev/null 2>&1 || true

# 5. Verificar node_modules
echo -e "${YELLOW}5. Verificando node_modules...${NC}"
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
    echo -e "${BLUE}📦 Reinstalando dependencias...${NC}"
    rm -rf node_modules
    rm -f package-lock.json
    npm install
else
    echo -e "${GREEN}✅ node_modules OK${NC}"
fi

# 6. Verificar configuración Metro
echo -e "${YELLOW}6. Verificando metro.config.js...${NC}"
if [ -f "metro.config.js" ]; then
    echo -e "${GREEN}✅ metro.config.js encontrado${NC}"
else
    echo -e "${RED}❌ metro.config.js faltante${NC}"
    exit 1
fi

# 7. Configurar variables de entorno
echo -e "${YELLOW}7. Configurando variables de entorno...${NC}"
export EXPO_NO_FLIPPER=1
export RCT_NO_LAUNCH_PACKAGER=1
export EXPO_USE_FAST_RESOLVER=1
export NODE_OPTIONS="--max-old-space-size=8192"

# 8. Verificar simulador
echo -e "${YELLOW}8. Verificando simulador iOS...${NC}"
if xcrun simctl list devices | grep -q "Booted"; then
    echo -e "${GREEN}✅ Simulador iOS activo${NC}"
else
    echo -e "${BLUE}📱 Iniciando simulador...${NC}"
    open -a Simulator
    sleep 3
fi

echo -e "${GREEN}🎉 Cache limpiado completamente${NC}"
echo -e "${BLUE}💡 Ahora puedes ejecutar:${NC}"
echo -e "   npx expo start --ios --clear"
echo -e "   o"
echo -e "   npm run ios"

echo -e "${YELLOW}🔧 Si el error persiste, ejecuta:${NC}"
echo -e "   rm -rf node_modules && npm install"
echo -e "   npx expo install --fix"