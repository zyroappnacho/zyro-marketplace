#!/bin/bash

echo "🚀 CONFIGURANDO GITHUB Y RAILWAY PARA ZYRO MARKETPLACE"
echo "=================================================="

# 1. Inicializar Git
echo "📁 Inicializando repositorio Git..."
git init

# 2. Crear .gitignore
echo "📝 Creando .gitignore..."
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Expo
.expo/
dist/
web-build/

# Native
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision

# Metro
.metro-health-check*

# Debug
npm-debug.*
yarn-debug.*
yarn-error.*

# macOS
.DS_Store
*.pem

# local env files
.env*.local
.env

# typescript
*.tsbuildinfo

# Backups
*_BACKUP_*
BACKUP_*
RESTORE_*

# Test files
test-*.js
verify-*.js
diagnose-*.js
demo-*.js
fix-*.js
setup-*.js
apply-*.js
debug-*.js
execute-*.js
run-*.js
start-*.js
configure-*.js
clean-*.js
restart-*.js
update-*.js
initialize-*.js
create-*.js
generate-*.js
enhance-*.js
sync-*.js
implement-*.js

# Temporary files
*.tmp
*.temp
EOF

# 3. Añadir archivos
echo "➕ Añadiendo archivos al repositorio..."
git add .

# 4. Commit inicial
echo "💾 Creando commit inicial..."
git commit -m "🎉 Initial commit: ZYRO Marketplace - Complete React Native App with Stripe"

echo ""
echo "✅ REPOSITORIO LOCAL CONFIGURADO"
echo ""
echo "🌐 PRÓXIMOS PASOS:"
echo "1. Ve a https://github.com/new"
echo "2. Nombre del repositorio: zyro-marketplace"
echo "3. Descripción: ZYRO Marketplace - React Native App with Stripe Integration"
echo "4. Público o Privado (tu elección)"
echo "5. NO inicialices con README, .gitignore o licencia"
echo "6. Crea el repositorio"
echo ""
echo "📋 COMANDOS PARA CONECTAR CON GITHUB:"
echo "git remote add origin https://github.com/TU_USUARIO/zyro-marketplace.git"
echo "git branch -M main"
echo "git push -u origin main"
echo ""
echo "🚀 DESPUÉS PODRÁS USAR RAILWAY GRATIS!"