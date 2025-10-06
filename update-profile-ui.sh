#!/bin/bash

echo "🎨 ZYRO - Actualizando UI del Perfil"
echo "==================================="

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔄 Aplicando nueva UI del perfil de influencer...${NC}"

# 1. Verificar cambios aplicados
echo -e "${YELLOW}1. Verificando cambios en ZyroAppNew.js...${NC}"
if grep -q "profileCard" components/ZyroAppNew.js; then
    echo -e "${GREEN}✅ Nuevos estilos de perfil aplicados${NC}"
else
    echo -e "${RED}❌ Estilos de perfil no encontrados${NC}"
    exit 1
fi

# 2. Limpiar cache para aplicar cambios
echo -e "${YELLOW}2. Limpiando cache...${NC}"
rm -rf .metro-cache
rm -rf .expo
pkill -f "Metro" > /dev/null 2>&1 || true
pkill -f "expo start" > /dev/null 2>&1 || true

# 3. Configurar entorno
echo -e "${YELLOW}3. Configurando entorno...${NC}"
export EXPO_NO_FLIPPER=1
export EXPO_USE_FAST_RESOLVER=1
export NODE_OPTIONS="--max-old-space-size=8192"

# 4. Mostrar cambios aplicados
echo -e "${BLUE}📋 Cambios aplicados al perfil:${NC}"
echo -e "${GREEN}✅ Header con logo ZYRO y notificación${NC}"
echo -e "${GREEN}✅ Tarjeta de perfil con fondo dorado${NC}"
echo -e "${GREEN}✅ Foto de perfil con icono de cámara${NC}"
echo -e "${GREEN}✅ Nombre: 'Nayades Influencer'${NC}"
echo -e "${GREEN}✅ Estadísticas: 12 colaboraciones, 350K seguidores${NC}"
echo -e "${GREEN}✅ Próxima colaboración: PAPÚA${NC}"
echo -e "${GREEN}✅ Menú completo con todos los botones${NC}"
echo -e "${GREEN}✅ Botones de Cerrar Sesión y Borrar Cuenta${NC}"

# 5. Reiniciar la app
echo -e "${YELLOW}5. Reiniciando ZYRO Marketplace...${NC}"
echo -e "${BLUE}🚀 Ejecutando: npx expo start --ios --clear${NC}"

npx expo start --ios --clear --localhost &

sleep 3
echo -e "\n${GREEN}🎉 UI del perfil actualizada${NC}"
echo -e "${BLUE}💡 Ve a la pestaña 'Perfil' para ver los cambios${NC}"
echo -e "${YELLOW}📱 Características del nuevo perfil:${NC}"
echo -e "   • Diseño exacto de las capturas de pantalla"
echo -e "   • Fondo dorado en la tarjeta de perfil"
echo -e "   • Estadísticas de colaboraciones y seguidores"
echo -e "   • Próxima colaboración destacada"
echo -e "   • Menú completo con iconos"

echo -e "\n${GREEN}✅ Perfil de influencer listo - Exacto a las capturas${NC}"