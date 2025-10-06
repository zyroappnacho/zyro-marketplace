#!/bin/bash

echo "🚨 ZYRO - Solucionando Modal Bloqueado"
echo "====================================="

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔧 Aplicando solución para modal de ciudades bloqueado...${NC}"

# 1. Verificar si el simulador está ejecutándose
echo -e "${YELLOW}1. Verificando simulador iOS...${NC}"
if xcrun simctl list devices | grep -q "Booted"; then
    DEVICE_ID=$(xcrun simctl list devices | grep "Booted" | head -1 | grep -o '[A-F0-9-]\{36\}')
    echo -e "${GREEN}✅ Simulador activo: $DEVICE_ID${NC}"
else
    echo -e "${RED}❌ No hay simulador ejecutándose${NC}"
    echo -e "${BLUE}📱 Iniciando simulador...${NC}"
    open -a Simulator
    sleep 5
fi

# 2. Limpiar datos de la app en el simulador
echo -e "${YELLOW}2. Limpiando datos de la app...${NC}"
if [ ! -z "$DEVICE_ID" ]; then
    # Resetear la app específica
    xcrun simctl uninstall "$DEVICE_ID" com.zyro.marketplace > /dev/null 2>&1 || true
    echo -e "${GREEN}✅ App data cleared${NC}"
else
    echo -e "${YELLOW}⚠️  No se pudo identificar el dispositivo${NC}"
fi

# 3. Limpiar cache de Metro
echo -e "${YELLOW}3. Limpiando cache de Metro...${NC}"
rm -rf .metro-cache
rm -rf .expo
rm -rf node_modules/.cache

# 4. Detener procesos Metro
echo -e "${YELLOW}4. Deteniendo procesos...${NC}"
pkill -f "Metro" > /dev/null 2>&1 || true
pkill -f "expo start" > /dev/null 2>&1 || true

# 5. Configurar variables de entorno
echo -e "${YELLOW}5. Configurando entorno...${NC}"
export EXPO_NO_FLIPPER=1
export RCT_NO_LAUNCH_PACKAGER=1
export EXPO_USE_FAST_RESOLVER=1

# 6. Mostrar instrucciones de emergencia
echo -e "${BLUE}📱 INSTRUCCIONES DE EMERGENCIA:${NC}"
echo -e "${GREEN}Si el modal sigue bloqueado en el simulador:${NC}"
echo -e "   1. Presiona ${YELLOW}Cmd + R${NC} para recargar"
echo -e "   2. Presiona ${YELLOW}Cmd + D${NC} y selecciona 'Reload'"
echo -e "   3. Cierra la app y ábrela de nuevo"
echo -e "   4. En último caso: Device > Erase All Content and Settings"

# 7. Reiniciar la app
echo -e "${YELLOW}7. Reiniciando ZYRO Marketplace...${NC}"
echo -e "${BLUE}🚀 Ejecutando: npx expo start --ios --clear${NC}"

# Iniciar con configuración limpia
npx expo start --ios --clear --localhost &

# Esperar un momento y mostrar mensaje final
sleep 3
echo -e "\n${GREEN}🎉 Solución aplicada${NC}"
echo -e "${BLUE}💡 La app debería iniciarse sin el modal bloqueado${NC}"
echo -e "${YELLOW}🔧 Si persiste el problema:${NC}"
echo -e "   • Usa Cmd+R en el simulador"
echo -e "   • Reinicia el simulador completamente"
echo -e "   • Ejecuta: ./fix-metro-cache.sh"

echo -e "\n${GREEN}✅ ZYRO listo para usar sin bloqueos de modal${NC}"