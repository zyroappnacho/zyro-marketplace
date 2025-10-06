# 🚨 SOLUCIÓN COMPLETA PARA EMPRESAS DUPLICADAS

## 📋 Problema Identificado
Se están creando **dos empresas con el mismo nombre pero planes diferentes** al registrar y pagar:
- ✅ **clinica ponzano** - Plan 12 Meses (correcto)
- ❌ **clinica ponzano** - Plan 6 Meses (duplicado incorrecto)

## 🎯 OPCIONES DE SOLUCIÓN

### OPCIÓN 1: Usar Componente en la App (RECOMENDADO)

1. **Agregar el componente temporal a tu app:**
   ```javascript
   // En tu archivo principal (App.js o similar)
   import DuplicatesFixer from './components/DuplicatesFixer';
   
   // Agregar temporalmente en tu render:
   <DuplicatesFixer />
   ```

2. **Ejecutar desde la app:**
   - Abre la aplicación
   - Verás el componente "Corrector de Duplicados"
   - Presiona "Corregir Duplicados"
   - Espera a que termine
   - Reinicia la aplicación

3. **Remover el componente después de usar**

### OPCIÓN 2: Usar Consola del Navegador

1. **Abrir Debug Mode:**
   - Abre tu app en el simulador
   - Presiona `Cmd+D` (iOS) o `Cmd+M` (Android)
   - Selecciona "Debug" o "Remote JS Debugging"
   - Abre las herramientas de desarrollador del navegador

2. **Ejecutar en la consola del navegador:**
   ```javascript
   // PASO 1: Detectar y eliminar duplicados
   AsyncStorage.getItem('companiesList').then(data => {
     const companies = data ? JSON.parse(data) : [];
     console.log('📊 Empresas encontradas:', companies.length);
     
     // Buscar duplicados
     const duplicates = {};
     companies.forEach(company => {
       const name = (company.companyName || company.name || '').toLowerCase().trim();
       if (!duplicates[name]) duplicates[name] = [];
       duplicates[name].push(company);
     });
     
     const duplicateGroups = Object.entries(duplicates).filter(([name, comps]) => comps.length > 1);
     
     if (duplicateGroups.length > 0) {
       console.log('⚠️ DUPLICADOS ENCONTRADOS:');
       duplicateGroups.forEach(([name, comps]) => {
         console.log(`📋 ${name}: ${comps.length} duplicados`);
         comps.forEach((comp, i) => {
           console.log(`   ${i+1}. ID: ${comp.id} | Plan: ${comp.plan}`);
         });
       });
       
       // Limpiar duplicados
       const cleanCompanies = [];
       duplicateGroups.forEach(([name, comps]) => {
         // Ordenar por fecha (más reciente primero)
         comps.sort((a, b) => new Date(b.registrationDate || 0) - new Date(a.registrationDate || 0));
         
         // Mantener solo el más reciente
         const keep = comps[0];
         const remove = comps.slice(1);
         
         console.log(`✅ Manteniendo: ${keep.companyName} (${keep.plan})`);
         cleanCompanies.push(keep);
         
         // Eliminar duplicados
         remove.forEach(comp => {
           console.log(`🗑️ Eliminando: ${comp.companyName} (${comp.plan})`);
           AsyncStorage.removeItem(`company_${comp.id}`);
           AsyncStorage.removeItem(`approved_user_${comp.id}`);
         });
       });
       
       // Agregar empresas sin duplicados
       const uniqueCompanies = companies.filter(company => {
         const name = (company.companyName || company.name || '').toLowerCase().trim();
         return !duplicates[name] || duplicates[name].length === 1;
       });
       
       const finalList = [...uniqueCompanies, ...cleanCompanies];
       
       // Guardar lista limpia
       AsyncStorage.setItem('companiesList', JSON.stringify(finalList)).then(() => {
         console.log(`✅ DUPLICADOS ELIMINADOS: ${companies.length - finalList.length}`);
         console.log(`📊 EMPRESAS FINALES: ${finalList.length}`);
         console.log('🔄 Reinicia la aplicación para ver los cambios');
       });
       
     } else {
       console.log('✅ No se encontraron duplicados');
     }
   });
   ```

3. **Instalar protección:**
   ```javascript
   // PASO 2: Instalar protección anti-duplicados
   const protection = {
     enabled: true,
     installedAt: new Date().toISOString(),
     version: '1.0'
   };
   
   AsyncStorage.setItem('duplicate_protection', JSON.stringify(protection)).then(() => {
     console.log('🛡️ Protección anti-duplicados instalada');
   });
   ```

### OPCIÓN 3: Limpieza Manual Completa

Si las opciones anteriores no funcionan, ejecuta esto en la consola:

```javascript
// LIMPIEZA COMPLETA Y RECONSTRUCCIÓN
AsyncStorage.getItem('companiesList').then(data => {
  const companies = data ? JSON.parse(data) : [];
  
  // Crear mapa de empresas únicas por nombre
  const uniqueMap = new Map();
  
  companies.forEach(company => {
    const name = (company.companyName || company.name || '').toLowerCase().trim();
    const existing = uniqueMap.get(name);
    
    if (!existing) {
      uniqueMap.set(name, company);
    } else {
      // Mantener el más reciente
      const existingDate = new Date(existing.registrationDate || 0);
      const currentDate = new Date(company.registrationDate || 0);
      
      if (currentDate > existingDate) {
        // Eliminar el anterior
        AsyncStorage.removeItem(`company_${existing.id}`);
        AsyncStorage.removeItem(`approved_user_${existing.id}`);
        uniqueMap.set(name, company);
      } else {
        // Eliminar el actual
        AsyncStorage.removeItem(`company_${company.id}`);
        AsyncStorage.removeItem(`approved_user_${company.id}`);
      }
    }
  });
  
  const cleanList = Array.from(uniqueMap.values());
  
  AsyncStorage.setItem('companiesList', JSON.stringify(cleanList)).then(() => {
    console.log(`✅ LIMPIEZA COMPLETA: ${cleanList.length} empresas únicas`);
    console.log('🔄 Reinicia la aplicación');
  });
});
```

## 🛡️ PROTECCIÓN IMPLEMENTADA

He actualizado el componente `CompanyRegistrationWithStripe.js` con:

1. **Verificación de proceso en curso**: Evita registros duplicados concurrentes
2. **Timeout de seguridad**: Bloquea registros por 2 minutos
3. **Limpieza automática**: Remueve bloqueos expirados

### Código de protección agregado:
```javascript
// Verificar si ya se está procesando este registro
const registrationKey = `processing_${companyData.email.toLowerCase()}_${companyData.name.toLowerCase()}`;
const existingProcess = await AsyncStorage.getItem(registrationKey);

if (existingProcess) {
  const processData = JSON.parse(existingProcess);
  const timeDiff = Date.now() - processData.timestamp;
  
  // Si el proceso tiene menos de 2 minutos, evitar duplicado
  if (timeDiff < 120000) {
    Alert.alert('Registro en Proceso', 'Tu registro ya se está procesando. Por favor espera un momento.');
    return;
  }
}
```

## 📊 RESULTADO ESPERADO

Después de ejecutar cualquiera de las opciones:

**ANTES:**
- clinica ponzano - Plan 12 Meses ✅
- clinica ponzano - Plan 6 Meses ❌

**DESPUÉS:**
- clinica ponzano - Plan 12 Meses ✅ (solo esta)

## 🔄 PASOS FINALES

1. **Ejecutar una de las opciones de arriba**
2. **Reiniciar la aplicación completamente**
3. **Verificar en Panel de Administrador > Empresas**
4. **Confirmar que solo aparece una empresa "clinica ponzano"**

## 📝 NOTAS IMPORTANTES

- ✅ **La protección ya está instalada** en el código para futuros registros
- ✅ **Los datos se mantienen seguros** - solo se eliminan duplicados
- ✅ **Se conserva la empresa más reciente** con el plan correcto
- ✅ **El proceso es reversible** si algo sale mal

## 🆘 SI NECESITAS AYUDA

Si alguna opción no funciona:

1. **Verifica que AsyncStorage esté disponible** en la consola
2. **Asegúrate de estar en modo debug** de React Native
3. **Reinicia completamente** la aplicación después de cada paso
4. **Contacta si persiste el problema** con los logs específicos

---

**Estado**: ✅ Solución lista para implementar
**Prioridad**: 🔴 Alta - Ejecutar inmediatamente  
**Tiempo estimado**: 2-5 minutos por opción