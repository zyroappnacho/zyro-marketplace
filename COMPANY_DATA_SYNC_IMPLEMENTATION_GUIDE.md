# GUÍA DE IMPLEMENTACIÓN - SINCRONIZACIÓN DE DATOS DE EMPRESA

## Resumen del Problema Resuelto

**PROBLEMA ORIGINAL:**
- En la versión de usuario de empresa, el botón "Datos de la Empresa" no mostraba la información correctamente
- Los datos no se sincronizaban entre la versión de administrador y la versión de empresa
- Cada empresa no veía únicamente su información correspondiente

**SOLUCIÓN IMPLEMENTADA:**
- Sistema completo de sincronización bidireccional
- Validación estricta de identidad por ID de empresa
- Sincronización automática en tiempo real
- Seguridad garantizada (cada empresa ve solo sus datos)

## Campos Sincronizados (12 campos específicos)

1. **companyName** - Nombre de la empresa
2. **cifNif** - CIF/NIF
3. **companyAddress** - Dirección completa
4. **companyPhone** - Teléfono de la empresa
5. **companyEmail** - Email corporativo
6. **website** - Sitio web
7. **representativeName** - Nombre completo del representante legal
8. **representativeEmail** - Email del representante legal
9. **representativePosition** - Cargo en la empresa
10. **businessType** - Tipo de negocio
11. **businessDescription** - Descripción del negocio
12. **password** - Contraseña (siempre protegida)

## Arquitectura de la Solución

### 1. CompanyDataSyncService
**Ubicación:** `services/CompanyDataSyncService.js`

**Funcionalidades principales:**
- `notifyCompanyDataChange()` - Notifica cambios a otros componentes
- `subscribeToCompanyChanges()` - Suscribe componentes a cambios
- `getLatestCompanyData()` - Obtiene datos más recientes
- `validateCompanyDataIntegrity()` - Valida integridad de datos
- `forceSyncCompanyData()` - Fuerza sincronización completa

### 2. CompanyDataScreen (Versión Empresa)
**Ubicación:** `components/CompanyDataScreen.js`

**Funcionalidades:**
- Carga datos específicos de la empresa logueada
- Validación estricta de permisos (solo empresas)
- Edición segura con validación completa
- Notificación automática de cambios al admin

### 3. AdminCompanyDetailScreen (Versión Admin)
**Ubicación:** `components/AdminCompanyDetailScreen.js`

**Funcionalidades:**
- Muestra todos los 12 campos requeridos
- Suscripción automática a cambios de empresa
- Búsqueda exhaustiva en múltiples fuentes
- Actualización en tiempo real

## Flujo de Sincronización

### Desde Empresa → Admin
1. Usuario empresa edita datos en CompanyDataScreen
2. Validación completa de campos obligatorios
3. Guardado en múltiples ubicaciones de almacenamiento
4. Notificación automática vía CompanyDataSyncService
5. AdminCompanyDetailScreen recibe actualización inmediata
6. Admin ve cambios reflejados en tiempo real

### Desde Admin → Empresa
1. Admin ve datos completos en AdminCompanyDetailScreen
2. Datos se cargan desde múltiples fuentes con prioridades
3. Información se sincroniza automáticamente
4. CompanyDataScreen recibe datos actualizados
5. Empresa ve información correcta al acceder

## Características de Seguridad

### Validación de Identidad
- Verificación estricta por ID único de empresa
- Validación cruzada por email corporativo
- Prevención de acceso cruzado entre empresas

### Protección de Datos
- Contraseñas siempre protegidas y no editables
- Validación de formato para emails y URLs
- Campos obligatorios verificados antes del guardado

### Auditoría Completa
- Registro de todos los cambios con timestamps
- Identificación de fuente de cada modificación
- Trazabilidad completa de actualizaciones

## Almacenamiento de Datos

### Múltiples Ubicaciones
Los datos se guardan en múltiples ubicaciones para garantizar disponibilidad:

1. **`company_data_sync_{companyId}`** - Datos de sincronización
2. **`company_{companyId}`** - Datos principales de empresa
3. **`approved_user_{companyId}`** - Datos como usuario aprobado
4. **`companies_list`** - Lista general de empresas

### Búsqueda con Prioridades
El sistema busca datos en orden de prioridad:
1. Datos de sincronización (más recientes)
2. Datos directos de empresa
3. Datos de usuario aprobado
4. Lista general de empresas

## Verificación y Pruebas

### Script de Verificación Rápida
```bash
node verify-company-data-sync.js
```

### Pruebas Completas
```bash
node test-company-data-sync-complete.js
```

### Verificación Manual
1. Acceder como empresa y editar datos
2. Verificar que cambios aparecen en panel de admin
3. Confirmar que cada empresa ve solo sus datos
4. Probar validaciones de campos obligatorios

## Solución de Problemas

### Datos No Se Sincronizan
1. Verificar que CompanyDataSyncService esté inicializado
2. Comprobar que los listeners estén activos
3. Validar que el ID de empresa sea correcto

### Datos Incompletos
1. Ejecutar validación de integridad
2. Forzar sincronización completa
3. Verificar múltiples fuentes de datos

### Errores de Permisos
1. Confirmar que el usuario tenga rol 'company'
2. Verificar que el ID de empresa coincida
3. Validar autenticación del usuario

## Estado de Implementación

### ✅ Completado
- [x] Servicio de sincronización completo
- [x] Validación de integridad de datos
- [x] Notificaciones en tiempo real
- [x] Suscripciones a cambios
- [x] Seguridad por ID de empresa
- [x] Almacenamiento múltiple
- [x] Búsqueda exhaustiva
- [x] Manejo de errores robusto
- [x] Scripts de prueba y verificación

### 🎯 Resultado Final
- ✅ Cada empresa ve únicamente su información correspondiente
- ✅ Cambios se reflejan automáticamente en ambas interfaces
- ✅ Datos siempre actualizados y sincronizados
- ✅ Seguridad y privacidad garantizadas
- ✅ Sistema robusto y escalable

## Comandos Útiles

```bash
# Verificación rápida
node verify-company-data-sync.js

# Pruebas completas
node test-company-data-sync-complete.js

# Aplicar correcciones
node apply-company-data-sync-fix-complete.js

# Verificar archivos específicos
ls -la components/CompanyDataScreen.js
ls -la components/AdminCompanyDetailScreen.js
ls -la services/CompanyDataSyncService.js
```

---

**✅ SINCRONIZACIÓN DE DATOS DE EMPRESA COMPLETAMENTE IMPLEMENTADA**

El sistema garantiza que cada empresa vea únicamente su información correspondiente y que los cambios se reflejen automáticamente entre la versión de administrador y la versión de empresa.