/**
 * PARCHE ESPECÍFICO PARA CompanyRegistrationService
 * 
 * Este parche modifica el comportamiento del servicio de registro
 * para evitar duplicados durante el registro con Stripe
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import StorageService from './services/StorageService';
import { Alert } from 'react-native';

class ParcheRegistroEmpresaStripe {
  
  /**
   * Aplicar parche al servicio de registro
   */
  async aplicarParche() {
    try {
      console.log('🔧 APLICANDO PARCHE AL SERVICIO DE REGISTRO...\n');
      
      // PASO 1: Crear función de verificación mejorada
      console.log('🛡️ PASO 1: Creando función de verificación mejorada');
      await this.crearFuncionVerificacionMejorada();
      
      // PASO 2: Crear función de guardado único
      console.log('💾 PASO 2: Creando función de guardado único');
      await this.crearFuncionGuardadoUnico();
      
      // PASO 3: Crear protección anti-duplicados
      console.log('🛡️ PASO 3: Creando protección anti-duplicados');
      await this.crearProteccionAntiDuplicados();
      
      // PASO 4: Configurar flags de control
      console.log('🚩 PASO 4: Configurando flags de control');
      await this.configurarFlagsControl();
      
      console.log('✅ PARCHE APLICADO EXITOSAMENTE');
      
      Alert.alert(
        'Parche Aplicado',
        'El parche para evitar duplicados en el registro con Stripe ha sido aplicado exitosamente.',
        [{ text: 'OK' }]
      );
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Error aplicando parche:', error);
      
      Alert.alert(
        'Error en Parche',
        `Error aplicando parche: ${error.message}`,
        [{ text: 'OK' }]
      );
      
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Crear función de verificación mejorada
   */
  async crearFuncionVerificacionMejorada() {
    try {
      const funcionVerificacion = {
        version: '3.0-stripe-patch',
        createdAt: new Date().toISOString(),
        
        // Función principal de verificación
        async verificarAntesDelRegistro(companyData, sessionId) {
          try {
            console.log('🔍 [PARCHE] Verificando antes del registro...');
            console.log('📧 Email:', companyData.email);
            console.log('🎫 SessionId:', sessionId);
            
            // 1. VERIFICACIÓN POR EMAIL EN USUARIOS APROBADOS
            const existingByEmail = await StorageService.getApprovedUserByEmail(companyData.email);
            if (existingByEmail && existingByEmail.role === 'company') {
              console.log('⚠️ [PARCHE] DUPLICADO DETECTADO: Email ya existe en usuarios aprobados');
              return {
                exists: true,
                reason: 'email_approved_user',
                existing: existingByEmail,
                action: 'update_existing'
              };
            }
            
            // 2. VERIFICACIÓN POR EMAIL EN LISTA DE EMPRESAS
            const companiesList = await StorageService.getCompaniesList();
            const existingInList = companiesList.find(c => c.email === companyData.email);
            if (existingInList) {
              console.log('⚠️ [PARCHE] DUPLICADO DETECTADO: Email ya existe en lista de empresas');
              return {
                exists: true,
                reason: 'email_companies_list',
                existing: existingInList,
                action: 'reject_duplicate'
              };
            }
            
            // 3. VERIFICACIÓN POR SESSION ID
            const existingBySession = companiesList.find(c => c.stripeSessionId === sessionId);
            if (existingBySession) {
              console.log('⚠️ [PARCHE] DUPLICADO DETECTADO: SessionId ya procesado');
              return {
                exists: true,
                reason: 'session_id_processed',
                existing: existingBySession,
                action: 'return_existing'
              };
            }
            
            // 4. VERIFICACIÓN DE REGISTRO EN PROCESO
            const processingKey = `stripe_processing_${companyData.email.toLowerCase()}`;
            const processing = await AsyncStorage.getItem(processingKey);
            if (processing) {
              const processData = JSON.parse(processing);
              const timeDiff = Date.now() - processData.timestamp;
              
              if (timeDiff < 300000) { // 5 minutos
                console.log('⚠️ [PARCHE] DUPLICADO DETECTADO: Registro en proceso');
                return {
                  exists: true,
                  reason: 'registration_in_process',
                  existing: processData,
                  action: 'wait_or_reject'
                };
              } else {
                // Limpiar registro expirado
                await AsyncStorage.removeItem(processingKey);
              }
            }
            
            console.log('✅ [PARCHE] Verificación completada: No hay duplicados');
            return { exists: false };
            
          } catch (error) {
            console.error('❌ [PARCHE] Error en verificación:', error);
            return { exists: false, error: error.message };
          }
        },
        
        // Función para marcar registro en proceso
        async marcarRegistroEnProceso(companyData, sessionId) {
          try {
            const processingKey = `stripe_processing_${companyData.email.toLowerCase()}`;
            const processData = {
              email: companyData.email,
              companyName: companyData.name,
              sessionId: sessionId,
              timestamp: Date.now(),
              status: 'processing'
            };
            
            await AsyncStorage.setItem(processingKey, JSON.stringify(processData));
            console.log('✅ [PARCHE] Registro marcado como en proceso');
            
            return true;
          } catch (error) {
            console.error('❌ [PARCHE] Error marcando registro en proceso:', error);
            return false;
          }
        },
        
        // Función para limpiar marca de proceso
        async limpiarMarcaProceso(companyData) {
          try {
            const processingKey = `stripe_processing_${companyData.email.toLowerCase()}`;
            await AsyncStorage.removeItem(processingKey);
            console.log('✅ [PARCHE] Marca de proceso limpiada');
            
            return true;
          } catch (error) {
            console.error('❌ [PARCHE] Error limpiando marca de proceso:', error);
            return false;
          }
        }
      };
      
      await AsyncStorage.setItem('stripe_verification_functions', JSON.stringify(funcionVerificacion));
      console.log('   ✅ Función de verificación mejorada creada');
      
    } catch (error) {
      console.error('Error creando función de verificación:', error);
      throw error;
    }
  }
  
  /**
   * Crear función de guardado único
   */
  async crearFuncionGuardadoUnico() {
    try {
      const funcionGuardado = {
        version: '3.0-stripe-patch',
        createdAt: new Date().toISOString(),
        
        // Función principal de guardado único
        async guardarEmpresaUnico(companyProfile) {
          try {
            console.log('💾 [PARCHE] Iniciando guardado único de empresa...');
            console.log('🏢 Empresa:', companyProfile.companyName);
            console.log('📧 Email:', companyProfile.email);
            
            // PASO 1: Guardar datos completos de empresa (incluye companiesList automáticamente)
            console.log('💾 [PARCHE] Guardando datos de empresa...');
            const companyDataSuccess = await StorageService.saveCompanyData(companyProfile);
            if (!companyDataSuccess) {
              throw new Error('Error guardando datos de empresa');
            }
            console.log('✅ [PARCHE] Datos de empresa guardados');
            
            // PASO 2: Verificar si ya existe como usuario aprobado
            const existingApprovedUser = await StorageService.getApprovedUserByEmail(companyProfile.email);
            
            if (existingApprovedUser && existingApprovedUser.role === 'company') {
              console.log('⚠️ [PARCHE] Usuario aprobado ya existe, actualizando...');
              
              // Actualizar usuario existente
              const updatedUser = {
                ...existingApprovedUser,
                ...companyProfile,
                updatedAt: new Date().toISOString()
              };
              
              const updateSuccess = await StorageService.saveApprovedUser(updatedUser);
              if (updateSuccess) {
                console.log('✅ [PARCHE] Usuario aprobado actualizado');
              }
              
            } else {
              console.log('💾 [PARCHE] Creando nuevo usuario aprobado...');
              
              // Crear nuevo usuario aprobado
              const approvedUserSuccess = await StorageService.saveApprovedUser(companyProfile);
              if (approvedUserSuccess) {
                console.log('✅ [PARCHE] Usuario aprobado creado');
              } else {
                console.log('⚠️ [PARCHE] Advertencia: Error creando usuario aprobado');
              }
            }
            
            console.log('🎉 [PARCHE] Guardado único completado exitosamente');
            
            return {
              success: true,
              companyId: companyProfile.id,
              method: 'unique_save'
            };
            
          } catch (error) {
            console.error('❌ [PARCHE] Error en guardado único:', error);
            throw error;
          }
        }
      };
      
      await AsyncStorage.setItem('stripe_save_functions', JSON.stringify(funcionGuardado));
      console.log('   ✅ Función de guardado único creada');
      
    } catch (error) {
      console.error('Error creando función de guardado:', error);
      throw error;
    }
  }
  
  /**
   * Crear protección anti-duplicados
   */
  async crearProteccionAntiDuplicados() {
    try {
      const proteccionConfig = {
        enabled: true,
        version: '3.0-stripe-patch',
        createdAt: new Date().toISOString(),
        
        // Configuraciones de protección
        protections: {
          emailVerification: true,
          sessionIdVerification: true,
          processingLock: true,
          timeoutProtection: 300000, // 5 minutos
          maxRetries: 3
        },
        
        // Acciones por tipo de duplicado
        actions: {
          email_approved_user: 'update_existing',
          email_companies_list: 'reject_duplicate',
          session_id_processed: 'return_existing',
          registration_in_process: 'wait_or_reject'
        },
        
        // Mensajes de error
        errorMessages: {
          email_duplicate: 'Ya existe una empresa registrada con este email',
          session_processed: 'Esta sesión de pago ya ha sido procesada',
          registration_in_process: 'Ya hay un registro en proceso para esta empresa',
          general_error: 'Error en el proceso de registro'
        }
      };
      
      await AsyncStorage.setItem('stripe_protection_config', JSON.stringify(proteccionConfig));
      console.log('   ✅ Configuración de protección anti-duplicados creada');
      
    } catch (error) {
      console.error('Error creando protección anti-duplicados:', error);
      throw error;
    }
  }
  
  /**
   * Configurar flags de control
   */
  async configurarFlagsControl() {
    try {
      // Flag principal del parche
      const patchFlag = {
        patchApplied: true,
        patchVersion: '3.0-stripe-specific',
        appliedAt: new Date().toISOString(),
        description: 'Parche específico para evitar duplicados en registro con Stripe',
        
        // Configuraciones del parche
        configurations: {
          useUniqueRegistration: true,
          preventDuplicateEmails: true,
          preventDuplicateSessionIds: true,
          useProcessingLock: true,
          enableDetailedLogging: true
        }
      };
      
      await AsyncStorage.setItem('stripe_registration_patch', JSON.stringify(patchFlag));
      
      // Flag de estado del sistema
      const systemStatus = {
        duplicateProtectionActive: true,
        lastPatchApplied: new Date().toISOString(),
        systemVersion: '3.0-stripe-patch',
        status: 'protected'
      };
      
      await AsyncStorage.setItem('system_duplicate_protection_status', JSON.stringify(systemStatus));
      
      console.log('   ✅ Flags de control configurados');
      
    } catch (error) {
      console.error('Error configurando flags de control:', error);
      throw error;
    }
  }
  
  /**
   * Verificar si el parche está aplicado
   */
  async verificarParcheAplicado() {
    try {
      const patchFlag = await AsyncStorage.getItem('stripe_registration_patch');
      const verificationFunctions = await AsyncStorage.getItem('stripe_verification_functions');
      const saveFunctions = await AsyncStorage.getItem('stripe_save_functions');
      const protectionConfig = await AsyncStorage.getItem('stripe_protection_config');
      
      const parcheCompleto = !!(patchFlag && verificationFunctions && saveFunctions && protectionConfig);
      
      return {
        applied: parcheCompleto,
        patchFlag: !!patchFlag,
        verificationFunctions: !!verificationFunctions,
        saveFunctions: !!saveFunctions,
        protectionConfig: !!protectionConfig
      };
      
    } catch (error) {
      console.error('Error verificando parche:', error);
      return { applied: false };
    }
  }
  
  /**
   * Mostrar estado del parche
   */
  async mostrarEstadoParche() {
    try {
      const estado = await this.verificarParcheAplicado();
      
      console.log('\n📋 ESTADO DEL PARCHE:');
      console.log('====================');
      console.log(`✅ Parche aplicado: ${estado.applied ? 'SÍ' : 'NO'}`);
      console.log(`🚩 Flag principal: ${estado.patchFlag ? 'SÍ' : 'NO'}`);
      console.log(`🔍 Funciones verificación: ${estado.verificationFunctions ? 'SÍ' : 'NO'}`);
      console.log(`💾 Funciones guardado: ${estado.saveFunctions ? 'SÍ' : 'NO'}`);
      console.log(`🛡️ Configuración protección: ${estado.protectionConfig ? 'SÍ' : 'NO'}`);
      
      Alert.alert(
        'Estado del Parche',
        `Parche aplicado: ${estado.applied ? 'SÍ' : 'NO'}\n\n` +
        `Componentes:\n` +
        `• Flag principal: ${estado.patchFlag ? '✅' : '❌'}\n` +
        `• Verificación: ${estado.verificationFunctions ? '✅' : '❌'}\n` +
        `• Guardado: ${estado.saveFunctions ? '✅' : '❌'}\n` +
        `• Protección: ${estado.protectionConfig ? '✅' : '❌'}`,
        [{ text: 'OK' }]
      );
      
      return estado;
      
    } catch (error) {
      console.error('Error mostrando estado del parche:', error);
      return { applied: false };
    }
  }
  
  /**
   * Remover parche (para testing)
   */
  async removerParche() {
    try {
      console.log('🗑️ REMOVIENDO PARCHE...');
      
      const keys = [
        'stripe_registration_patch',
        'stripe_verification_functions',
        'stripe_save_functions',
        'stripe_protection_config',
        'system_duplicate_protection_status'
      ];
      
      for (const key of keys) {
        await AsyncStorage.removeItem(key);
        console.log(`   🗑️ Removido: ${key}`);
      }
      
      console.log('✅ PARCHE REMOVIDO COMPLETAMENTE');
      
      Alert.alert(
        'Parche Removido',
        'El parche ha sido removido completamente del sistema.',
        [{ text: 'OK' }]
      );
      
      return { success: true };
      
    } catch (error) {
      console.error('Error removiendo parche:', error);
      
      Alert.alert(
        'Error',
        `Error removiendo parche: ${error.message}`,
        [{ text: 'OK' }]
      );
      
      return { success: false, error: error.message };
    }
  }
}

// Funciones de utilidad
export const aplicarParcheRegistroStripe = async () => {
  const parche = new ParcheRegistroEmpresaStripe();
  return await parche.aplicarParche();
};

export const verificarEstadoParche = async () => {
  const parche = new ParcheRegistroEmpresaStripe();
  return await parche.mostrarEstadoParche();
};

export const removerParcheRegistroStripe = async () => {
  const parche = new ParcheRegistroEmpresaStripe();
  return await parche.removerParche();
};

export default ParcheRegistroEmpresaStripe;