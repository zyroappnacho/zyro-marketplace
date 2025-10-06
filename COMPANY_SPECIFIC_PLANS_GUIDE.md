# Guía de Uso - Corrección de Planes Específicos por Empresa

## 🎯 Problema Resuelto

Cada empresa ahora verá su plan específico seleccionado durante el registro con Stripe, en lugar de mostrar siempre "Plan 12 Meses".

## 🔧 Archivos Creados/Modificados

### Archivos Principales
- ✅ `components/CompanySubscriptionPlans.js` - **ACTUALIZADO**
- ✅ `fix-company-specific-plan-sync.js` - **NUEVO**
- ✅ `initialize-company-plan-sync.js` - **NUEVO**

### Scripts de Soporte
- 📄 `execute-company-plan-sync.js` - Sincronización masiva
- 📄 `test-company-specific-plans.js` - Pruebas específicas
- 📄 `apply-company-plan-sync-fix.js` - Este script

## 🚀 Cómo Aplicar la Corrección

### Paso 1: Ejecutar Inicialización (EN LA APP)
```javascript
import { initializeCompanyPlanSync } from './initialize-company-plan-sync';

// Ejecutar una vez al iniciar la app
const result = await initializeCompanyPlanSync();
console.log('Sincronización:', result.success ? 'ÉXITO' : 'ERROR');
```

### Paso 2: Verificar Empresa Específica (OPCIONAL)
```javascript
import { verifyCompanyPlan, testPlanDetection } from './initialize-company-plan-sync';

// Verificar empresa específica
const verification = await verifyCompanyPlan('company_test_001');
console.log('Verificación:', verification);

// Probar detección de plan
const detection = await testPlanDetection('company_test_001');
console.log('Detección:', detection);
```

## 🔍 Cómo Verificar que Funciona

### 1. En el Dashboard Principal
- Acceder como empresa (`empresa@zyro.com`)
- Verificar que debajo del nombre de empresa muestra el plan correcto

### 2. En Gestión de Suscripciones
- Ir a "Gestionar Planes de Suscripción"
- Verificar que "Plan Actual" muestra el plan específico de esa empresa
- NO debe mostrar siempre "Plan 12 Meses"

### 3. Diferentes Empresas
- Cada empresa debe ver su plan específico
- Plan 3 Meses: 499€/mes
- Plan 6 Meses: 399€/mes
- Plan 12 Meses: 299€/mes

## 📊 Lógica de Detección

### Prioridad 1: Datos Sincronizados Recientes
- Si `lastPlanSync` es reciente (< 24h)
- Y tiene `selectedPlan` y `monthlyAmount`
- Usar esos datos directamente

### Prioridad 2: Detección por Precio
- 499€ → Plan 3 Meses
- 399€ → Plan 6 Meses
- 299€ → Plan 12 Meses

### Prioridad 3: Detección por Nombre
- "Plan 3 Meses" → Plan 3 Meses
- "Plan 6 Meses" → Plan 6 Meses
- "Plan 12 Meses" → Plan 12 Meses

### Fallback: Plan por Defecto
- Si no se puede detectar: Plan 6 Meses (más común)

## 🔄 Sincronización Automática

El sistema incluye sincronización automática que:
1. Verifica si la empresa está sincronizada
2. Si no, ejecuta sincronización desde datos existentes
3. Actualiza todas las ubicaciones de datos
4. Mantiene consistencia entre fuentes

## ✅ Estado Final

- ✅ Cada empresa ve su plan específico
- ✅ Sincronización automática
- ✅ Detección robusta por múltiples métodos
- ✅ Compatibilidad con datos existentes
- ✅ Logs detallados para debugging

## 🎉 Resultado

**PROBLEMA RESUELTO**: Ya no se muestra siempre "Plan 12 Meses". Cada empresa ve su plan real seleccionado en Stripe.