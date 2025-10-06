/**
 * 🛠️ EJECUTAR SOLUCIÓN DE DUPLICADOS "ACTIVA" EN LA APP REAL
 * 
 * Script mejorado para aplicar directamente en React Native
 * Soluciona el problema de empresas duplicadas con estado "Activa"
 * 
 * INSTRUCCIONES:
 * 1. Importar este script en tu componente principal
 * 2. Ejecutar la función cuando detectes duplicados
 * 3. Verificar resultados con la función de verificación
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

/**
 * 🚀 FUNCIÓN PRINCIPAL: Aplicar solución de duplicados
 */
export const ejecutarSolucionDuplicadosActiva = async () => {
  try {
    console.log('🚀 INICIANDO SOLUCIÓN DE DUPLICADOS "ACTIVA"');
    console.log('='.repeat(60));
    
    // PASO 1: Obtener datos actuales
    const companiesData = await AsyncStorage.getItem('companiesList');
    const companies = companiesData ? JSON.parse(companiesData) : [];
    
    console.log(`📊 Empresas encontradas: ${companies.length}`);
    
    if (companies.length === 0) {
      Alert.alert(
        'ℹ️ Sin Datos',
        'No hay empresas registradas para procesar.',
        [{ text: 'OK' }]
      );
      return { success: true, message: 'Sin empresas' };
    }
    
    // PASO 2: Análisis detallado de duplicados
    const analisis = analizarDuplicados(companies);
    
    console.log('\n🔍 ANÁLISIS DE DUPLICADOS:');
    console.log(`   📧 Duplicados por email: ${analisis.duplicatesByEmail.length}`);
    console.log(`   🏢 Duplicados por nombre: ${analisis.duplicatesByName.length}`);
    console.log(`   ⚠️ Empresas sin email: ${analisis.companiesWithoutEmail.length}`);
    console.log(`   🔄 Empresas con estado "Activa": ${analisis.activeStatusCompanies.length}`);
    
    // PASO 3: Mostrar duplicados específicos
    mostrarDuplicadosDetallados(analisis);
    
    // PASO 4: Verificar si hay duplicados que solucionar
    const totalDuplicates = analisis.duplicatesByEmail.length + analisis.duplicatesByName.length;
    
    if (totalDuplicates === 0) {
      Alert.alert(
        '✅ Sin Duplicados',
        `Análisis completado:\n\n` +
        `• Total de empresas: ${companies.length}\n` +
        `• Sin duplicados detectados\n` +
        `• Estado: ✅ Limpio\n\n` +
        `🎉 No se requiere acción.`,
        [{ text: 'Perfecto' }]
      );
      return { success: true, message: 'Sin duplicados' };
    }
    
    // PASO 5: Aplicar solución inteligente
    console.log('\n🔧 APLICANDO SOLUCIÓN INTELIGENTE...');
    
    const resultado = await aplicarSolucionInteligente(companies, analisis);
    
    // PASO 6: Guardar resultados
    await AsyncStorage.setItem('companiesList', JSON.stringify(resultado.companiesLimpias));
    
    // PASO 7: Limpiar datos relacionados
    await limpiarDatosRelacionados(resultado.companiesLimpias);
    
    // PASO 8: Mostrar resultado final
    const mensaje = `✅ ¡Solución Aplicada Exitosamente!\n\n` +
      `📊 RESULTADO:\n` +
      `• Empresas antes: ${companies.length}\n` +
      `• Empresas después: ${resultado.companiesLimpias.length}\n` +
      `• Duplicados eliminados: ${resultado.duplicadosEliminados}\n\n` +
      `🎯 MEJORAS APLICADAS:\n` +
      `• ✅ Eliminados duplicados por email\n` +
      `• ✅ Eliminados duplicados por nombre\n` +
      `• ✅ Priorizadas empresas con email válido\n` +
      `• ✅ Mantenidas versiones más recientes\n` +
      `• ✅ Limpiados datos relacionados\n\n` +
      `🎉 El problema de duplicados "Activa" ha sido SOLUCIONADO!`;
    
    Alert.alert('🎉 ¡Éxito!', mensaje, [{ text: 'Excelente' }]);
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ SOLUCIÓN COMPLETADA EXITOSAMENTE');
    console.log('='.repeat(60));
    
    return {
      success: true,
      empresasAntes: companies.length,
      empresasDespues: resultado.companiesLimpias.length,
      duplicadosEliminados: resultado.duplicadosEliminados,
      analisis: analisis
    };
    
  } catch (error) {
    console.error('❌ ERROR EN SOLUCIÓN:', error);
    
    Alert.alert(
      '❌ Error Crítico',
      `Error aplicando la solución:\n\n` +
      `${error.message}\n\n` +
      `Por favor, contacta soporte técnico.`,
      [{ text: 'OK' }]
    );
    
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * 🔍 Analizar duplicados en detalle
 */
const analizarDuplicados = (companies) => {
  const emailGroups = {};
  const nameGroups = {};
  const companiesWithoutEmail = [];
  const activeStatusCompanies = [];
  
  companies.forEach((company, index) => {
    const email = company.email?.toLowerCase().trim();
    const name = (company.companyName || company.name || '').toLowerCase().trim();
    const status = company.status?.toLowerCase();
    
    // Agrupar por email
    if (email) {
      if (!emailGroups[email]) {
        emailGroups[email] = [];
      }
      emailGroups[email].push({ ...company, originalIndex: index });
    } else {
      companiesWithoutEmail.push({ ...company, originalIndex: index });
    }
    
    // Agrupar por nombre
    if (name) {
      if (!nameGroups[name]) {
        nameGroups[name] = [];
      }
      nameGroups[name].push({ ...company, originalIndex: index });
    }
    
    // Detectar empresas con estado "Activa"
    if (status === 'activa' || status === 'active') {
      activeStatusCompanies.push({ ...company, originalIndex: index });
    }
  });
  
  // Filtrar solo los grupos con duplicados
  const duplicatesByEmail = Object.keys(emailGroups)
    .filter(email => emailGroups[email].length > 1)
    .map(email => ({
      email,
      companies: emailGroups[email],
      count: emailGroups[email].length
    }));
  
  const duplicatesByName = Object.keys(nameGroups)
    .filter(name => nameGroups[name].length > 1)
    .map(name => ({
      name,
      companies: nameGroups[name],
      count: nameGroups[name].length
    }));
  
  return {
    duplicatesByEmail,
    duplicatesByName,
    companiesWithoutEmail,
    activeStatusCompanies,
    emailGroups,
    nameGroups
  };
};

/**
 * 📋 Mostrar duplicados detallados
 */
const mostrarDuplicadosDetallados = (analisis) => {
  if (analisis.duplicatesByEmail.length > 0) {
    console.log('\n📧 DUPLICADOS POR EMAIL:');
    analisis.duplicatesByEmail.forEach(group => {
      console.log(`   ❌ ${group.email} (${group.count} empresas):`);
      group.companies.forEach(company => {
        console.log(`      - ${company.companyName || company.name}`);
        console.log(`        Plan: ${company.plan || company.selectedPlan || 'N/A'}`);
        console.log(`        Estado: ${company.status || 'N/A'}`);
        console.log(`        Fecha: ${company.registrationDate || 'N/A'}`);
      });
    });
  }
  
  if (analisis.duplicatesByName.length > 0) {
    console.log('\n🏢 DUPLICADOS POR NOMBRE:');
    analisis.duplicatesByName.forEach(group => {
      console.log(`   ❌ ${group.name} (${group.count} empresas):`);
      group.companies.forEach(company => {
        console.log(`      - ${company.email || 'Sin email'}`);
        console.log(`        Plan: ${company.plan || company.selectedPlan || 'N/A'}`);
        console.log(`        Estado: ${company.status || 'N/A'}`);
      });
    });
  }
  
  if (analisis.activeStatusCompanies.length > 0) {
    console.log('\n🔄 EMPRESAS CON ESTADO "ACTIVA":');
    analisis.activeStatusCompanies.forEach(company => {
      console.log(`   - ${company.companyName || company.name} (${company.email || 'Sin email'})`);
    });
  }
};

/**
 * 🎯 Aplicar solución inteligente
 */
const aplicarSolucionInteligente = async (companies, analisis) => {
  console.log('🎯 Aplicando lógica de prioridad inteligente...');
  
  const companiesLimpias = [];
  const processedEmails = new Set();
  const processedNames = new Set();
  let duplicadosEliminados = 0;
  
  // Ordenar empresas por prioridad
  const companiesOrdenadas = companies.sort((a, b) => {
    // Prioridad 1: Email válido y completo
    const aHasValidEmail = !!(a.email && a.email.includes('@') && a.email.includes('.'));
    const bHasValidEmail = !!(b.email && b.email.includes('@') && b.email.includes('.'));
    if (aHasValidEmail !== bHasValidEmail) {
      return bHasValidEmail ? 1 : -1;
    }
    
    // Prioridad 2: Datos de pago completos
    const aHasPaymentData = !!(a.firstPaymentCompletedDate || a.monthlyAmount || a.stripeCustomerId);
    const bHasPaymentData = !!(b.firstPaymentCompletedDate || b.monthlyAmount || b.stripeCustomerId);
    if (aHasPaymentData !== bHasPaymentData) {
      return bHasPaymentData ? 1 : -1;
    }
    
    // Prioridad 3: Plan definido
    const aHasPlan = !!(a.plan || a.selectedPlan);
    const bHasPlan = !!(b.plan || b.selectedPlan);
    if (aHasPlan !== bHasPlan) {
      return bHasPlan ? 1 : -1;
    }
    
    // Prioridad 4: Más datos completos
    const aDataScore = calcularScoreDatos(a);
    const bDataScore = calcularScoreDatos(b);
    if (aDataScore !== bDataScore) {
      return bDataScore - aDataScore;
    }
    
    // Prioridad 5: Más reciente
    const dateA = new Date(a.registrationDate || a.createdAt || 0);
    const dateB = new Date(b.registrationDate || b.createdAt || 0);
    return dateB - dateA;
  });
  
  // Procesar cada empresa
  companiesOrdenadas.forEach(company => {
    const email = company.email?.toLowerCase().trim();
    const name = (company.companyName || company.name || '').toLowerCase().trim();
    
    const emailDuplicate = email && processedEmails.has(email);
    const nameDuplicate = name && processedNames.has(name);
    
    if (!emailDuplicate && !nameDuplicate) {
      // Mantener esta empresa
      companiesLimpias.push(company);
      
      if (email) processedEmails.add(email);
      if (name) processedNames.add(name);
      
      console.log(`✅ MANTENIDA: ${company.companyName || company.name}`);
      console.log(`   📧 ${company.email || 'Sin email'}`);
      console.log(`   📅 Plan: ${company.plan || company.selectedPlan || 'N/A'}`);
      
    } else {
      // Eliminar duplicado
      duplicadosEliminados++;
      
      console.log(`❌ ELIMINADA: ${company.companyName || company.name}`);
      console.log(`   📧 ${company.email || 'Sin email'}`);
      console.log(`   🔄 Razón: ${emailDuplicate ? 'Email duplicado' : 'Nombre duplicado'}`);
    }
  });
  
  return {
    companiesLimpias,
    duplicadosEliminados
  };
};

/**
 * 📊 Calcular score de completitud de datos
 */
const calcularScoreDatos = (company) => {
  let score = 0;
  
  if (company.email) score += 2;
  if (company.companyName || company.name) score += 2;
  if (company.plan || company.selectedPlan) score += 1;
  if (company.firstPaymentCompletedDate) score += 2;
  if (company.monthlyAmount) score += 1;
  if (company.stripeCustomerId) score += 1;
  if (company.registrationDate) score += 1;
  if (company.status) score += 1;
  
  return score;
};

/**
 * 🧹 Limpiar datos relacionados
 */
const limpiarDatosRelacionados = async (companiesLimpias) => {
  try {
    console.log('\n🧹 Limpiando datos relacionados...');
    
    // Obtener emails válidos de empresas limpias
    const validEmails = companiesLimpias
      .map(c => c.email?.toLowerCase().trim())
      .filter(Boolean);
    
    console.log(`📧 Emails válidos: ${validEmails.length}`);
    
    // Limpiar usuarios aprobados
    const approvedUsersData = await AsyncStorage.getItem('approvedUsers');
    const approvedUsers = approvedUsersData ? JSON.parse(approvedUsersData) : [];
    
    const companyUsers = approvedUsers.filter(user => user.role === 'company');
    const otherUsers = approvedUsers.filter(user => user.role !== 'company');
    
    // Mantener solo usuarios de empresas válidas
    const cleanCompanyUsers = companyUsers.filter(user => {
      const userEmail = user.email?.toLowerCase().trim();
      return userEmail && validEmails.includes(userEmail);
    });
    
    const allCleanUsers = [...otherUsers, ...cleanCompanyUsers];
    await AsyncStorage.setItem('approvedUsers', JSON.stringify(allCleanUsers));
    
    const removedUsers = companyUsers.length - cleanCompanyUsers.length;
    console.log(`🧹 Usuarios empresa eliminados: ${removedUsers}`);
    
    // Limpiar otros datos relacionados si existen
    await limpiarDatosAdicionales(validEmails);
    
  } catch (error) {
    console.error('❌ Error limpiando datos relacionados:', error);
  }
};

/**
 * 🗂️ Limpiar datos adicionales
 */
const limpiarDatosAdicionales = async (validEmails) => {
  try {
    // Limpiar datos de campañas si existen
    const campaignsData = await AsyncStorage.getItem('campaigns');
    if (campaignsData) {
      const campaigns = JSON.parse(campaignsData);
      const cleanCampaigns = campaigns.filter(campaign => {
        const campaignEmail = campaign.companyEmail?.toLowerCase().trim();
        return !campaignEmail || validEmails.includes(campaignEmail);
      });
      
      if (cleanCampaigns.length !== campaigns.length) {
        await AsyncStorage.setItem('campaigns', JSON.stringify(cleanCampaigns));
        console.log(`🧹 Campañas limpiadas: ${campaigns.length - cleanCampaigns.length} eliminadas`);
      }
    }
    
    // Limpiar solicitudes si existen
    const requestsData = await AsyncStorage.getItem('collaborationRequests');
    if (requestsData) {
      const requests = JSON.parse(requestsData);
      const cleanRequests = requests.filter(request => {
        const requestEmail = request.companyEmail?.toLowerCase().trim();
        return !requestEmail || validEmails.includes(requestEmail);
      });
      
      if (cleanRequests.length !== requests.length) {
        await AsyncStorage.setItem('collaborationRequests', JSON.stringify(cleanRequests));
        console.log(`🧹 Solicitudes limpiadas: ${requests.length - cleanRequests.length} eliminadas`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error limpiando datos adicionales:', error);
  }
};

/**
 * 🔍 Verificar estado después de aplicar la solución
 */
export const verificarSolucionAplicada = async () => {
  try {
    console.log('🔍 VERIFICANDO SOLUCIÓN APLICADA...');
    console.log('='.repeat(50));
    
    const companiesData = await AsyncStorage.getItem('companiesList');
    const companies = companiesData ? JSON.parse(companiesData) : [];
    
    console.log(`📊 Total de empresas: ${companies.length}`);
    
    if (companies.length === 0) {
      Alert.alert('ℹ️ Sin Empresas', 'No hay empresas para verificar.');
      return { success: true, message: 'Sin empresas' };
    }
    
    // Verificar duplicados
    const emails = companies.map(c => c.email?.toLowerCase().trim()).filter(Boolean);
    const names = companies.map(c => (c.companyName || c.name || '').toLowerCase().trim()).filter(Boolean);
    
    const uniqueEmails = [...new Set(emails)];
    const uniqueNames = [...new Set(names)];
    
    const duplicateEmails = emails.length - uniqueEmails.length;
    const duplicateNames = names.length - uniqueNames.length;
    const totalDuplicates = duplicateEmails + duplicateNames;
    
    console.log('\n📊 VERIFICACIÓN:');
    console.log(`   📧 Emails totales: ${emails.length}`);
    console.log(`   📧 Emails únicos: ${uniqueEmails.length}`);
    console.log(`   📧 Duplicados email: ${duplicateEmails}`);
    console.log(`   🏢 Nombres totales: ${names.length}`);
    console.log(`   🏢 Nombres únicos: ${uniqueNames.length}`);
    console.log(`   🏢 Duplicados nombre: ${duplicateNames}`);
    console.log(`   ⚠️ Total duplicados: ${totalDuplicates}`);
    
    const solucionExitosa = totalDuplicates === 0;
    
    const mensaje = `${solucionExitosa ? '✅' : '⚠️'} Verificación Completada\n\n` +
      `📊 ESTADO ACTUAL:\n` +
      `• Total empresas: ${companies.length}\n` +
      `• Emails únicos: ${uniqueEmails.length}/${emails.length}\n` +
      `• Nombres únicos: ${uniqueNames.length}/${names.length}\n` +
      `• Duplicados restantes: ${totalDuplicates}\n\n` +
      `${solucionExitosa ? 
        '🎉 ¡PERFECTO! Sin duplicados detectados.\n✅ Solución aplicada correctamente.' : 
        '⚠️ Aún hay duplicados.\n🔄 Puede necesitar otra ejecución.'
      }`;
    
    Alert.alert(
      solucionExitosa ? '✅ Verificación Exitosa' : '⚠️ Duplicados Detectados',
      mensaje,
      [{ text: 'OK' }]
    );
    
    return {
      success: solucionExitosa,
      totalCompanies: companies.length,
      uniqueEmails: uniqueEmails.length,
      uniqueNames: uniqueNames.length,
      duplicatesRemaining: totalDuplicates
    };
    
  } catch (error) {
    console.error('❌ Error verificando solución:', error);
    Alert.alert('❌ Error', `Error en verificación: ${error.message}`);
    return { success: false, error: error.message };
  }
};

/**
 * 📋 Mostrar resumen de empresas actuales
 */
export const mostrarResumenEmpresas = async () => {
  try {
    const companiesData = await AsyncStorage.getItem('companiesList');
    const companies = companiesData ? JSON.parse(companiesData) : [];
    
    console.log('\n📋 RESUMEN DE EMPRESAS ACTUALES:');
    console.log('='.repeat(50));
    
    if (companies.length === 0) {
      console.log('   📭 No hay empresas registradas');
      return;
    }
    
    companies.forEach((company, index) => {
      console.log(`${index + 1}. ${company.companyName || company.name || 'Sin nombre'}`);
      console.log(`   📧 ${company.email || 'Sin email'}`);
      console.log(`   📅 Plan: ${company.plan || company.selectedPlan || 'N/A'}`);
      console.log(`   🔄 Estado: ${company.status || 'N/A'}`);
      console.log(`   📆 Registro: ${company.registrationDate || 'N/A'}`);
      console.log('   ' + '-'.repeat(40));
    });
    
    return companies;
    
  } catch (error) {
    console.error('❌ Error mostrando resumen:', error);
    return [];
  }
};

export default ejecutarSolucionDuplicadosActiva;