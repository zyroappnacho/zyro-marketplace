
# PRECIOS REALES DE PRODUCCIÓN - STRIPE

## Configuración Final de Precios

### Estructura de Precios
- **Setup Fee**: 150€ (pago único, solo la primera vez)
- **Precio mensual**: Según el plan seleccionado
- **Sin período de prueba**: Pago inmediato

### Planes de Suscripción

| Plan | Precio Mensual | Duración | Setup Fee | Total Primer Pago |
|------|----------------|----------|-----------|-------------------|
| **3 Meses** | 349€/mes | 3 meses | 150€ | **499€** |
| **6 Meses** | 399€/mes | 6 meses | 150€ | **549€** |
| **12 Meses** | 299€/mes | 12 meses | 150€ | **449€** |

### Flujo de Pagos

#### Primer Pago (Registro)
- Plan 3 meses: 349€ + 150€ = **499€**
- Plan 6 meses: 399€ + 150€ = **549€**
- Plan 12 meses: 299€ + 150€ = **449€**

#### Pagos Siguientes (Mensualidades)
- Plan 3 meses: **349€/mes** (sin setup fee)
- Plan 6 meses: **399€/mes** (sin setup fee)
- Plan 12 meses: **299€/mes** (sin setup fee)

### Configuración Técnica

#### Archivos Actualizados
- `services/StripeService.js` - Setup fee 150€
- `components/StripeSubscriptionPlans.js` - Precios actualizados
- `stripe-real-prices.json` - Configuración centralizada

#### Scripts de Prueba
- `test-stripe-real-prices.js` - Prueba todos los planes reales

### Verificación

Para probar los precios reales:

```bash
# 1. Reiniciar servidor con precios actualizados
pkill -f "stripe-server" && sleep 2
cd backend && node stripe-server.js &

# 2. Probar precios reales
node test-stripe-real-prices.js
```

### Resultado Esperado en Checkout

✅ **Plan 3 Meses**: Muestra 499€ (349€ + 150€)
✅ **Plan 6 Meses**: Muestra 549€ (399€ + 150€)  
✅ **Plan 12 Meses**: Muestra 449€ (299€ + 150€)

### Notas Importantes

- El setup fee de 150€ se cobra **solo una vez** en el primer pago
- Las mensualidades siguientes son solo el precio del plan (sin setup fee)
- No hay período de prueba - el pago es inmediato
- Los precios están en euros (EUR)

---
Precios reales configurados: 10/3/2025, 11:53:19 PM
