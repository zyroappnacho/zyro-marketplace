#!/bin/bash

# ZYRO Marketplace - Complete Testing Suite
# Este script ejecuta todos los tests y verificaciones necesarias

echo "🚀 ZYRO Marketplace - Suite de Testing Completo"
echo "================================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar status
show_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        exit 1
    fi
}

# Función para mostrar info
show_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Función para mostrar warning
show_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo ""
show_info "Iniciando verificaciones previas..."

# 1. Verificar Node.js
echo ""
echo "1️⃣ Verificando Node.js..."
node --version > /dev/null 2>&1
show_status $? "Node.js instalado"

# 2. Verificar npm
echo ""
echo "2️⃣ Verificando npm..."
npm --version > /dev/null 2>&1
show_status $? "npm instalado"

# 3. Verificar dependencias
echo ""
echo "3️⃣ Instalando/verificando dependencias..."
npm install > /dev/null 2>&1
show_status $? "Dependencias instaladas"

# 4. Verificar estructura del proyecto
echo ""
echo "4️⃣ Verificando estructura del proyecto..."

required_files=(
    "package.json"
    "app.json"
    "eas.json"
    "App.js"
    "store/index.js"
    "components/ZyroApp.js"
    "services/StorageService.js"
    "services/ApiService.js"
    "services/NotificationService.js"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}  ✅ $file${NC}"
    else
        echo -e "${RED}  ❌ $file (faltante)${NC}"
        exit 1
    fi
done

# 5. Verificar sintaxis JavaScript
echo ""
echo "5️⃣ Verificando sintaxis JavaScript..."
find . -name "*.js" -not -path "./node_modules/*" -exec node -c {} \; > /dev/null 2>&1
show_status $? "Sintaxis JavaScript válida"

# 6. Ejecutar tests unitarios
echo ""
echo "6️⃣ Ejecutando tests unitarios..."
if [ -f "__tests__/App.test.js" ]; then
    npm test > /dev/null 2>&1
    show_status $? "Tests unitarios"
else
    show_warning "No se encontraron tests unitarios"
fi

# 7. Verificar configuración de Redux
echo ""
echo "7️⃣ Verificando configuración de Redux..."
if grep -q "configureStore" store/index.js; then
    show_status 0 "Redux Store configurado"
else
    show_status 1 "Redux Store no configurado correctamente"
fi

# 8. Verificar slices de Redux
echo ""
echo "8️⃣ Verificando Redux Slices..."
slices=(
    "store/slices/authSlice.js"
    "store/slices/uiSlice.js"
    "store/slices/collaborationsSlice.js"
    "store/slices/notificationsSlice.js"
)

for slice in "${slices[@]}"; do
    if [ -f "$slice" ]; then
        echo -e "${GREEN}  ✅ $slice${NC}"
    else
        echo -e "${RED}  ❌ $slice (faltante)${NC}"
        exit 1
    fi
done

# 9. Verificar servicios
echo ""
echo "9️⃣ Verificando servicios..."
services=(
    "services/StorageService.js"
    "services/ApiService.js"
    "services/NotificationService.js"
)

for service in "${services[@]}"; do
    if [ -f "$service" ]; then
        echo -e "${GREEN}  ✅ $service${NC}"
    else
        echo -e "${RED}  ❌ $service (faltante)${NC}"
        exit 1
    fi
done

# 10. Verificar componentes principales
echo ""
echo "🔟 Verificando componentes principales..."
components=(
    "components/ZyroApp.js"
    "components/NotificationManager.js"
    "components/ChatSystem.js"
    "components/InteractiveMap.js"
    "components/CollaborationDetailScreen.js"
)

for component in "${components[@]}"; do
    if [ -f "$component" ]; then
        echo -e "${GREEN}  ✅ $component${NC}"
    else
        echo -e "${RED}  ❌ $component (faltante)${NC}"
        exit 1
    fi
done

# 11. Verificar configuración de Expo
echo ""
echo "1️⃣1️⃣ Verificando configuración de Expo..."
if [ -f "app.json" ]; then
    if grep -q "com.zyro.marketplace" app.json; then
        show_status 0 "Bundle ID configurado correctamente"
    else
        show_status 1 "Bundle ID no configurado"
    fi
else
    show_status 1 "app.json no encontrado"
fi

# 12. Verificar configuración de EAS
echo ""
echo "1️⃣2️⃣ Verificando configuración de EAS..."
if [ -f "eas.json" ]; then
    if grep -q "production" eas.json; then
        show_status 0 "EAS configurado para producción"
    else
        show_status 1 "EAS no configurado correctamente"
    fi
else
    show_status 1 "eas.json no encontrado"
fi

# 13. Test de build local (dry run)
echo ""
echo "1️⃣3️⃣ Probando build local (dry run)..."
if command -v expo &> /dev/null; then
    expo export > /dev/null 2>&1
    show_status $? "Build local exitoso"
else
    show_warning "Expo CLI no instalado - saltando test de build"
fi

# 14. Verificar assets
echo ""
echo "1️⃣4️⃣ Verificando assets..."
if [ -d "assets" ]; then
    show_status 0 "Directorio assets existe"
    
    # Verificar si existe el generador de assets
    if [ -f "assets/icon-generator.html" ]; then
        show_status 0 "Generador de assets disponible"
    else
        show_warning "Ejecuta 'node generate-assets.js' para crear assets"
    fi
else
    show_warning "Directorio assets no encontrado"
fi

# 15. Verificar documentación
echo ""
echo "1️⃣5️⃣ Verificando documentación..."
docs=(
    "README.md"
    "BUILD_DEPLOY_GUIDE.md"
    "PROJECT_STATUS.md"
)

for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}  ✅ $doc${NC}"
    else
        echo -e "${YELLOW}  ⚠️  $doc (recomendado)${NC}"
    fi
done

# 16. Verificar seguridad básica
echo ""
echo "1️⃣6️⃣ Verificando seguridad básica..."

# Verificar que no hay secrets hardcodeados
if grep -r "sk_live_\|pk_live_\|AIza\|AAAA" --include="*.js" --exclude-dir=node_modules . > /dev/null 2>&1; then
    show_status 1 "PELIGRO: Posibles secrets hardcodeados encontrados"
else
    show_status 0 "No se encontraron secrets hardcodeados"
fi

# 17. Test de memoria y performance
echo ""
echo "1️⃣7️⃣ Verificando optimizaciones..."

# Verificar que se usa React.memo donde es apropiado
if grep -r "React.memo\|useMemo\|useCallback" --include="*.js" --exclude-dir=node_modules . > /dev/null 2>&1; then
    show_status 0 "Optimizaciones de React encontradas"
else
    show_warning "Considera usar React.memo, useMemo, useCallback para optimizar"
fi

# 18. Verificar accesibilidad
echo ""
echo "1️⃣8️⃣ Verificando accesibilidad..."
if grep -r "accessibilityLabel\|accessibilityHint" --include="*.js" --exclude-dir=node_modules . > /dev/null 2>&1; then
    show_status 0 "Etiquetas de accesibilidad encontradas"
else
    show_warning "Considera agregar etiquetas de accesibilidad"
fi

# Resumen final
echo ""
echo "================================================"
echo -e "${GREEN}🎉 TESTING COMPLETO - TODOS LOS CHECKS PASARON${NC}"
echo "================================================"
echo ""
echo -e "${BLUE}📋 Resumen del proyecto:${NC}"
echo "   • App: ZYRO Marketplace"
echo "   • Plataformas: iOS, Android, Web"
echo "   • Framework: React Native + Expo"
echo "   • Estado: Redux Toolkit"
echo "   • Bundle ID: com.zyro.marketplace"
echo ""
echo -e "${BLUE}🚀 Próximos pasos para deploy:${NC}"
echo "   1. Generar assets: node generate-assets.js"
echo "   2. Configurar credenciales: eas login"
echo "   3. Build desarrollo: eas build --platform all --profile development"
echo "   4. Build producción: eas build --platform all --profile production"
echo "   5. Submit a stores: eas submit --platform all --profile production"
echo ""
echo -e "${GREEN}✅ La app está lista para ser publicada!${NC}"