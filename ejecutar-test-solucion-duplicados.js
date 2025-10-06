/**
 * 🧪 EJECUTAR TEST DE SOLUCIÓN DUPLICADOS PARA NODE.JS
 */

// Simular AsyncStorage para Node.js
const storage = {};
const AsyncStorage = {
  getItem: async (key) => storage[key] || null,
  setItem: async (key, value) => { storage[key] = value; },
  removeItem: async (key) => { delete storage[key]; }
};

// Simular Alert para Node.js
const Alert = {
  alert: (title, message, buttons) => {
    console.log('📱 ALERT:', title);
    console.log('💬 MESSAGE:', message);
    if (buttons && buttons.length > 0) {
      console.log('🔘 BUTTONS:', buttons.map(b => b.text).join(', '));
    }
  }
};

// Hacer disponibles globalmente
global.AsyncStorage = AsyncStorage;
global.Alert = Alert;

/**
 * 🎯 Crear datos de prueba con duplicados "Activa"
 */
const crearDatosPruebaDuplicadosActiva = async () => {
  console.log('🎯 Creando datos de prueba con duplicados "Activa"...');
  
  const companiesPrueba = [
    // Empresa original
    {
      id: 'comp_001',
      companyName: 'BAR escudo',
      email: 'bar.escudo@gmail.com',
      plan: 'Plan 3 Meses',
      status: 'pending',
      registrationDate: '2024-01-15T10:00:00Z',
      firstPaymentCompletedDate: '2024-01-15T10:30:00Z',
      monthlyAmount: 29.99,
      stripeCustomerId: 'cus_123456'
    },
    
    // Duplicado con estado "Activa" (sin email)
    {
      id: 'comp_002',
      companyName: 'BAR escudo',
      email: null,
      plan: 'Plan 3 Meses',
      status: 'activa',
      registrationDate: '2024-01-15T10:01:00Z',
      firstPaymentCompletedDate: null,
      monthlyAmount: null,
      stripeCustomerId: null
    },
    
    // Otro duplicado con estado "Active"
    {
      id: 'comp_003',
      companyName: 'BAR escudo',
      email: 'bar.escudo@gmail.com',
      plan: 'Plan 3 Meses',
      status: 'active',
      registrationDate: '2024-01-15T10:02:00Z',
      firstPaymentCompletedDate: null,
      monthlyAmount: 29.99,
      stripeCustomerId: null
    },
    
    // Empresa diferente sin duplicados
    {
      id: 'comp_004',
      companyName: 'Restaurante La Plaza',
      email: 'info@laplaza.com',
      plan: 'Plan 1 Mes',
      status: 'pending',
      registrationDate: '2024-01-16T09:00:00Z',
      firstPaymentCompletedDate: '2024-01-16T09:15:00Z',
      monthlyAmount: 19.99,
      stripeCustomerId: 'cus_789012'
    },
    
    // Duplicado por nombre pero diferente email
    {
      id: 'comp_005',
      companyName: 'Café Central',
      email: 'admin@cafecentral.es',
      plan: 'Plan 6 Meses',
      status: 'pending',
      registrationDate: '2024-01-17T14:00:00Z',
      firstPaymentCompletedDate: '2024-01-17T14:20:00Z',
      monthlyAmount: 49.99,
      stripeCustomerId: 'cus_345678'
    },
    
    // Duplicado del anterior con estado "Activa"
    {
      id: 'comp_006',
      companyName: 'Café Central',
      email: 'contacto@cafecentral.es',
      plan: 'Plan 6 Meses',
      status: 'activa',
      registrationDate: '2024-01-17T14:01:00Z',
      firstPaymentCompletedDate: null,
      monthlyAmount: null,
      stripeCustomerId: null
    }
  ];
  
  // Guardar datos de prueba
  await AsyncStorage.setItem('companiesList', JSON.stringify(companiesPrueba));
  
  console.log(`✅ Datos de prueba creados: ${companiesPrueba.length} empresas`);
  console.log(`🔄 Empresas con estado "Activa": ${companiesPrueba.filter(c => c.status?.toLowerCase().includes('activ')).length}`);
  
  return companiesPrueba;
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
 * 🎯 Aplicar solución inteligente
 */
const aplicarSolucionInteligente = (companies) => {
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
    
    // Prioridad 3: Más reciente
    const dateA = new Date(a.registrationDate || 0);
    const dateB = new Date(b.registrationDate || 0);
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
 * 🚀 Ejecutar solución completa
 */
const ejecutarSolucionCompleta = async () => {
  try {
    console.log('🚀 INICIANDO SOLUCIÓN DE DUPLICADOS "ACTIVA"');
    console.log('='.repeat(60));
    
    // PASO 1: Crear datos de prueba
    console.log('\n📝 PASO 1: Creando datos de prueba...');
    const companiesPrueba = await crearDatosPruebaDuplicadosActiva();
    
    // PASO 2: Mostrar estado inicial
    console.log('\n📊 PASO 2: Estado inicial...');
    companiesPrueba.forEach((company, index) => {
      console.log(`${index + 1}. ${company.companyName} (${company.email || 'Sin email'}) - ${company.status}`);
    });
    
    // PASO 3: Analizar duplicados
    console.log('\n🔍 PASO 3: Analizando duplicados...');
    const analisis = analizarDuplicados(companiesPrueba);
    
    console.log(`📧 Duplicados por email: ${analisis.duplicatesByEmail.length}`);
    console.log(`🏢 Duplicados por nombre: ${analisis.duplicatesByName.length}`);
    
    if (analisis.duplicatesByEmail.length > 0) {
      console.log('\n📧 DUPLICADOS POR EMAIL:');
      analisis.duplicatesByEmail.forEach(group => {
        console.log(`   ❌ ${group.email} (${group.count} empresas)`);
      });
    }
    
    if (analisis.duplicatesByName.length > 0) {
      console.log('\n🏢 DUPLICADOS POR NOMBRE:');
      analisis.duplicatesByName.forEach(group => {
        console.log(`   ❌ ${group.name} (${group.count} empresas)`);
      });
    }
    
    // PASO 4: Aplicar solución
    console.log('\n🔧 PASO 4: Aplicando solución...');
    const resultado = aplicarSolucionInteligente(companiesPrueba);
    
    // PASO 5: Guardar resultados
    await AsyncStorage.setItem('companiesList', JSON.stringify(resultado.companiesLimpias));
    
    // PASO 6: Mostrar resultado final
    console.log('\n📊 PASO 6: Resultado final...');
    console.log(`   • Empresas antes: ${companiesPrueba.length}`);
    console.log(`   • Empresas después: ${resultado.companiesLimpias.length}`);
    console.log(`   • Duplicados eliminados: ${resultado.duplicadosEliminados}`);
    
    console.log('\n📋 EMPRESAS FINALES:');
    resultado.companiesLimpias.forEach((company, index) => {
      console.log(`${index + 1}. ${company.companyName} (${company.email || 'Sin email'}) - ${company.status}`);
    });
    
    // PASO 7: Verificar que no hay duplicados
    const verificacion = analizarDuplicados(resultado.companiesLimpias);
    const sinDuplicados = verificacion.duplicatesByEmail.length === 0 && verificacion.duplicatesByName.length === 0;
    
    console.log('\n🔍 VERIFICACIÓN FINAL:');
    console.log(`   ✅ Sin duplicados: ${sinDuplicados ? 'SÍ' : 'NO'}`);
    
    if (sinDuplicados) {
      console.log('\n🎉 ¡SOLUCIÓN APLICADA EXITOSAMENTE!');
      console.log('✅ Todos los duplicados "Activa" han sido eliminados');
      console.log('✅ Se mantuvieron las versiones más completas');
      console.log('✅ El problema está SOLUCIONADO');
    } else {
      console.log('\n⚠️ Aún hay duplicados restantes');
    }
    
    return {
      success: sinDuplicados,
      empresasAntes: companiesPrueba.length,
      empresasDespues: resultado.companiesLimpias.length,
      duplicadosEliminados: resultado.duplicadosEliminados
    };
    
  } catch (error) {
    console.error('❌ ERROR EN SOLUCIÓN:', error);
    return { success: false, error: error.message };
  }
};

// Ejecutar la solución
console.log('🧪 EJECUTANDO TEST DE SOLUCIÓN DUPLICADOS "ACTIVA"');
console.log('='.repeat(60));

ejecutarSolucionCompleta()
  .then(resultado => {
    console.log('\n🎯 RESULTADO FINAL DEL TEST:');
    console.log(JSON.stringify(resultado, null, 2));
    
    if (resultado.success) {
      console.log('\n✅ ¡TEST EXITOSO! La solución funciona correctamente.');
      console.log('✅ Listo para aplicar en la app real.');
    } else {
      console.log('\n❌ Test falló:', resultado.error);
    }
  })
  .catch(error => {
    console.error('❌ Error en test:', error.message);
  });