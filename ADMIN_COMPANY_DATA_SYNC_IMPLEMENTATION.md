# Sincronización de Datos Empresa ↔ Administrador

## 📋 Resumen

Se ha implementado un sistema completo de sincronización en tiempo real entre la **pantalla de datos de empresa** (versión empresa) y la **pantalla de detalles de empresa** (versión administrador). Cuando se editan datos en la versión de empresa, estos cambios se reflejan automáticamente en el panel de administrador.

## 🔧 Componentes Implementados

### 1. Servicio de Sincronización (`CompanyDataSyncService.js`)

**Ubicación:** `services/CompanyDataSyncService.js`

**Funcionalidades:**
- ✅ Notificación de cambios en tiempo real
- ✅ Suscripción a cambios por empresa específica
- ✅ Obtención de datos más recientes
- ✅ Sincronización forzada
- ✅ Limpieza automática de datos antiguos
- ✅ Verificación de estado de sincronización

**Métodos principales:**
```javascript
// Notificar cambios
await CompanyDataSyncService.notifyCompanyDataChange(companyId, updatedData, source);

// Suscribirse a cambios
const unsubscribe = CompanyDataSyncService.subscribeToCompanyChanges(companyId, callback, componentName);

// Obtener datos más recientes
const latestData = await CompanyDataSyncService.getLatestCompanyData(companyId);
```

### 2. Pantalla de Datos de Empresa (Actualizada)

**Ubicación:** `components/CompanyDataScreen.js`

**Cambios implementados:**
- ✅ Importación del servicio de sincronización
- ✅ Notificación automática de cambios al guardar
- ✅ Mensaje de confirmación actualizado

**Código clave:**
```javascript
// Al guardar datos
await CompanyDataSyncService.notifyCompanyDataChange(
  user.id, 
  updatedCompanyData, 
  'company_data_screen'
);
```

### 3. Panel de Administrador - Detalles de Empresa (Actualizado)

**Ubicación:** `components/AdminCompanyDetailScreen.js`

**Funcionalidades añadidas:**
- ✅ Escucha cambios en tiempo real
- ✅ Actualización automática de datos
- ✅ Notificación visual de actualizaciones
- ✅ Botón de actualización manual
- ✅ Indicador de estado de sincronización
- ✅ Información de fuente de datos

**Código clave:**
```javascript
// Suscripción a cambios en tiempo real
const unsubscribe = CompanyDataSyncService.subscribeToCompanyChanges(
  companyId,
  (syncData) => {
    // Actualizar datos automáticamente
    setCompanyData(prevData => ({
      ...prevData,
      ...syncData.updatedData,
      lastSyncUpdate: syncData.timestamp
    }));
  },
  'AdminCompanyDetailScreen'
);
```

## 🔄 Flujo de Sincronización

### Paso a Paso:

1. **Usuario edita datos** en la pantalla "Datos de la Empresa" (versión empresa)
2. **Al guardar**, se ejecuta `CompanyDataSyncService.notifyCompanyDataChange()`
3. **El servicio** guarda los cambios y emite un evento de sincronización
4. **Panel de administrador** recibe la notificación en tiempo real
5. **Datos se actualizan** automáticamente en la pantalla "Ver empresa"
6. **Se muestra notificación** visual de la actualización
7. **Estado de sincronización** se actualiza con timestamp y fuente

### Diagrama de Flujo:

```
[Pantalla Empresa] → [Editar Datos] → [Guardar]
                                         ↓
[CompanyDataSyncService] → [notifyCompanyDataChange()]
                                         ↓
[AsyncStorage] ← [Guardar Sync Data] ← [Emit Event]
                                         ↓
[Panel Admin] ← [subscribeToCompanyChanges()] ← [Recibir Event]
                                         ↓
[Actualizar UI] → [Mostrar Notificación] → [Update Sync Status]
```

## 🎯 Casos de Uso Cubiertos

### ✅ Sincronización Automática
- Los cambios se propagan automáticamente sin intervención del usuario
- No es necesario refrescar manualmente la pantalla del administrador

### ✅ Notificaciones en Tiempo Real
- El administrador recibe notificaciones visuales cuando se actualizan datos
- Se muestra la fuente del cambio (pantalla de datos de empresa)

### ✅ Actualización Manual
- Botón de refresh en el panel de administrador para forzar actualización
- Útil en caso de problemas de conectividad o sincronización

### ✅ Indicadores Visuales
- Estado de sincronización con timestamp
- Información de la fuente de los datos
- Badge visual que indica datos sincronizados

### ✅ Manejo de Errores
- Fallback a datos locales si falla la sincronización
- Logs detallados para debugging
- Limpieza automática de datos antiguos

## 🧪 Instrucciones de Prueba

### Prueba Manual:

1. **Abrir la app** en modo empresa (`empresa@zyro.com`)
2. **Navegar** a "Datos de la Empresa"
3. **Editar** cualquier campo (nombre, dirección, teléfono, etc.)
4. **Guardar** los cambios
5. **Cambiar** a modo administrador (`admin_zyrovip`)
6. **Ir** a "Empresas" → "Ver empresa" para esa empresa
7. **Verificar** que los datos están actualizados
8. **Observar** el indicador de sincronización en la parte inferior

### Prueba Automática:

```bash
node test-admin-company-data-sync.js
```

## 📊 Campos Sincronizados

Los siguientes 12 campos se sincronizan automáticamente:

1. **Nombre de la empresa** (`companyName`)
2. **CIF/NIF** (`cifNif`)
3. **Dirección completa** (`companyAddress`)
4. **Teléfono de la empresa** (`companyPhone`)
5. **Email corporativo** (`companyEmail`)
6. **Nombre del representante** (`representativeName`)
7. **Email del representante** (`representativeEmail`)
8. **Cargo del representante** (`representativePosition`)
9. **Tipo de negocio** (`businessType`)
10. **Descripción del negocio** (`businessDescription`)
11. **Sitio web** (`website`)
12. **Imagen de perfil** (`profileImage`)

> **Nota:** La contraseña no se sincroniza por seguridad y se muestra como `••••••••`

## 🔧 Configuración Técnica

### Dependencias:
- `AsyncStorage` para persistencia local
- `EventEmitter` para eventos en tiempo real
- `React hooks` (useState, useEffect) para manejo de estado

### Almacenamiento:
- **Datos principales:** `company_${companyId}`
- **Datos de sincronización:** `company_data_sync_${companyId}`
- **Limpieza automática:** Datos antiguos > 24 horas

### Performance:
- **Eventos ligeros:** Solo se envían los datos cambiados
- **Suscripciones específicas:** Por empresa, no globales
- **Cleanup automático:** Previene memory leaks

## 🎉 Resultado Final

### ✅ Funcionalidad Completada:
- **Sincronización bidireccional** entre pantallas
- **Tiempo real** sin necesidad de refresh manual
- **Indicadores visuales** de estado de sincronización
- **Manejo robusto** de errores y estados
- **Performance optimizada** con cleanup automático

### 🎯 Experiencia de Usuario:
- **Transparente:** Los cambios aparecen automáticamente
- **Informativa:** Se muestra cuándo y desde dónde se actualizaron los datos
- **Confiable:** Fallbacks y manejo de errores
- **Eficiente:** No impacta el rendimiento de la aplicación

## 📝 Notas de Implementación

1. **Singleton Pattern:** El servicio usa un patrón singleton para evitar múltiples instancias
2. **Event-Driven:** Basado en eventos para desacoplamiento de componentes
3. **Persistent Storage:** Usa AsyncStorage para persistencia entre sesiones
4. **Memory Management:** Cleanup automático de listeners y datos antiguos
5. **Error Handling:** Manejo robusto de errores con fallbacks apropiados

---

**✅ IMPLEMENTACIÓN COMPLETADA**

La sincronización en tiempo real entre la pantalla de datos de empresa y el panel de administrador está completamente implementada y lista para uso en producción.