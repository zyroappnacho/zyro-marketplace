
# CONFIGURACIÓN DE PRECIOS DEL CHECKOUT - STRIPE

## Configuración Aplicada

### Estructura de Precios
- **Pago inicial único**: 150€ (obligatorio para todos los planes)
- **Sin período de prueba**: El cliente paga desde el primer día
- **Suscripción mensual**: Según el plan seleccionado

### Planes Disponibles

| Plan | Precio Mensual | Duración | Total Primer Pago |
|------|----------------|----------|-------------------|
| Mensual | 29.99€ | 1 mes | 179.99€ (29.99€ + 150€) |
| Trimestral | 27.99€ | 3 meses | 177.99€ (27.99€ + 150€) |
| Semestral | 25.99€ | 6 meses | 175.99€ (25.99€ + 150€) |
| Anual | 23.99€ | 12 meses | 173.99€ (23.99€ + 150€) |

### Configuración Técnica

#### Servidor Stripe (`stripe-server.js`)
- ✅ `trial_period_days: 0` - Sin período de prueba
- ✅ Setup fee de 150€ como precio adicional
- ✅ Suscripción mensual recurrente
- ✅ Metadata completa para seguimiento

#### Flujo de Pago
1. **Primer pago**: Precio mensual + 150€ setup fee
2. **Pagos siguientes**: Solo precio mensual
3. **Renovación**: Automática según duración del plan

### Archivos Modificados
- `backend/stripe-server.js` - Configuración principal
- `services/StripeService.js` - Servicio cliente
- `stripe-pricing-config.json` - Configuración de precios

### Scripts de Prueba
- `test-stripe-pricing.js` - Prueba todos los planes
- `stripe-pricing-config.json` - Configuración centralizada

## Verificación

Para verificar que todo funciona correctamente:

```bash
# 1. Reiniciar servidor con nueva configuración
pkill -f "stripe-server" && sleep 2
cd backend && node stripe-server.js &

# 2. Probar todos los planes
node test-stripe-pricing.js
```

## Resultado Esperado

✅ Checkout muestra precio del plan + 150€
✅ Sin período de prueba
✅ Suscripción recurrente mensual
✅ Pago inicial único de 150€

---
Configuración aplicada: 10/3/2025, 11:45:38 PM
