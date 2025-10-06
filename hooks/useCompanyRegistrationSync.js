import { useEffect, useCallback } from 'react';
import CompanyRegistrationSyncService from '../services/CompanyRegistrationSyncService';
import StorageService from '../services/StorageService';

/**
 * Hook para sincronización automática de datos de empresa
 * Se ejecuta cuando se completa el registro de una empresa
 */
export const useCompanyRegistrationSync = () => {
  
  // Función para sincronizar datos de empresa recién registrada
  const syncNewCompanyRegistration = useCallback(async (registrationData) => {
    try {
      console.log('🔄 useCompanyRegistrationSync: Iniciando sincronización automática');
      
      const result = await CompanyRegistrationSyncService.syncCompanyRegistrationData(registrationData);
      
      if (result.success) {
        console.log('✅ useCompanyRegistrationSync: Sincronización exitosa');
        console.log(`   📊 Empresa: ${result.companyData.companyName}`);
        console.log(`   🔗 Fuentes actualizadas: ${result.sourcesUpdated.join(', ')}`);
        
        return {
          success: true,
          companyId: result.companyId,
          message: 'Empresa sincronizada correctamente'
        };
      } else {
        console.error('❌ useCompanyRegistrationSync: Error en sincronización:', result.error);
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      console.error('❌ useCompanyRegistrationSync: Error inesperado:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }, []);

  // Función para verificar y sincronizar empresas existentes
  const syncExistingCompanies = useCallback(async () => {
    try {
      console.log('🔄 useCompanyRegistrationSync: Verificando empresas existentes');
      
      const result = await CompanyRegistrationSyncService.syncAllExistingCompanies();
      
      if (result.success) {
        console.log('✅ useCompanyRegistrationSync: Empresas existentes sincronizadas');
        console.log(`   📊 Total procesadas: ${result.totalProcessed}`);
        console.log(`   ✅ Sincronizadas: ${result.syncedCount}`);
        
        return result;
      } else {
        console.error('❌ useCompanyRegistrationSync: Error sincronizando empresas existentes:', result.error);
        return result;
      }
    } catch (error) {
      console.error('❌ useCompanyRegistrationSync: Error inesperado:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }, []);

  // Función para forzar sincronización de una empresa específica
  const forceSyncCompany = useCallback(async (companyId) => {
    try {
      console.log(`🔄 useCompanyRegistrationSync: Forzando sincronización para ${companyId}`);
      
      const result = await CompanyRegistrationSyncService.forceSyncCompany(companyId);
      
      if (result.success) {
        console.log('✅ useCompanyRegistrationSync: Sincronización forzada exitosa');
        return result;
      } else {
        console.error('❌ useCompanyRegistrationSync: Error en sincronización forzada:', result.error);
        return result;
      }
    } catch (error) {
      console.error('❌ useCompanyRegistrationSync: Error inesperado:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }, []);

  // Función para verificar si una empresa está sincronizada
  const checkCompanySync = useCallback(async (companyId) => {
    try {
      const isSynced = await CompanyRegistrationSyncService.isCompanySynced(companyId);
      console.log(`📊 useCompanyRegistrationSync: Empresa ${companyId} ${isSynced ? 'está' : 'NO está'} sincronizada`);
      return isSynced;
    } catch (error) {
      console.error('❌ useCompanyRegistrationSync: Error verificando sincronización:', error);
      return false;
    }
  }, []);

  // Función para limpiar datos antiguos
  const cleanupOldData = useCallback(async (maxAgeHours = 168) => {
    try {
      console.log('🧹 useCompanyRegistrationSync: Limpiando datos antiguos');
      
      const cleanedCount = await CompanyRegistrationSyncService.cleanupOldSyncData(maxAgeHours);
      
      console.log(`✅ useCompanyRegistrationSync: ${cleanedCount} registros antiguos eliminados`);
      return cleanedCount;
    } catch (error) {
      console.error('❌ useCompanyRegistrationSync: Error limpiando datos:', error);
      return 0;
    }
  }, []);

  // Función para obtener estadísticas de sincronización
  const getSyncStats = useCallback(async () => {
    try {
      const companiesList = await StorageService.getCompaniesList();
      const approvedUsers = await StorageService.getApprovedUsersList();
      const companyUsers = approvedUsers.filter(user => user.role === 'company');
      
      let syncedCount = 0;
      for (const company of companiesList) {
        const isSynced = await CompanyRegistrationSyncService.isCompanySynced(company.id);
        if (isSynced) syncedCount++;
      }
      
      const stats = {
        totalCompanies: companiesList.length,
        totalCompanyUsers: companyUsers.length,
        syncedCompanies: syncedCount,
        unsyncedCompanies: companiesList.length - syncedCount,
        syncPercentage: companiesList.length > 0 ? Math.round((syncedCount / companiesList.length) * 100) : 0
      };
      
      console.log('📊 useCompanyRegistrationSync: Estadísticas de sincronización:', stats);
      return stats;
    } catch (error) {
      console.error('❌ useCompanyRegistrationSync: Error obteniendo estadísticas:', error);
      return {
        totalCompanies: 0,
        totalCompanyUsers: 0,
        syncedCompanies: 0,
        unsyncedCompanies: 0,
        syncPercentage: 0
      };
    }
  }, []);

  // Auto-sincronización al montar el hook (opcional)
  useEffect(() => {
    const autoSync = async () => {
      try {
        // Verificar si hay empresas no sincronizadas
        const stats = await getSyncStats();
        
        if (stats.unsyncedCompanies > 0) {
          console.log(`🔄 useCompanyRegistrationSync: ${stats.unsyncedCompanies} empresas no sincronizadas detectadas`);
          console.log('   Ejecutando sincronización automática...');
          
          await syncExistingCompanies();
        } else {
          console.log('✅ useCompanyRegistrationSync: Todas las empresas están sincronizadas');
        }
      } catch (error) {
        console.error('❌ useCompanyRegistrationSync: Error en auto-sincronización:', error);
      }
    };

    // Ejecutar auto-sincronización después de un pequeño delay
    const timeoutId = setTimeout(autoSync, 2000);
    
    return () => clearTimeout(timeoutId);
  }, [getSyncStats, syncExistingCompanies]);

  return {
    // Funciones principales
    syncNewCompanyRegistration,
    syncExistingCompanies,
    forceSyncCompany,
    
    // Funciones de utilidad
    checkCompanySync,
    cleanupOldData,
    getSyncStats
  };
};

export default useCompanyRegistrationSync;