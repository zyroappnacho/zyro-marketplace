#!/bin/bash

echo "🏢 INICIANDO PRUEBA DE LOGIN DE EMPRESA"
echo "======================================"

echo ""
echo "🔧 Limpiando cache y reiniciando..."

# Limpiar cache de npm
npm start -- --clear &

# Esperar un momento para que se inicie
sleep 3

echo ""
echo "✅ SIMULADOR INICIADO CON CACHE LIMPIO"
echo "======================================"

echo ""
echo "🎯 CREDENCIALES DE PRUEBA:"
echo "Email: empresa@zyro.com"
echo "Contraseña: empresa123"

echo ""
echo "📋 PASOS PARA PROBAR:"
echo "1. Espera a que cargue completamente el simulador"
echo "2. Ve a la pantalla de login"
echo "3. Introduce las credenciales de empresa"
echo "4. Deberías acceder al dashboard de empresa"

echo ""
echo "✅ LISTO PARA PROBAR EL LOGIN DE EMPRESA"