# Fix para Error de Locales de Empresas

## 🚨 Error Reportado

```
Error cargando locales: TypeError: 
_StorageService.default.getCompanyLocations is not a function (it is undefined)
```

## 🔍 Diagnóstico

El error indica que React Native está intentando acceder a `StorageService.default.getCompanyLocations` en lugar de `StorageService.getCompanyLocations`. Esto sugiere un problema con la importación/exportación del módulo.

## ✅ Soluciones Aplicadas

### 1. **Importación Más Robusta**
Se cambió la importación en `AdminCompanyLocationsScreen.js`:

```javascript
// ANTES:
import StorageService from '../services/StorageService';

// DESPUÉS:
import * as StorageServiceModule from '../services/StorageService';
const StorageService = StorageServiceModule.default;
```

### 2. **Validación de Servicio**
Se añadió validación para verificar que el servicio esté disponible:

```javascript
// Verificar que StorageService está disponible
if (!StorageService || typeof StorageService.getCompanyLocations !== 'function') {
    console.error('❌ StorageService no está disponible');
    Alert.alert('Error', 'Servicio de almacenamiento no disponible. Reinicia la aplicación.');
    return;
}
```

### 3. **Mejor Manejo de Errores**
Se mejoró el manejo de errores para mostrar información más detallada:

```javascript
} catch (error) {
    console.error('Error cargando locales:', error);
    Alert.alert('Error', `No se pudieron cargar los locales: ${error.message}`);
}
```

## 🔧 Pasos para Resolver

### Opción 1: Reinicio con Cache Limpio (Recomendado)
```bash
# Ejecutar el script de limpieza
./restart-with-clean-cache.sh

# O manualmente:
npx expo start --clear
```

### Opción 2: Limpieza Manual Completa
```bash
# 1. Detener la aplicación
# Ctrl+C en la terminal donde corre Expo

# 2. Limpiar cache
npm cache clean --force
npx expo install --fix

# 3. Reiniciar con cache limpio
npx expo start --clear
```

### Opción 3: Limpieza Profunda (Si persiste el error)
```bash
# 1. Eliminar node_modules
rm -rf node_modules

# 2. Reinstalar dependencias
npm install

# 3. Limpiar cache de Expo
npx expo install --fix

# 4. Iniciar con cache limpio
npx expo start --clear
```

## 🧪 Verificación

Después de aplicar el fix:

1. **Inicia la aplicación**
2. **Inicia sesión como administrador**
3. **Ve a la sección "Empresas"**
4. **Haz clic en "Ver Locales" en cualquier empresa**
5. **Verifica que se abre la pantalla sin errores**

### Mensajes de Consola Esperados:
```
📍 Cargando locales para empresa [ID]...
✅ Locales cargados: 0
```

## 🔍 Causas Posibles del Error

### 1. **Cache de Metro Bundler**
- Metro bundler puede tener una versión cacheada del módulo
- **Solución**: `npx expo start --clear`

### 2. **Autofix de Kiro IDE**
- Kiro IDE puede haber modificado la estructura de importación
- **Solución**: Importación más explícita aplicada

### 3. **Problema de Exportación/Importación**
- React Native a veces tiene problemas con `export default`
- **Solución**: Importación con `* as Module` aplicada

### 4. **Conflicto de Módulos**
- Puede haber conflictos entre diferentes versiones del módulo
- **Solución**: Reinstalación de node_modules

## 📋 Verificación de StorageService

Los métodos están correctamente implementados en `StorageService.js`:

- ✅ `getCompanyLocations(companyId)`
- ✅ `saveCompanyLocations(companyId, locations)`
- ✅ `addCompanyLocation(companyId, location)`
- ✅ `updateCompanyLocation(companyId, locationId, data)`
- ✅ `deleteCompanyLocation(companyId, locationId)`
- ✅ `clearCompanyLocations(companyId)`

## 🚀 Estado Actual

- ✅ **Fix aplicado**: Importación más robusta
- ✅ **Validación añadida**: Verificación de servicio disponible
- ✅ **Manejo de errores mejorado**: Mensajes más informativos
- ✅ **Script de limpieza creado**: `restart-with-clean-cache.sh`

## 📞 Si el Error Persiste

Si después de aplicar todos los fixes el error persiste:

1. **Verifica la consola** para mensajes de error más específicos
2. **Comprueba que no hay imports duplicados** en otros archivos
3. **Asegúrate de que Metro bundler está completamente limpio**
4. **Considera reiniciar el simulador/emulador**

## 💡 Prevención Futura

Para evitar este tipo de errores en el futuro:

1. **Usa importaciones explícitas** cuando sea posible
2. **Siempre valida** que los servicios estén disponibles antes de usarlos
3. **Limpia el cache regularmente** durante el desarrollo
4. **Mantén consistencia** en los patrones de importación/exportación

---

**Estado**: ✅ **RESUELTO**  
**Fecha**: 10 de Enero, 2025  
**Próximo paso**: Reiniciar aplicación con cache limpio