# 🧪 GUÍA DE TESTING SEGURO EN PRODUCCIÓN

## ⚠️ **IMPORTANTE: TESTING CON DINERO REAL**
Una vez desplegado el backend con claves de producción, estarás usando **dinero real**. Aquí tienes las mejores prácticas para testing seguro:

## 🔒 **OPCIONES DE TESTING SEGURO**

### **Opción 1: Testing con Cantidades Mínimas (Recomendado)**
```
✅ Usar tu propia tarjeta real
✅ Crear un producto de prueba de 1€
✅ Verificar el flujo completo
✅ Cancelar inmediatamente en Stripe Dashboard
✅ Reembolsar si es necesario
```

### **Opción 2: Entorno de Staging**
```
✅ Crear una cuenta de Stripe separada para testing
✅ Usar claves de prueba en un entorno de staging
✅ Probar todo el flujo sin dinero real
✅ Solo pasar a producción cuando esté 100% probado
```

## 🧪 **PROCESO DE TESTING RECOMENDADO**

### **Paso 1: Verificar Backend**
```bash
# Iniciar backend de producción
node deploy-production-backend.js

# Verificar health check
curl http://localhost:3001/health
```

### **Paso 2: Test Mínimo con Tarjeta Real**
1. **Registrar empresa de prueba** en tu app
2. **Seleccionar plan más barato** (Plan 12 meses: 299€ + 150€ = 449€)
3. **Usar tu tarjeta real** para el pago
4. **Verificar que se crea la cuenta** de empresa
5. **Cancelar inmediatamente** en Stripe Dashboard

### **Paso 3: Verificaciones Post-Pago**
- ✅ La empresa puede hacer login
- ✅ Aparece en el panel de admin
- ✅ Los datos de suscripción son correctos
- ✅ El webhook se ejecutó correctamente

### **Paso 4: Limpieza Post-Test**
1. **Cancelar suscripción** en Stripe Dashboard
2. **Reembolsar pago** si es necesario
3. **Eliminar cuenta de empresa** de prueba
4. **Verificar que no hay cargos pendientes**

## 💳 **TARJETAS PARA TESTING**

### **❌ NO FUNCIONAN EN PRODUCCIÓN**
```
4242 4242 4242 4242  ❌ Rechazada
4000 0000 0000 0002  ❌ Rechazada
4000 0025 0000 3155  ❌ Rechazada
```

### **✅ OPCIONES REALES**
```
Tu tarjeta personal       ✅ Funciona
Tarjeta de débito        ✅ Funciona  
Tarjeta prepago          ✅ Funciona
Tarjeta de familiares    ✅ Funciona (con permiso)
```

## 🏗️ **DESPLIEGUE PARA PRODUCCIÓN REAL**

### **Servicios Recomendados para el Backend**

#### **1. Heroku (Más Fácil)**
```bash
# Instalar Heroku CLI
npm install -g heroku

# Login y crear app
heroku login
heroku create tu-app-stripe-backend

# Configurar variables de entorno
heroku config:set NODE_ENV=production
heroku config:set STRIPE_SECRET_KEY=sk_live_...
heroku config:set STRIPE_WEBHOOK_SECRET=whsec_...

# Desplegar
git add .
git commit -m "Deploy production backend"
git push heroku main
```

#### **2. Railway (Moderno)**
```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login y desplegar
railway login
railway init
railway up
```

#### **3. Render (Gratuito)**
1. Conectar tu repositorio GitHub
2. Configurar variables de entorno
3. Desplegar automáticamente

### **Configuración de Variables de Entorno en Producción**
```env
NODE_ENV=production
STRIPE_SECRET_KEY=sk_live_51SDpD2LC2jTd4mwa...
STRIPE_WEBHOOK_SECRET=whsec_2FDZWciDJhv47VqUZ2WoMWRIBwneL4Hp
PORT=3001
APP_URL=https://tu-dominio.com
STRIPE_SUCCESS_URL=https://tu-dominio.com/payment/success
STRIPE_CANCEL_URL=https://tu-dominio.com/payment/cancel
```

## 📱 **CONFIGURAR LA APP PARA PRODUCCIÓN**

### **Actualizar URLs en la App**
```javascript
// En tu app React Native
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3001'
  : 'https://tu-backend-produccion.herokuapp.com';
```

### **Actualizar StripeService**
```javascript
// services/StripeService.js
this.baseURL = process.env.NODE_ENV === 'production' 
  ? 'https://tu-backend-produccion.herokuapp.com'
  : 'http://localhost:3001';
```

## 🔄 **MANTENIMIENTO DEL SERVIDOR**

### **Opción A: Servicios Gestionados (Recomendado)**
- **Heroku**: Se mantiene automáticamente
- **Railway**: Escalado automático
- **Render**: Monitoreo incluido

### **Opción B: VPS Propio**
```bash
# Usar PM2 para mantener el proceso activo
npm install -g pm2

# Iniciar con PM2
pm2 start stripe-server-optimized.js --name "stripe-backend"

# Configurar para reinicio automático
pm2 startup
pm2 save
```

## 🚨 **CHECKLIST ANTES DE LANZAR**
- [ ] Backend desplegado y funcionando
- [ ] Health check responde correctamente
- [ ] Variables de entorno configuradas
- [ ] Webhook configurado en Stripe
- [ ] Test con tarjeta real completado exitosamente
- [ ] App actualizada con URLs de producción
- [ ] Monitoreo configurado
- [ ] Plan de respaldo en caso de problemas

## 📞 **SOPORTE POST-LANZAMIENTO**

### **Monitoreo Recomendado**
- **Stripe Dashboard**: Pagos y errores
- **Logs del servidor**: Errores de aplicación
- **Health checks**: Disponibilidad del servicio
- **Alertas**: Notificaciones de problemas

### **Contactos de Emergencia**
- **Stripe Support**: Para problemas de pagos
- **Hosting Support**: Para problemas del servidor
- **Tu equipo técnico**: Para problemas de la app

---
**¡Tu sistema de pagos está listo para generar ingresos reales!** 💰