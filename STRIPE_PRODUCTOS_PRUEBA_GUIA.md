# 🧪 Guía para Crear Productos de Prueba en Stripe

## **1. Crear Producto de Prueba de 1€**

### **Pasos en Stripe Dashboard:**
1. Ve a [dashboard.stripe.com](https://dashboard.stripe.com)
2. **Asegúrate de estar en modo TEST** (toggle en la esquina superior izquierda)
3. Ve a **Products** → **Add product**

### **Configuración del Producto:**
```
Nombre: "Plan Prueba - 1€"
Descripción: "Plan de prueba para verificar pagos"
Precio: 1.00 EUR
Tipo: One-time payment (pago único)
```

### **Configuración Avanzada:**
- **Tax code**: No tax
- **Statement descriptor**: "ZYRO-TEST"
- **Unit label**: Deja vacío

## **2. Obtener el Price ID**
Después de crear el producto:
1. Copia el **Price ID** (empieza con `price_`)
2. Lo necesitarás para el script de prueba

## **3. Script de Prueba Automático**

Voy a crear un script que:
- ✅ Añada automáticamente el producto de 1€ a tu backend
- ✅ Pruebe el flujo completo de checkout
- ✅ Verifique que los webhooks funcionen

## **4. Productos de Prueba Recomendados:**

### **Para Testing Completo:**
1. **Plan Prueba 1€** - Pago único
2. **Plan Prueba Mensual 0.50€** - Suscripción mensual
3. **Setup Fee Prueba 0.10€** - Fee de configuración

## **5. Tarjetas de Prueba de Stripe:**

### **Tarjetas que FUNCIONAN:**
- **4242 4242 4242 4242** - Visa (éxito)
- **4000 0000 0000 0002** - Visa (declined)
- **4000 0027 6000 3184** - Visa (requiere autenticación 3D Secure)

### **Datos de Prueba:**
- **Fecha**: Cualquier fecha futura (ej: 12/28)
- **CVC**: Cualquier 3 dígitos (ej: 123)
- **Código postal**: Cualquiera (ej: 12345)

## **6. Verificar Webhooks:**
Después de un pago exitoso, verifica en:
- **Stripe Dashboard** → **Webhooks** → Ver eventos recibidos
- **Render Logs** → Verificar que se procesaron los webhooks

## **7. Flujo de Prueba Completo:**
1. Crear producto de 1€ en Stripe
2. Ejecutar script de prueba
3. Simular registro de empresa
4. Procesar pago con tarjeta de prueba
5. Verificar webhook recibido
6. Confirmar empresa registrada en admin panel

## **¡IMPORTANTE!**
- Siempre usa **modo TEST** en Stripe para pruebas
- Los pagos de prueba NO son reales
- Puedes hacer tantas pruebas como quieras sin costo