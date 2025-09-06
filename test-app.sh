#!/bin/bash

echo "🚀 Iniciando Zyro Marketplace - Testing Completo"
echo "==============================================="
echo ""
echo "📋 CREDENCIALES DE PRUEBA:"
echo ""
echo "👑 ADMINISTRADOR:"
echo "   Usuario: admin_zyrovip"
echo "   Contraseña: xarrec-2paqra-guftoN"
echo ""
echo "📱 INFLUENCER DE PRUEBA:"
echo "   Usuario: pruebainflu"
echo "   Contraseña: 12345"
echo ""
echo "🏢 EMPRESA:"
echo "   Hacer clic en 'SOY EMPRESA' y registrarse"
echo ""
echo "⚡ Iniciando servidor Expo..."
echo ""

# Iniciar servidor Expo en background
npx expo start &
EXPO_PID=$!

# Esperar a que el servidor esté listo
sleep 5

echo "🌐 Abriendo aplicación web..."
open http://localhost:8081

echo ""
echo "📱 Para abrir iOS simulator, presiona 'i' en la terminal del servidor"
echo "🤖 Para abrir Android emulator, presiona 'a' en la terminal del servidor"
echo ""
echo "Presiona Ctrl+C para detener el servidor"

# Esperar a que el usuario termine
wait $EXPO_PID