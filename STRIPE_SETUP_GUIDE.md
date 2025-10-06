# 🔧 Guía de Configuración de Stripe

## ¿Por qué aparece "Something went wrong"?

El error que ves es porque estamos usando una URL simulada de Stripe que no existe realmente. Para que funcione correctamente, necesitas configurar Stripe con tus propias claves.

## 📋 Pasos para Configurar Stripe

### 1. Crear Cuenta de Stripe

1. Ve a [https://stripe.com](https://stripe.com)
2. Crea una cuenta gratuita
3. Verifica tu email

### 2. Obtener las Claves API

1. En el dashboard de Stripe, ve a **Developers > API keys**
2. Copia las siguientes claves:
   - **Publishable key** (empieza con `pk_test_...`)
   - **Secret key** (empieza con `sk_test_...`)

### 3. Configurar las Claves en tu Proyecto

Actualiza el archivo `ZyroMarketplace/backend/.env`:

```env
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica_aqui
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_aqui

# App Configuration
APP_URL=http://localhost:3000
PORT=3001
```

### 4. Configurar Webhooks (Opcional para desarrollo)

1. En Stripe Dashboard, ve a **Developers > Webhooks**
2. Crea un nuevo endpoint: `http://localhost:3001/webhook`
3. Selecciona estos eventos:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `invoice.payment_succeeded`

## 🚀 Modo de Desarrollo vs Producción

### Desarrollo (Actual)
- Usa claves de test (`pk_test_` y `sk_test_`)
- Los pagos son simulados
- No se cobra dinero real

### Producción
- Usa claves live (`pk_live_` y `sk_live_`)
- Los pagos son reales
- Requiere verificación de la cuenta

## 🔄 Reiniciar el Backend

Después de configurar las claves, reinicia el backend:

```bash
cd ZyroMarketplace
node kill-and-start-stripe.js
```

## 🧪 Probar el Sistema

1. **Sin configurar Stripe**: Verás el modo demo
2. **Con Stripe configurado**: Se abrirá el checkout real de Stripe

## 💳 Tarjetas de Prueba

Para testing, usa estas tarjetas:

- **Visa**: `4242 4242 4242 4242`
- **Visa (declined)**: `4000 0000 0000 0002`
- **Mastercard**: `5555 5555 5555 4444`

**Fecha**: Cualquier fecha futura  
**CVC**: Cualquier 3 dígitos  
**ZIP**: Cualquier código postal

## 🔧 Solución Rápida para Demo

Si solo quieres probar la funcionalidad sin configurar Stripe, el sistema actual funciona en modo demo y simula el pago exitoso.

## 📞 Soporte

Si necesitas ayuda con la configuración:
1. Revisa la documentación de Stripe: [https://stripe.com/docs](https://stripe.com/docs)
2. Verifica que el backend esté ejecutándose en puerto 3001
3. Comprueba que las claves estén correctamente configuradas

---

**Nota**: En producción, nunca expongas las claves secretas en el código. Usa variables de entorno seguras.