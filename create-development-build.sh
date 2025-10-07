#!/bin/bash

# 🚀 BUILD DE DESARROLLO AUTOMÁTICO
# Ejecutar cuando Apple verifique la cuenta

echo "🚀 Iniciando build de desarrollo..."

# Verificar login EAS
echo "📋 Verificando login EAS..."
npx eas-cli whoami

# Crear build de desarrollo
echo "🔨 Creando build de desarrollo..."
npx eas-cli build --platform ios --profile development

echo "✅ Build completado!"
echo "📱 Descarga el .ipa desde https://expo.dev/accounts/nachodeborbon/projects/zyromarketplace/builds"
echo "🔐 Credenciales incluidas en el build:"
echo "   👤 Influencer: colabos.nachodeborbon@gmail.com / Nacho12345"
echo "   🏢 Empresa: empresa@zyro.com / Empresa1234"
echo "   ⚙️ Admin: admin_zyrovip / xarrec-2paqra-guftoN5"
