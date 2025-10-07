/**
 * Servicio de Stripe para gestionar pagos y suscripciones
 * Integración completa con pasarela externa
 */

import { loadStripe } from '@stripe/stripe-js';
import * as WebBrowser from 'expo-web-browser';
import { Alert } from 'react-native';

class StripeService {
  constructor() {
    this.stripe = null;
    // Usar URL de producción o desarrollo según el entorno
    this.baseURL = process.env.NODE_ENV === 'production' 
      ? 'https://zyro-marketplace.onrender.com/api' 
      : 'http://localhost:3001';
    this.initializeStripe();
  }

  async initializeStripe() {
    try {
      this.stripe = await loadStripe(process.env.STRIPE_PUBLISHABLE_KEY);
    } catch (error) {
      console.error('Error inicializando Stripe:', error);
    }
  }

  /**
   * Planes de suscripción disponibles
   */
  getSubscriptionPlans() {
    return {
      plan_3_months: {
        id: 'plan_3_months',
        name: 'Plan 3 Meses',
        price: 499,
        currency: 'eur',
        interval: 'month',
        interval_count: 1,
        duration_months: 3,
        description: '499€/mes durante 3 meses',
        features: [
          'Promoción en Instagram',
          'Acceso a todos los influencers',
          'Configuración completa de anuncios',
          'Soporte prioritario'
        ]
      },
      plan_6_months: {
        id: 'plan_6_months',
        name: 'Plan 6 Meses',
        price: 399,
        currency: 'eur',
        interval: 'month',
        interval_count: 1,
        duration_months: 6,
        description: '399€/mes durante 6 meses',
        popular: true,
        features: [
          'Promoción en Instagram',
          'Acceso a todos los influencers',
          'Configuración completa de anuncios',
          'Soporte prioritario',
          'Descuento del 20%'
        ]
      },
      plan_12_months: {
        id: 'plan_12_months',
        name: 'Plan 12 Meses',
        price: 299,
        currency: 'eur',
        interval: 'month',
        interval_count: 1,
        duration_months: 12,
        description: '299€/mes durante 12 meses',
        features: [
          'Promoción en Instagram',
          'Acceso a todos los influencers',
          'Configuración completa de anuncios',
          'Soporte prioritario',
          'Descuento del 40%',
          'Consultoría personalizada'
        ]
      }
    };
  }

  /**
   * Pago único inicial
   */
  getInitialPayment() {
    return {
      id: 'initial_setup',
      name: 'Configuración Inicial',
      price: 150,
      currency: 'eur',
      description: 'Pago único para configuración de anuncios y promoción inicial',
      features: [
        'Configuración completa de anuncios',
        'Promoción inicial en Instagram',
        'Presentación a todos los influencers',
        'Setup personalizado'
      ]
    };
  }

  /**
   * Crear sesión de pago en Stripe
   */
  async createCheckoutSession(companyData, selectedPlan) {
    try {
      const plans = this.getSubscriptionPlans();
      const plan = plans[selectedPlan];

      if (!plan) {
        throw new Error('Plan seleccionado no válido');
      }

      // Calcular precio total del primer pago (mensual + setup fee)
      const setupFee = 150;
      const totalFirstPayment = plan.price + setupFee;

      // Preparar datos para el backend
      const sessionData = {
        company: companyData,
        plan: {
          id: selectedPlan,
          name: plan.name,
          description: plan.description,
          duration_months: plan.duration_months
        },
        initial_payment: {
          price: totalFirstPayment // Precio total del primer pago
        },
        success_url: process.env.NODE_ENV === 'production' 
          ? `https://zyro-marketplace.onrender.com/payment/success?session_id={CHECKOUT_SESSION_ID}`
          : `http://localhost:3000/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: process.env.NODE_ENV === 'production'
          ? `https://zyro-marketplace.onrender.com/payment/cancel`
          : `http://localhost:3000/payment/cancel`,
        metadata: {
          company_id: companyData.id,
          company_name: companyData.name,
          company_email: companyData.email,
          plan_id: selectedPlan,
          monthly_price: plan.price,
          setup_fee: 150,
          total_first_payment: totalFirstPayment
        }
      };

      console.log('📋 Datos enviados al backend:', JSON.stringify(sessionData, null, 2));

      // Llamar al backend para crear la sesión
      const response = await fetch(`${this.baseURL}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error creando sesión de pago');
      }

      const session = await response.json();
      return session;

    } catch (error) {
      console.error('Error creando sesión de checkout:', error);
      throw error;
    }
  }

  /**
   * Redirigir a Stripe Checkout (pasarela externa)
   */
  async redirectToCheckout(companyData, selectedPlan) {
    try {
      console.log('🔄 Iniciando checkout para plan:', selectedPlan);
      console.log('🔄 Datos de empresa:', companyData);
      
      // Siempre intentar crear sesión real con el backend
      const session = await this.createCheckoutSession(companyData, selectedPlan);
      
      if (session && session.url) {
        console.log('✅ Sesión real creada:', session.sessionId);
        
        // Abrir navegador externo con URL real de Stripe
        const result = await WebBrowser.openBrowserAsync(session.url, {
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
          showTitle: true,
          toolbarColor: '#6366f1',
          controlsColor: '#ffffff',
          secondaryToolbarColor: '#4f46e5'
        });

        return {
          ...result,
          sessionId: session.sessionId,
          type: 'real_checkout'
        };
      } else {
        throw new Error('No se pudo crear la sesión de checkout');
      }

    } catch (error) {
      console.error('❌ Error creando checkout real:', error);
      
      // Solo usar modo demo si hay un error específico del backend
      if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
        console.log('⚠️ Error de conexión, usando modo demo');
        
        return new Promise((resolve, reject) => {
          Alert.alert(
            'Modo Demo - Backend No Disponible',
            `No se pudo conectar al servidor de pagos.\n\nPlan: ${this.getSubscriptionPlans()[selectedPlan]?.name}\n\n¿Simular pago exitoso?`,
            [
              {
                text: 'Cancelar',
                style: 'cancel',
                onPress: () => {
                  reject(new Error('Pago cancelado por el usuario'));
                }
              },
              {
                text: 'Simular Éxito',
                onPress: () => {
                  console.log('✅ Pago simulado exitoso');
                  resolve({
                    type: 'demo_success',
                    sessionId: `demo_session_${Date.now()}`
                  });
                }
              }
            ]
          );
        });
      } else {
        // Error real de Stripe o del backend
        Alert.alert(
          'Error de Pago',
          `No se pudo procesar el pago: ${error.message}`,
          [{ text: 'OK' }]
        );
        throw error;
      }
    }
  }

  /**
   * Verificar estado del pago - MÉTODO CRÍTICO PARA SEGURIDAD
   */
  async verifyPaymentStatus(sessionId) {
    try {
      console.log('🔍 Verificando estado del pago con sessionId:', sessionId);
      
      // Si es un sessionId de demo, simular verificación exitosa
      if (sessionId.startsWith('demo_session_')) {
        console.log('⚠️ MODO DEMO: Simulando verificación exitosa');
        return {
          status: 'complete',
          payment_status: 'paid',
          session_id: sessionId,
          amount_total: 64900, // 649€ en centavos
          currency: 'eur',
          customer: 'demo_customer',
          subscription_id: 'demo_subscription',
          metadata: {
            demo_mode: true,
            verified_at: new Date().toISOString()
          }
        };
      }

      // Verificación real con el backend de Stripe
      const response = await fetch(`${this.baseURL}/api/stripe/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ session_id: sessionId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error verificando pago');
      }

      const result = await response.json();
      
      console.log('📊 Resultado de verificación:', {
        sessionId: sessionId,
        status: result.status,
        paymentStatus: result.payment_status,
        amountTotal: result.amount_total,
        currency: result.currency
      });

      // 🧪 DETECTAR MODO TEST DE STRIPE
      const isStripeTestMode = this.isStripeTestMode(sessionId, result);
      
      // Mapear estados de Stripe a nuestro formato
      const mappedResult = {
        ...result,
        // Normalizar estados
        status: this.normalizePaymentStatus(result.status, result.payment_status),
        verified_at: new Date().toISOString(),
        is_paid: result.status === 'complete' && result.payment_status === 'paid',
        is_test_mode: isStripeTestMode,
        // Para pagos de test, considerarlos válidos si están completos
        is_valid_for_registration: (result.status === 'complete' && result.payment_status === 'paid') || isStripeTestMode
      };

      return mappedResult;

    } catch (error) {
      console.error('❌ Error verificando estado del pago:', error);
      
      // Si hay error de conexión, no asumir que el pago falló
      if (error.message.includes('fetch') || error.message.includes('network')) {
        throw new Error('No se pudo conectar con el servidor de pagos. Inténtalo de nuevo.');
      }
      
      throw error;
    }
  }

  /**
   * Detectar si es modo test de Stripe
   */
  isStripeTestMode(sessionId, paymentResult) {
    // Detectar por sessionId (Stripe test sessions empiezan con cs_test_)
    if (sessionId.startsWith('cs_test_')) {
      console.log('🧪 STRIPE TEST MODE detectado por sessionId');
      return true;
    }

    // Detectar por customer ID (Stripe test customers empiezan con cus_test_)
    if (paymentResult.customer_id && paymentResult.customer_id.startsWith('cus_test_')) {
      console.log('🧪 STRIPE TEST MODE detectado por customer ID');
      return true;
    }

    // Detectar por subscription ID (Stripe test subscriptions empiezan con sub_test_)
    if (paymentResult.subscription_id && paymentResult.subscription_id.startsWith('sub_test_')) {
      console.log('🧪 STRIPE TEST MODE detectado por subscription ID');
      return true;
    }

    // Detectar por metadatos de test
    if (paymentResult.metadata && paymentResult.metadata.test_mode === 'true') {
      console.log('🧪 STRIPE TEST MODE detectado por metadatos');
      return true;
    }

    // Detectar por ambiente de desarrollo
    if (process.env.NODE_ENV === 'development' || process.env.STRIPE_TEST_MODE === 'true') {
      console.log('🧪 STRIPE TEST MODE detectado por ambiente de desarrollo');
      return true;
    }

    return false;
  }

  /**
   * Normalizar estados de pago de Stripe
   */
  normalizePaymentStatus(sessionStatus, paymentStatus) {
    // Estados de sesión de Stripe:
    // - open: Sesión abierta, pago pendiente
    // - complete: Sesión completada
    // - expired: Sesión expirada
    
    // Estados de pago de Stripe:
    // - unpaid: No pagado
    // - paid: Pagado exitosamente
    // - no_payment_required: No se requiere pago
    
    if (sessionStatus === 'complete' && paymentStatus === 'paid') {
      return 'complete'; // Pago completado exitosamente
    } else if (sessionStatus === 'open') {
      return 'pending'; // Pago pendiente
    } else if (sessionStatus === 'expired') {
      return 'expired'; // Sesión expirada
    } else if (paymentStatus === 'unpaid') {
      return 'unpaid'; // No pagado
    } else {
      return 'unknown'; // Estado desconocido
    }
  }

  /**
   * Verificar múltiples veces el estado del pago con reintentos
   */
  async verifyPaymentWithRetries(sessionId, maxRetries = 5, delayMs = 3000) {
    console.log(`🔄 Verificando pago con reintentos (máximo ${maxRetries})`);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔍 Intento ${attempt}/${maxRetries} - Verificando pago...`);
        
        const result = await this.verifyPaymentStatus(sessionId);
        
        if (result.status === 'complete' && result.is_paid) {
          console.log(`✅ Pago confirmado en intento ${attempt}`);
          return result;
        } else if (result.status === 'pending' || result.status === 'open') {
          console.log(`⏳ Pago aún pendiente en intento ${attempt}`);
          
          if (attempt < maxRetries) {
            console.log(`⏱️ Esperando ${delayMs}ms antes del siguiente intento...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
            continue;
          } else {
            console.log('⏰ Máximo de reintentos alcanzado, pago aún pendiente');
            return result;
          }
        } else {
          console.log(`❌ Pago no exitoso en intento ${attempt}:`, result.status);
          return result;
        }
        
      } catch (error) {
        console.error(`❌ Error en intento ${attempt}:`, error.message);
        
        if (attempt < maxRetries) {
          console.log(`⏱️ Esperando ${delayMs}ms antes del siguiente intento...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        } else {
          console.log('❌ Máximo de reintentos alcanzado, lanzando error');
          throw error;
        }
      }
    }
  }

  /**
   * Verificar si un pago está realmente completado
   */
  async isPaymentCompleted(sessionId) {
    try {
      const result = await this.verifyPaymentStatus(sessionId);
      return result.status === 'complete' && result.is_paid;
    } catch (error) {
      console.error('Error verificando si el pago está completado:', error);
      return false;
    }
  }

  /**
   * Esperar hasta que un pago se complete (con timeout)
   */
  async waitForPaymentCompletion(sessionId, timeoutMs = 600000) { // 10 minutos
    console.log(`⏳ Esperando confirmación de pago (timeout: ${timeoutMs}ms)`);
    
    const startTime = Date.now();
    const checkInterval = 10000; // Verificar cada 10 segundos
    
    return new Promise((resolve, reject) => {
      const checkPayment = async () => {
        try {
          const elapsed = Date.now() - startTime;
          
          if (elapsed >= timeoutMs) {
            reject(new Error('Timeout esperando confirmación de pago'));
            return;
          }
          
          const result = await this.verifyPaymentStatus(sessionId);
          
          if (result.status === 'complete' && result.is_paid) {
            console.log('✅ Pago confirmado después de esperar');
            resolve(result);
          } else if (result.status === 'expired' || result.status === 'failed') {
            reject(new Error(`Pago ${result.status}`));
          } else {
            // Continuar esperando
            setTimeout(checkPayment, checkInterval);
          }
          
        } catch (error) {
          reject(error);
        }
      };
      
      // Iniciar verificación
      checkPayment();
    });
  }

  /**
   * Obtener información de suscripción
   */
  async getSubscriptionInfo(customerId) {
    try {
      const response = await fetch(`${this.baseURL}/api/stripe/subscription-info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customer_id: customerId })
      });

      if (!response.ok) {
        throw new Error('Error obteniendo información de suscripción');
      }

      const subscription = await response.json();
      return subscription;

    } catch (error) {
      console.error('Error obteniendo información de suscripción:', error);
      throw error;
    }
  }

  /**
   * Cancelar suscripción
   */
  async cancelSubscription(subscriptionId) {
    try {
      const response = await fetch(`${this.baseURL}/api/stripe/cancel-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription_id: subscriptionId })
      });

      if (!response.ok) {
        throw new Error('Error cancelando suscripción');
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('Error cancelando suscripción:', error);
      throw error;
    }
  }

  /**
   * Crear portal del cliente para gestionar suscripción
   */
  async createCustomerPortal(customerId) {
    try {
      const response = await fetch(`${this.baseURL}/api/stripe/customer-portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          customer_id: customerId,
          return_url: `${this.baseURL}/company/subscription`
        })
      });

      if (!response.ok) {
        throw new Error('Error creando portal del cliente');
      }

      const portal = await response.json();
      
      // Abrir portal en navegador externo
      await WebBrowser.openBrowserAsync(portal.url, {
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        showTitle: true,
        toolbarColor: '#6366f1',
        controlsColor: '#ffffff'
      });

      return portal;

    } catch (error) {
      console.error('Error abriendo portal del cliente:', error);
      throw error;
    }
  }

  /**
   * Formatear precio para mostrar
   */
  formatPrice(amount, currency = 'EUR') {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Calcular total del primer pago (plan + configuración inicial)
   */
  calculateFirstPaymentTotal(planId) {
    const plans = this.getSubscriptionPlans();
    const initialPayment = this.getInitialPayment();
    const plan = plans[planId];

    if (!plan) return 0;

    return plan.price + initialPayment.price;
  }

  /**
   * Gestionar renovación automática
   */
  async manageAutoRenewal(subscriptionId, enableAutoRenewal) {
    try {
      const response = await fetch(`${this.baseURL}/api/stripe/manage-auto-renewal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          subscription_id: subscriptionId,
          enable_auto_renewal: enableAutoRenewal
        })
      });

      if (!response.ok) {
        throw new Error('Error gestionando renovación automática');
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('Error gestionando renovación automática:', error);
      throw error;
    }
  }

  /**
   * Obtener estado de renovación automática
   */
  async getAutoRenewalStatus(subscriptionId) {
    try {
      const response = await fetch(`${this.baseURL}/api/stripe/auto-renewal-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription_id: subscriptionId })
      });

      if (!response.ok) {
        throw new Error('Error obteniendo estado de renovación');
      }

      const status = await response.json();
      return status;

    } catch (error) {
      console.error('Error obteniendo estado de renovación:', error);
      throw error;
    }
  }

  /**
   * Obtener resumen de facturación con renovaciones
   */
  getBillingSummary(planId) {
    const plans = this.getSubscriptionPlans();
    const initialPayment = this.getInitialPayment();
    const plan = plans[planId];

    if (!plan) return null;

    const firstPayment = plan.price + initialPayment.price;
    const monthlyPayment = plan.price;
    const totalPlan = plan.price * plan.duration_months;
    const totalWithSetup = totalPlan + initialPayment.price;

    return {
      plan: plan,
      initialPayment: initialPayment,
      firstPayment: firstPayment,
      monthlyPayment: monthlyPayment,
      totalPlan: totalPlan,
      totalWithSetup: totalWithSetup,
      autoRenewal: {
        enabled: true, // Por defecto habilitado
        renewalPrice: monthlyPayment,
        renewalPeriod: plan.duration_months,
        description: `Se renovará automáticamente cada ${plan.duration_months} meses por ${this.formatPrice(monthlyPayment)}/mes`
      },
      savings: planId === 'plan_6_months' ? (499 - 399) * 6 : 
               planId === 'plan_12_months' ? (499 - 299) * 12 : 0
    };
  }

  /**
   * Calcular ahorros anuales con renovación automática
   */
  calculateAnnualSavings(planId) {
    const plans = this.getSubscriptionPlans();
    const plan = plans[planId];
    
    if (!plan) return 0;

    const monthlyPlanPrice = 499; // Precio base mensual
    const annualCost = plan.price * 12;
    const monthlyAnnualCost = monthlyPlanPrice * 12;
    
    return monthlyAnnualCost - annualCost;
  }
}

// Para React Native
export default new StripeService();

// Para Node.js testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = new StripeService();
}