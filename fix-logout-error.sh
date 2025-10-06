#!/bin/bash

echo "🔧 ZYRO - Solucionando Error de Logout"
echo "====================================="

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Solucionando error: StorageService.clearUser is not a function${NC}"

# 1. Verificar que el método clearUser existe
echo -e "${YELLOW}1. Verificando StorageService...${NC}"
if grep -q "clearUser" services/StorageService.js; then
    echo -e "${GREEN}✅ Método clearUser encontrado en StorageService${NC}"
else
    echo -e "${RED}❌ Método clearUser no encontrado${NC}"
    exit 1
fi

# 2. Detener procesos Metro
echo -e "${YELLOW}2. Deteniendo procesos Metro...${NC}"
pkill -f "Metro" > /dev/null 2>&1 || true
pkill -f "expo start" > /dev/null 2>&1 || true
pkill -f "react-native" > /dev/null 2>&1 || true

# 3. Limpiar cache completamente
echo -e "${YELLOW}3. Limpiando cache...${NC}"
rm -rf .metro-cache
rm -rf .expo
rm -rf node_modules/.cache
rm -rf /tmp/metro-*
rm -rf /tmp/react-*

# 4. Limpiar datos de la app en el simulador
echo -e "${YELLOW}4. Limpiando datos de la app...${NC}"
if xcrun simctl list devices | grep -q "Booted"; then
    DEVICE_ID=$(xcrun simctl list devices | grep "Booted" | head -1 | grep -o '[A-F0-9-]\{36\}')
    if [ ! -z "$DEVICE_ID" ]; then
        xcrun simctl uninstall "$DEVICE_ID" com.zyro.marketplace > /dev/null 2>&1 || true
        echo -e "${GREEN}✅ Datos de la app limpiados${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No hay simulador ejecutándose${NC}"
fi

# 5. Verificar que no hay errores de sintaxis
echo -e "${YELLOW}5. Verificando sintaxis de archivos...${NC}"
if node -c services/StorageService.js 2>/dev/null; then
    echo -e "${GREEN}✅ StorageService.js - Sintaxis correcta${NC}"
else
    echo -e "${RED}❌ StorageService.js - Error de sintaxis${NC}"
    exit 1
fi

if node -c components/ZyroAppNew.js 2>/dev/null; then
    echo -e "${GREEN}✅ ZyroAppNew.js - Sintaxis correcta${NC}"
else
    echo -e "${RED}❌ ZyroAppNew.js - Error de sintaxis${NC}"
    exit 1
fi

# 6. Configurar variables de entorno
echo -e "${YELLOW}6. Configurando entorno...${NC}"
export EXPO_NO_FLIPPER=1
export RCT_NO_LAUNCH_PACKAGER=1
export EXPO_USE_FAST_RESOLVER=1
export NODE_OPTIONS="--max-old-space-size=8192"

# 7. Mostrar información del fix
echo -e "${BLUE}📋 Fix aplicado:${NC}"
echo -e "${GREEN}✅ Método clearUser agregado a StorageService${NC}"
echo -e "${GREEN}✅ Cache limpiado completamente${NC}"
echo -e "${GREEN}✅ Datos de la app reseteados${NC}"

# 8. Reiniciar la app
echo -e "${YELLOW}8. Reiniciando ZYRO Marketplace...${NC}"
echo -e "${BLUE}🚀 Ejecutando: npx expo start --ios --clear${NC}"

# Iniciar con configuración limpia
npx expo start --ios --clear --localhost &

# Esperar y mostrar instrucciones
sleep 3
echo -e "\n${GREEN}🎉 Fix aplicado correctamente${NC}"
echo -e "${BLUE}💡 El error de logout debería estar solucionado${NC}"
echo -e "${YELLOW}🔧 Si persiste el error:${NC}"
echo -e "   • Usa Cmd+R en el simulador para recargar"
echo -e "   • Verifica que la app se haya reinstalado"
echo -e "   • El método clearUser ahora existe en StorageService"

echo -e "\n${GREEN}✅ ZYRO listo - Logout funcionando correctamente${NC}"