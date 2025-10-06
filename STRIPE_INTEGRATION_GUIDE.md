# Guía Completa de Integración con Stripe

## 📋 Resumen del Sistema

Este sistema implementa una pasarela de pago externa con Stripe para ZyroMarketplace, evitando las comisiones de Apple al procesar pagos fuera de la app. El sistema incluye:

- **3 planes de suscripción** (3, 6 y 12 meses)
- **Pago único inicial** de configuración (150€)
- **Renovación automática** de suscripciones
- **Métodos de pago**: Tarjetas de débito/crédito y transferencias bancarias
- **Portal del cliente** para gestionar suscripciones

## 🏗️ Arquitectura del Sistema

```
App React Native → Backend API → Stripe → Webhook → Base de Datos
                ↓
        Navegador Externo (Stripe Checkout)
```

## 📦 Planes Configurados

### Plan 3 Meses
- **Precio**: 499€/mes
- **Duración**: 3 meses
- **Total**: 1,497€ + 150€ inicial = 1,647€

### Plan 6 Meses (Más Popular)
- **Precio**: 399€/mes
- **Duración**: 6 meses
- **Total**: 2,394€ + 150€ inicial = 2,544€
- **Ahorro**: 600€ vs plan mensual

### Plan 12 Meses
- **Precio**: 299€/mes
- **Duración**: 12 meses
- **Total**: 3,588€ + 150€ inicial = 3,738€
- **Ahorro**: 2,400€ vs plan mensual

### Pago Inicial
- **Precio**: 150€ (una sola vez)
- **Incluye**: Configuración de anuncios, promoción inicial, presentación a influencers

## 🔧 Configuración Paso a Paso

### 1. Configurar Cuenta de Stripe

1. **Accede a tu Dashboard de Stripe**: https://dashboard.stripe.com
2. **Obtén tus claves API**:
   - Clave Publicable: `pk_live_...` (producción) o `pk_test_...` (pruebas)
   - Clave Secreta: `sk_live_...` (producción) o `sk_test_...` (pruebas)

3. **Configura Webhooks**:
   - URL: `https://tudominio.com/api/stripe/webhook`
   - Eventos a escuchar:
     - `checkout.session.completed`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

### 2. Configurar Variables de Entorno

Actualiza tu archivo `.env`:

```env
# === STRIPE CONFIGURATION ===
STRIPE_PUBLISHABLE_KEY=pk_live_tu_clave_publicable_real
STRIPE_SECRET_KEY=sk_live_tu_clave_secreta_real
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret_real

# URLs de redirección
STRIPE_SUCCESS_URL=https://tudominio.com/payment/success
STRIPE_CANCEL_URL=https://tudominio.com/payment/cancel

# === CONFIGURACIÓN GENERAL ===
NODE_ENV=production
APP_URL=https://tudominio.com
```

### 3. Instalar Dependencias

En el directorio principal:
```bash
cd ZyroMarketplace
npm install
```

En el directorio del backend:
```bash
cd backend
npm install
```

### 4. Configurar Productos en Stripe

Los productos se crean automáticamente la primera vez que se ejecuta el código, pero puedes crearlos manualmente:

#### Productos a crear:
1. **Plan 3 Meses** - ID: `plan_3_months`
2. **Plan 6 Meses** - ID: `plan_6_months`  
3. **Plan 12 Meses** - ID: `plan_12_months`
4. **Configuración Inicial** - ID: `initial_setup`

### 5. Configurar Métodos de Pago

En tu Dashboard de Stripe:
1. Ve a **Settings → Payment methods**
2. Activa:
   - **Cards** (Visa, Mastercard, American Express)
   - **SEPA Direct Debit** (para transferencias bancarias en Europa)
   - **Bancontact** (opcional, para Bélgica)
   - **iDEAL** (opcional, para Países Bajos)

### 6. Configurar el Portal del Cliente

1. Ve a **Settings → Billing → Customer portal**
2. Activa el portal del cliente
3. Configura:
   - Permitir cancelación de suscripciones
   - Permitir actualización de métodos de pago
   - Permitir descarga de facturas

## 🚀 Despliegue del Backend

### Opción 1: Vercel (Recomendado)

1. Instala Vercel CLI:
```bash
npm i -g vercel
```

2. Despliega:
```bash
cd backend
vercel --prod
```

3. Configura variables de entorno en Vercel Dashboard

### Opción 2: Heroku

1. Crea app en Heroku:
```bash
heroku create zyro-stripe-api
```

2. Configura variables:
```bash
heroku config:set STRIPE_SECRET_KEY=sk_live_...
heroku config:set STRIPE_WEBHOOK_SECRET=whsec_...
```

3. Despliega:
```bash
git push heroku main
```

### Opción 3: VPS/Servidor Propio

1. Instala Node.js y PM2
2. Clona el repositorio
3. Instala dependencias
4. Configura variables de entorno
5. Ejecuta con PM2:
```bash
pm2 start stripe-api.js --name "zyro-stripe"
```

## 🔗 Integración en la App

### 1. Actualizar Navegación

En tu archivo de navegación principal, agrega la nueva pantalla:

```javascript
import CompanyRegistrationWithStripe from './components/CompanyRegistrationWithStripe';

// En tu Stack Navigator:
<Stack.Screen 
  name="CompanyRegistration" 
  component={CompanyRegistrationWithStripe}
  options={{ title: 'Registro de Empresa' }}
/>
```

### 2. Actualizar Redux Store

Asegúrate de que tu store de Redux puede manejar los datos de la empresa:

```javascript
// En authSlice.js
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    company: null,
    subscription: null,
    // ... otros estados
  },
  reducers: {
    setCompanyData: (state, action) => {
      state.company = action.payload;
    },
    setSubscriptionData: (state, action) => {
      state.subscription = action.payload;
    },
    // ... otros reducers
  }
});
```

## 🧪 Testing

### 1. Tarjetas de Prueba

Usa estas tarjetas para testing:

- **Visa exitosa**: `4242424242424242`
- **Visa que requiere autenticación**: `4000002500003155`
- **Visa declinada**: `4000000000000002`
- **Mastercard exitosa**: `5555555555554444`

### 2. Testing de Webhooks

Usa Stripe CLI para testing local:

```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

### 3. Testing de Suscripciones

1. Crea una suscripción de prueba
2. Verifica que se procese correctamente
3. Prueba la cancelación
4. Verifica los webhooks

## 📊 Monitoreo y Analytics

### 1. Dashboard de Stripe

Monitorea:
- Pagos exitosos/fallidos
- Suscripciones activas
- Cancelaciones
- Ingresos mensuales

### 2. Logs del Sistema

Implementa logging para:
- Creación de sesiones de pago
- Webhooks recibidos
- Errores de procesamiento
- Actualizaciones de suscripción

## 🔒 Seguridad

### 1. Validación de Webhooks

El sistema valida automáticamente los webhooks usando el secret de Stripe.

### 2. Manejo de Claves

- **NUNCA** expongas las claves secretas en el frontend
- Usa variables de entorno para todas las claves
- Rota las claves regularmente

### 3. Validación de Datos

- Valida todos los datos de entrada
- Sanitiza los datos antes de procesarlos
- Implementa rate limiting en las APIs

## 🚨 Manejo de Errores

### 1. Errores Comunes

- **Pago declinado**: Mostrar mensaje claro al usuario
- **Webhook fallido**: Implementar reintentos automáticos
- **Suscripción expirada**: Notificar al usuario y suspender servicios

### 2. Recuperación de Errores

- Implementa reintentos automáticos para pagos fallidos
- Notifica a los usuarios sobre problemas de pago
- Proporciona opciones de recuperación

## 📞 Soporte al Cliente

### 1. Portal del Cliente

Los clientes pueden:
- Ver historial de pagos
- Actualizar métodos de pago
- Cancelar suscripciones
- Descargar facturas

### 2. Gestión de Disputas

- Monitorea disputas en Stripe Dashboard
- Responde rápidamente con documentación
- Implementa políticas claras de reembolso

## 🔄 Mantenimiento

### 1. Actualizaciones Regulares

- Mantén las dependencias actualizadas
- Revisa logs regularmente
- Monitorea métricas de rendimiento

### 2. Backup y Recuperación

- Haz backup de datos de suscripciones
- Implementa procedimientos de recuperación
- Prueba los backups regularmente

## 📈 Optimización

### 1. Conversión

- Optimiza el flujo de pago
- Reduce pasos innecesarios
- Mejora la UX del checkout

### 2. Retención

- Implementa recordatorios de pago
- Ofrece descuentos por renovación
- Mejora la comunicación con clientes

## 🎯 Próximos Pasos

1. **Implementar el backend** en tu servidor
2. **Configurar webhooks** en Stripe
3. **Probar el flujo completo** en modo test
4. **Migrar a producción** con claves reales
5. **Monitorear y optimizar** basado en métricas

## 📋 Checklist de Implementación

- [ ] Cuenta de Stripe configurada y verificada
- [ ] Claves API obtenidas (publicable y secreta)
- [ ] Variables de entorno configuradas
- [ ] Backend desplegado y funcionando
- [ ] Webhooks configurados en Stripe
- [ ] Productos y precios creados en Stripe
- [ ] Métodos de pago activados
- [ ] Portal del cliente configurado
- [ ] Testing completo realizado
- [ ] Monitoreo implementado
- [ ] Documentación actualizada

¡Con esta configuración tendrás un sistema de pagos robusto y completo para tu marketplace!