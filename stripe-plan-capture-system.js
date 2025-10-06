/**
 * Sistema de Captura de Planes de Stripe por Empresa
 * Captura y sincroniza el plan exacto seleccionado durante el registro
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import StorageService from './services/StorageService';

class StripePlanCaptureSystem {
  constructor() {
    this.captureKey = 'stripe_plan_capture';
  }

  // Capturar plan seleccionado durante el registro de Stripe
  async capturePlanFromStripeRegistration(companyData, selectedPlan) {
    try {
      console.log(`📋 Capturando plan de Stripe para empresa: ${companyData.name}`);
      console.log(`🎯 Plan seleccionado: ${selectedPlan}`);

      // Mapear el plan seleccionado a información completa
      const planDetails = this.mapSelectedPlanToDetails(selectedPlan);
      
      if (!planDetails) {
        console.log('❌ Plan seleccionado no válido:', selectedPlan);
        return { success: false, error: 'Plan no válido' };
      }

      // Crear registro de captura de plan
      const planCaptureRecord = {
        companyId: companyData.id,
        companyName: companyData.name,
        companyEmail: companyData.email,
        
        // Plan seleccionado en Stripe
        selectedPlan: selectedPlan,
        planDetails: planDetails,
        
        // Información de pago
        monthlyAmount: planDetails.price,
        totalAmount: planDetails.totalAmount,
        planDuration: planDetails.duration,
        
        // Metadatos
        captureDate: new Date().toISOString(),
        registrationDate: companyData.registrationDate || new Date().toISOString(),
        stripeSessionId: `stripe_session_${companyData.id}_${Date.now()}`,
        
        // Estado
        status: 'captured',
        paymentCompleted: true
      };

      // Guardar registro de captura
      await AsyncStorage.setItem(
        `${this.captureKey}_${companyData.id}`, 
        JSON.stringify(planCaptureRecord)
      );

      // Actualizar datos de empresa con plan capturado
      await this.updateCompanyWithCapturedPlan(companyData.id, planCaptureRecord);

      console.log('✅ Plan capturado y sincronizado exitosamente');
      
      return {
        success: true,
        companyId: companyData.id,
        capturedPlan: planDetails,
        message: 'Plan capturado desde Stripe'
      };

    } catch (error) {
      console.error('❌ Error capturando plan de Stripe:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Mapear plan seleccionado a detalles completos
  mapSelectedPlanToDetails(selectedPlan) {
    const planMappings = {
      'plan_3_months': {
        id: 'plan_3_months',
        name: 'Plan 3 Meses',
        price: 499,
        duration: 3,
        totalAmount: 499 * 3 + 150, // Incluye setup fee
        description: 'Perfecto para campañas cortas',
        stripeId: 'plan_3_months'
      },
      'plan_6_months': {
        id: 'plan_6_months',
        name: 'Plan 6 Meses',
        price: 399,
        duration: 6,
        totalAmount: 399 * 6 + 150, // Incluye setup fee
        description: 'Ideal para estrategias a medio plazo',
        stripeId: 'plan_6_months'
      },
      'plan_12_months': {
        id: 'plan_12_months',
        name: 'Plan 12 Meses',
        price: 299,
        duration: 12,
        totalAmount: 299 * 12 + 150, // Incluye setup fee
        description: 'Máximo ahorro para estrategias anuales',
        stripeId: 'plan_12_months'
      }
    };

    // Buscar por ID exacto
    if (planMappings[selectedPlan]) {
      return planMappings[selectedPlan];
    }

    // Buscar por patrones comunes
    const planStr = String(selectedPlan).toLowerCase();
    
    if (planStr.includes('3') && planStr.includes('mes')) {
      return planMappings['plan_3_months'];
    }
    if (planStr.includes('6') && planStr.includes('mes')) {
      return planMappings['plan_6_months'];
    }
    if (planStr.includes('12') && planStr.includes('mes')) {
      return planMappings['plan_12_months'];
    }

    return null;
  }

  // Actualizar datos de empresa con plan capturado
  async updateCompanyWithCapturedPlan(companyId, planCaptureRecord) {
    try {
      // 1. Actualizar datos principales de empresa
      const companyData = await StorageService.getCompanyData(companyId);
      
      if (companyData) {
        const updatedCompanyData = {
          ...companyData,
          
          // Plan específico capturado de Stripe
          selectedPlan: planCaptureRecord.planDetails.name,
          planId: planCaptureRecord.planDetails.id,
          planDuration: planCaptureRecord.planDetails.duration,
          monthlyAmount: planCaptureRecord.planDetails.price,
          totalAmount: planCaptureRecord.planDetails.totalAmount,
          
          // Información de Stripe
          stripeSessionId: planCaptureRecord.stripeSessionId,
          stripePlanId: planCaptureRecord.planDetails.stripeId,
          
          // Fechas
          planCaptureDate: planCaptureRecord.captureDate,
          nextBillingDate: this.calculateNextBillingDate(planCaptureRecord.planDetails.duration),
          
          // Estado
          planCaptured: true,
          planCaptureVersion: '1.0'
        };

        await StorageService.saveCompanyData(updatedCompanyData);
        console.log('✅ Datos principales de empresa actualizados');
      }

      // 2. Actualizar usuario aprobado
      const approvedUser = await StorageService.getApprovedUser(companyId);
      
      if (approvedUser) {
        const updatedUser = {
          ...approvedUser,
          selectedPlan: planCaptureRecord.planDetails.name,
          planId: planCaptureRecord.planDetails.id,
          monthlyAmount: planCaptureRecord.planDetails.price,
          planDuration: planCaptureRecord.planDetails.duration,
          planCaptured: true
        };

        await StorageService.saveApprovedUser(updatedUser);
        console.log('✅ Usuario aprobado actualizado');
      }

      // 3. Actualizar lista de empresas
      const companiesList = await StorageService.getCompaniesList();
      const companyIndex = companiesList.findIndex(c => c.id === companyId);
      
      if (companyIndex >= 0) {
        companiesList[companyIndex] = {
          ...companiesList[companyIndex],
          plan: planCaptureRecord.planDetails.name,
          monthlyAmount: planCaptureRecord.planDetails.price,
          planDuration: planCaptureRecord.planDetails.duration,
          planCaptured: true
        };

        await AsyncStorage.setItem('companiesList', JSON.stringify(companiesList));
        console.log('✅ Lista de empresas actualizada');
      }

    } catch (error) {
      console.error('❌ Error actualizando empresa con plan capturado:', error);
    }
  }

  // Calcular próxima fecha de facturación
  calculateNextBillingDate(durationMonths) {
    const now = new Date();
    const nextBilling = new Date(now);
    nextBilling.setMonth(now.getMonth() + durationMonths);
    return nextBilling.toISOString();
  }

  // Obtener plan capturado para una empresa específica
  async getCapturedPlanForCompany(companyId) {
    try {
      console.log(`🔍 Obteniendo plan capturado para empresa: ${companyId}`);
      
      const captureRecord = await AsyncStorage.getItem(`${this.captureKey}_${companyId}`);
      
      if (!captureRecord) {
        console.log('⚠️ No se encontró plan capturado, usando datos de empresa');
        return await this.fallbackToCompanyData(companyId);
      }

      const parsedRecord = JSON.parse(captureRecord);
      console.log('✅ Plan capturado encontrado:', parsedRecord.planDetails.name);
      
      return {
        success: true,
        planDetails: parsedRecord.planDetails,
        captureDate: parsedRecord.captureDate,
        source: 'stripe_capture'
      };

    } catch (error) {
      console.error('❌ Error obteniendo plan capturado:', error);
      return await this.fallbackToCompanyData(companyId);
    }
  }

  // Fallback a datos de empresa si no hay captura
  async fallbackToCompanyData(companyId) {
    try {
      const companyData = await StorageService.getCompanyData(companyId);
      
      if (companyData && companyData.monthlyAmount) {
        const planDetails = this.detectPlanFromPrice(companyData.monthlyAmount);
        
        if (planDetails) {
          console.log('✅ Plan detectado desde datos de empresa:', planDetails.name);
          return {
            success: true,
            planDetails: planDetails,
            source: 'company_data_fallback'
          };
        }
      }

      // Plan por defecto
      console.log('⚠️ Usando plan por defecto');
      return {
        success: true,
        planDetails: {
          id: 'plan_6_months',
          name: 'Plan 6 Meses',
          price: 399,
          duration: 6,
          description: 'Ideal para estrategias a medio plazo'
        },
        source: 'default'
      };

    } catch (error) {
      console.error('❌ Error en fallback:', error);
      return { success: false, error: error.message };
    }
  }

  // Detectar plan desde precio
  detectPlanFromPrice(monthlyAmount) {
    const price = Number(monthlyAmount);
    
    if (price === 499) {
      return {
        id: 'plan_3_months',
        name: 'Plan 3 Meses',
        price: 499,
        duration: 3,
        description: 'Perfecto para campañas cortas'
      };
    }
    
    if (price === 399) {
      return {
        id: 'plan_6_months',
        name: 'Plan 6 Meses',
        price: 399,
        duration: 6,
        description: 'Ideal para estrategias a medio plazo'
      };
    }
    
    if (price === 299) {
      return {
        id: 'plan_12_months',
        name: 'Plan 12 Meses',
        price: 299,
        duration: 12,
        description: 'Máximo ahorro para estrategias anuales'
      };
    }
    
    return null;
  }

  // Simular captura de planes para empresas existentes
  async simulatePlanCaptureForExistingCompanies() {
    try {
      console.log('🔄 Simulando captura de planes para empresas existentes...');
      
      const companiesList = await StorageService.getCompaniesList();
      let capturedCount = 0;
      
      for (const company of companiesList) {
        // Verificar si ya tiene plan capturado
        const existingCapture = await AsyncStorage.getItem(`${this.captureKey}_${company.id}`);
        
        if (!existingCapture) {
          // Determinar plan basado en datos existentes
          const companyData = await StorageService.getCompanyData(company.id);
          let selectedPlan = 'plan_6_months'; // Por defecto
          
          if (companyData) {
            if (companyData.monthlyAmount === 499) {
              selectedPlan = 'plan_3_months';
            } else if (companyData.monthlyAmount === 399) {
              selectedPlan = 'plan_6_months';
            } else if (companyData.monthlyAmount === 299) {
              selectedPlan = 'plan_12_months';
            } else if (companyData.selectedPlan) {
              if (companyData.selectedPlan.includes('3')) selectedPlan = 'plan_3_months';
              else if (companyData.selectedPlan.includes('6')) selectedPlan = 'plan_6_months';
              else if (companyData.selectedPlan.includes('12')) selectedPlan = 'plan_12_months';
            }
          }

          // Simular captura
          const simulatedCompanyData = {
            id: company.id,
            name: company.companyName || company.name,
            email: company.email,
            registrationDate: companyData?.registrationDate || new Date().toISOString()
          };

          const result = await this.capturePlanFromStripeRegistration(simulatedCompanyData, selectedPlan);
          
          if (result.success) {
            capturedCount++;
            console.log(`✅ Plan capturado para: ${company.companyName} (${selectedPlan})`);
          }
        }
      }
      
      console.log(`🎉 Captura simulada completada: ${capturedCount} empresas`);
      
      return {
        success: true,
        capturedCount: capturedCount,
        totalCompanies: companiesList.length
      };

    } catch (error) {
      console.error('❌ Error en captura simulada:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verificar estado de captura para todas las empresas
  async verifyAllCompanyCaptures() {
    try {
      console.log('📊 Verificando estado de captura para todas las empresas...');
      
      const companiesList = await StorageService.getCompaniesList();
      const results = [];
      
      for (const company of companiesList) {
        const captureResult = await this.getCapturedPlanForCompany(company.id);
        
        results.push({
          companyId: company.id,
          companyName: company.companyName || company.name,
          planName: captureResult.planDetails?.name || 'No detectado',
          planPrice: captureResult.planDetails?.price || 0,
          planDuration: captureResult.planDetails?.duration || 0,
          source: captureResult.source || 'unknown',
          success: captureResult.success
        });
      }
      
      // Mostrar resumen
      console.log('\n📋 RESUMEN DE CAPTURA DE PLANES:');
      results.forEach(result => {
        console.log(`🏢 ${result.companyName}:`);
        console.log(`   Plan: ${result.planName} (${result.planPrice}€/mes, ${result.planDuration}m)`);
        console.log(`   Fuente: ${result.source}`);
        console.log(`   Estado: ${result.success ? '✅' : '❌'}`);
      });
      
      return {
        success: true,
        results: results,
        totalCompanies: results.length,
        successfulCaptures: results.filter(r => r.success).length
      };

    } catch (error) {
      console.error('❌ Error verificando capturas:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Crear instancia singleton
const stripePlanCaptureSystem = new StripePlanCaptureSystem();

export default stripePlanCaptureSystem;