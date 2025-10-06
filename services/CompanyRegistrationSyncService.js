import AsyncStorage from '@react-native-async-storage/async-storage';
import StorageService from './StorageService';
import CompanyDataSyncService from './CompanyDataSyncService';

class CompanyRegistrationSyncService {
  constructor() {
    this.syncKey = 'company_registration_sync';
  }

  // Método principal para sincronizar datos al completar registro
  async syncCompanyRegistrationData(registrationData) {
    try {
      console.log('🔄 CompanyRegistrationSyncService: Iniciando sincronización de registro');
      console.log(`   📋 Empresa: ${registrationData.companyName}`);
      console.log(`   📧 Email: ${registrationData.companyEmail}`);
      
      const companyId = registrationData.id || registrationData.companyId || `company_${Date.now()}`;
      
      // PASO 1: Crear datos completos de empresa
      const completeCompanyData = {
        // ID y metadatos
        id: companyId,
        companyId: companyId,
        
        // Datos básicos de empresa (los 12 campos principales)
        companyName: registrationData.companyName || registrationData.name || 'Empresa ZYRO',
        cifNif: registrationData.cifNif || registrationData.taxId || 'B12345678',
        companyAddress: registrationData.companyAddress || registrationData.address || 'Dirección no especificada',
        companyPhone: registrationData.companyPhone || registrationData.phone || '+34 000 000 000',
        companyEmail: registrationData.companyEmail || registrationData.email || 'contacto@empresa.com',
        representativeName: registrationData.representativeName || registrationData.fullName || 'Representante Legal',
        representativeEmail: registrationData.representativeEmail || registrationData.email || registrationData.companyEmail,
        representativePosition: registrationData.representativePosition || registrationData.position || 'Director General',
        businessType: registrationData.businessType || 'Servicios Empresariales',
        businessDescription: registrationData.businessDescription || registrationData.description || 'Empresa de servicios profesionales',
        website: registrationData.website || 'https://www.empresa.com',
        
        // Datos de suscripción
        selectedPlan: registrationData.selectedPlan || registrationData.plan || 'Plan 6 Meses',
        planId: registrationData.planId || 'plan_6_months',
        monthlyAmount: registrationData.monthlyAmount || 399,
        totalAmount: registrationData.totalAmount || 2394,
        planDuration: registrationData.planDuration || 6,
        
        // Datos de pago
        paymentMethod: registrationData.paymentMethod || 'Tarjeta de Crédito',
        paymentMethodName: registrationData.paymentMethodName || 'Visa ****1234',
        
        // Estado y fechas
        status: registrationData.status || 'payment_completed',
        registrationDate: registrationData.registrationDate || new Date().toISOString(),
        firstPaymentCompletedDate: registrationData.firstPaymentCompletedDate || new Date().toISOString(),
        nextPaymentDate: registrationData.nextPaymentDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        
        // Metadatos de sincronización
        lastSaved: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        syncedFromRegistration: true,
        registrationSyncDate: new Date().toISOString(),
        version: '2.0',
        
        // Imagen de perfil si existe
        profileImage: registrationData.profileImage || null
      };
      
      console.log('💾 Guardando datos completos en múltiples ubicaciones...');
      
      // PASO 2: Guardar en datos directos de empresa
      const saveCompanyResult = await StorageService.saveCompanyData(completeCompanyData);
      console.log(`   ${saveCompanyResult ? '✅' : '❌'} Datos de empresa guardados`);
      
      // PASO 3: Guardar como usuario aprobado
      const approvedUserData = {
        ...completeCompanyData,
        role: 'company',
        email: completeCompanyData.companyEmail,
        password: registrationData.password || 'empresa123',
        name: completeCompanyData.companyName,
        fullName: completeCompanyData.representativeName,
        isActive: true,
        approvedAt: new Date().toISOString(),
        verified: true
      };
      
      const saveApprovedResult = await StorageService.saveApprovedUser(approvedUserData);
      console.log(`   ${saveApprovedResult ? '✅' : '❌'} Usuario aprobado guardado`);
      
      // PASO 4: Actualizar lista de empresas
      const companiesList = await StorageService.getCompaniesList();
      const existingIndex = companiesList.findIndex(c => c.id === companyId);
      
      const companyListEntry = {
        id: companyId,
        companyName: completeCompanyData.companyName,
        email: completeCompanyData.companyEmail,
        plan: completeCompanyData.selectedPlan,
        status: completeCompanyData.status,
        registrationDate: completeCompanyData.registrationDate,
        firstPaymentCompletedDate: completeCompanyData.firstPaymentCompletedDate,
        nextPaymentDate: completeCompanyData.nextPaymentDate,
        profileImage: completeCompanyData.profileImage,
        paymentMethodName: completeCompanyData.paymentMethodName,
        monthlyAmount: completeCompanyData.monthlyAmount
      };
      
      if (existingIndex >= 0) {
        companiesList[existingIndex] = companyListEntry;
      } else {
        companiesList.push(companyListEntry);
      }
      
      await AsyncStorage.setItem('companiesList', JSON.stringify(companiesList));
      console.log('   ✅ Lista de empresas actualizada');
      
      // PASO 5: Notificar cambios via servicio de sincronización
      await CompanyDataSyncService.notifyCompanyDataChange(
        companyId,
        completeCompanyData,
        'registration_sync'
      );
      console.log('   ✅ Notificación de sincronización enviada');
      
      // PASO 6: Guardar metadatos de sincronización
      const syncMetadata = {
        companyId: companyId,
        syncDate: new Date().toISOString(),
        originalData: registrationData,
        processedData: completeCompanyData,
        success: true,
        sourcesUpdated: ['company_data', 'approved_user', 'companies_list', 'sync_service']
      };
      
      await AsyncStorage.setItem(`${this.syncKey}_${companyId}`, JSON.stringify(syncMetadata));
      console.log('   ✅ Metadatos de sincronización guardados');
      
      console.log('🎉 CompanyRegistrationSyncService: Sincronización completada exitosamente');
      
      return {
        success: true,
        companyId: companyId,
        companyData: completeCompanyData,
        sourcesUpdated: syncMetadata.sourcesUpdated,
        message: 'Datos de empresa sincronizados en todas las fuentes'
      };
      
    } catch (error) {
      console.error('❌ CompanyRegistrationSyncService: Error en sincronización:', error);
      
      return {
        success: false,
        error: error.message,
        message: 'Error al sincronizar datos de empresa'
      };
    }
  }

  // Método para verificar si una empresa ya está sincronizada
  async isCompanySynced(companyId) {
    try {
      const syncMetadata = await AsyncStorage.getItem(`${this.syncKey}_${companyId}`);
      return !!syncMetadata;
    } catch (error) {
      console.error('Error verificando sincronización:', error);
      return false;
    }
  }

  // Método para forzar re-sincronización de una empresa
  async forceSyncCompany(companyId) {
    try {
      console.log(`🔄 Forzando re-sincronización para empresa: ${companyId}`);
      
      // Buscar datos existentes
      const companyData = await StorageService.getCompanyData(companyId);
      const approvedUser = await StorageService.getApprovedUser(companyId);
      
      if (companyData || approvedUser) {
        const dataToSync = companyData || approvedUser;
        return await this.syncCompanyRegistrationData(dataToSync);
      } else {
        console.log('❌ No se encontraron datos para re-sincronizar');
        return {
          success: false,
          message: 'No se encontraron datos para sincronizar'
        };
      }
    } catch (error) {
      console.error('Error en re-sincronización:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Método para sincronizar todas las empresas existentes
  async syncAllExistingCompanies() {
    try {
      console.log('🔄 Sincronizando todas las empresas existentes...');
      
      const companiesList = await StorageService.getCompaniesList();
      const approvedUsers = await StorageService.getApprovedUsersList();
      
      let syncedCount = 0;
      const results = [];
      
      // Sincronizar empresas de la lista
      for (const company of companiesList) {
        if (company.id) {
          const result = await this.forceSyncCompany(company.id);
          results.push(result);
          if (result.success) syncedCount++;
        }
      }
      
      // Sincronizar usuarios aprobados de tipo empresa
      for (const user of approvedUsers) {
        if (user.role === 'company' && user.id) {
          const alreadySynced = results.find(r => r.companyId === user.id);
          if (!alreadySynced) {
            const result = await this.forceSyncCompany(user.id);
            results.push(result);
            if (result.success) syncedCount++;
          }
        }
      }
      
      console.log(`✅ Sincronización masiva completada: ${syncedCount} empresas sincronizadas`);
      
      return {
        success: true,
        syncedCount: syncedCount,
        totalProcessed: results.length,
        results: results
      };
      
    } catch (error) {
      console.error('Error en sincronización masiva:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Método para limpiar datos de sincronización antiguos
  async cleanupOldSyncData(maxAgeHours = 168) { // 7 días por defecto
    try {
      console.log(`🧹 Limpiando datos de sincronización antiguos (>${maxAgeHours}h)`);
      
      const keys = await AsyncStorage.getAllKeys();
      const syncKeys = keys.filter(key => key.startsWith(this.syncKey));
      
      let cleanedCount = 0;
      const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);
      
      for (const key of syncKeys) {
        try {
          const data = await AsyncStorage.getItem(key);
          if (data) {
            const parsedData = JSON.parse(data);
            const syncTime = new Date(parsedData.syncDate).getTime();
            
            if (syncTime < cutoffTime) {
              await AsyncStorage.removeItem(key);
              cleanedCount++;
            }
          }
        } catch (error) {
          console.error(`Error procesando clave ${key}:`, error);
        }
      }
      
      console.log(`✅ ${cleanedCount} registros de sincronización antiguos eliminados`);
      return cleanedCount;
      
    } catch (error) {
      console.error('Error limpiando datos antiguos:', error);
      return 0;
    }
  }
}

// Crear instancia singleton
const companyRegistrationSyncService = new CompanyRegistrationSyncService();

export default companyRegistrationSyncService;