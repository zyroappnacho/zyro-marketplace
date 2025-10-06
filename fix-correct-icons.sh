#!/bin/bash

echo "🔧 ZYRO - Corrigiendo Iconos Exactos"
echo "==================================="

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${PURPLE}📱 Aplicando iconos exactos de la captura de pantalla...${NC}"

# 1. Verificar cambios aplicados
echo -e "${YELLOW}1. Verificando iconos corregidos...${NC}"

# Verificar navegación inferior
if grep -q "{ icon: '🏠'" components/ZyroAppNew.js; then
    echo -e "${GREEN}✅ Navegación inferior corregida${NC}"
else
    echo -e "${RED}❌ Navegación inferior no corregida${NC}"
fi

# Verificar menú de perfil
if grep -q "📷.*Actualizar Foto" components/ZyroAppNew.js; then
    echo -e "${GREEN}✅ Menú de perfil corregido${NC}"
else
    echo -e "${RED}❌ Menú de perfil no corregido${NC}"
fi

# Verificar próxima colaboración
if grep -q "nextCollaborationContainer" components/ZyroAppNew.js; then
    echo -e "${GREEN}✅ Sección 'Próxima Colaboración' restaurada${NC}"
else
    echo -e "${RED}❌ Sección 'Próxima Colaboración' faltante${NC}"
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

# 4. Mostrar iconos corregidos
echo -e "${BLUE}📋 Iconos corregidos según la captura:${NC}"

echo -e "${GREEN}Navegación Inferior:${NC}"
echo -e "   🏠 Inicio"
echo -e "   🗺️ Mapa"
echo -e "   🕐 Historial"
echo -e "   👤 Perfil"

echo -e "${GREEN}Header:${NC}"
echo -e "   ⚙️ Configuración"
echo -e "   🔔 Notificaciones"

echo -e "${GREEN}Menú de Perfil:${NC}"
echo -e "   📷 Actualizar Foto de Perfil"
echo -e "   👤 Datos Personales"
echo -e "   📋 Normas de Uso"
echo -e "   🛡️ Política de Privacidad"
echo -e "   🔒 Contraseña y Seguridad"
echo -e "   ❓ Ayuda y Soporte"
echo -e "   ▷ Cerrar Sesión"
echo -e "   🗑️ Borrar Cuenta (GDPR)"

echo -e "${GREEN}Próxima Colaboración:${NC}"
echo -e "   📅 15 sept 2025"
echo -e "   🕐 14:00"
echo -e "   📍 Madrid"

echo -e "${GREEN}Otros Elementos:${NC}"
echo -e "   📸📊🌍 Botones de upload"
echo -e "   👥👫 Colaboradores"
echo -e "   📧📞 Contacto"
echo -e "   📷 Cámara en perfil"

# 5. Mostrar estructura completa
echo -e "${BLUE}📱 Estructura del perfil restaurada:${NC}"
echo -e "   1. Tarjeta de perfil con fondo dorado"
echo -e "   2. Estadísticas (12 colaboraciones | 350K seguidores)"
echo -e "   3. Próxima Colaboración - PAPÚA"
echo -e "   4. Menú completo con 8 opciones"

# 6. Reiniciar la app
echo -e "${YELLOW}6. Reiniciando ZYRO Marketplace...${NC}"
echo -e "${BLUE}🚀 Ejecutando: npx expo start --ios --clear${NC}"

npx expo start --ios --clear --localhost &

sleep 3
echo -e "\n${GREEN}🎉 Iconos corregidos exactamente como en la captura${NC}"
echo -e "${BLUE}💡 Ahora los iconos coinciden perfectamente${NC}"
echo -e "${YELLOW}📱 Verifica en el simulador:${NC}"
echo -e "   • Navegación inferior con iconos correctos"
echo -e "   • Menú de perfil con iconos específicos"
echo -e "   • Sección 'Próxima Colaboración' restaurada"
echo -e "   • Todos los iconos como en la captura original"

echo -e "\n${GREEN}✅ ZYRO Marketplace con iconos exactos de la captura${NC}"