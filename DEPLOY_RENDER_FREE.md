# 🚀 Despliegue Gratuito en Render.com

## ✅ Ventajas de Render.com
- **Completamente gratuito** para aplicaciones web
- **750 horas gratis** al mes (suficiente para desarrollo)
- **HTTPS automático** con certificado SSL
- **Despliegue automático** desde GitHub
- **Dominio personalizado** disponible

## 📋 Pasos para Desplegar

### 1. Crear cuenta en Render
1. Ve a [render.com](https://render.com)
2. Regístrate con tu cuenta de GitHub
3. Autoriza el acceso a tus repositorios

### 2. Crear Web Service
1. Haz clic en "New +" → "Web Service"
2. Conecta tu repositorio: `zyroappnacho/zyro-marketplace`
3. Configura los siguientes campos:

**Configuración Básica:**
- **Name**: `zyro-marketplace-backend`
- **Environment**: `Node`
- **Region**: `Oregon (US West)` (más cercano)
- **Branch**: `main`
- **Root Directory**: (dejar vacío)

**Build & Deploy:**
- **Build Command**: `npm install --legacy-peer-deps`
- **Start Command**: `node backend/stripe-server-optimized.js`

### 3. Variables de Entorno
Agrega estas variables en la sección "Environment":

```
NODE_ENV=production
STRIPE_SECRET_KEY=sk_test_tu_clave_secreta_stripe
STRIPE_PUBLISHABLE_KEY=pk_test_tu_clave_publica_stripe
SENDGRID_API_KEY=SG.tu_clave_sendgrid
```

### 4. Plan y Configuración
- **Plan**: Selecciona "Free" (0$/mes)
- **Auto-Deploy**: Activado (se despliega automáticamente con cada push)

## 🔧 Configuración Avanzada

### Healthcheck Endpoint
Tu servidor ya incluye endpoints de salud:
- `GET /` - Estado general de la API
- `GET /health` - Verificación de salud

### Dominios
- **Dominio gratuito**: `tu-app-name.onrender.com`
- **Dominio personalizado**: Disponible en plan gratuito

### Logs y Monitoreo
- Acceso completo a logs en tiempo real
- Métricas de rendimiento incluidas
- Alertas por email disponibles

## 🚨 Limitaciones del Plan Gratuito
- **Hibernación**: La app se duerme después de 15 minutos de inactividad
- **Tiempo de arranque**: ~30 segundos para despertar
- **Ancho de banda**: 100GB/mes
- **Horas de cómputo**: 750 horas/mes

## 🔄 Proceso de Despliegue
1. Render detecta cambios en GitHub automáticamente
2. Ejecuta `npm install --legacy-peer-deps`
3. Inicia el servidor con `node backend/stripe-server-optimized.js`
4. La aplicación estará disponible en tu dominio .onrender.com

## 📱 Conectar con tu App React Native
Una vez desplegado, actualiza la URL del backend en tu app:

```javascript
// En tu archivo de configuración
const API_BASE_URL = 'https://tu-app-name.onrender.com';
```

## ✅ Verificación del Despliegue
1. Visita `https://tu-app-name.onrender.com`
2. Deberías ver: `{"message":"Zyro Marketplace Backend API","status":"running"}`
3. Verifica `/health` endpoint
4. Prueba endpoints de Stripe

## 🆙 Upgrade Futuro
Si necesitas más recursos:
- **Starter Plan**: $7/mes - Sin hibernación
- **Standard Plan**: $25/mes - Más recursos y escalabilidad