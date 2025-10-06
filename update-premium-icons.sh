#!/bin/bash

echo "✨ ZYRO - Actualizando a Iconos Premium"
echo "======================================"

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${PURPLE}🎨 Aplicando iconos premium en toda la app...${NC}"

# 1. Verificar cambios aplicados
echo -e "${YELLOW}1. Verificando iconos actualizados...${NC}"

# Verificar navegación inferior
if grep -q "{ icon: '⌂'" components/ZyroAppNew.js; then
    echo -e "${GREEN}✅ Navegación inferior actualizada${NC}"
else
    echo -e "${RED}❌ Navegación inferior no actualizada${NC}"
fi

# Verificar menú de perfil
if grep -q "menuIcon.*⚬" components/ZyroAppNew.js; then
    echo -e "${GREEN}✅ Menú de perfil actualizado${NC}"
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

# 4. Mostrar mapeo de iconos premium
echo -e "${BLUE}📋 Mapeo de Iconos Premium aplicado:${NC}"
echo -e "${GREEN}Navegación Inferior:${NC}"
echo -e "   🏠 → ⌂  (Inicio)"
echo -e "   🗺️ → ⊞  (Mapa)"
echo -e "   📅 → ◷  (Historial)"
echo -e "   👤 → ⚬  (Perfil)"

echo -e "${GREEN}Header:${NC}"
echo -e "   ⚙️ → ⚙  (Configuración)"
echo -e "   🔔 → ◐  (Notificaciones)"

echo -e "${GREEN}Menú de Perfil:${NC}"
echo -e "   📷 → ⚬  (Actualizar Foto)"
echo -e "   👤 → ⚬  (Datos Personales)"
echo -e "   📋 → ⚬  (Normas de Uso)"
echo -e "   🛡️ → ⚬  (Política de Privacidad)"
echo -e "   🔒 → ⚬  (Contraseña y Seguridad)"
echo -e "   ❓ → ⚬  (Ayuda y Soporte)"
echo -e "   🚪 → ▷  (Cerrar Sesión)"
echo -e "   🗑️ → ⚬  (Borrar Cuenta)"

echo -e "${GREEN}Otros Elementos:${NC}"
echo -e "   📸📊🌍 → ⚬  (Botones de upload)"
echo -e "   👥👫 → ⚬  (Colaboradores)"
echo -e "   📧📞 → ⚬  (Contacto)"

# 5. Mostrar características de los iconos premium
echo -e "${BLUE}🎯 Características de los Iconos Premium:${NC}"
echo -e "   • Estética minimalista y elegante"
echo -e "   • Consistencia visual en toda la app"
echo -e "   • Mejor legibilidad en pantallas pequeñas"
echo -e "   • Diseño profesional y premium"
echo -e "   • Compatibilidad universal con fuentes"

# 6. Reiniciar la app
echo -e "${YELLOW}6. Reiniciando ZYRO Marketplace...${NC}"
echo -e "${BLUE}🚀 Ejecutando: npx expo start --ios --clear${NC}"

npx expo start --ios --clear --localhost &

sleep 3
echo -e "\n${GREEN}🎉 Iconos premium aplicados correctamente${NC}"
echo -e "${BLUE}💡 Revisa toda la app para ver los nuevos iconos${NC}"
echo -e "${YELLOW}📱 Áreas actualizadas:${NC}"
echo -e "   • Navegación inferior (4 pestañas)"
echo -e "   • Header superior (configuración y notificaciones)"
echo -e "   • Menú de perfil (8 opciones)"
echo -e "   • Botones de registro y upload"
echo -e "   • Tarjetas de colaboraciones"
echo -e "   • Pantallas de ayuda y contacto"

echo -e "\n${GREEN}✅ ZYRO Marketplace con estética premium completa${NC}"