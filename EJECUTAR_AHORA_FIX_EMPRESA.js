/**
 * 🚀 EJECUTAR INMEDIATAMENTE - Corrección Usuario Empresa
 * 
 * INSTRUCCIONES:
 * 1. Copia TODO este código
 * 2. Pégalo en un archivo temporal en tu proyecto (ej: temp-fix.js)
 * 3. Importa AsyncStorage en la parte superior
 * 4. Ejecuta la función fixEmpresaUser()
 * 5. Reinicia la app
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const fixEmpresaUser = async () => {
  try {
    console.log('🔧 INICIANDO CORRECCIÓN DE USUARIO EMPRESA...');
    
    // ========================================
    // 1. CORREGIR USUARIO ACTUAL
    // ========================================
    const correctedUser = {
      id: 'company_zyro_001',
      email: 'empresa@zyro.com',
      userType: 'company', // ← ESTE ES EL CAMPO QUE FALTABA
      companyName: 'Prueba Perfil Empresa',
      name: 'Prueba Perfil Empresa',
      profileImage: null,
      isActive: true,
      registrationDate: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      companyEmail: 'empresa@zyro.com',
      businessType: 'restaurante',
      city: 'Madrid',
      phone: '+34 600 000 000',
      status: 'active'
    };

    await AsyncStorage.setItem('currentUser', JSON.stringify(correctedUser));
    console.log('✅ 1/4 Usuario corregido con userType: company');
    
    // ========================================
    // 2. CREAR DATOS COMPLETOS DE EMPRESA
    // ========================================
    const companyData = {
      id: 'company_zyro_001',
      companyName: 'Prueba Perfil Empresa',
      companyEmail: 'empresa@zyro.com',
      businessType: 'restaurante',
      city: 'Madrid',
      address: 'Calle Gran Vía, 1, Madrid',
      phone: '+34 600 000 000',
      description: 'Empresa de prueba para testing',
      profileImage: null,
      selectedPlan: 'Plan 12 meses',
      monthlyAmount: 99.99,
      paymentMethodName: 'Tarjeta **** 1234',
      registrationDate: new Date().toISOString(),
      status: 'active',
      lastSaved: new Date().toISOString(),
      version: '2.0'
    };

    await AsyncStorage.setItem('company_company_zyro_001', JSON.stringify(companyData));
    console.log('✅ 2/4 Datos completos de empresa creados');
    
    // ========================================
    // 3. CREAR CAMPAÑAS DEL ADMIN
    // ========================================
    const adminCampaigns = [
      {
        id: 1,
        title: 'Promoción Restaurante Italiano',
        business: 'Prueba Perfil Empresa', // ← DEBE COINCIDIR EXACTAMENTE
        category: 'restaurantes',
        city: 'Madrid',
        description: 'Promoción de nuestro nuevo menú italiano',
        minFollowers: 1000,
        requirements: 'Mínimo 1K seguidores en Instagram',
        whatIncludes: 'Cena completa para 2 personas',
        contentRequired: '2 stories + 1 post en feed',
        deadline: '48 horas después de la experiencia',
        address: 'Calle Gran Vía, 1, Madrid',
        phone: '+34 600 000 000',
        email: 'empresa@zyro.com',
        availableDates: ['2025-10-15', '2025-10-16', '2025-10-17'],
        availableTimes: ['13:00', '14:00', '20:00', '21:00'],
        status: 'active',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Experiencia Spa y Relajación',
        business: 'Prueba Perfil Empresa', // ← DEBE COINCIDIR EXACTAMENTE
        category: 'salud-belleza',
        city: 'Madrid',
        description: 'Experiencia completa de relajación',
        minFollowers: 2000,
        requirements: 'Mínimo 2K seguidores, contenido de bienestar',
        whatIncludes: 'Masaje relajante + acceso a instalaciones',
        contentRequired: '3 stories + 1 reel',
        deadline: '24 horas después de la experiencia',
        address: 'Calle Serrano, 50, Madrid',
        phone: '+34 600 000 001',
        email: 'spa@pruebaperfilempresa.com',
        availableDates: ['2025-10-20', '2025-10-21', '2025-10-22'],
        availableTimes: ['10:00', '11:00', '16:00', '17:00'],
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ];

    await AsyncStorage.setItem('admin_campaigns', JSON.stringify(adminCampaigns));
    console.log('✅ 3/4 Campañas del admin creadas (2 para "Prueba Perfil Empresa")');
    
    // ========================================
    // 4. CREAR SOLICITUDES DE COLABORACIÓN
    // ========================================
    const collaborationRequests = [
      {
        id: 1,
        collaborationId: 1, // Campaña "Promoción Restaurante Italiano"
        userId: 'influencer_001',
        userName: 'Ana García',
        userEmail: 'ana@example.com',
        userInstagram: 'ana_garcia_food', // Sin @ inicial
        userFollowers: '15K',
        userCity: 'Madrid',
        status: 'pending',
        selectedDate: '2025-10-15',
        selectedTime: '14:00',
        message: 'Me encantaría colaborar con vuestro restaurante.',
        submittedAt: new Date().toISOString()
      },
      {
        id: 2,
        collaborationId: 2, // Campaña "Experiencia Spa y Relajación"
        userId: 'influencer_002',
        userName: 'María Rodríguez',
        userEmail: 'maria@example.com',
        userInstagram: '@maria_wellness', // Con @ inicial
        userFollowers: '12K',
        userCity: 'Madrid',
        status: 'approved',
        selectedDate: '2025-10-20',
        selectedTime: '11:00',
        message: 'El spa se ve increíble.',
        submittedAt: new Date().toISOString(),
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'admin'
      },
      {
        id: 3,
        collaborationId: 1, // Otra solicitud para "Promoción Restaurante Italiano"
        userId: 'influencer_003',
        userName: 'Pedro Martín',
        userEmail: 'pedro@example.com',
        userInstagram: 'pedro_foodie', // Sin @ inicial
        userFollowers: '20K',
        userCity: 'Madrid',
        status: 'pending',
        selectedDate: '2025-10-16',
        selectedTime: '21:00',
        message: 'Soy foodie especializado en restaurantes italianos.',
        submittedAt: new Date().toISOString()
      }
    ];

    await AsyncStorage.setItem('collaboration_requests', JSON.stringify(collaborationRequests));
    console.log('✅ 4/4 Solicitudes de colaboración creadas (3 para "Prueba Perfil Empresa")');
    
    // ========================================
    // VERIFICACIÓN
    // ========================================
    console.log('\n🎉 CORRECCIÓN COMPLETADA EXITOSAMENTE');
    console.log('📊 Resumen:');
    console.log('   ✅ Usuario: empresa@zyro.com (userType: company)');
    console.log('   ✅ Empresa: "Prueba Perfil Empresa"');
    console.log('   ✅ Campañas: 2 (ambas para "Prueba Perfil Empresa")');
    console.log('   ✅ Solicitudes: 3 (todas para "Prueba Perfil Empresa")');
    
    console.log('\n📱 PRÓXIMOS PASOS:');
    console.log('1. Reinicia la aplicación completamente');
    console.log('2. Inicia sesión con empresa@zyro.com');
    console.log('3. Ve a "Control Total de la Empresa" → "Solicitudes de Influencers"');
    console.log('4. Deberías ver 3 solicitudes sin el error');
    
    return true;
    
  } catch (error) {
    console.error('❌ ERROR DURANTE LA CORRECCIÓN:', error);
    return false;
  }
};

// ========================================
// PARA USAR INMEDIATAMENTE:
// ========================================

// Opción 1: Ejecutar directamente
// fixEmpresaUser();

// Opción 2: Exportar para usar en otro componente
// export { fixEmpresaUser };

// Opción 3: Ejecutar con confirmación
const ejecutarCorreccion = async () => {
  console.log('⚠️ ¿Estás seguro de que quieres corregir el usuario empresa@zyro.com?');
  console.log('Esto sobrescribirá los datos existentes.');
  
  // En una app real, mostrarías un Alert aquí
  const success = await fixEmpresaUser();
  
  if (success) {
    console.log('🎉 ¡Corrección exitosa! Reinicia la app.');
  } else {
    console.log('💥 Error en la corrección. Revisa los logs.');
  }
};

// Descomenta la siguiente línea para ejecutar automáticamente:
// ejecutarCorreccion();

console.log('📋 ARCHIVO LISTO PARA USAR');
console.log('Copia este código y ejecútalo en tu aplicación React Native.');