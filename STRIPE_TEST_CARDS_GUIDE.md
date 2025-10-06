
# 🧪 GUÍA DE PRUEBAS DE STRIPE - TARJETAS DE PRUEBA

## 📋 Preparación

1. **Iniciar el backend de Stripe:**
   ```bash
   cd ZyroMarketplace
   node start-stripe-backend.js
   ```

2. **Verificar que el backend esté funcionando:**
   - Abrir: http://localhost:3001/health
   - Debe mostrar: {"status": "ok", "port": 3001}

3. **Iniciar la aplicación:**
   ```bash
   npm start
   # o
   expo start
   ```

## 🎯 Tarjetas de Prueba Disponibles

### ✅ Pagos Exitosos
- **Visa Básica:** 4242424242424242
- **Visa con 3D Secure:** 4000000000003220
- **Mastercard:** 5555555555554444
- **American Express:** 378282246310005
- **Diners Club:** 30569309025904

### ❌ Pagos que Fallan
- **Tarjeta Declinada:** 4000000000000002
- **Fondos Insuficientes:** 4000000000009995
- **Tarjeta Expirada:** 4000000000000069
- **CVC Incorrecto:** 4000000000000127
- **Error de Procesamiento:** 4000000000000119

### 📝 Datos Adicionales para Todas las Tarjetas
- **Fecha de Expiración:** 12/25 (cualquier fecha futura)
- **CVC:** 123 (1234 para American Express)
- **Código Postal:** Cualquiera

## 🔄 Flujo de Prueba

### Paso 1: Registro de Empresa
1. Abrir la app
2. Ir a "Registro de Empresa"
3. Completar todos los campos obligatorios
4. Seleccionar un plan de suscripción

### Paso 2: Proceso de Pago
1. Hacer clic en "Proceder al Pago"
2. Se abrirá Stripe Checkout en el navegador
3. Usar una de las tarjetas de prueba
4. Completar el formulario de pago

### Paso 3: Verificar Resultados
- **Pago Exitoso:** Redirección a página de éxito
- **Pago Fallido:** Mensaje de error específico
- **3D Secure:** Pantalla adicional de autenticación

## 🧪 Escenarios de Prueba Recomendados

### Escenario 1: Pago Exitoso Básico
- Plan: 3 Meses
- Tarjeta: 4242424242424242
- Resultado esperado: Pago completado, empresa registrada

### Escenario 2: Pago con 3D Secure
- Plan: 6 Meses
- Tarjeta: 4000000000003220
- Resultado esperado: Pantalla de autenticación adicional

### Escenario 3: Tarjeta Declinada
- Plan: 12 Meses
- Tarjeta: 4000000000000002
- Resultado esperado: Error "Su tarjeta fue declinada"

### Escenario 4: Fondos Insuficientes
- Plan: 3 Meses
- Tarjeta: 4000000000009995
- Resultado esperado: Error "Fondos insuficientes"

## 📊 Monitoreo y Logs

### Backend Logs
- Verificar logs en la consola del backend
- Buscar mensajes de sesiones creadas
- Verificar webhooks recibidos

### App Logs
- Verificar logs en la consola de React Native
- Buscar mensajes de StripeService
- Verificar estados de pago

## 🔧 Solución de Problemas

### Backend No Responde
```bash
# Verificar puerto ocupado
lsof -i :3001

# Reiniciar backend
node start-stripe-backend.js
```

### Error de CORS
- Verificar ALLOWED_ORIGINS en .env
- Asegurar que incluye la URL de la app

### Sesión No Se Crea
- Verificar claves de Stripe en .env
- Verificar formato de datos enviados
- Revisar logs del backend

## 📱 Datos de Empresa de Prueba

```json
{
  "name": "Empresa de Prueba Stripe",
  "email": "test@empresa.com",
  "phone": "+34 600 000 000",
  "address": "Calle Test 123, Madrid",
  "cif": "B12345678",
  "website": "https://test-empresa.com"
}
```

## 🎯 Objetivos de las Pruebas

1. ✅ Verificar que se crean sesiones de Stripe correctamente
2. ✅ Confirmar que las tarjetas de prueba funcionan
3. ✅ Validar manejo de errores de pago
4. ✅ Verificar redirecciones después del pago
5. ✅ Confirmar que se guarda la información de la empresa
6. ✅ Validar integración completa del flujo de pago

---

**¡Listo para probar! 🚀**
