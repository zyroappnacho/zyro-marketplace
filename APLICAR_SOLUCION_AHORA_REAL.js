/**
 * ⚡ APLICAR SOLUCIÓN DUPLICADOS "ACTIVA" - VERSIÓN FINAL PARA APP REAL
 * 
 * INSTRUCCIONES PARA USAR EN TU APP:
 * 
 * 1. Importa este archivo en tu AdminPanel o componente principal
 * 2. Llama a la función aplicarSolucionAhoraReal()
 * 3. La solución se aplicará automáticamente a tus datos reales
 * 
 * EJEMPLO DE USO:
 * 
 * import { aplicarSolucionAhoraReal } from './APLICAR_SOLUCION_AHORA_REAL';
 * 
 * const solucionarDuplicados = async () => {
 *   const resultado = await aplicarSolucionAhoraReal();
 *   console.log('Resultado:', resultado);
 * };
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

/**
 * ⚡ APLICAR SOLUCIÓN INMEDIATAMENTE A DATOS REALES
 */
export const aplicarSolucionAhoraReal = async () => {
  try {
    console.log('⚡ APLICANDO SOLUCIÓN DE DUPLICADOS "ACTIVA" A DATOS REALES...');
    console.log('='.repeat(70));
    
    // PASO 1: Obtener datos reales actuales
    console.log('\n📊 PASO 1: Obteniendo datos reales...');
    const companiesData = await AsyncStorage.getItem('companiesList');
    const companies = companiesData ? JSON.parse(companiesData) : [];
    
    console.log(`📊 Total de empresas encontradas: ${companies.length}`);
    
    if (companies.length === 0) {
      Alert.alert(
        'ℹ️ Sin Empresas',
        'No hay empresas registradas para procesar.',
        [{ text: 'OK' }]
      );
      return { success: true, message: 'Sin empresas para procesar' };
    }
    
    // PASO 2: Mostrar estado actual
    console.log('\n📋 PASO 2: Estado actual de empresas...');
    companies.forEach((company, index) => {
      console.log(`${index + 1}. ${company.companyName || company.name || 'Sin nombre'}`);
      console.log(`   📧 ${company.email || 'Sin email'}`);
      console.log(`   📅 Plan: ${company.plan || company.selectedPlan || 'N/A'}`);
      console.log(`   🔄 Estado: ${company.status || 'N/A'}`);
      console.log(`   📆 Registro: ${company.registrationDate || 'N/A'}`);
    });
    
    // PASO 3: Detectar duplicados reales
    console.log('\n🔍 PASO 3: Detectando duplicados reales...');
    const analisis = analizarDuplicadosReales(companies);
    
    console.log(`📧 Duplicados por email: ${analisis.duplicatesByEmail.length}`);
    console.log(`🏢 Duplicados por nombre: ${analisis.duplicatesByName.length}`);
    console.log(`⚠️ Empresas sin email: ${analisis.companiesWithoutEmail.length}`);
    console.log(`🔄 Empresas con estado "Activa": ${analisis.activeStatusCompanies.length}`);
    
    // Mostrar duplicados específicos
    if (analisis.duplicatesByEmail.length > 0) {
      console.log('\n📧 DUPLICADOS POR EMAIL DETECTADOS:');
      analisis.duplicatesByEmail.forEach(group => {
        console.log(`   ❌ ${group.email} (${group.count} empresas):`);
        group.companies.forEach(company => {
          console.log(`      - ${company.companyName || company.name} (${company.status})`);
        });
      });
    }
    
    if (analisis.duplicatesByName.length > 0) {
      console.log('\n🏢 DUPLICADOS POR NOMBRE DETECTADOS:');
      analisis.duplicatesByName.forEach(group => {
        console.log(`   ❌ ${group.name} (${group.count} empresas):`);
        group.companies.forEach(company => {
          console.log(`      - ${company.email || 'Sin email'} (${company.status})`);
        });
      });
    }
    
    if (analisis.activeStatusCompanies.length > 0) {
      console.log('\n🔄 EMPRESAS CON ESTADO "ACTIVA" DETECTADAS:');
      analisis.activeStatusCompanies.forEach(company => {
        console.log(`   - ${company.companyName || company.name} (${company.email || 'Sin email'})`);
      });
    }
    
    // PASO 4: Verificar si hay duplicados que solucionar
    const totalDuplicates = analisis.duplicatesByEmail.length + analisis.duplicatesByName.length;
    
    if (totalDuplicates === 0) {
      Alert.alert(
        '✅ Sin Duplicados',
        `Análisis completado de ${companies.length} empresas:\n\n` +
        `• Sin duplicados detectados\n` +
        `• Estado: ✅ Limpio\n\n` +
        `🎉 No se requiere acción.`,
        [{ text: 'Perfecto' }]
      );
      return { 
        success: true, 
        message: 'Sin duplicados detectados',
        totalEmpresas: companies.length
      };
    }
    
    // PASO 5: Confirmar con el usuario antes de aplicar
    return new Promise((resolve) => {
      Alert.alert(
        '🛠️ Duplicados Detectados',
        `Se encontraron duplicados en tus datos:\n\n` +
        `📊 Total empresas: ${companies.length}\n` +
        `📧 Duplicados por email: ${analisis.duplicatesByEmail.length}\n` +
        `🏢 Duplicados por nombre: ${analisis.duplicatesByName.length}\n` +
        `🔄 Empresas "Activa": ${analisis.activeStatusCompanies.length}\n\n` +
        `¿Quieres aplicar la solución automática?\n\n` +
        `✅ Eliminará duplicados inteligentemente\n` +
        `✅ Mantendrá versiones más completas\n` +
        `✅ Priorizará empresas con email válido\n\n` +
        `⚠️ Esta acción no se puede deshacer.`,
        [
          {
            text: '❌ Cancelar',
            style: 'cancel',
            onPress: () => {
              console.log('❌ Solución cancelada por el usuario');
              resolve({ success: false, cancelled: true });
            }
          },
          {
            text: '✅ Aplicar Solución',
            onPress: async () => {
              try {
                console.log('✅ Usuario confirmó aplicar solución');
                
                // PASO 6: Aplicar solución inteligente
                console.log('\n🔧 PASO 6: Aplicando solución inteligente...');
                const resultado = aplicarSolucionInteligente(companies);
                
                // PASO 7: Guardar datos limpios
                await AsyncStorage.setItem('companiesList', JSON.stringify(resultado.companiesLimpias));
                
                // PASO 8: Limpiar datos relacionados
                await limpiarDatosRelacionados(resultado.companiesLimpias);
                
                // PASO 9: Mostrar resultado final
                console.log('\n📊 PASO 9: Resultado final...');
                console.log(`   • Empresas antes: ${companies.length}`);
                console.log(`   • Empresas después: ${resultado.companiesLimpias.length}`);
                console.log(`   • Duplicados eliminados: ${resultado.duplicadosEliminados}`);
                
                console.log('\n📋 EMPRESAS FINALES:');
                resultado.companiesLimpias.forEach((company, index) => {
                  console.log(`${index + 1}. ${company.companyName || company.name}`);
                  console.log(`   📧 ${company.email || 'Sin email'}`);
                  console.log(`   📅 Plan: ${company.plan || company.selectedPlan || 'N/A'}`);
                });
                
                // PASO 10: Verificar que no hay duplicados
                const verificacion = analizarDuplicadosReales(resultado.companiesLimpias);
                const sinDuplicados = verificacion.duplicatesByEmail.length === 0 && verificacion.duplicatesByName.length === 0;
                
                const mensajeFinal = `✅ ¡Solución Aplicada Exitosamente!\n\n` +
                  `📊 RESULTADO:\n` +
                  `• Empresas antes: ${companies.length}\n` +
                  `• Empresas después: ${resultado.companiesLimpias.length}\n` +
                  `• Duplicados eliminados: ${resultado.duplicadosEliminados}\n\n` +
                  `🎯 VERIFICACIÓN:\n` +
                  `• Sin duplicados restantes: ${sinDuplicados ? '✅ SÍ' : '❌ NO'}\n\n` +
                  `🎉 ¡El problema de duplicados "Activa" ha sido SOLUCIONADO!\n\n` +
                  `✅ Cada empresa aparece solo UNA vez\n` +
                  `✅ Se mantuvieron las versiones más completas\n` +
                  `✅ Se priorizaron empresas con email válido\n` +
                  `✅ Los datos relacionados fueron limpiados`;
                
                Alert.alert('🎉 ¡Éxito Total!', mensajeFinal, [{ text: 'Excelente' }]);
                
                console.log('\n' + '='.repeat(70));
                console.log('🎉 ¡SOLUCIÓN APLICADA EXITOSAMENTE A DATOS REALES!');
                console.log('='.repeat(70));
                
                resolve({
                  success: true,
                  empresasAntes: companies.length,
                  empresasDespues: resultado.companiesLimpias.length,
                  duplicadosEliminados: resultado.duplicadosEliminados,
                  sinDuplicadosRestantes: sinDuplicados
                });
                
              } catch (error) {
                console.error('❌ Error aplicando solución:', error);
                
                Alert.alert(
                  '❌ Error',
                  `Error aplicando la solución:\n\n${error.message}`,
                  [{ text: 'OK' }]
                );
                
                resolve({ success: false, error: error.message });
              }
            }
          }
        ]
      );
    });
    
  } catch (error) {
    console.error('❌ ERROR CRÍTICO:', error);
    
    Alert.alert(
      '❌ Error Crítico',
      `Error crítico en la solución:\n\n${error.message}\n\nContacta soporte técnico.`,
      [{ text: 'OK' }]
    );
    
    return { success: false, error: error.message };
  }
};

/**
 * 🔍 Analizar duplicados en datos reales
 */
const analizarDuplicadosReales = (companies) => {
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
    activeStatusCompanies
  };
};

/**
 * 🎯 Aplicar solución inteligente a datos reales
 */
const aplicarSolucionInteligente = (companies) => {
  console.log('🎯 Aplicando lógica de prioridad inteligente a datos reales...');
  
  const companiesLimpias = [];
  const processedEmails = new Set();
  const processedNames = new Set();
  let duplicadosEliminados = 0;
  
  // Ordenar empresas por prioridad inteligente
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
    
    // Prioridad 4: Estado no "activa" (preferir pending sobre activa)
    const aIsActive = (a.status?.toLowerCase() === 'activa' || a.status?.toLowerCase() === 'active');
    const bIsActive = (b.status?.toLowerCase() === 'activa' || b.status?.toLowerCase() === 'active');
    if (aIsActive !== bIsActive) {
      return aIsActive ? 1 : -1;
    }
    
    // Prioridad 5: Más datos completos
    const aDataScore = calcularScoreDatos(a);
    const bDataScore = calcularScoreDatos(b);
    if (aDataScore !== bDataScore) {
      return bDataScore - aDataScore;
    }
    
    // Prioridad 6: Más reciente
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
      console.log(`   🔄 Estado: ${company.status || 'N/A'}`);
      
    } else {
      // Eliminar duplicado
      duplicadosEliminados++;
      
      console.log(`❌ ELIMINADA: ${company.companyName || company.name}`);
      console.log(`   📧 ${company.email || 'Sin email'}`);
      console.log(`   🔄 Razón: ${emailDuplicate ? 'Email duplicado' : 'Nombre duplicado'}`);
      console.log(`   📊 Estado: ${company.status || 'N/A'}`);
    }
  });
  
  return { companiesLimpias, duplicadosEliminados };
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
  if (company.status && company.status !== 'activa' && company.status !== 'active') score += 1;
  
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
    
    console.log(`📧 Emails válidos para mantener: ${validEmails.length}`);
    
    // Limpiar usuarios aprobados
    const approvedUsersData = await AsyncStorage.getItem('approvedUsers');
    if (approvedUsersData) {
      const approvedUsers = JSON.parse(approvedUsersData);
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
      console.log(`🧹 Usuarios empresa duplicados eliminados: ${removedUsers}`);
    }
    
    console.log('✅ Datos relacionados limpiados');
    
  } catch (error) {
    console.error('❌ Error limpiando datos relacionados:', error);
  }
};

/**
 * 🔍 Verificar estado después de aplicar la solución
 */
export const verificarEstadoDespuesSolucion = async () => {
  try {
    console.log('🔍 VERIFICANDO ESTADO DESPUÉS DE LA SOLUCIÓN...');
    
    const companiesData = await AsyncStorage.getItem('companiesList');
    const companies = companiesData ? JSON.parse(companiesData) : [];
    
    console.log(`📊 Total de empresas: ${companies.length}`);
    
    if (companies.length === 0) {
      Alert.alert('ℹ️ Sin Empresas', 'No hay empresas para verificar.');
      return { success: true, message: 'Sin empresas' };
    }
    
    // Verificar duplicados
    const analisis = analizarDuplicadosReales(companies);
    const totalDuplicates = analisis.duplicatesByEmail.length + analisis.duplicatesByName.length;
    const solucionExitosa = totalDuplicates === 0;
    
    const mensaje = `${solucionExitosa ? '✅' : '⚠️'} Verificación Completada\n\n` +
      `📊 ESTADO ACTUAL:\n` +
      `• Total empresas: ${companies.length}\n` +
      `• Duplicados por email: ${analisis.duplicatesByEmail.length}\n` +
      `• Duplicados por nombre: ${analisis.duplicatesByName.length}\n` +
      `• Empresas sin email: ${analisis.companiesWithoutEmail.length}\n` +
      `• Empresas "Activa": ${analisis.activeStatusCompanies.length}\n\n` +
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
      duplicatesRemaining: totalDuplicates,
      analisis: analisis
    };
    
  } catch (error) {
    console.error('❌ Error verificando estado:', error);
    Alert.alert('❌ Error', `Error en verificación: ${error.message}`);
    return { success: false, error: error.message };
  }
};

export default aplicarSolucionAhoraReal;