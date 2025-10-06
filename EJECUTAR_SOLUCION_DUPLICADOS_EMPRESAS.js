/**
 * SCRIPT PARA EJECUTAR INMEDIATAMENTE
 * Soluciona el problema de empresas duplicadas con diferentes planes
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

console.log('🚨 SOLUCIONANDO PROBLEMA DE EMPRESAS DUPLICADAS');
console.log('===============================================');

async function solucionarDuplicados() {
  try {
    // 1. Obtener lista actual de empresas
    console.log('📋 Obteniendo lista de empresas...');
    const companiesListStr = await AsyncStorage.getItem('companiesList');
    const companiesList = companiesListStr ? JSON.parse(companiesListStr) : [];
    
    console.log(`   Total empresas: ${companiesList.length}`);
    
    // 2. Buscar duplicados por nombre
    console.log('\n🔍 Buscando duplicados por nombre...');
    const duplicateGroups = {};
    
    companiesList.forEach(company => {
      const normalizedName = (company.companyName || company.name || '').toLowerCase().trim();
      
      if (!duplicateGroups[normalizedName]) {
        duplicateGroups[normalizedName] = [];
      }
      duplicateGroups[normalizedName].push(company);
    });
    
    // 3. Identificar grupos con duplicados
    const duplicates = [];
    Object.keys(duplicateGroups).forEach(name => {
      if (duplicateGroups[name].length > 1) {
        duplicates.push({
          name: name,
          companies: duplicateGroups[name]
        });
      }
    });
    
    if (duplicates.length === 0) {
      console.log('✅ No se encontraron empresas duplicadas');
      return { success: true, message: 'No hay duplicados' };
    }
    
    console.log(`⚠️ Encontrados ${duplicates.length} grupos de empresas duplicadas:`);
    
    // 4. Mostrar duplicados encontrados
    duplicates.forEach((group, index) => {
      console.log(`\n   ${index + 1}. Empresa: "${group.name}"`);
      group.companies.forEach((company, companyIndex) => {
        console.log(`      ${companyIndex + 1}. ID: ${company.id}`);
        console.log(`         Plan: ${company.plan}`);
        console.log(`         Email: ${company.email}`);
        console.log(`         Registro: ${company.registrationDate}`);
      });
    });
    
    // 5. Corregir duplicados
    console.log('\n🔧 Corrigiendo duplicados...');
    let companiesRemoved = 0;
    const cleanedCompanies = [];
    
    for (const group of duplicates) {
      // Ordenar por fecha de registro (más reciente primero)
      const sortedCompanies = group.companies.sort((a, b) => {
        const dateA = new Date(a.registrationDate || 0);
        const dateB = new Date(b.registrationDate || 0);
        return dateB - dateA;
      });
      
      // Mantener la empresa más reciente
      const companyToKeep = sortedCompanies[0];
      const companiesToRemove = sortedCompanies.slice(1);
      
      console.log(`   ✅ Manteniendo: ${companyToKeep.id} (${companyToKeep.plan})`);
      cleanedCompanies.push(companyToKeep);
      
      // Eliminar las empresas duplicadas
      for (const companyToRemove of companiesToRemove) {
        console.log(`   🗑️ Eliminando: ${companyToRemove.id} (${companyToRemove.plan})`);
        
        // Eliminar datos individuales
        await AsyncStorage.removeItem(`company_${companyToRemove.id}`);
        await AsyncStorage.removeItem(`approved_user_${companyToRemove.id}`);
        await AsyncStorage.removeItem(`company_subscription_${companyToRemove.id}`);
        await AsyncStorage.removeItem(`company_locations_${companyToRemove.id}`);
        await AsyncStorage.removeItem(`company_profile_image_${companyToRemove.id}`);
        
        companiesRemoved++;
      }
    }
    
    // 6. Agregar empresas sin duplicados
    const uniqueCompanies = companiesList.filter(company => {
      const normalizedName = (company.companyName || company.name || '').toLowerCase().trim();
      return !duplicateGroups[normalizedName] || duplicateGroups[normalizedName].length === 1;
    });
    
    const finalCompaniesList = [...uniqueCompanies, ...cleanedCompanies];
    
    // 7. Guardar lista corregida
    console.log('\n💾 Guardando lista corregida...');
    await AsyncStorage.setItem('companiesList', JSON.stringify(finalCompaniesList));
    
    // 8. Limpiar lista de usuarios aprobados
    console.log('🧹 Limpiando usuarios aprobados duplicados...');
    const approvedUsersStr = await AsyncStorage.getItem('approvedUsersList');
    const approvedUsers = approvedUsersStr ? JSON.parse(approvedUsersStr) : [];
    
    // Eliminar usuarios duplicados por email
    const uniqueUsers = [];
    const seenEmails = new Set();
    
    for (const user of approvedUsers) {
      if (!seenEmails.has(user.email)) {
        seenEmails.add(user.email);
        uniqueUsers.push(user);
      }
    }
    
    await AsyncStorage.setItem('approvedUsersList', JSON.stringify(uniqueUsers));
    
    // 9. Resultado final
    console.log('\n✅ CORRECCIÓN COMPLETADA');
    console.log(`   Empresas eliminadas: ${companiesRemoved}`);
    console.log(`   Empresas finales: ${finalCompaniesList.length}`);
    console.log(`   Usuarios únicos: ${uniqueUsers.length}`);
    
    return {
      success: true,
      companiesRemoved: companiesRemoved,
      finalCompanyCount: finalCompaniesList.length,
      message: `${companiesRemoved} empresas duplicadas eliminadas exitosamente`
    };
    
  } catch (error) {
    console.error('❌ Error solucionando duplicados:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// EJECUTAR SOLUCIÓN INMEDIATAMENTE
solucionarDuplicados().then(result => {
  console.log('\n🎯 RESULTADO FINAL:');
  console.log('==================');
  
  if (result.success) {
    console.log('✅ ÉXITO:', result.message);
    if (result.companiesRemoved > 0) {
      console.log(`   ${result.companiesRemoved} empresas duplicadas eliminadas`);
      console.log(`   ${result.finalCompanyCount} empresas restantes`);
    }
  } else {
    console.log('❌ ERROR:', result.error);
  }
  
  console.log('\n🔄 Reinicia la aplicación para ver los cambios');
  
}).catch(error => {
  console.error('❌ Error crítico:', error);
});

export default solucionarDuplicados;