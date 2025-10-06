/**
 * 🛠️ EJECUTAR LIMPIEZA AUTOMÁTICA DE DUPLICADOS
 * 
 * Script para ejecutar automáticamente y limpiar duplicados existentes
 * Se ejecuta sin intervención del usuario
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 🚀 EJECUTAR LIMPIEZA AUTOMÁTICA SILENCIOSA
 */
export const ejecutarLimpiezaAutomatica = async () => {
  try {
    console.log('🛠️ Iniciando limpieza automática de duplicados...');
    
    // Obtener empresas actuales
    const companiesData = await AsyncStorage.getItem('companiesList');
    const companies = companiesData ? JSON.parse(companiesData) : [];
    
    if (companies.length === 0) {
      console.log('ℹ️ No hay empresas para procesar');
      return { success: true, message: 'Sin empresas' };
    }
    
    console.log(`📊 Procesando ${companies.length} empresas...`);
    
    // Detectar duplicados
    const analisis = analizarDuplicados(companies);
    const totalDuplicates = analisis.duplicatesByEmail.length + analisis.duplicatesByName.length;
    
    if (totalDuplicates === 0) {
      console.log('✅ No se detectaron duplicados');
      return { success: true, message: 'Sin duplicados' };
    }
    
    console.log(`🔍 Duplicados detectados:`);
    console.log(`   📧 Por email: ${analisis.duplicatesByEmail.length}`);
    console.log(`   🏢 Por nombre: ${analisis.duplicatesByName.length}`);
    
    // Aplicar limpieza automática
    const resultado = aplicarLimpiezaInteligente(companies);
    
    // Guardar lista limpia
    await AsyncStorage.setItem('companiesList', JSON.stringify(resultado.companiesLimpias));
    
    // Limpiar datos relacionados
    await limpiarDatosRelacionados(resultado.companiesLimpias);
    
    console.log(`✅ Limpieza completada:`);
    console.log(`   • Empresas antes: ${companies.length}`);
    console.log(`   • Empresas después: ${resultado.companiesLimpias.length}`);
    console.log(`   • Duplicados eliminados: ${resultado.duplicadosEliminados}`);
    
    return {
      success: true,
      empresasAntes: companies.length,
      empresasDespues: resultado.companiesLimpias.length,
      duplicadosEliminados: resultado.duplicadosEliminados
    };
    
  } catch (error) {
    console.error('❌ Error en limpieza automática:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 🔍 Analizar duplicados
 */
const analizarDuplicados = (companies) => {
  const emailGroups = {};
  const nameGroups = {};
  
  companies.forEach((company) => {
    const email = company.email?.toLowerCase().trim();
    const name = (company.companyName || company.name || '').toLowerCase().trim();
    
    // Agrupar por email
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
  
  return { duplicatesByEmail, duplicatesByName };
};

/**
 * 🎯 Aplicar limpieza inteligente
 */
const aplicarLimpiezaInteligente = (companies) => {
  console.log('🎯 Aplicando lógica de prioridad inteligente...');
  
  const companiesLimpias = [];
  const processedEmails = new Set();
  const processedNames = new Set();
  let duplicadosEliminados = 0;
  
  // Ordenar empresas por prioridad
  const companiesOrdenadas = companies.sort((a, b) => {
    // Prioridad 1: Email válido
    const aHasValidEmail = !!(a.email && a.email.includes('@') && a.email.includes('.'));
    const bHasValidEmail = !!(b.email && b.email.includes('@') && b.email.includes('.'));
    if (aHasValidEmail !== bHasValidEmail) {
      return bHasValidEmail ? 1 : -1;
    }
    
    // Prioridad 2: Datos de pago
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
    
    // Prioridad 4: Estado NO "activa" (preferir pending sobre activa)
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
      
      console.log(`✅ MANTENIDA: ${company.companyName || company.name} (${company.email || 'Sin email'})`);
      
    } else {
      // Eliminar duplicado
      duplicadosEliminados++;
      
      console.log(`❌ ELIMINADA: ${company.companyName || company.name} (${company.email || 'Sin email'})`);
      console.log(`   🔄 Razón: ${emailDuplicate ? 'Email duplicado' : 'Nombre duplicado'}`);
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
    console.log('🧹 Limpiando datos relacionados...');
    
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
      if (removedUsers > 0) {
        console.log(`🧹 ${removedUsers} usuarios empresa duplicados eliminados`);
      }
    }
    
    console.log('✅ Datos relacionados limpiados');
    
  } catch (error) {
    console.error('❌ Error limpiando datos relacionados:', error);
  }
};

export default ejecutarLimpiezaAutomatica;