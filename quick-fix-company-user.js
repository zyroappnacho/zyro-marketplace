/**
 * SOLUCIÓN RÁPIDA: Ejecuta este código en tu aplicación
 * Copia y pega en un componente o archivo temporal
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const fixEmpresaZyroUser = async () => {
  try {
    console.log('🔧 Corrigiendo usuario empresa@zyro.com...');
    
    // PASO 1: Corregir usuario actual
    const correctedUser = {
      id: 'company_zyro_001',
      email: 'empresa@zyro.com',
      userType: 'company', // ← ESTE ES EL CAMPO QUE FALTABA
      companyName: 'Prueba Perfil Empresa',
      name: 'Prueba Perfil Empresa',
      isActive: true,
      registrationDate: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    await AsyncStorage.setItem('currentUser', JSON.stringify(correctedUser));
    console.log('✅ Usuario corregido con userType: company');
    
    // PASO 2: Crear datos de empresa
    const companyData = {
      id: correctedUser.id,
      companyName: 'Prueba Perfil Empresa',
      companyEmail: 'empresa@zyro.com',
      city: 'Madrid',
      phone: '+34 600 000 000',
      selectedPlan: 'Plan 12 meses',
      status: 'active',
      lastSaved: new Date().toISOString()
    };

    await AsyncStorage.setItem(`company_${correctedUser.id}`, JSON.stringify(companyData));
    console.log('✅ Datos de empresa creados');
    
    // PASO 3: Crear campañas que coincidan con el nombre de empresa
    const campaigns = [
      {
        id: 1,
        title: 'Promoción Restaurante',
        business: 'Prueba Perfil Empresa', // ← DEBE COINCIDIR EXACTAMENTE
        category: 'restaurantes',
        city: 'Madrid',
        status: 'active',
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        title: 'Experiencia Spa',
        business: 'Prueba Perfil Empresa', // ← DEBE COINCIDIR EXACTAMENTE
        category: 'salud-belleza',
        city: 'Madrid',
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ];

    await AsyncStorage.setItem('admin_campaigns', JSON.stringify(campaigns));
    console.log('✅ Campañas creadas');
    
    // PASO 4: Crear solicitudes de ejemplo
    const requests = [
      {
        id: 1,
        collaborationId: 1,
        userId: 'user1',
        userName: 'Ana García',
        userInstagram: 'ana_garcia',
        status: 'pending',
        selectedDate: '2025-10-15',
        submittedAt: new Date().toISOString()
      },
      {
        id: 2,
        collaborationId: 2,
        userId: 'user2',
        userName: 'María López',
        userInstagram: 'maria_lopez',
        status: 'approved',
        selectedDate: '2025-10-20',
        submittedAt: new Date().toISOString()
      }
    ];

    await AsyncStorage.setItem('collaboration_requests', JSON.stringify(requests));
    console.log('✅ Solicitudes creadas');
    
    console.log('\n🎉 CORRECCIÓN COMPLETADA');
    console.log('Ahora reinicia la app y ve a "Solicitudes de Influencers"');
    
    return true;
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
};

// Para usar: importa y ejecuta fixEmpresaZyroUser();