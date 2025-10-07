# 📱 Pago Real de 1€ desde Simulador iOS

## ✅ **SÍ, PUEDES PAGAR DESDE EL SIMULADOR**

El simulador de iOS **SÍ puede procesar pagos reales** porque:
- Tu app se conecta al backend desplegado en Render
- Stripe funciona a través de web views
- Los pagos se procesan en los servidores de Stripe, no localmente

## 🔄 **CÓMO FUNCIONA EL FLUJO**

### **1. En el Simulador iOS:**
- Tu app React Native se ejecuta
- Se conecta a `https://zyro-marketplace.onrender.com`
- Genera una sesión de checkout de Stripe

### **2. Stripe Checkout:**
- Se abre un web view con el formulario de pago
- **Aquí introduces tu tarjeta REAL**
- El pago se procesa en los servidores de Stripe

### **3. Webhook y Confirmación:**
- Stripe envía webhook a tu backend
- Tu backend registra la empresa
- La app recibe la confirmación

## 🛡️ **VENTAJAS DEL SIMULADOR PARA ESTA PRUEBA**

### ✅ **Seguridad:**
- No necesitas dispositivo físico
- Mismo flujo que en producción
- Fácil de debuggear

### ✅ **Conveniencia:**
- Puedes ver logs en tiempo real
- Fácil acceso a herramientas de desarrollo
- Puedes hacer capturas de pantalla

### ✅ **Funcionalidad Completa:**
- Stripe funciona igual que en dispositivo real
- Webhooks se procesan normalmente
- Toda la lógica de negocio funciona

## 📋 **PASOS PARA LA PRUEBA DESDE SIMULADOR**

### **1. Preparar el Simulador:**
```bash
# Asegúrate de que tu app esté corriendo
npm start
# o
yarn start

# En otra terminal, inicia el simulador iOS
npx react-native run-ios
# o si tienes el script personalizado
./start-ios-enhanced.sh
```

### **2. Crear Producto de 1€ en Stripe:**
- Ve a https://dashboard.stripe.com
- **Modo LIVE** (no Test)
- Products → Add product
- Nombre: "PRUEBA TEMPORAL - 1€"
- Precio: 1.00 EUR

### **3. Ejecutar Prueba:**
```bash
node test-real-1euro-payment.js
createRealCheckout("price_XXXXXXXXXX")
```

### **4. En el Simulador:**
- Navega a registro de empresa
- Completa los datos
- Procede al pago
- **Usa tu tarjeta REAL en el web view de Stripe**

## ⚠️ **CONSIDERACIONES IMPORTANTES**

### **Conectividad:**
- El simulador debe tener conexión a internet
- Tu backend debe estar Live en Render
- Stripe debe estar configurado correctamente

### **Tarjeta Real:**
- **SÍ se cobrará 1€ real** a tu tarjeta
- Usa una tarjeta con fondos suficientes
- El cargo aparecerá como "ZYRO-TEST"

### **Debugging:**
- Puedes ver logs en Xcode
- Render logs mostrarán webhooks
- Stripe Dashboard mostrará el pago

## 🔍 **VERIFICACIÓN DESPUÉS DEL PAGO**

### **En el Simulador:**
- La empresa debe aparecer registrada
- Navegación debe funcionar correctamente
- Estado de pago debe ser correcto

### **En Stripe Dashboard:**
- Pago de 1€ debe aparecer como "Succeeded"
- Webhook debe haberse enviado
- Balance debe mostrar el dinero

### **En Render Logs:**
- Webhook recibido correctamente
- Empresa registrada en base de datos
- Sin errores en el procesamiento

## 🚀 **SCRIPT OPTIMIZADO PARA SIMULADOR**

Te voy a crear un script específico que:
1. Verifique que tu simulador esté listo
2. Genere el checkout de 1€
3. Te guíe paso a paso
4. Verifique los resultados

## 🎯 **VENTAJAS vs DISPOSITIVO REAL**

| Aspecto | Simulador | Dispositivo Real |
|---------|-----------|------------------|
| **Debugging** | ✅ Fácil | ❌ Limitado |
| **Logs** | ✅ Completos | ❌ Básicos |
| **Desarrollo** | ✅ Rápido | ❌ Lento |
| **Funcionalidad** | ✅ Completa | ✅ Completa |
| **Pagos Reales** | ✅ Funciona | ✅ Funciona |

## 🔧 **TROUBLESHOOTING**

### **Si el pago no funciona:**
1. Verificar conexión a internet del simulador
2. Comprobar que el backend esté Live
3. Revisar logs de Stripe y Render
4. Verificar configuración de webhooks

### **Si no aparece la empresa:**
1. Verificar que el webhook se recibió
2. Comprobar logs del backend
3. Revisar base de datos (si tienes acceso)

**¿Quieres que proceda a crear el script optimizado para el simulador iOS?**