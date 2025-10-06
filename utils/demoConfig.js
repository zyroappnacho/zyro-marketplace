
// Configuración automática de datos de empresa para demo
// Este archivo es generado automáticamente por setup-company-subscription-demo.js

export const demoCompanyData = {
  "id": "company_test_001",
  "companyName": "Empresa de Prueba ZYRO",
  "businessName": "Empresa de Prueba ZYRO",
  "companyEmail": "empresa@zyro.com",
  "companyPhone": "+34 600 123 456",
  "status": "payment_completed",
  "registrationDate": "2025-09-23T10:11:15.415Z",
  "firstPaymentCompletedDate": "2025-09-24T10:11:15.435Z",
  "selectedPlan": "Plan 6 Meses",
  "planId": "6-months",
  "monthlyAmount": 399,
  "totalAmount": 2394,
  "planDuration": 6,
  "paymentMethodName": "Tarjeta de Crédito",
  "nextBillingDate": "2025-10-25T10:11:15.435Z"
};

export const demoSubscriptionData = {
  "userId": "company_test_001",
  "plan": {
    "id": "6-months",
    "name": "Plan 6 Meses",
    "price": 399,
    "duration": 6,
    "totalPrice": 2394,
    "description": "Ideal para estrategias a medio plazo",
    "recommended": true
  },
  "paymentMethod": {
    "id": "credit-card",
    "name": "Tarjeta de Crédito",
    "icon": "card",
    "description": "Visa, Mastercard, American Express"
  },
  "updatedAt": "2025-09-25T10:11:15.435Z",
  "nextBillingDate": "2025-10-25T10:11:15.435Z"
};

// Función para inicializar datos de demo en la aplicación
export const initializeDemoData = async () => {
  try {
    const StorageService = require('../services/StorageService').default;
    
    console.log('🔧 Inicializando datos de empresa demo...');
    
    // Guardar datos de empresa
    await StorageService.saveCompanyData(demoCompanyData);
    console.log('✅ Datos de empresa guardados');
    
    // Guardar datos de suscripción
    await StorageService.saveCompanySubscription(demoSubscriptionData);
    console.log('✅ Datos de suscripción guardados');
    
    // Actualizar lista de empresas
    const companiesList = await StorageService.getCompaniesList();
    const existingCompanyIndex = companiesList.findIndex(c => c.id === demoCompanyData.id);
    
    if (existingCompanyIndex >= 0) {
      companiesList[existingCompanyIndex] = {
        id: demoCompanyData.id,
        companyName: demoCompanyData.companyName,
        email: demoCompanyData.companyEmail,
        plan: demoCompanyData.selectedPlan,
        status: demoCompanyData.status,
        registrationDate: demoCompanyData.registrationDate,
        firstPaymentCompletedDate: demoCompanyData.firstPaymentCompletedDate,
        nextPaymentDate: demoCompanyData.nextBillingDate,
        monthlyAmount: demoCompanyData.monthlyAmount,
        paymentMethodName: demoCompanyData.paymentMethodName
      };
    } else {
      companiesList.push({
        id: demoCompanyData.id,
        companyName: demoCompanyData.companyName,
        email: demoCompanyData.companyEmail,
        plan: demoCompanyData.selectedPlan,
        status: demoCompanyData.status,
        registrationDate: demoCompanyData.registrationDate,
        firstPaymentCompletedDate: demoCompanyData.firstPaymentCompletedDate,
        nextPaymentDate: demoCompanyData.nextBillingDate,
        monthlyAmount: demoCompanyData.monthlyAmount,
        paymentMethodName: demoCompanyData.paymentMethodName
      });
    }
    
    await StorageService.saveData('companiesList', companiesList);
    console.log('✅ Lista de empresas actualizada');
    
    return true;
  } catch (error) {
    console.error('❌ Error inicializando datos demo:', error);
    return false;
  }
};
