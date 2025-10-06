# SINCRONIZACIÓN COMPLETA DE DATOS DE EMPRESA

## Problema Identificado
En la versión de usuario de empresa, el botón "Datos de la Empresa" no muestra la información correctamente. Los datos deben sincronizarse desde la versión de administrador (pantalla de detalles de empresa) hacia la versión de empresa, asegurando que cada empresa vea solo su información correspondiente.

## Campos a Sincronizar (12 campos específicos)
1. **Nombre de la empresa** - `companyName`
2. **CIF/NIF** - `cifNif`
3. **Dirección** - `companyAddress`
4. **Teléfono** - `companyPhone`
5. **E-mail corporativo** - `companyEmail`
6. **Sitio web** - `website`
7. **Nombre completo del representante legal** - `representativeName`
8. **E-mail del representante legal** - `representativeEmail`
9. **Cargo en la empresa** - `representativePosition`
10. **Tipo de negocio** - `businessType`
11. **Descripción del negocio** - `businessDescription`
12. **Contraseña** - `password` (protegida)

## Solución Implementada

### 1. Servicio de Sincronización Mejorado
- Sincronización bidireccional en tiempo real
- Validación de identidad por ID de empresa
- Sistema de eventos para notificaciones automáticas
- Persistencia garantizada en múltiples fuentes

### 2. Componente AdminCompanyDetailScreen Mejorado
- Muestra todos los 12 campos requeridos
- Sincronización automática con CompanyDataScreen
- Búsqueda exhaustiva en múltiples fuentes de datos
- Validación de integridad de datos

### 3. Componente CompanyDataScreen Mejorado
- Carga específica por ID de empresa
- Validación estricta de permisos (solo empresas)
- Sincronización automática con panel de administrador
- Edición segura con validación completa

### 4. Características de Seguridad
- Validación de identidad por ID único
- Protección de contraseñas
- Verificación de permisos por rol
- Auditoría completa de cambios

## Flujo de Sincronización

### Desde Admin → Empresa
1. Admin ve datos completos en AdminCompanyDetailScreen
2. Datos se cargan desde múltiples fuentes con prioridades
3. Información se sincroniza automáticamente
4. Empresa ve datos actualizados en CompanyDataScreen

### Desde Empresa → Admin
1. Empresa edita datos en CompanyDataScreen
2. Validación completa de campos obligatorios
3. Guardado en múltiples ubicaciones
4. Notificación automática al panel de administrador
5. Admin ve cambios reflejados inmediatamente

## Implementación Técnica

### Almacenamiento de Datos
```javascript
// Estructura de datos unificada
const companyData = {
  id: 'company_unique_id',
  companyName: 'Nombre de la Empresa',
  cifNif: 'B12345678',
  companyAddress: 'Dirección completa',
  companyPhone: '+34 XXX XXX XXX',
  companyEmail: 'contacto@empresa.com',
  website: 'https://www.empresa.com',
  representativeName: 'Nombre del Representante',
  representativeEmail: 'representante@empresa.com',
  representativePosition: 'Director General',
  businessType: 'Tipo de Negocio',
  businessDescription: 'Descripción detallada...',
  password: '••••••••', // Protegida
  
  // Metadatos de sincronización
  lastUpdated: '2024-01-01T00:00:00.000Z',
  updatedFrom: 'company_data_screen',
  syncEnabled: true,
  lastSyncUpdate: '2024-01-01T00:00:00.000Z'
};
```

### Sistema de Eventos
```javascript
// Notificación de cambios
await CompanyDataSyncService.notifyCompanyDataChange(
  companyId, 
  updatedData, 
  'company_data_screen'
);

// Suscripción a cambios
const unsubscribe = CompanyDataSyncService.subscribeToCompanyChanges(
  companyId,
  (syncData) => {
    // Actualizar UI automáticamente
    setCompanyData(prevData => ({
      ...prevData,
      ...syncData.updatedData
    }));
  },
  'AdminCompanyDetailScreen'
);
```

## Validaciones Implementadas

### 1. Validación de Identidad
- Verificación por ID único de empresa
- Validación cruzada por email corporativo
- Confirmación de permisos por rol

### 2. Validación de Datos
- Campos obligatorios completos
- Formato de email válido
- Formato de teléfono correcto
- URL de sitio web válida

### 3. Validación de Seguridad
- Solo empresas pueden editar sus datos
- Contraseñas siempre protegidas
- Auditoría completa de cambios
- Prevención de acceso cruzado

## Características Adicionales

### 1. Búsqueda Exhaustiva
- Múltiples fuentes de datos consultadas
- Sistema de prioridades para datos
- Fallbacks automáticos
- Combinación inteligente de información

### 2. Sincronización en Tiempo Real
- Eventos automáticos entre pantallas
- Notificaciones visuales de cambios
- Actualización inmediata de UI
- Persistencia garantizada

### 3. Manejo de Errores
- Fallbacks de emergencia
- Datos mínimos garantizados
- Mensajes informativos al usuario
- Recuperación automática

## Resultados Esperados

### Para Empresas
- ✅ Datos completos y actualizados siempre visibles
- ✅ Edición segura y validada
- ✅ Sincronización automática con admin
- ✅ Solo ven sus propios datos

### Para Administradores
- ✅ Vista completa de datos de cada empresa
- ✅ Información actualizada en tiempo real
- ✅ Trazabilidad completa de cambios
- ✅ Gestión centralizada de datos

### Para el Sistema
- ✅ Integridad de datos garantizada
- ✅ Sincronización bidireccional
- ✅ Seguridad y privacidad
- ✅ Escalabilidad y mantenibilidad

## Estado de Implementación
✅ **COMPLETADO** - Sistema de sincronización completa implementado y funcional.

La sincronización de datos de empresa entre la versión de administrador y la versión de empresa está completamente implementada, garantizando que cada empresa vea únicamente su información correspondiente y que los cambios se reflejen automáticamente en ambas interfaces.