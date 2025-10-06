#!/bin/bash

# Script de configuración automática para integración con Stripe
# ZyroMarketplace - Sistema de Pagos

echo "🚀 Configurando integración con Stripe para ZyroMarketplace..."
echo "=================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
show_message() {
    echo -e "${GREEN}✓${NC} $1"
}

show_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

show_error() {
    echo -e "${RED}✗${NC} $1"
}

show_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    show_error "Node.js no está instalado. Por favor instala Node.js primero."
    exit 1
fi

show_message "Node.js encontrado: $(node --version)"

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    show_error "npm no está instalado. Por favor instala npm primero."
    exit 1
fi

show_message "npm encontrado: $(npm --version)"

# Instalar dependencias del proyecto principal
echo ""
echo "📦 Instalando dependencias del proyecto principal..."
npm install

if [ $? -eq 0 ]; then
    show_message "Dependencias del proyecto principal instaladas correctamente"
else
    show_error "Error instalando dependencias del proyecto principal"
    exit 1
fi

# Crear directorio backend si no existe
if [ ! -d "backend" ]; then
    mkdir backend
    show_message "Directorio backend creado"
fi

# Instalar dependencias del backend
echo ""
echo "📦 Instalando dependencias del backend..."
cd backend
npm install

if [ $? -eq 0 ]; then
    show_message "Dependencias del backend instaladas correctamente"
else
    show_error "Error instalando dependencias del backend"
    exit 1
fi

cd ..

# Verificar archivos creados
echo ""
echo "📋 Verificando archivos creados..."

files_to_check=(
    "services/StripeService.js"
    "components/StripeSubscriptionPlans.js"
    "components/CompanyRegistrationWithStripe.js"
    "backend/stripe-api.js"
    "backend/package.json"
    "STRIPE_INTEGRATION_GUIDE.md"
)

all_files_exist=true

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        show_message "Archivo encontrado: $file"
    else
        show_error "Archivo faltante: $file"
        all_files_exist=false
    fi
done

if [ "$all_files_exist" = false ]; then
    show_error "Algunos archivos están faltando. Verifica la instalación."
    exit 1
fi

# Verificar configuración de .env
echo ""
echo "🔧 Verificando configuración de variables de entorno..."

if [ -f ".env" ]; then
    if grep -q "STRIPE_PUBLISHABLE_KEY" .env && grep -q "STRIPE_SECRET_KEY" .env; then
        show_message "Variables de Stripe encontradas en .env"
        show_warning "IMPORTANTE: Actualiza las claves de Stripe con tus claves reales"
    else
        show_warning "Variables de Stripe no encontradas en .env"
    fi
else
    show_error "Archivo .env no encontrado"
fi

# Crear script de inicio para el backend
echo ""
echo "📝 Creando scripts de utilidad..."

cat > backend/start-dev.sh << 'EOF'
#!/bin/bash
echo "🚀 Iniciando servidor Stripe API en modo desarrollo..."
npm run dev
EOF

chmod +x backend/start-dev.sh

cat > backend/start-prod.sh << 'EOF'
#!/bin/bash
echo "🚀 Iniciando servidor Stripe API en modo producción..."
npm start
EOF

chmod +x backend/start-prod.sh

show_message "Scripts de inicio creados"

# Crear archivo de configuración para desarrollo
cat > backend/.env.example << 'EOF'
# Configuración de Stripe para desarrollo
STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publicable_de_prueba
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_de_prueba
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret

# URLs de la aplicación
APP_URL=http://localhost:3000
STRIPE_SUCCESS_URL=http://localhost:3000/payment/success
STRIPE_CANCEL_URL=http://localhost:3000/payment/cancel

# Puerto del servidor
PORT=3001

# Entorno
NODE_ENV=development
EOF

show_message "Archivo .env.example creado para el backend"

# Crear documentación de testing
cat > STRIPE_TESTING_GUIDE.md << 'EOF'
# Guía de Testing para Stripe

## 🧪 Tarjetas de Prueba

### Tarjetas Exitosas
- **Visa**: 4242424242424242
- **Visa (debit)**: 4000056655665556
- **Mastercard**: 5555555555554444
- **American Express**: 378282246310005

### Tarjetas que Requieren Autenticación
- **Visa**: 4000002500003155
- **Mastercard**: 5200828282828210

### Tarjetas Declinadas
- **Genérica**: 4000000000000002
- **Fondos insuficientes**: 4000000000009995
- **Tarjeta perdida**: 4000000000009987

## 🔧 Configuración de Testing

1. Usa las claves de prueba (pk_test_ y sk_test_)
2. Configura webhooks apuntando a tu servidor local
3. Usa Stripe CLI para testing de webhooks:
   ```bash
   stripe listen --forward-to localhost:3001/api/stripe/webhook
   ```

## 📊 Verificación de Pagos

1. Crea un pago de prueba
2. Verifica en Stripe Dashboard que aparece
3. Confirma que los webhooks se procesan correctamente
4. Prueba cancelaciones y reembolsos

## 🚨 Casos de Error a Probar

- Pago declinado
- Webhook fallido
- Suscripción cancelada
- Método de pago expirado
EOF

show_message "Guía de testing creada"

# Mostrar resumen final
echo ""
echo "🎉 ¡Configuración completada!"
echo "=================================================="
echo ""
show_info "Archivos creados:"
echo "  • Servicio de Stripe (services/StripeService.js)"
echo "  • Componente de planes (components/StripeSubscriptionPlans.js)"
echo "  • Registro con Stripe (components/CompanyRegistrationWithStripe.js)"
echo "  • API Backend (backend/stripe-api.js)"
echo "  • Guías de documentación"
echo ""
show_info "Próximos pasos:"
echo "  1. Configura tu cuenta de Stripe"
echo "  2. Actualiza las claves API en .env"
echo "  3. Despliega el backend"
echo "  4. Configura webhooks en Stripe"
echo "  5. Prueba el flujo completo"
echo ""
show_warning "IMPORTANTE:"
echo "  • Lee STRIPE_INTEGRATION_GUIDE.md para instrucciones detalladas"
echo "  • Actualiza las claves de Stripe en .env con tus claves reales"
echo "  • Configura webhooks en tu Dashboard de Stripe"
echo "  • Prueba todo en modo test antes de ir a producción"
echo ""
show_info "Para iniciar el backend en desarrollo:"
echo "  cd backend && npm run dev"
echo ""
show_info "Para testing:"
echo "  Lee STRIPE_TESTING_GUIDE.md"
echo ""
echo "🚀 ¡Tu integración con Stripe está lista para configurar!"
EOF