#!/bin/bash

echo "🚀 Iniciando ZYRO con pantalla de bienvenida forzada..."

# Limpiar completamente el estado
echo "🧹 Limpiando estado de la aplicación..."

# Limpiar cache de Expo
rm -rf .expo/settings.json 2>/dev/null || true
rm -rf .expo/packager-info.json 2>/dev/null || true

# Limpiar cache de Metro
echo "🧹 Limpiando cache de Metro..."

# Iniciar con cache limpio y reset completo
npx expo start --clear --reset-cache --no-dev --minify

echo "✅ Aplicación iniciada con pantalla de bienvenida forzada"
