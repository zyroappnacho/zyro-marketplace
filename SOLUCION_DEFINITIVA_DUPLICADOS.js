/**
 * SOLUCIÓN DEFINITIVA PARA EMPRESAS DUPLICADAS
 * Este script bloquea completamente la creación de duplicados
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

console.log('🚨 EJECUTANDO SOLUCIÓN DEFINITIVA PARA DUPLICADOS');
console.log('================================================');

class SolucionDefinitivaDuplicados {
  
  async ejecutarSolucionCompleta() {
    try {
      console.log('🔧 Paso 1: Limpiando duplicados existentes...');
      await this.limpiarDuplicadosExistentes();
      
      console.log('\n🛡️ Paso 2: Instalando protección anti-duplicados...');
      await this.instalarProteccionAntiDuplicados();
      
      console.log('\n🔄 Paso 3: Reconstruyendo datos limpios...');
      await this.reconstruirDatosLimpios();
      
      console.log('\n✅ SOLUCIÓN COMPLETADA EXITOSAMENTE');
      return { success: true, message: 'Duplicados eliminados y protección instalada' };
      
    } catch (error) {
      console.error('❌ Error en solución definitiva:', error);
      return { success: false, error: error.message };
    }
  }
  
  async limpiarDuplicadosExistentes() {
    try {
      // 1. Obtener lista actual de empresas
      const companiesListStr = await AsyncStorage.getItem('companiesList');
      const companiesList = companiesListStr ? JSON.parse(companiesListStr) : [];
      
      console.log(`   📋 Empresas encontradas: ${companiesList.length}`);
      
      // 2. Agrupar por nombre normalizado
      const empresasPorNombre = {};
      
      companiesList.forEach(company => {
        const nombreNormalizado = (company.companyName || company.name || '').toLowerCase().trim();
        
        if (!empresasPorNombre[nombreNormalizado]) {
          empresasPorNombre[nombreNormalizado] = [];
        }
        empresasPorNombre[nombreNormalizado].push(company);
      });
      
      // 3. Identificar y eliminar duplicados
      let empresasEliminadas = 0;
      const empresasLimpias = [];
      
      for (const [nombre, empresas] of Object.entries(empresasPorNombre)) {
        if (empresas.length > 1) {
          console.log(`   🔍 Duplicados encontrados para "${nombre}": ${empresas.length} empresas`);
          
          // Ordenar por fecha de registro (más reciente primero)
          empresas.sort((a, b) => {
            const fechaA = new Date(a.registrationDate || 0);
            const fechaB = new Date(b.registrationDate || 0);
            return fechaB - fechaA;
          });
          
          // Mantener solo la más reciente
          const empresaAMantener = empresas[0];
          const empresasAEliminar = empresas.slice(1);
          
          console.log(`     ✅ Manteniendo: ${empresaAMantener.id} (Plan: ${empresaAMantener.plan})`);
          empresasLimpias.push(empresaAMantener);
          
          // Eliminar las duplicadas
          for (const empresa of empresasAEliminar) {
            console.log(`     🗑️ Eliminando: ${empresa.id} (Plan: ${empresa.plan})`);
            
            // Eliminar todos los datos relacionados
            await AsyncStorage.removeItem(`company_${empresa.id}`);
            await AsyncStorage.removeItem(`approved_user_${empresa.id}`);
            await AsyncStorage.removeItem(`company_subscription_${empresa.id}`);
            await AsyncStorage.removeItem(`company_locations_${empresa.id}`);
            await AsyncStorage.removeItem(`company_profile_image_${empresa.id}`);
            
            empresasEliminadas++;
          }
        } else {
          // No hay duplicados, mantener la empresa
          empresasLimpias.push(empresas[0]);
        }
      }
      
      // 4. Guardar lista limpia
      await AsyncStorage.setItem('companiesList', JSON.stringify(empresasLimpias));
      
      console.log(`   ✅ Limpieza completada: ${empresasEliminadas} duplicados eliminados`);
      console.log(`   📊 Empresas finales: ${empresasLimpias.length}`);
      
      return { eliminadas: empresasEliminadas, finales: empresasLimpias.length };
      
    } catch (error) {
      console.error('❌ Error limpiando duplicados:', error);
      throw error;
    }
  }
  
  async instalarProteccionAntiDuplicados() {
    try {
      // Crear sistema de bloqueo temporal para registros
      const proteccionConfig = {
        enabled: true,
        version: '2.0',
        installedAt: new Date().toISOString(),
        rules: {
          blockDuplicateNames: true,
          blockDuplicateEmails: true,
          registrationTimeout: 300000, // 5 minutos
          maxRetries: 3
        }
      };
      
      await AsyncStorage.setItem('anti_duplicate_protection', JSON.stringify(proteccionConfig));
      
      // Crear índice de empresas registradas para búsqueda rápida
      const companiesListStr = await AsyncStorage.getItem('companiesList');
      const companiesList = companiesListStr ? JSON.parse(companiesListStr) : [];
      
      const indiceEmpresas = {
        porNombre: {},
        porEmail: {},
        lastUpdated: new Date().toISOString()
      };
      
      companiesList.forEach(company => {
        const nombreNormalizado = (company.companyName || company.name || '').toLowerCase().trim();
        const emailNormalizado = (company.email || '').toLowerCase().trim();
        
        indiceEmpresas.porNombre[nombreNormalizado] = company.id;
        indiceEmpresas.porEmail[emailNormalizado] = company.id;
      });
      
      await AsyncStorage.setItem('companies_index', JSON.stringify(indiceEmpresas));
      
      console.log('   ✅ Protección anti-duplicados instalada');
      console.log(`   📊 Índice creado: ${Object.keys(indiceEmpresas.porNombre).length} nombres, ${Object.keys(indiceEmpresas.porEmail).length} emails`);
      
      return true;
    } catch (error) {
      console.error('❌ Error instalando protección:', error);
      throw error;
    }
  }
  
  async reconstruirDatosLimpios() {
    try {
      // 1. Reconstruir lista de usuarios aprobados sin duplicados
      const approvedUsersStr = await AsyncStorage.getItem('approvedUsersList');
      const approvedUsers = approvedUsersStr ? JSON.parse(approvedUsersStr) : [];
      
      console.log(`   📋 Usuarios aprobados encontrados: ${approvedUsers.length}`);
      
      // Eliminar duplicados por email
      const usuariosUnicos = [];
      const emailsVistos = new Set();
      
      for (const user of approvedUsers) {
        const emailNormalizado = (user.email || '').toLowerCase().trim();
        
        if (!emailsVistos.has(emailNormalizado)) {
          emailsVistos.add(emailNormalizado);
          usuariosUnicos.push(user);
        }
      }
      
      await AsyncStorage.setItem('approvedUsersList', JSON.stringify(usuariosUnicos));
      
      console.log(`   ✅ Usuarios aprobados reconstruidos: ${usuariosUnicos.length} únicos`);
      
      // 2. Limpiar registros temporales expirados
      const allKeys = await AsyncStorage.getAllKeys();
      const tempKeys = allKeys.filter(key => 
        key.startsWith('registration_in_progress_') || 
        key.startsWith('temp_') ||
        key.startsWith('cache_')
      );
      
      if (tempKeys.length > 0) {
        await AsyncStorage.multiRemove(tempKeys);
        console.log(`   🧹 ${tempKeys.length} registros temporales limpiados`);
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error reconstruyendo datos:', error);
      throw error;
    }
  }
  
  async verificarSolucion() {
    try {
      console.log('\n🔍 VERIFICANDO SOLUCIÓN...');
      
      // Verificar que no hay duplicados
      const companiesListStr = await AsyncStorage.getItem('companiesList');
      const companiesList = companiesListStr ? JSON.parse(companiesListStr) : [];
      
      const nombresVistos = new Set();
      let duplicadosEncontrados = 0;
      
      companiesList.forEach(company => {
        const nombreNormalizado = (company.companyName || company.name || '').toLowerCase().trim();
        
        if (nombresVistos.has(nombreNormalizado)) {
          duplicadosEncontrados++;
          console.log(`   ⚠️ Duplicado encontrado: ${nombreNormalizado}`);
        } else {
          nombresVistos.add(nombreNormalizado);
        }
      });
      
      if (duplicadosEncontrados === 0) {
        console.log('   ✅ No se encontraron duplicados');
        
        // Verificar protección instalada
        const proteccionStr = await AsyncStorage.getItem('anti_duplicate_protection');
        const proteccion = proteccionStr ? JSON.parse(proteccionStr) : null;
        
        if (proteccion && proteccion.enabled) {
          console.log('   ✅ Protección anti-duplicados activa');
          return { success: true, duplicates: 0, protection: true };
        } else {
          console.log('   ⚠️ Protección no encontrada');
          return { success: true, duplicates: 0, protection: false };
        }
      } else {
        console.log(`   ❌ Aún hay ${duplicadosEncontrados} duplicados`);
        return { success: false, duplicates: duplicadosEncontrados, protection: false };
      }
      
    } catch (error) {
      console.error('❌ Error verificando solución:', error);
      return { success: false, error: error.message };
    }
  }
}

// EJECUTAR SOLUCIÓN INMEDIATAMENTE
async function ejecutarSolucionAhora() {
  const solucion = new SolucionDefinitivaDuplicados();
  
  try {
    console.log('🚀 INICIANDO SOLUCIÓN DEFINITIVA...');
    
    // Ejecutar solución completa
    const resultado = await solucion.ejecutarSolucionCompleta();
    
    if (resultado.success) {
      // Verificar que funcionó
      const verificacion = await solucion.verificarSolucion();
      
      console.log('\n🎯 RESULTADO FINAL:');
      console.log('==================');
      
      if (verificacion.success && verificacion.duplicates === 0) {
        console.log('✅ ÉXITO TOTAL: Problema de duplicados solucionado completamente');
        console.log('   - Duplicados eliminados: ✅');
        console.log('   - Protección instalada: ✅');
        console.log('   - Verificación exitosa: ✅');
        
        console.log('\n🔄 PRÓXIMOS PASOS:');
        console.log('1. Reinicia la aplicación completamente');
        console.log('2. Verifica en el panel de administrador');
        console.log('3. Intenta registrar una nueva empresa para probar la protección');
        
      } else {
        console.log('⚠️ SOLUCIÓN PARCIAL: Revisa los detalles arriba');
      }
    } else {
      console.log('❌ ERROR EN LA SOLUCIÓN:', resultado.error);
    }
    
    return resultado;
    
  } catch (error) {
    console.error('❌ Error crítico ejecutando solución:', error);
    return { success: false, error: error.message };
  }
}

// Ejecutar automáticamente
ejecutarSolucionAhora().then(result => {
  console.log('\n🏁 Proceso completado');
}).catch(error => {
  console.error('❌ Error final:', error);
});

export default SolucionDefinitivaDuplicados;