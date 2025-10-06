// Script para inicializar usuario de empresa
import AsyncStorage from '@react-native-async-storage/async-storage';

export const initializeCompanyTestUser = async () => {
  try {
    console.log('🏢 Inicializando usuario de prueba de empresa...');
    
    const testCompanyUser = {
      id: 'company_test_001',
      email: 'empresa@zyro.com',
      password: 'empresa123',
      role: 'company',
      name: 'Empresa de Prueba ZYRO',
      companyName: 'Empresa de Prueba ZYRO',
      businessName: 'Empresa de Prueba ZYRO',
      subscriptionPlan: 'Plan de 6 meses',
      plan: '6months',
      status: 'approved',
      isActive: true,
      approvedAt: new Date().toISOString(),
      registrationDate: new Date().toISOString(),
      nextPaymentDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
      profileImage: null,
      paymentCompleted: true,
      firstPaymentCompleted: true
    };
    
    // Guardar usuario completo
    await AsyncStorage.setItem(`approved_user_${testCompanyUser.id}`, JSON.stringify(testCompanyUser));
    
    // Actualizar lista de usuarios aprobados
    const approvedUsers = await AsyncStorage.getItem('approvedUsersList');
    const existingUsers = approvedUsers ? JSON.parse(approvedUsers) : [];
    
    const testExists = existingUsers.find(u => u.email === 'empresa@zyro.com');
    if (!testExists) {
      existingUsers.push({
        id: testCompanyUser.id,
        email: testCompanyUser.email,
        role: testCompanyUser.role,
        name: testCompanyUser.name,
        approvedAt: testCompanyUser.approvedAt,
        isActive: testCompanyUser.isActive
      });
      
      await AsyncStorage.setItem('approvedUsersList', JSON.stringify(existingUsers));
    }
    
    console.log('✅ Usuario de empresa inicializado: empresa@zyro.com');
    return true;
  } catch (error) {
    console.error('❌ Error inicializando usuario de empresa:', error);
    return false;
  }
};