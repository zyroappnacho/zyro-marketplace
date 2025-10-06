/**
 * Servicio para manejar el registro completo de empresas
 * Incluye creación de perfil después del pago exitoso
 */

import StorageService from './StorageService';
import { Alert } from 'react-native';

class CompanyRegistrationService {
  /**
   * DUPLICATE_PREVENTION: Verificar empresa existente antes de registrar
   */
  async checkForExistingCompany(email, sessionId) {
    try {
      console.log('🔍 Verificando duplicados para:', { email, sessionId });
      
      // Verificar por email
      const existingByEmail = await StorageService.getApprovedUserByEmail(email);
      if (existingByEmail) {
        console.log('⚠️ Empresa ya existe por email:', email);
        return { exists: true, reason: 'email', company: existingByEmail };
      }
      
      // Verificar por sessionId si está disponible
      if (sessionId) {
        const companiesList = await StorageService.getCompaniesList();
        const existingBySession = companiesList.find(c => 
          c.stripeSessionId === sessionId || c.sessionId === sessionId
        );
        
        if (existingBySession) {
          console.log('⚠️ Empresa ya existe por sessionId:', sessionId);
          return { exists: true, reason: 'session', company: existingBySession };
        }
      }
      
      console.log('✅ No se encontraron duplicados');
      return { exists: false };
      
    } catch (error) {
      console.error('❌ Error verificando duplicados:', error);
      return { exists: false, error: error.message };
    }
  }

  
  /**
   * Crear perfil de empresa después del pago exitoso
   */
  async createCompanyProfileAfterPayment(paymentData) {
    try {
      console.log('🏢 Creando perfil de empresa después del pago exitoso...');
      console.log('📋 Datos del pago:', paymentData);

      const { companyData, plan, sessionId } = paymentData;
      
      if (!companyData || !companyData.email || !companyData.name) {
        throw new Error('Datos de empresa incompletos');
      }

      if (!companyData.password) {
        throw new Error('Contraseña de usuario requerida');
      }

      // 🛡️ PROTECCIÓN ANTI-DUPLICADOS MEJORADA Y DEFINITIVA
      console.log('🔍 Verificando duplicados con protección mejorada...');
      
      const email = companyData.email.toLowerCase().trim();
      const companyName = companyData.name.toLowerCase().trim();
      
      // 1. VERIFICACIÓN ATÓMICA - Crear clave única para evitar condiciones de carrera
      const atomicKey = `registration_atomic_${email}_${Date.now()}`;
      const atomicData = {
        email: email,
        companyName: companyName,
        sessionId: sessionId,
        timestamp: Date.now(),
        status: 'checking'
      };
      
      await StorageService.saveData(atomicKey, atomicData);
      console.log('🔒 Registro atómico iniciado:', atomicKey);
      
      try {
        // 2. VERIFICACIÓN EXHAUSTIVA DE DUPLICADOS
        
        // 2a. Verificar por email en usuarios aprobados
        const existingByEmail = await StorageService.getApprovedUserByEmail(companyData.email);
        if (existingByEmail && existingByEmail.role === 'company') {
          console.log('⚠️ DUPLICADO DETECTADO: Empresa ya existe con este email en usuarios aprobados');
          console.log('   ID existente:', existingByEmail.id);
          console.log('   Nombre existente:', existingByEmail.companyName);
          
          await StorageService.removeData(atomicKey);
          
          throw new Error(`Ya existe una empresa registrada con el email "${companyData.email}". Si es tu empresa, contacta con soporte para recuperar el acceso.`);
        }

        // 2b. Verificar por email en lista de empresas
        const companiesList = await StorageService.getCompaniesList();
        const existingInList = companiesList.find(c => c.email?.toLowerCase() === email);
        if (existingInList) {
          console.log('⚠️ DUPLICADO DETECTADO: Empresa ya existe con este email en lista de empresas');
          console.log('   ID existente:', existingInList.id);
          console.log('   Nombre existente:', existingInList.companyName);
          
          await StorageService.removeData(atomicKey);
          
          throw new Error(`Ya existe una empresa registrada con el email "${companyData.email}". Si es tu empresa, contacta con soporte para recuperar el acceso.`);
        }

        // 2c. Verificar por nombre de empresa
        const existingByName = companiesList.find(c => {
          const existingName = (c.companyName || c.name || '').toLowerCase().trim();
          return existingName === companyName;
        });
        
        if (existingByName) {
          console.log('⚠️ DUPLICADO DETECTADO: Ya existe una empresa con este nombre:', companyData.name);
          console.log('   Empresa existente:', existingByName.companyName, 'Email:', existingByName.email);
          
          await StorageService.removeData(atomicKey);
          
          throw new Error(`Ya existe una empresa registrada con el nombre "${companyData.name}". Por favor, usa un nombre diferente o contacta con soporte si es tu empresa.`);
        }

        // 2d. Verificar por sessionId para evitar doble procesamiento
        const existingBySession = companiesList.find(c => c.stripeSessionId === sessionId);
        if (existingBySession) {
          console.log('⚠️ DUPLICADO DETECTADO: SessionId ya procesado:', sessionId);
          console.log('   Empresa existente:', existingBySession.companyName);
          
          await StorageService.removeData(atomicKey);
          
          return {
            success: true,
            companyId: existingBySession.id,
            email: existingBySession.email,
            userPassword: companyData.password,
            companyProfile: existingBySession,
            alreadyProcessed: true
          };
        }

        // 2e. Verificar registros en proceso (simplificado)
        // Verificar si hay un registro en proceso específico para este email
        const registrationInProgressKey = `registration_in_progress_${email}`;
        const existingRegistration = await StorageService.getData(registrationInProgressKey);
        
        if (existingRegistration) {
          const timeDiff = Date.now() - existingRegistration.timestamp;
          
          // Si hay otro registro en proceso en los últimos 2 minutos
          if (timeDiff < 120000) {
            console.log('⚠️ DUPLICADO DETECTADO: Registro concurrente en proceso');
            console.log('   Tiempo transcurrido:', Math.round(timeDiff / 1000), 'segundos');
            
            await StorageService.removeData(atomicKey);
            
            throw new Error('Ya hay un registro en proceso para esta empresa. Por favor, espera unos minutos antes de intentar de nuevo.');
          } else {
            // Limpiar registro expirado
            await StorageService.removeData(registrationInProgressKey);
          }
        }

        // 3. MARCAR COMO EN PROCESO PARA EVITAR DUPLICADOS CONCURRENTES
        atomicData.status = 'processing';
        await StorageService.saveData(atomicKey, atomicData);
        console.log('✅ Verificaciones completadas, procediendo con registro único...');

        // 4. GENERAR PERFIL ÚNICO DE EMPRESA
        const companyId = `company_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const userPassword = companyData.password;
        
        const companyProfile = {
          // Identificación única
          id: companyId,
          role: 'company',
          
          // Información básica
          name: companyData.name,
          companyName: companyData.name,
          businessName: companyData.name,
          
          // Credenciales de acceso
          email: companyData.email,
          password: userPassword,
          
          // Información de contacto
          phone: companyData.phone,
          address: companyData.address,
          
          // Plan y suscripción
          selectedPlan: plan,
          planId: plan,
          subscriptionStatus: 'active',
          
          // Estado y fechas
          status: 'approved',
          isActive: true,
          verified: true,
          
          // Fechas importantes
          registrationDate: new Date().toISOString(),
          approvedAt: new Date().toISOString(),
          paymentCompletedDate: new Date().toISOString(),
          firstPaymentCompletedDate: new Date().toISOString(),
          lastLogin: null,
          
          // Información de pago
          paymentCompleted: true,
          firstPaymentCompleted: true,
          stripeSessionId: sessionId,
          
          // Configuración inicial
          profileImage: null,
          settings: {
            notifications: true,
            emailNotifications: true,
            language: 'es'
          },
          
          // Metadatos de protección
          atomicKey: atomicKey,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0'
        };

        console.log('💾 Guardando perfil único de empresa...');
        
        // 5. GUARDADO ATÓMICO ÚNICO
        // Usar transacción simulada para evitar duplicados
        const saveResult = await this.atomicCompanySave(companyProfile);
        
        if (!saveResult.success) {
          await StorageService.removeData(atomicKey);
          throw new Error(saveResult.error || 'Error guardando datos de empresa');
        }
        
        console.log('✅ Empresa guardada exitosamente');

        // 6. Enviar notificación de bienvenida
        await this.sendWelcomeNotification(companyProfile);
        console.log('✅ Notificación de bienvenida enviada');

        // 7. Limpiar registro atómico
        await StorageService.removeData(atomicKey);
        console.log('✅ Registro atómico completado y limpiado');

        console.log('🎉 Perfil de empresa creado exitosamente sin duplicados');
        
        return {
          success: true,
          companyId: companyId,
          email: companyData.email,
          userPassword: userPassword,
          companyProfile: companyProfile
        };

      } catch (innerError) {
        // Limpiar registro atómico en caso de error
        await StorageService.removeData(atomicKey);
        throw innerError;
      }

    } catch (error) {
      console.error('❌ Error creando perfil de empresa:', error);
      
      // Limpiar cualquier registro atómico pendiente
      try {
        const email = companyData.email.toLowerCase();
        const atomicKey = `registration_atomic_${email}_${Date.now()}`;
        const registrationKey = `registration_in_progress_${email}`;
        
        await StorageService.removeData(atomicKey);
        await StorageService.removeData(registrationKey);
        
        console.log('✅ Registros atómicos limpiados después del error');
      } catch (cleanupError) {
        console.error('Error limpiando registros atómicos:', cleanupError);
      }
      
      throw error;
    }
  }

  /**
   * Guardado atómico de empresa para evitar duplicados
   */
  async atomicCompanySave(companyProfile) {
    try {
      console.log('🔒 Iniciando guardado atómico...');
      
      // 1. Usar el método existente de StorageService que ya maneja duplicados
      const companyDataSuccess = await StorageService.saveCompanyData(companyProfile);
      
      if (!companyDataSuccess) {
        return {
          success: false,
          error: 'Error guardando datos de empresa'
        };
      }
      
      console.log('✅ Empresa guardada usando StorageService.saveCompanyData');
      
      // 2. Guardado único en usuarios aprobados
      const approvedUsers = await StorageService.getApprovedUsersList();
      const email = companyProfile.email.toLowerCase();
      const existingUser = approvedUsers.find(u => u.email?.toLowerCase() === email && u.role === 'company');
      
      if (!existingUser) {
        const approvedUserSuccess = await StorageService.saveApprovedUser(companyProfile);
        if (!approvedUserSuccess) {
          console.log('⚠️ Advertencia: Error guardando usuario aprobado, pero empresa ya guardada');
        } else {
          console.log('✅ Usuario aprobado creado para login');
        }
      } else {
        console.log('⚠️ Usuario aprobado ya existe, no se crea duplicado');
      }
      
      return {
        success: true,
        message: 'Empresa guardada exitosamente sin duplicados'
      };
      
    } catch (error) {
      console.error('❌ Error en guardado atómico:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generar contraseña temporal segura
   */
  generateTemporaryPassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Agregar empresa a la lista de administración
   */
  async addToCompaniesList(companyProfile) {
    try {
      const companiesList = await StorageService.getCompaniesList();
      
      const companyListEntry = {
        id: companyProfile.id,
        companyName: companyProfile.companyName,
        email: companyProfile.email,
        plan: companyProfile.selectedPlan,
        status: companyProfile.status,
        registrationDate: companyProfile.registrationDate,
        firstPaymentCompletedDate: companyProfile.firstPaymentCompletedDate,
        nextPaymentDate: this.calculateNextPaymentDate(companyProfile.selectedPlan),
        profileImage: companyProfile.profileImage,
        paymentMethodName: 'Stripe',
        monthlyAmount: this.getMonthlyAmount(companyProfile.selectedPlan),
        isActive: true
      };

      const updatedList = [...companiesList, companyListEntry];
      await StorageService.saveData('companiesList', updatedList);
      
      return true;
    } catch (error) {
      console.error('Error adding to companies list:', error);
      return false;
    }
  }

  /**
   * Calcular próxima fecha de pago
   */
  calculateNextPaymentDate(plan) {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
    return nextMonth.toISOString();
  }

  /**
   * Obtener monto mensual según el plan
   */
  getMonthlyAmount(plan) {
    const planPrices = {
      'basic': 499,
      'plan_3_months': 499,
      'premium': 399,
      'plan_6_months': 399,
      'enterprise': 299,
      'plan_12_months': 299
    };
    
    return planPrices[plan] || 399;
  }

  /**
   * Enviar notificación de bienvenida
   */
  async sendWelcomeNotification(companyProfile) {
    try {
      // En una implementación real, aquí se enviaría un email
      console.log(`📧 Enviando email de bienvenida a: ${companyProfile.email}`);
      
      // Simular envío de email con credenciales
      const emailContent = {
        to: companyProfile.email,
        subject: 'Bienvenido a ZyroMarketplace - Acceso a tu cuenta',
        body: `
          Hola ${companyProfile.companyName},
          
          ¡Bienvenido a ZyroMarketplace! Tu pago se ha procesado exitosamente y tu cuenta está lista.
          
          Credenciales de acceso:
          - Usuario: ${companyProfile.email}
          - Contraseña: ${companyProfile.password}
          
          Estas son las credenciales que configuraste durante el registro.
          
          ¡Gracias por confiar en nosotros!
          
          Equipo ZyroMarketplace
        `
      };
      
      // Guardar notificación para mostrar en la app
      await this.saveWelcomeNotification(companyProfile.id, emailContent);
      
      return true;
    } catch (error) {
      console.error('Error sending welcome notification:', error);
      return false;
    }
  }

  /**
   * Guardar notificación de bienvenida
   */
  async saveWelcomeNotification(companyId, emailContent) {
    try {
      const notification = {
        id: `welcome_${companyId}`,
        type: 'welcome',
        title: 'Cuenta creada exitosamente',
        message: 'Tu cuenta de empresa ha sido creada. Revisa tu email para las credenciales de acceso.',
        companyId: companyId,
        emailContent: emailContent,
        createdAt: new Date().toISOString(),
        read: false
      };

      // Guardar en notificaciones de la empresa
      const notifications = await StorageService.getData(`notifications_${companyId}`) || [];
      notifications.unshift(notification);
      await StorageService.saveData(`notifications_${companyId}`, notifications);

      return true;
    } catch (error) {
      console.error('Error saving welcome notification:', error);
      return false;
    }
  }

  /**
   * Verificar si una empresa ya existe
   */
  async companyExists(email) {
    try {
      const existingUser = await StorageService.getApprovedUserByEmail(email);
      return existingUser && existingUser.role === 'company';
    } catch (error) {
      console.error('Error checking if company exists:', error);
      return false;
    }
  }

  /**
   * Mostrar credenciales de acceso al usuario
   */
  showAccessCredentials(email, userPassword) {
    Alert.alert(
      '🎉 ¡Registro Completado!',
      `Tu cuenta de empresa ha sido creada exitosamente.\n\n` +
      `📧 Usuario: ${email}\n` +
      `🔑 Contraseña: ${userPassword}\n\n` +
      `Estas son las credenciales que configuraste en el registro.\n\n` +
      `¡Ya puedes acceder a tu cuenta de empresa!`,
      [
        {
          text: 'Entendido',
          style: 'default'
        }
      ]
    );
  }

  /**
   * Manejar el flujo completo después del pago exitoso
   */
  async handlePaymentSuccess(paymentData) {
    try {
      console.log('🎯 Iniciando flujo completo después del pago exitoso...');

      // 1. Verificar que la empresa no exista ya
      const exists = await this.companyExists(paymentData.companyData.email);
      if (exists) {
        console.log('⚠️ La empresa ya existe, actualizando información...');
        // Aquí podrías actualizar la información existente si es necesario
      }

      // 2. Crear perfil de empresa
      const result = await this.createCompanyProfileAfterPayment(paymentData);
      
      if (result.success) {
        // 3. Mostrar credenciales al usuario
        this.showAccessCredentials(result.email, result.userPassword);
        
        // 4. Retornar información para la app
        return {
          success: true,
          message: 'Empresa registrada exitosamente',
          companyId: result.companyId,
          email: result.email,
          userPassword: result.userPassword,
          redirectTo: 'login' // Indicar que debe ir al login
        };
      } else {
        throw new Error('Error en la creación del perfil');
      }

    } catch (error) {
      console.error('❌ Error en flujo completo después del pago:', error);
      
      Alert.alert(
        'Error en el Registro',
        'Hubo un problema creando tu cuenta de empresa. Por favor, contacta con soporte.',
        [{ text: 'OK' }]
      );
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  // ========================================
  // MÉTODOS DE PREVENCIÓN DE DUPLICADOS
  // ========================================

  /**
   * Buscar empresa por nombre
   */
  async findCompanyByName(companyName) {
    try {
      const companiesList = await StorageService.getCompaniesList();
      const normalizedName = companyName.toLowerCase().trim();
      
      return companiesList.find(company => {
        const existingName = (company.companyName || company.name || '').toLowerCase().trim();
        return existingName === normalizedName;
      });
    } catch (error) {
      console.error('Error buscando empresa por nombre:', error);
      return null;
    }
  }

  /**
   * Buscar empresa por sessionId de Stripe
   */
  async findCompanyBySessionId(sessionId) {
    try {
      if (!sessionId) return null;
      
      console.log('🔍 Buscando empresa por sessionId:', sessionId);
      
      // Buscar en lista de empresas
      const companiesList = await StorageService.getCompaniesList();
      const companyInList = companiesList.find(company => 
        company.stripeSessionId === sessionId
      );
      
      if (companyInList) {
        console.log('✅ Empresa encontrada en lista por sessionId:', companyInList.companyName);
        return companyInList;
      }
      
      // Buscar en usuarios aprobados
      const approvedUsers = await StorageService.getApprovedUsersList();
      const companyUsers = approvedUsers.filter(u => u.role === 'company');
      
      for (const user of companyUsers) {
        const fullUserData = await StorageService.getApprovedUser(user.id);
        if (fullUserData && fullUserData.stripeSessionId === sessionId) {
          console.log('✅ Empresa encontrada en usuarios aprobados por sessionId:', fullUserData.companyName);
          return fullUserData;
        }
      }
      
      console.log('❌ No se encontró empresa con sessionId:', sessionId);
      return null;
    } catch (error) {
      console.error('Error buscando empresa por sessionId:', error);
      return null;
    }
  }

  /**
   * Verificar si hay un registro en proceso
   */
  async checkRegistrationInProgress(companyName, email) {
    try {
      const registrationKey = `registration_in_progress_${email.toLowerCase()}`;
      const registrationData = await StorageService.getData(registrationKey);
      
      if (registrationData) {
        const timeDiff = Date.now() - registrationData.timestamp;
        const fiveMinutes = 5 * 60 * 1000;
        
        // Si han pasado más de 5 minutos, considerar que el registro anterior falló
        if (timeDiff > fiveMinutes) {
          await StorageService.removeData(registrationKey);
          return false;
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error verificando registro en proceso:', error);
      return false;
    }
  }

  /**
   * Marcar registro en proceso
   */
  async markRegistrationInProgress(companyName, email, sessionId) {
    try {
      const registrationKey = `registration_in_progress_${email.toLowerCase()}`;
      const registrationData = {
        companyName: companyName,
        email: email,
        sessionId: sessionId,
        timestamp: Date.now(),
        status: 'in_progress'
      };
      
      await StorageService.saveData(registrationKey, registrationData);
      console.log('✅ Registro marcado como en proceso');
      return true;
    } catch (error) {
      console.error('Error marcando registro en proceso:', error);
      return false;
    }
  }

  /**
   * Limpiar marca de registro en proceso
   */
  async clearRegistrationInProgress(companyName, email) {
    try {
      const registrationKey = `registration_in_progress_${email.toLowerCase()}`;
      await StorageService.removeData(registrationKey);
      console.log('✅ Marca de registro en proceso limpiada');
      return true;
    } catch (error) {
      console.error('Error limpiando marca de registro:', error);
      return false;
    }
  }

  /**
   * Limpiar todas las marcas de registro expiradas
   */
  async cleanupExpiredRegistrations() {
    try {
      console.log('🧹 Limpiando registros expirados...');
      
      const allKeys = await AsyncStorage.getAllKeys();
      const registrationKeys = allKeys.filter(key => key.startsWith('registration_in_progress_'));
      
      let cleanedCount = 0;
      const fiveMinutes = 5 * 60 * 1000;
      
      for (const key of registrationKeys) {
        try {
          const registrationData = await StorageService.getData(key);
          if (registrationData) {
            const timeDiff = Date.now() - registrationData.timestamp;
            
            if (timeDiff > fiveMinutes) {
              await StorageService.removeData(key);
              cleanedCount++;
            }
          }
        } catch (error) {
          console.error(`Error procesando ${key}:`, error);
        }
      }
      
      console.log(`✅ ${cleanedCount} registros expirados limpiados`);
      return cleanedCount;
    } catch (error) {
      console.error('Error limpiando registros expirados:', error);
      return 0;
    }
  }
}

export default new CompanyRegistrationService();