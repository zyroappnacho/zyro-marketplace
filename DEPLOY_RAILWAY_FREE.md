# 🚀 DESPLIEGUE GRATUITO EN RAILWAY

## ✅ Por qué Railway es perfecto para tu app:

- **100% GRATUITO** para proyectos pequeños
- **Despliegue automático** desde GitHub
- **SSL/HTTPS incluido** (requerido por Stripe)
- **Variables de entorno** fáciles de configurar
- **Dominio gratuito**: `zyromarketplace.up.railway.app`

## 📋 Pasos para desplegar GRATIS:

### 1. Preparar el proyecto
```bash
cd ZyroMarketplace/backend
```

### 2. Crear railway.json
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node stripe-server.js",
    "healthcheckPath": "/api/stripe/health"
  }
}
```

### 3. Crear cuenta en Railway
1. Ve a [railway.app](https://railway.app)
2. Regístrate con GitHub (gratis)
3. Conecta tu repositorio

### 4. Configurar variables de entorno
En Railway Dashboard:
```
STRIPE_PUBLISHABLE_KEY=pk_live_51SDpD2LC2jTd4mwa...
STRIPE_SECRET_KEY=sk_live_51SDpD2LC2jTd4mwa...
STRIPE_WEBHOOK_SECRET=whsec_... (después del webhook)
NODE_ENV=production
PORT=3001
```

### 5. Desplegar
```bash
# Railway detecta automáticamente y despliega
# Tu app estará en: https://zyromarketplace.up.railway.app
```

## 🔧 Configurar Webhook en Stripe

1. Ve a [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. **URL**: `https://zyromarketplace.up.railway.app/api/stripe/webhook`
3. **Eventos**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `invoice.payment_succeeded`

4. Copia el **Webhook Secret** y añádelo a Railway

## 📱 Actualizar la app móvil

Cambia la URL en tu app:
```javascript
// En tu app React Native
const API_BASE_URL = 'https://zyromarketplace.up.railway.app/api';
```

## 💰 Límites del plan gratuito:

- **Ejecución**: 500 horas/mes (suficiente para empezar)
- **Ancho de banda**: 100GB/mes
- **Almacenamiento**: 1GB
- **Builds**: Ilimitados

## 🎯 Ventajas vs otras opciones:

| Servicio | Precio | SSL | Dominio | Facilidad |
|----------|--------|-----|---------|-----------|
| Railway  | GRATIS | ✅  | ✅      | ⭐⭐⭐⭐⭐ |
| Render   | GRATIS | ✅  | ✅      | ⭐⭐⭐⭐   |
| Vercel   | GRATIS | ✅  | ✅      | ⭐⭐⭐     |
| DigitalOcean | $5/mes | ❌ | ❌   | ⭐⭐      |

## 🚀 Comandos rápidos:

```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Inicializar proyecto
cd ZyroMarketplace/backend
railway init

# 4. Desplegar
railway up

# 5. Ver logs
railway logs

# 6. Abrir en navegador
railway open
```

## ✅ Checklist de despliegue:

- [ ] Cuenta Railway creada
- [ ] Repositorio conectado
- [ ] Variables de entorno configuradas
- [ ] Backend desplegado
- [ ] Webhook configurado en Stripe
- [ ] URL actualizada en la app móvil
- [ ] Test de pago realizado

## 🎉 ¡Listo para producción!

Una vez completado, tu app estará 100% funcional con:
- ✅ Pagos reales con Stripe
- ✅ Backend desplegado GRATIS
- ✅ SSL/HTTPS automático
- ✅ Dominio profesional
- ✅ Escalabilidad automática

**¡Tu marketplace estará listo para el App Store sin coste de hosting!**