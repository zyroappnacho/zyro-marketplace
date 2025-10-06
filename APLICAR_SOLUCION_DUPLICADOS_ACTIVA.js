/**
 * APLICAR SOLUCIÓN DE DUPLICADOS "ACTIVA" EN LA APP REAL
 * 
 * Script para ejecutar desde la app React Native
 * Soluciona duplicados causados por el estado "Activa"
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

/**
 * Ejecutar solución de duplicados en la app real
 */
export const aplicarSolucionDuplicadosActiva = async () => {
  try {
    console.log('🚀 APLICANDO SOLUCIÓN DE DUPLICADOS "ACTIVA"');
    console.log('='.repeat(50));
    
    // 1. Obtener empresas actuales
    const companiesData = await AsyncStorage.getItem('companiesList');
    const companies = companiesData ? JSON.parse(companiesData) : [];
    
    console.log(`📊 Total de empresas antes: ${companies.length}`);
    
    if (companies.length === 0) {
      Alert.alert('ℹ️ Sin Empresas', 'No hay empresas para procesar.');
      return { success: true, message: 'No hay empresas' };
    }
    
    // 2. Mostrar empresas actuales
    console.log('\n📋 EMPRESAS ACTUALES:');
    companies.forEach((company, index) => {
      console.log(`${index + 1}. ${company.companyName || company.name}`);
      console.log(`   📧 ${company.email || 'Sin email'}`);
      console.log(`   📅 Plan: ${company.plan || company.selectedPlan || 'N/A'}`);
      console.log(`   🔄 Estado: ${company.status || 'N/A'}`);
    });
    
    // 3. Detectar duplicados
    const emailGroups = {};
    const nameGroups = {};
    
    companies.forEach((company, index) => {
      const email = company.email?.toLowerCase().trim();
      const name = (company.companyName || company.name || '').toLowerCase().trim();
      
      // Agrupar por email (solo si tiene email)
      if (email) {
        if (!emailGroups[email]) {
          emailGroups[email] = [];
        }
        emailGroups[email].push(company);
      }
      
      // Agrupar por nombre
      if (name) {
        if (!nameGroups[name]) {
          nameGroups[name] = [];
        }
        nameGroups[name].push(company);
      }
    });
    
    const duplicateEmails = Object.keys(emailGroups).filter(email => emailGroups[email].length > 1);
    const duplicateNames = Object.keys(nameGroups).filter(name => nameGroups[name].length > 1);
    
    console.log(`\n🔍 DUPLICADOS DETECTADOS:`);
    console.log(`   📧 Por email: ${duplicateEmails.length}`);
    console.log(`   🏢 Por nombre: ${duplicateNames.length}`);
    
    if (duplicateEmails.length === 0 && duplicateNames.length === 0) {
      Alert.alert(
        '✅ Sin Duplicados',
        `No se detectaron duplicados.\n\nTotal de empresas: ${companies.length}`,
        [{ text: 'Perfecto' }]
      );
      return { success: true, message: 'No hay duplicados' };
    }
    
    // 4. Mostrar duplicados encontrados
    if (duplicateEmails.length > 0) {
      console.log('\n📧 DUPLICADOS POR EMAIL:');
      duplicateEmails.forEach(email => {
        const duplicates = emailGroups[email];
        console.log(`   ❌ ${email}: ${duplicates.length} empresas`);
        duplicates.forEach(dup => {
          console.log(`      - ${dup.companyName} (${dup.plan})`);
        });
      });
    }
    
    if (duplicateNames.length > 0) {
      console.log('\n🏢 DUPLICADOS POR NOMBRE:');
      duplicateNames.forEach(name => {
        const duplicates = nameGroups[name];
        console.log(`   ❌ ${name}: ${duplicates.length} empresas`);
        duplicates.forEach(dup => {
          console.log(`      - ${dup.email || 'Sin email'} (${dup.plan})`);
        });
      });
    }
    
    // 5. Aplicar solución con lógica de prioridad
    console.log('\n🔧 APLICANDO SOLUCIÓN...');
    
    const cleanCompanies = [];
    const processedEmails = new Set();
    const processedNames = new Set();
    
    // Ordenar por prioridad inteligente
    const sortedCompanies = companies.sort((a, b) => {
      // Prioridad 1: Email válido
      const aHasEmail = !!(a.email && a.email.trim());
      const bHasEmail = !!(b.email && b.email.trim());
      if (aHasEmail !== bHasEmail) {
        return bHasEmail ? 1 : -1;
      }
      
      // Prioridad 2: Datos de pago
      const aHasPayment = !!(a.firstPaymentCompletedDate || a.monthlyAmount);
      const bHasPayment = !!(b.firstPaymentCompletedDate || b.monthlyAmount);
      if (aHasPayment !== bHasPayment) {
        return bHasPayment ? 1 : -1;
      }
      
      // Prioridad 3: Más reciente
      const dateA = new Date(a.registrationDate || 0);
      const dateB = new Date(b.registrationDate || 0);
      return dateB - dateA;
    });
    
    sortedCompanies.forEach(company => {
      const email = company.email?.toLowerCase().trim();
      const name = (company.companyName || company.name || '').toLowerCase().trim();
      
      const emailDuplicate = email && processedEmails.has(email);
      const nameDuplicate = name && processedNames.has(name);
      
      if (!emailDuplicate && !nameDuplicate) {
        cleanCompanies.push(company);
        if (email) processedEmails.add(email);
        if (name) processedNames.add(name);
        
        console.log(`✅ Manteniendo: ${company.companyName || company.name} (${company.email || 'Sin email'})`);
      } else {
        console.log(`❌ Eliminando: ${company.companyName || company.name} (${company.email || 'Sin email'})`);
      }
    });
    
    // 6. Guardar lista limpia
    await AsyncStorage.setItem('companiesList', JSON.stringify(cleanCompanies));
    
    const removedCount = companies.length - cleanCompanies.length;
    
    console.log(`\n📊 RESULTADO:`);
    console.log(`   • Empresas antes: ${companies.length}`);
    console.log(`   • Empresas después: ${cleanCompanies.length}`);
    console.log(`   • Duplicados eliminados: ${removedCount}`);
    
    // 7. También limpiar usuarios aprobados
    await limpiarUsuariosAprobadosDuplicados();
    
    // 8. Mostrar resultado al usuario
    Alert.alert(
      '✅ ¡Duplicados Eliminados!',
      `Solución aplicada exitosamente:\n\n` +
      `📊 Resultado:\n` +
      `• Empresas antes: ${companies.length}\n` +
      `• Empresas después: ${cleanCompanies.length}\n` +
      `• Duplicados eliminados: ${removedCount}\n\n` +
      `✅ Ahora cada empresa aparece solo UNA vez.\n` +
      `✅ Se priorizaron empresas con email válido.\n` +
      `✅ Se mantuvieron las versiones más recientes.\n\n` +
      `🎉 ¡El problema de duplicados "Activa" ha sido solucionado!`,
      [{ text: 'Perfecto' }]
    );
    
    return {
      success: true,
      originalCount: companies.length,
      cleanCount: cleanCompanies.length,
      removedCount: removedCount
    };
    
  } catch (error) {
    console.error('❌ Error aplicando solución:', error);
    
    Alert.alert(
      '❌ Error',
      `Error aplicando la solución:\n\n${error.message}`,
      [{ text: 'OK' }]
    );
    
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Limpiar usuarios aprobados duplicados
 */
const limpiarUsuariosAprobadosDuplicados = async () => {
  try {
    console.log('\n🧹 Limpiando usuarios aprobados duplicados...');
    
    const approvedUsersData = await AsyncStorage.getItem('approvedUsers');
    const approvedUsers = approvedUsersData ? JSON.parse(approvedUsersData) : [];
    
    const companyUsers = approvedUsers.filter(user => user.role === 'company');
    const otherUsers = approvedUsers.filter(user => user.role !== 'company');
    
    console.log(`📊 Usuarios empresa: ${companyUsers.length}`);
    
    if (companyUsers.length === 0) {
      return;
    }
    
    // Eliminar duplicados por email
    const cleanCompanyUsers = [];
    const processedEmails = new Set();
    
    companyUsers.forEach(user => {
      const email = user.email?.toLowerCase().trim();
      
      if (email && !processedEmails.has(email)) {
        cleanCompanyUsers.push(user);
        processedEmails.add(email);
        console.log(`✅ Usuario mantenido: ${user.companyName || user.name} (${user.email})`);
      } else {
        console.log(`❌ Usuario duplicado eliminado: ${user.companyName || user.name} (${user.email || 'Sin email'})`);
      }
    });
    
    const allCleanUsers = [...otherUsers, ...cleanCompanyUsers];
    await AsyncStorage.setItem('approvedUsers', JSON.stringify(allCleanUsers));
    
    const removedUserCount = companyUsers.length - cleanCompanyUsers.length;
    console.log(`📊 Usuarios duplicados eliminados: ${removedUserCount}`);
    
  } catch (error) {
    console.error('❌ Error limpiando usuarios aprobados:', error);
  }
};

/**
 * Verificar estado después de la solución
 */
export const verificarEstadoDespuesDeSolucion = async () => {
  try {
    console.log('🔍 VERIFICANDO ESTADO DESPUÉS DE LA SOLUCIÓN...');
    
    const companiesData = await AsyncStorage.getItem('companiesList');
    const companies = companiesData ? JSON.parse(companiesData) : [];
    
    console.log(`📊 Total de empresas: ${companies.length}`);
    
    if (companies.length > 0) {
      console.log('\n📋 EMPRESAS FINALES:');
      companies.forEach((company, index) => {
        console.log(`${index + 1}. ${company.companyName || company.name}`);
        console.log(`   📧 ${company.email || 'Sin email'}`);
        console.log(`   📅 Plan: ${company.plan || company.selectedPlan}`);
        console.log(`   🔄 Estado: ${company.status}`);
      });
      
      // Verificar duplicados
      const emails = companies.map(c => c.email?.toLowerCase().trim()).filter(Boolean);
      const uniqueEmails = [...new Set(emails)];
      
      const names = companies.map(c => (c.companyName || c.name || '').toLowerCase().trim()).filter(Boolean);
      const uniqueNames = [...new Set(names)];
      
      const noDuplicates = emails.length === uniqueEmails.length && names.length === uniqueNames.length;
      
      Alert.alert(
        noDuplicates ? '✅ Verificación Exitosa' : '⚠️ Duplicados Restantes',
        `Estado después de la solución:\n\n` +
        `• Total de empresas: ${companies.length}\n` +
        `• Emails únicos: ${uniqueEmails.length}/${emails.length}\n` +
        `• Nombres únicos: ${uniqueNames.length}/${names.length}\n` +
        `• Sin duplicados: ${noDuplicates ? '✅' : '❌'}\n\n` +
        `${noDuplicates ? '🎉 ¡Problema solucionado!' : '⚠️ Puede necesitar otra ejecución'}`,
        [{ text: 'OK' }]
      );
      
      return {
        success: noDuplicates,
        totalCompanies: companies.length,
        uniqueEmails: uniqueEmails.length,
        uniqueNames: uniqueNames.length
      };
    }
    
  } catch (error) {
    console.error('❌ Error verificando estado:', error);
    Alert.alert('❌ Error', `Error verificando estado: ${error.message}`);
    return { success: false, error: error.message };
  }
};

export default aplicarSolucionDuplicadosActiva;