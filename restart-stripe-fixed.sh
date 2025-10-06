#!/bin/bash

echo "🔄 Reiniciando servidor Stripe..."

# Terminar procesos existentes
pkill -f "node.*stripe-server" 2>/dev/null || true
sleep 2

# Verificar que el puerto esté libre
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️ Puerto 3001 aún ocupado, terminando procesos..."
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Iniciar servidor
echo "🚀 Iniciando servidor Stripe corregido..."
cd backend && node stripe-server.js &

echo "✅ Servidor reiniciado con período de prueba corregido"
echo "💡 El servidor ahora usa trial_period_days: 1"
