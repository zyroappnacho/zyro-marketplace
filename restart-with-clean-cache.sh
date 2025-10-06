#!/bin/bash

echo "🧹 Limpiando cache y reiniciando aplicación..."

# Detener cualquier proceso de Expo/Metro que esté corriendo
echo "🛑 Deteniendo procesos existentes..."
pkill -f "expo\|metro" 2>/dev/null || true

# Limpiar cache de npm
echo "🧹 Limpiando cache de npm..."
npm cache clean --force

# Limpiar cache de Expo
echo "🧹 Limpiando cache de Expo..."
npx expo install --fix

# Limpiar node_modules y reinstalar (opcional, comentado por velocidad)
# echo "🧹 Limpiando node_modules..."
# rm -rf node_modules
# npm install

echo "🚀 Iniciando aplicación con cache limpio..."
npx expo start --clear

echo "✅ Aplicación reiniciada con cache limpio!"