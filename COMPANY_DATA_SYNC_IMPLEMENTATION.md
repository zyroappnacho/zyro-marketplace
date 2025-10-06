# 🔄 Sistema de Sincronización de Datos de Empresa

## 📋 Resumen de la Implementación

Se ha implementado un sistema completo de sincronización automática entre:

1. **Formulario de registro de empresa** (ZyroAppNew.js - "Soy empresa")
2. **Pantalla de datos de empresa** (CompanyDataScreen.js - "Datos de la empresa")

## 🎯 Problema Resuelto

**ANTES**: Los datos del formulario de registro de empresa y la pantalla de datos de empresa no estaban sincronizados. Los campos como CIF/NIF, nombre del representante, email del representante, cargo del representante, tipo de negocio, y descripción del negocio no se reflejaban correctamente entre ambas pantallas.

**AHORA**: Sincronización automática y bidireccional de todos los 12 campos de empresa.

## 📊 Los 12 Campos Sincronizados

### Información de la Empresa
1. **companyName** - Nombre de la empresa
2. **cifNif** - CIF/NIF
3. **companyAddress** - Dirección completa
4. **companyPhone** - Teléfono de la empresa
5. **companyEmail** - Email corporativo
6. **password** - Contraseña (protegida)

### Contacto y Representante
7. **representativeName** - Nombre del representante
8. **representativeEmail** - Email del representante
9. **representativePosition** - Cargo del representante

### Información del Negocio
10. **businessType** - Tipo de negocio
11. **businessDescription** - Descripción del negocio
12. **website** - Sitio web

## 🛠️ Archivos Implementados/Modificados

### 📁 Nuevos Archivos
- `sync-company-registration-data.js` - Sistema de sincronización principal
- `test-company-data-sync.js` - Script de pruebas
- `COMPANY_DATA_SYNC_IMPLEMENTATION.md` - Esta documentación

### 📝 Archivos Modificados
- `components/CompanyDataScreen.js` - Integración del sistema de sincronización
- `components/ZyroAppNew.js` - Guardado automático de datos del formulario

## 🔄 Flujo de Sincronización

### 1. Registro de Empresa (ZyroAppNew.js)
```javascript
// Cuando el usuario completa el formulario "Soy empresa"
const handleRegister = async () => {
    if (registerForm.userType === 'company') {
        // NUEVO: Guardar datos para sincronización
        await saveCompanyRegistrationData(registerForm);
        
        // Continuar con el proceso de registro...
    }
};
```

### 2. Carga en Pantalla de Datos (CompanyDataScreen.js)
```javascript
const loadCompanyData = async () => {
    // PASO 1: Intentar cargar datos del formulario de registro
    const registrationResult = await loadCompanyRegistrationData();
    
    if (registrationResult.success) {
        // Usar datos sincronizados del formulario
        setCompanyData(registrationResult.data);
        return;
    }
    
    // PASO 2: Fallback a métodos anteriores si no hay datos sincronizados
    // ...
};
```

### 3. Guardado de Cambios (CompanyDataScreen.js)
```javascript
const handleSave = async () => {
    // Guardar datos actualizados
    await StorageService.saveCompanyData(updatedCompanyData);
    
    // NUEVO: Sincronizar de vuelta al formulario
    await syncCompanyDataToRegistration(companyData);
};
```

## 🎛️ Funciones del Sistema de Sincronización

### `saveCompanyRegistrationData(registrationFormData)`
- Guarda los datos del formulario de registro
- Se ejecuta automáticamente cuando una empresa se registra
- Almacena en claves específicas para sincronización

### `loadCompanyRegistrationData()`
- Carga los datos del formulario de registro
- Se ejecuta cuando se abre CompanyDataScreen
- Prioriza datos sincronizados sobre otros métodos

### `syncCompanyDataToRegistration(updatedCompanyData)`
- Sincroniza cambios de vuelta al formulario
- Se ejecuta cuando se guardan cambios en CompanyDataScreen
- Mantiene la sincronización bidireccional

### `verifyCompanyDataSync(companyId)`
- Verifica si los datos están sincronizados
- Detecta diferencias entre formulario y pantalla
- Disponible desde el botón de sincronización

### `forceCompanyDataSync(companyId)`
- Fuerza la sincronización automática
- Resuelve diferencias detectadas
- Disponible desde el botón de sincronización

## 🔧 Características Técnicas

### Almacenamiento
- **Clave principal**: `company_registration_data`
- **Clave de sincronización**: `company_form_sync_data`
- **Metadatos**: timestamps, fuente de datos, historial

### Validación
- Verificación de campos requeridos
- Detección de campos faltantes
- Validación de integridad de datos

### Recuperación de Errores
- Múltiples fuentes de datos como fallback
- Recuperación automática de datos incompletos
- Logs detallados para debugging

## 🎮 Interfaz de Usuario

### Botón de Sincronización (CompanyDataScreen)
- **Icono**: Refresh (🔄)
- **Ubicación**: Header, junto al botón de edición
- **Funciones**:
  - Verificar sincronización
  - Forzar sincronización
  - Buscar datos originales

### Mensajes de Usuario
- Confirmación de sincronización exitosa
- Alertas de datos desincronizados
- Opciones de resolución automática

## 🧪 Pruebas

### Script de Prueba: `test-company-data-sync.js`
```bash
node test-company-data-sync.js
```

**Verifica**:
- ✅ Guardado de datos del formulario
- ✅ Carga en CompanyDataScreen
- ✅ Sincronización bidireccional
- ✅ Integridad de los 12 campos
- ✅ Manejo de actualizaciones

## 🚀 Cómo Usar

### Para Usuarios (Empresas)
1. **Registro**: Completa el formulario "Soy empresa" normalmente
2. **Datos sincronizados**: Los datos se guardan automáticamente para sincronización
3. **Acceso a datos**: Ve a "Control Total de la Empresa" → "Datos de la Empresa"
4. **Verificación**: Todos los campos del formulario aparecen sincronizados
5. **Edición**: Modifica cualquier campo y guarda
6. **Sincronización**: Los cambios se sincronizan automáticamente

### Para Desarrolladores
1. **Importar sistema**: `import { ... } from '../sync-company-registration-data'`
2. **Guardar en registro**: `await saveCompanyRegistrationData(formData)`
3. **Cargar en pantalla**: `await loadCompanyRegistrationData()`
4. **Sincronizar cambios**: `await syncCompanyDataToRegistration(updatedData)`

## ✅ Estado de Implementación

- [x] Sistema de sincronización creado
- [x] Integración en ZyroAppNew.js
- [x] Integración en CompanyDataScreen.js
- [x] Funciones de verificación y forzado
- [x] Interfaz de usuario mejorada
- [x] Script de pruebas completo
- [x] Documentación completa
- [x] Manejo de errores y fallbacks
- [x] Sincronización bidireccional
- [x] Los 12 campos sincronizados

## 🎉 Resultado Final

**PROBLEMA RESUELTO**: Los datos del formulario de registro de empresa ("Soy empresa") ahora están **perfectamente sincronizados** con la pantalla de datos de empresa ("Datos de la empresa").

**Campos sincronizados**:
- ✅ CIF/NIF
- ✅ Nombre del representante  
- ✅ Email del representante
- ✅ Cargo del representante
- ✅ Tipo de negocio
- ✅ Descripción del negocio
- ✅ Todos los demás campos (12 en total)

**Sincronización**:
- ✅ Automática al registrarse
- ✅ Automática al abrir datos de empresa
- ✅ Automática al guardar cambios
- ✅ Bidireccional (formulario ↔ pantalla)
- ✅ Con verificación y recuperación de errores

La implementación está **completa y lista para usar**. 🚀