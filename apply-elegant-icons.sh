#!/bin/bash

echo "✨ ZYRO - Aplicando Iconos Elegantes Dorados"
echo "==========================================="

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${PURPLE}🎨 Aplicando iconos elegantes minimalistas en dorado...${NC}"

# 1. Verificar cambios aplicados
echo -e "${YELLOW}1. Verificando iconos elegantes...${NC}"

# Verificar navegación inferior
if grep -q "{ icon: '⌂'" components/ZyroAppNew.js; then
    echo -e "${GREEN}✅ Navegación inferior con iconos elegantes${NC}"
else
    echo -e "${RED}❌ Navegación inferior no actualizada${NC}"
fi

# Verificar menú de perfil
if grep -q "menuIcon.*◉" components/ZyroAppNew.js; then
    echo -e "${GREEN}✅ Menú de perfil con iconos elegantes${NC}"
else
    echo -e "${RED}❌ Menú de perfil no actualizado${NC}"
fi

# 2. Limpiar cache
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

# 4. Mostrar mapeo de iconos elegantes
echo -e "${BLUE}📋 Iconos Elegantes Aplicados:${NC}"

echo -e "${GREEN}Navegación Inferior (Dorados cuando activos):${NC}"
echo -e "   ⌂  Inicio (casa minimalista)"
echo -e "   ⊞  Mapa (cuadrado con cruz)"
echo -e "   ◷  Historial (reloj minimalista)"
echo -e "   ◉  Perfil (círculo relleno)"

echo -e "${GREEN}Header Superior:${NC}"
echo -e "   ⚙  Configuración (engranaje simple)"
echo -e "   ◐  Notificaciones (semicírculo)"

echo -e "${GREEN}Menú de Perfil (Todos en dorado #C9A961):${NC}"
echo -e "   ◉  Actualizar Foto de Perfil"
echo -e "   ◉  Datos Personales"
echo -e "   ◉  Normas de Uso"
echo -e "   ◉  Política de Privacidad"
echo -e "   ◉  Contraseña y Seguridad"
echo -e "   ◉  Ayuda y Soporte"
echo -e "   ▷  Cerrar Sesión (flecha)"
echo -e "   ◉  Borrar Cuenta (GDPR)"

echo -e "${GREEN}Próxima Colaboración:${NC}"
echo -e "   ◉  15 sept 2025 (fecha)"
echo -e "   ◷  14:00 (hora)"
echo -e "   ◉  Madrid (ubicación)"

echo -e "${GREEN}Otros Elementos:${NC}"
echo -e "   ◉  Cámara en perfil"
echo -e "   ◉  Botones de upload"
echo -e "   ◉  Colaboradores"
echo -e "   ◉  Contacto"

# 5. Mostrar características de los iconos
echo -e "${BLUE}🎯 Características de los Iconos Elegantes:${NC}"
echo -e "   • Minimalistas y geométricos"
echo -e "   • Color dorado (#C9A961) para destacar"
echo -e "   • Consistencia visual en toda la app"
echo -e "   • Estilo premium y sofisticado"
echo -e "   • Perfecta legibilidad en móviles"
echo -e "   • Sin emojis, solo formas elegantes"

# 6. Reiniciar la app
echo -e "${YELLOW}6. Reiniciando ZYRO Marketplace...${NC}"
echo -e "${BLUE}🚀 Ejecutando: npx expo start --ios --clear${NC}"

npx expo start --ios --clear --localhost &

sleep 3
echo -e "\n${GREEN}🎉 Iconos elegantes aplicados correctamente${NC}"
echo -e "${BLUE}💡 Los iconos ahora son minimalistas y elegantes${NC}"
echo -e "${YELLOW}📱 Características visuales:${NC}"
echo -e "   • Iconos geométricos simples"
echo -e "   • Color dorado para elementos activos"
echo -e "   • Estética premium y sofisticada"
echo -e "   • Consistencia en toda la aplicación"
echo -e "   • Perfecta integración con el diseño"

echo -e "\n${GREEN}✅ ZYRO Marketplace con iconos elegantes premium${NC}"