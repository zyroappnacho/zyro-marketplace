# 💳 Guía para Prueba Real de 1€ en Stripe

## ⚠️ **IMPORTANTE: PRUEBA CON DINERO REAL**

Esta guía te ayudará a crear un producto temporal de 1€ en **modo LIVE** de Stripe para verificar que el dinero llega correctamente a tu cuenta.

## 🔄 **PROCESO COMPLETO**

### **PASO 1: Crear Producto Temporal de 1€**

1. **Ve a Stripe Dashboard**: https://dashboard.stripe.com
2. **ASEGÚRATE de estar en modo LIVE** (toggle superior derecho debe estar en "Live")
3. **Products** → **Add product**
4. **Configuración del producto**:
   ```
   Nombre: "PRUEBA TEMPORAL - 1€"
   Descripción: "Producto temporal para testing - ELIMINAR DESPUÉS"
   Precio: 1.00 EUR
   Tipo: One-time payment
   Statement descriptor: "ZYRO-TEST"
   ```
5. **Guardar** y **copiar el Price ID** (empieza con `price_`)

### **PASO 2: Añadir Producto al Backend**

Necesitamos añadir temporalmente este producto a tu backend para que pueda procesarlo:

```javascript
// Añadir a tu configuración de precios
const testProduct = {
  price_id: "price_XXXXXXXXXXXXXXX", // El Price ID que copiaste
  product_id: "prod_XXXXXXXXXXXXXXX", // El Product ID de Stripe
  amount: 100, // 1€ en centavos
  currency: "eur",
  description: "Producto de prueba temporal - 1€"
};
```

### **PASO 3: Realizar Prueba Real**

1. **Abrir tu app** React Native
2. **Registrar empresa** de prueba con datos reales
3. **Seleccionar el producto de 1€** (si está disponible en la app)
4. **Usar tarjeta REAL** para el pago
5. **Completar el pago**

### **PASO 4: Verificar Recepción del Dinero**

1. **Stripe Dashboard** → **Payments**
2. Verificar que aparece el pago de 1€
3. **Balance** → Confirmar que el dinero está en tu cuenta
4. **Webhooks** → Verificar que se recibió el webhook

### **PASO 5: Eliminar Producto Temporal**

**INMEDIATAMENTE después de la prueba**:
1. **Products** → Buscar "PRUEBA TEMPORAL - 1€"
2. **Archive product** (no se puede eliminar si ya se usó)
3. **Desactivar** para que no se pueda usar más

## 🛡️ **MEDIDAS DE SEGURIDAD**

### **Antes de la Prueba**:
- ✅ Verificar que el webhook está configurado correctamente
- ✅ Confirmar que el backend está funcionando
- ✅ Usar solo 1€ para minimizar riesgo
- ✅ Tener preparado el proceso de eliminación

### **Durante la Prueba**:
- ⏱️ Realizar la prueba rápidamente
- 📱 Usar tu teléfono personal para el pago
- 💳 Usar una tarjeta con límite bajo si es posible

### **Después de la Prueba**:
- 🗑️ Archivar el producto inmediatamente
- 📊 Verificar que el dinero llegó correctamente
- 📝 Documentar los resultados
- 🔄 Confirmar que los webhooks funcionaron

## 🧪 **Script para Añadir Producto Temporal**

Te voy a crear un script que añada temporalmente el producto de 1€ a tu backend:

```javascript
// Añadir producto temporal al backend
const addTemporaryTestProduct = async (priceId, productId) => {
  // Este script añadirá el producto temporalmente
  // y lo eliminará después de la prueba
};
```

## 📊 **Qué Verificar**

### **En Stripe Dashboard**:
- ✅ Pago recibido de 1€
- ✅ Estado: "Succeeded"
- ✅ Webhook enviado correctamente
- ✅ Dinero en balance

### **En Render Logs**:
- ✅ Webhook recibido
- ✅ Empresa registrada
- ✅ Email enviado (si aplica)

### **En tu App**:
- ✅ Empresa aparece en admin panel
- ✅ Estado de pago correcto
- ✅ Datos sincronizados

## ⚡ **SCRIPT DE PRUEBA RÁPIDA**

¿Quieres que cree un script automatizado que:
1. Te ayude a añadir el producto temporal
2. Genere una URL de pago directa
3. Verifique el resultado
4. Te recuerde eliminar el producto?

## 🎯 **RESULTADO ESPERADO**

Si todo funciona correctamente:
- 💰 Recibirás 1€ en tu cuenta de Stripe
- 📧 Se enviará email de confirmación
- 🏢 La empresa aparecerá registrada
- 📊 Los webhooks funcionarán correctamente

**¿Quieres que proceda a crear el script para añadir el producto temporal de 1€?**