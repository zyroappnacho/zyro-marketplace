#!/bin/bash

echo "🚀 Iniciando nuevo simulador de iOS para ZYRO..."

# Limpiar caché de Expo
echo "🧹 Limpiando caché..."
npx expo r -c

# Verificar que Xcode esté instalado
if ! command -v xcodebuild &> /dev/null; then
    echo "❌ Xcode no está instalado. Por favor instala Xcode desde la App Store."
    exit 1
fi

# Verificar simuladores disponibles
echo "📱 Verificando simuladores disponibles..."
xcrun simctl list devices available

# Iniciar el simulador de iOS
echo "🎯 Iniciando simulador de iOS..."
npx expo start --ios --clear

echo "✅ Simulador de iOS iniciado correctamente!"
echo "📝 El simulador debería abrirse automáticamente en Xcode"
echo "🔗 Si no se abre automáticamente, presiona 'i' en la terminal de Expo"