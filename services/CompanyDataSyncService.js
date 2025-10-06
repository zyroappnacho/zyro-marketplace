import AsyncStorage from '@react-native-async-storage/async-storage';

class CompanyDataSyncService {
  constructor() {
    this.syncKey = 'company_data_sync';
    this.listeners = new Map();
    this.eventListeners = new Map();
    this.isInitialized = false;
    
    this.initialize();
  }

  async initialize() {
    if (this.isInitialized) return;
    
    console.log('🔄 CompanyDataSyncService: Inicializando servicio de sincronización');
    
    // Configurar listener para cambios en AsyncStorage
    this.startSyncListener();
    this.isInitialized = true;
    
    console.log('✅ CompanyDataSyncService: Servicio inicializado');
  }

  // Método para notificar cambios en datos de empresa
  async notifyCompanyDataChange(companyId, updatedData, source = 'unknown') {
    try {
      console.log(`📢 CompanyDataSyncService: Notificando cambio en empresa ${companyId} desde ${source}`);
      
      const syncData = {
        companyId,
        updatedData,
        source,
        timestamp: new Date().toISOString(),
        syncId: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      // Guardar en AsyncStorage para sincronización
      await AsyncStorage.setItem(`${this.syncKey}_${companyId}`, JSON.stringify(syncData));
      
      // Emitir evento para listeners activos
      this.emitEvent('companyDataChanged', syncData);
      
      console.log(`✅ CompanyDataSyncService: Cambio notificado exitosamente (${syncData.syncId})`);
      
      return true;
    } catch (error) {
      console.error('❌ CompanyDataSyncService: Error notificando cambio:', error);
      return false;
    }
  }

  // Método para suscribirse a cambios de una empresa específica
  subscribeToCompanyChanges(companyId, callback, componentName = 'unknown') {
    console.log(`🔔 CompanyDataSyncService: ${componentName} suscribiéndose a cambios de empresa ${companyId}`);
    
    const listenerId = `${componentName}_${companyId}_${Date.now()}`;
    
    // Crear listener específico para esta empresa
    const listener = (syncData) => {
      if (syncData.companyId === companyId) {
        console.log(`📨 CompanyDataSyncService: Enviando actualización a ${componentName} para empresa ${companyId}`);
        callback(syncData);
      }
    };

    // Registrar listener
    this.addEventListener('companyDataChanged', listener);
    this.listeners.set(listenerId, { listener, companyId, componentName });
    
    console.log(`✅ CompanyDataSyncService: ${componentName} suscrito exitosamente (${listenerId})`);
    
    // Retornar función para desuscribirse
    return () => {
      console.log(`🔕 CompanyDataSyncService: ${componentName} desuscribiéndose (${listenerId})`);
      this.removeEventListener('companyDataChanged', listener);
      this.listeners.delete(listenerId);
    };
  }

  // Método para obtener los datos más recientes de una empresa
  async getLatestCompanyData(companyId) {
    try {
      console.log(`📋 CompanyDataSyncService: Obteniendo datos más recientes de empresa ${companyId}`);
      
      // Obtener datos principales
      const companyData = await AsyncStorage.getItem(`company_${companyId}`);
      
      if (!companyData) {
        console.log(`⚠️ CompanyDataSyncService: No se encontraron datos para empresa ${companyId}`);
        return null;
      }

      const parsedData = JSON.parse(companyData);
      
      // Verificar si hay datos de sincronización más recientes
      const syncData = await AsyncStorage.getItem(`${this.syncKey}_${companyId}`);
      
      if (syncData) {
        const parsedSyncData = JSON.parse(syncData);
        const syncTimestamp = new Date(parsedSyncData.timestamp).getTime();
        const dataTimestamp = new Date(parsedData.lastSaved || parsedData.lastUpdated || 0).getTime();
        
        // Si los datos de sincronización son más recientes, usar esos
        if (syncTimestamp > dataTimestamp) {
          console.log(`🔄 CompanyDataSyncService: Usando datos de sincronización más recientes`);
          return {
            ...parsedData,
            ...parsedSyncData.updatedData,
            lastSyncUpdate: parsedSyncData.timestamp,
            syncSource: parsedSyncData.source
          };
        }
      }
      
      console.log(`✅ CompanyDataSyncService: Datos obtenidos exitosamente`);
      return parsedData;
    } catch (error) {
      console.error('❌ CompanyDataSyncService: Error obteniendo datos:', error);
      return null;
    }
  }

  // Método para validar integridad de datos de empresa
  async validateCompanyDataIntegrity(companyId) {
    try {
      console.log(`🔍 CompanyDataSyncService: Validando integridad de datos para empresa ${companyId}`);
      
      const data = await this.getLatestCompanyData(companyId);
      
      if (!data) {
        return { isValid: false, errors: ['No se encontraron datos'] };
      }

      const errors = [];
      const requiredFields = {
        'companyName': 'Nombre de la empresa',
        'cifNif': 'CIF/NIF',
        'companyAddress': 'Dirección',
        'companyPhone': 'Teléfono',
        'companyEmail': 'Email corporativo',
        'representativeName': 'Nombre del representante',
        'representativeEmail': 'Email del representante',
        'representativePosition': 'Cargo del representante',
        'businessType': 'Tipo de negocio',
        'businessDescription': 'Descripción del negocio',
        'website': 'Sitio web'
      };

      // Validar campos requeridos
      Object.entries(requiredFields).forEach(([field, label]) => {
        if (!data[field] || !data[field].trim()) {
          errors.push(`${label} está vacío`);
        }
      });

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (data.companyEmail && !emailRegex.test(data.companyEmail)) {
        errors.push('Email corporativo tiene formato inválido');
      }
      if (data.representativeEmail && !emailRegex.test(data.representativeEmail)) {
        errors.push('Email del representante tiene formato inválido');
      }

      // Validar URL del sitio web
      if (data.website && !data.website.startsWith('http')) {
        errors.push('Sitio web debe comenzar con http:// o https://');
      }

      const isValid = errors.length === 0;
      
      console.log(`${isValid ? '✅' : '⚠️'} CompanyDataSyncService: Validación completada - ${errors.length} errores encontrados`);
      
      return { isValid, errors, data };
    } catch (error) {
      console.error('❌ Error validando integridad:', error);
      return { isValid: false, errors: ['Error interno de validación'] };
    }
  }

  // Método para forzar sincronización entre pantallas
  async forceSyncCompanyData(companyId) {
    try {
      console.log(`🔄 CompanyDataSyncService: Forzando sincronización para empresa ${companyId}`);
      
      const latestData = await this.getLatestCompanyData(companyId);
      
      if (latestData) {
        await this.notifyCompanyDataChange(companyId, latestData, 'force_sync');
        console.log(`✅ CompanyDataSyncService: Sincronización forzada completada`);
        return true;
      } else {
        console.log(`⚠️ CompanyDataSyncService: No se pudieron obtener datos para sincronización forzada`);
        return false;
      }
    } catch (error) {
      console.error('❌ CompanyDataSyncService: Error en sincronización forzada:', error);
      return false;
    }
  }

  // Método para limpiar datos de sincronización antiguos
  async cleanupOldSyncData(maxAgeHours = 24) {
    try {
      console.log(`🧹 CompanyDataSyncService: Limpiando datos de sincronización antiguos (>${maxAgeHours}h)`);
      
      const keys = await AsyncStorage.getAllKeys();
      const syncKeys = keys.filter(key => key.startsWith(this.syncKey));
      
      let cleanedCount = 0;
      const cutoffTime = Date.now() - (maxAgeHours * 60 * 60 * 1000);
      
      for (const key of syncKeys) {
        try {
          const data = await AsyncStorage.getItem(key);
          if (data) {
            const parsedData = JSON.parse(data);
            const dataTime = new Date(parsedData.timestamp).getTime();
            
            if (dataTime < cutoffTime) {
              await AsyncStorage.removeItem(key);
              cleanedCount++;
            }
          }
        } catch (error) {
          console.error(`Error procesando clave ${key}:`, error);
        }
      }
      
      console.log(`✅ CompanyDataSyncService: ${cleanedCount} registros de sincronización antiguos eliminados`);
      return cleanedCount;
    } catch (error) {
      console.error('❌ CompanyDataSyncService: Error limpiando datos antiguos:', error);
      return 0;
    }
  }

  // Método para verificar el estado de sincronización
  async getSyncStatus(companyId) {
    try {
      console.log(`📊 CompanyDataSyncService: Verificando estado de sincronización para empresa ${companyId}`);
      
      const companyData = await AsyncStorage.getItem(`company_${companyId}`);
      const syncData = await AsyncStorage.getItem(`${this.syncKey}_${companyId}`);
      
      const status = {
        companyId,
        hasCompanyData: !!companyData,
        hasSyncData: !!syncData,
        lastCompanyUpdate: null,
        lastSyncUpdate: null,
        isInSync: false,
        activeListeners: Array.from(this.listeners.values()).filter(l => l.companyId === companyId).length
      };

      if (companyData) {
        const parsedCompanyData = JSON.parse(companyData);
        status.lastCompanyUpdate = parsedCompanyData.lastSaved || parsedCompanyData.lastUpdated;
      }

      if (syncData) {
        const parsedSyncData = JSON.parse(syncData);
        status.lastSyncUpdate = parsedSyncData.timestamp;
      }

      // Determinar si están sincronizados
      if (status.lastCompanyUpdate && status.lastSyncUpdate) {
        const companyTime = new Date(status.lastCompanyUpdate).getTime();
        const syncTime = new Date(status.lastSyncUpdate).getTime();
        status.isInSync = Math.abs(companyTime - syncTime) < 5000; // 5 segundos de tolerancia
      } else if (!status.lastSyncUpdate && status.lastCompanyUpdate) {
        status.isInSync = true; // Solo datos de empresa, considerado sincronizado
      }

      console.log(`✅ CompanyDataSyncService: Estado de sincronización obtenido`);
      return status;
    } catch (error) {
      console.error('❌ CompanyDataSyncService: Error obteniendo estado de sincronización:', error);
      return null;
    }
  }

  // Método privado para iniciar el listener de sincronización
  startSyncListener() {
    // En React Native, no hay un listener directo para AsyncStorage
    // Pero podemos usar un polling ligero o eventos manuales
    console.log('🔄 CompanyDataSyncService: Listener de sincronización iniciado');
  }

  // Método para obtener estadísticas del servicio
  getServiceStats() {
    return {
      isInitialized: this.isInitialized,
      activeListeners: this.listeners.size,
      listenerDetails: Array.from(this.listeners.entries()).map(([id, info]) => ({
        id,
        componentName: info.componentName,
        companyId: info.companyId
      }))
    };
  }

  // Métodos para manejar eventos manualmente (reemplazo de EventEmitter)
  addEventListener(eventName, listener) {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    this.eventListeners.get(eventName).push(listener);
  }

  removeEventListener(eventName, listener) {
    if (this.eventListeners.has(eventName)) {
      const listeners = this.eventListeners.get(eventName);
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emitEvent(eventName, data) {
    if (this.eventListeners.has(eventName)) {
      const listeners = this.eventListeners.get(eventName);
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error('Error ejecutando listener:', error);
        }
      });
    }
  }

  removeAllEventListeners() {
    this.eventListeners.clear();
  }

  // Método para destruir el servicio
  destroy() {
    console.log('🔄 CompanyDataSyncService: Destruyendo servicio');
    
    // Remover todos los listeners
    this.removeAllEventListeners();
    this.listeners.clear();
    this.isInitialized = false;
    
    console.log('✅ CompanyDataSyncService: Servicio destruido');
  }
}

// Crear instancia singleton
const companyDataSyncService = new CompanyDataSyncService();

export default companyDataSyncService;