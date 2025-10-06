#!/bin/bash

echo "🚀 ZYRO MARKETPLACE - INICIO RÁPIDO"
echo "===================================="

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${PURPLE}💎 Simulador iOS RECREADO desde cero con TODAS las funcionalidades${NC}"

# Mostrar opciones
echo -e "${CYAN}Selecciona una opción:${NC}"
echo -e "${YELLOW}1.${NC} 🚀 Inicio rápido (recomendado)"
echo -e "${YELLOW}2.${NC} 🧹 Inicio con limpieza de cache"
echo -e "${YELLOW}3.${NC} 🔧 Recrear simulador desde cero"
echo -e "${YELLOW}4.${NC} 🧪 Ejecutar tests completos"
echo -e "${YELLOW}5.${NC} 📋 Ver información del proyecto"
echo -e "${YELLOW}6.${NC} ❌ Salir"

echo ""
read -p "Ingresa tu opción (1-6): " option

case $option in
    1)
        echo -e "${GREEN}🚀 Iniciando ZYRO Marketplace...${NC}"
        ./start-ios-enhanced.sh
        ;;
    2)
        echo -e "${GREEN}🧹 Iniciando con limpieza de cache...${NC}"
        ./start-ios-enhanced.sh --clean
        ;;
    3)
        echo -e "${GREEN}🔧 Recreando simulador desde cero...${NC}"
        ./fix-ios-simulator.sh
        ;;
    4)
        echo -e "${GREEN}🧪 Ejecutando tests completos...${NC}"
        ./test-ios-complete.sh
        ;;
    5)
        echo -e "${CYAN}📋 INFORMACIÓN DEL PROYECTO ZYRO MARKETPLACE${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}📱 Nombre: ZYRO Marketplace${NC}"
        echo -e "${GREEN}🆔 Bundle ID: com.zyro.marketplace${NC}"
        echo -e "${GREEN}📦 Versión: 1.0.0${NC}"
        echo -e "${GREEN}🎯 Estado: COMPLETAMENTE RECREADO${NC}"
        echo -e "${GREEN}📅 Fecha: 21 de Enero, 2025${NC}"
        echo ""
        echo -e "${CYAN}🚀 FUNCIONALIDADES IMPLEMENTADAS (100%):${NC}"
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
        echo ""
        echo -e "${CYAN}🎯 CREDENCIALES DE PRUEBA:${NC}"
        echo -e "${PURPLE}   👑 Admin: admin_zyrovip / xarrec-2paqra-guftoN${NC}"
        echo -e "${PURPLE}   👤 Influencer: cualquier email / cualquier contraseña${NC}"
        echo -e "${PURPLE}   🏢 Empresa: cualquier email / cualquier contraseña${NC}"
        echo ""
        echo -e "${CYAN}🛠 COMANDOS DISPONIBLES:${NC}"
        echo -e "${BLUE}   npm run zyro:start     - Inicio rápido${NC}"
        echo -e "${BLUE}   npm run zyro:clean     - Inicio con limpieza${NC}"
        echo -e "${BLUE}   npm run zyro:recreate  - Recrear simulador${NC}"
        echo -e "${BLUE}   npm run zyro:test      - Tests completos${NC}"
        echo ""
        read -p "Presiona Enter para continuar..."
        ;;
    6)
        echo -e "${GREEN}👋 ¡Hasta luego!${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ Opción inválida. Por favor selecciona 1-6.${NC}"
        exit 1
        ;;
esac