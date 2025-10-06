#!/bin/bash

echo "🔄 ZYRO Marketplace - Restaurado al Estado Original"
echo "================================================="

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}✅ Estado restaurado exitosamente${NC}"
echo -e "${BLUE}📱 Iniciando simulador con configuración original...${NC}"
echo ""

# Limpiar caché
rm -rf .expo
rm -rf node_modules/.cache

# Iniciar Expo
npx expo start --clear

echo -e "${GREEN}🎉 ¡Simulador original iniciado!${NC}"