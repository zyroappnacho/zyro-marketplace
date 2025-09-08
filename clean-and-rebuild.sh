#!/bin/bash

echo "🧹 Limpieza completa del proyecto ZYRO..."

# Eliminar directorios de build anteriores
echo "🗑️  Eliminando builds anteriores..."
rm -rf ios/
rm -rf android/
rm -rf .expo/
rm -rf node_modules/.cache/
rm -rf .metro/

# Limpiar caché de npm
echo "🧽 Limpiando caché de npm..."
npm cache clean --force

# Limpiar caché de Expo
echo "🧽 Limpiando caché de Expo..."
npx expo r -c

# Reinstalar dependencias
echo "📦 Reinstalando dependencias..."
npm install --legacy-peer-deps

# Generar assets
echo "🎨 Generando assets con nuevo logo..."
node generate-ios-assets.js

echo "✅ Limpieza completa terminada!"
echo "🚀 Proyecto listo para generar nuevo simulador de iOS"