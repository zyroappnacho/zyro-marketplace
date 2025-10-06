/**
 * EJECUTAR AHORA - SOLUCIÓN INMEDIATA PARA DUPLICADOS
 * Corre este script para solucionar el problema inmediatamente
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

console.log('🚨 SOLUCIONANDO DUPLICADOS AHORA MISMO');
console.log('====================================');

async function solucionarAhora() {
  try {
    console.log('🔍 Paso 1: Analizando empresas duplicadas...');
    
    // Obtener lista de empresas
    const companiesListStr = await AsyncStorage.getItem('companiesList');
    const companiesList = companiesListStr ? JSON.parse(companiesListStr) : [];
    
    console.log(`📊 Total empresas encontradas: ${companiesList.length}`);
    
    // Buscar duplicados específicamente por nombre
    const duplicados = {};
    companiesList.forEach(company => {
      const nombre = (company.companyName || company.name || '').toLowerCase().trim();
      if (!duplicados[nombre]) {
        duplicados[nombre] = [];
      }
      duplicados[nombre].push(company);
    });
    
    // Identificar grupos con duplicados
    const gruposDuplicados = Object.entries(duplicados).filter(([nombre, empresas]) => empresas.length > 1);
    
    if (gruposDuplicados.length === 0) {
      console.log('✅ No se encontraron duplicados');
      return { success: true, message: 'No hay duplicados que corregir' };
    }
    
    console.log(`⚠️ Encontrados ${gruposDuplicados.length} grupos de empresas duplicadas:`);
    
    // Mostrar duplicados encontrados
    gruposDuplicados.forEach(([nombre, empresas]) => {
      console.log(`\n📋 Empresa: "${nombre}" (${empresas.length} duplicados)`);
      empresas.forEach((empresa, index) => {
        console.log(`   ${index + 1}. ID: ${empresa.id} | Plan: ${empresa.plan} | Email: ${empresa.email}`);
      });
    });
    
    console.log('\n🔧 Paso 2: Eliminando duplicados...');
    
    let eliminados = 0;
    const empresasLimpias = [];
    
    // Procesar cada grupo de duplicados
    for (const [nombre, empresas] of gruposDuplicados) {
      // Ordenar por fecha de registro (más reciente primero)
      empresas.sort((a, b) => {
        const fechaA = new Date(a.registrationDate || 0);
        const fechaB = new Date(b.registrationDate || 0);
        return fechaB - fechaA;
      });
      
      // Mantener la más reciente
      const empresaAMantener = empresas[0];
      const empresasAEliminar = empresas.slice(1);
      
      console.log(`\n   ✅ Manteniendo: ${empresaAMantener.companyName} (${empresaAMantener.plan})`);
      empresasLimpias.push(empresaAMantener);
      
      // Eliminar duplicados
      for (const empresa of empresasAEliminar) {
        console.log(`   🗑️ Eliminando: ${empresa.companyName} (${empresa.plan})`);
        
        // Eliminar datos individuales
        await AsyncStorage.removeItem(`company_${empresa.id}`);
        await AsyncStorage.removeItem(`approved_user_${empresa.id}`);
        await AsyncStorage.removeItem(`company_subscription_${empresa.id}`);
        await AsyncStorage.removeItem(`company_locations_${empresa.id}`);
        await AsyncStorage.removeItem(`company_profile_image_${empresa.id}`);
        
        eliminados++;
      }
    }
    
    // Agregar empresas sin duplicados
    const empresasSinDuplicados = companiesList.filter(company => {
      const nombre = (company.companyName || company.name || '').toLowerCase().trim();
      return !duplicados[nombre] || duplicados[nombre].length === 1;
    });
    
    const listaFinal = [...empresasSinDuplicados, ...empresasLimpias];
    
    console.log('\n💾 Paso 3: Guardando lista limpia...');
    await AsyncStorage.setItem('companiesList', JSON.stringify(listaFinal));
    
    console.log('\n🧹 Paso 4: Limpiando usuarios aprobados...');
    
    // Limpiar usuarios aprobados duplicados
    const approvedUsersStr = await AsyncStorage.getItem('approvedUsersList');
    const approvedUsers = approvedUsersStr ? JSON.parse(approvedUsersStr) : [];
    
    const usuariosUnicos = [];
    const emailsVistos = new Set();
    
    for (const user of approvedUsers) {
      if (!emailsVistos.has(user.email)) {
        emailsVistos.add(user.email);
        usuariosUnicos.push(user);
      }
    }
    
    await AsyncStorage.setItem('approvedUsersList', JSON.stringify(usuariosUnicos));
    
    console.log('\n🛡️ Paso 5: Instalando protección anti-duplicados...');
    
    // Instalar protección
    const proteccion = {
      enabled: true,
      installedAt: new Date().toISOString(),
      version: '1.0',
      rules: {
        blockDuplicateNames: true,
        blockDuplicateEmails: true,
        timeout: 120000 // 2 minutos
      }
    };
    
    await AsyncStorage.setItem('duplicate_protection', JSON.stringify(proteccion));
    
    console.log('\n✅ SOLUCIÓN COMPLETADA');
    console.log('=====================');
    console.log(`📊 Empresas eliminadas: ${eliminados}`);
    console.log(`📊 Empresas finales: ${listaFinal.length}`);
    console.log(`📊 Usuarios únicos: ${usuariosUnicos.length}`);
    console.log('🛡️ Protección anti-duplicados: ACTIVA');
    
    // Verificación final
    console.log('\n🔍 Verificación final...');
    const verificacion = await verificarSolucion();
    
    if (verificacion.success) {
      console.log('✅ VERIFICACIÓN EXITOSA: No quedan duplicados');
    } else {
      console.log('⚠️ ADVERTENCIA: Aún hay duplicados por revisar');
    }
    
    return {
      success: true,
      eliminados: eliminados,
      empresasFinales: listaFinal.length,
      usuariosUnicos: usuariosUnicos.length,
      proteccionActiva: true
    };
    
  } catch (error) {
    console.error('❌ Error en la solución:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function verificarSolucion() {
  try {
    const companiesListStr = await AsyncStorage.getItem('companiesList');
    const companiesList = companiesListStr ? JSON.parse(companiesListStr) : [];
    
    const nombresVistos = new Set();
    let duplicadosEncontrados = 0;
    
    companiesList.forEach(company => {
      const nombre = (company.companyName || company.name || '').toLowerCase().trim();
      if (nombresVistos.has(nombre)) {
        duplicadosEncontrados++;
      } else {
        nombresVistos.add(nombre);
      }
    });
    
    return {
      success: duplicadosEncontrados === 0,
      duplicados: duplicadosEncontrados,
      totalEmpresas: companiesList.length
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// EJECUTAR INMEDIATAMENTE
solucionarAhora().then(resultado => {
  console.log('\n🎯 RESULTADO FINAL:');
  console.log('==================');
  
  if (resultado.success) {
    console.log('✅ ÉXITO COMPLETO');
    console.log(`   Duplicados eliminados: ${resultado.eliminados}`);
    console.log(`   Empresas restantes: ${resultado.empresasFinales}`);
    console.log(`   Protección instalada: ${resultado.proteccionActiva ? 'SÍ' : 'NO'}`);
    
    console.log('\n🔄 PRÓXIMOS PASOS:');
    console.log('1. Reinicia la aplicación completamente');
    console.log('2. Ve al panel de administrador > Empresas');
    console.log('3. Verifica que "clinica ponzano" aparece solo una vez');
    console.log('4. El problema debería estar solucionado');
    
  } else {
    console.log('❌ ERROR:', resultado.error);
  }
  
}).catch(error => {
  console.error('❌ Error crítico:', error);
});

export default solucionarAhora;