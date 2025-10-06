#!/bin/bash

echo "🔄 Reiniciando completamente el simulador de iOS..."
echo "=================================================="

# 1. Detener todos los procesos de Expo y React Native
echo "📱 Deteniendo procesos de Expo y React Native..."
pkill -f "expo"
pkill -f "react-native"
pkill -f "metro"
pkill -f "node.*start"
pkill -f "watchman"

# 2. Cerrar simulador de iOS
echo "📱 Cerrando simulador de iOS..."
osascript -e 'quit app "Simulator"'
pkill -f "Simulator"

# 3. Limpiar cache de Expo
echo "🧹 Limpiando cache de Expo..."
expo r -c 2>/dev/null || echo "Expo CLI no disponible, continuando..."

# 4. Limpiar cache de npm
echo "🧹 Limpiando cache de npm..."
npm start -- --reset-cache 2>/dev/null &
sleep 2
pkill -f "npm start"

# 5. Limpiar cache de Metro
echo "🧹 Limpiando cache de Metro..."
npx react-native start --reset-cache 2>/dev/null &
sleep 2
pkill -f "react-native start"

# 6. Limpiar watchman
echo "🧹 Limpiando Watchman..."
watchman watch-del-all 2>/dev/null || echo "Watchman no disponible"

# 7. Limpiar directorios temporales
echo "🧹 Limpiando directorios temporales..."
rm -rf node_modules/.cache 2>/dev/null
rm -rf .expo 2>/dev/null
rm -rf /tmp/metro-* 2>/dev/null
rm -rf /tmp/react-* 2>/dev/null

# 8. Esperar un momento
echo "⏳ Esperando que todos los procesos terminen..."
sleep 3

# 9. Verificar que no hay procesos corriendo
echo "🔍 Verificando procesos..."
EXPO_PROCESSES=$(pgrep -f "expo" | wc -l)
METRO_PROCESSES=$(pgrep -f "metro" | wc -l)
NODE_PROCESSES=$(pgrep -f "node.*start" | wc -l)

if [ "$EXPO_PROCESSES" -eq 0 ] && [ "$METRO_PROCESSES" -eq 0 ] && [ "$NODE_PROCESSES" -eq 0 ]; then
    echo "✅ Todos los procesos detenidos correctamente"
else
    echo "⚠️ Algunos procesos aún están corriendo:"
    echo "   Expo: $EXPO_PROCESSES procesos"
    echo "   Metro: $METRO_PROCESSES procesos" 
    echo "   Node: $NODE_PROCESSES procesos"
fi

# 10. Iniciar simulador de iOS limpio
echo ""
echo "🚀 Iniciando simulador de iOS limpio..."
echo "======================================"

# Abrir simulador
open -a Simulator

# Esperar que el simulador se abra
echo "⏳ Esperando que el simulador se abra..."
sleep 5

# 11. Iniciar Expo con cache limpio
echo "🚀 Iniciando Expo con cache completamente limpio..."
cd ZyroMarketplace

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json"
    echo "   Asegúrate de estar en el directorio correcto"
    exit 1
fi

echo "📦 Directorio de trabajo: $(pwd)"
echo "📦 Iniciando con cache limpio..."

# Iniciar con todas las opciones de limpieza
npx expo start --clear --ios --dev-client

echo ""
echo "✅ Simulador de iOS reiniciado completamente"
echo "🔧 Cache limpiado en todos los niveles"
echo "📱 Aplicación iniciando con estado fresco"
echo ""
echo "💡 Si hay problemas:"
echo "   1. Presiona 'r' en la terminal para recargar"
echo "   2. Presiona 'shift + r' para recargar con cache limpio"
echo "   3. Cierra y vuelve a abrir la app en el simulador"