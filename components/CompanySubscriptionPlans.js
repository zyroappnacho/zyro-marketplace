import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import MinimalistIcons from './MinimalistIcons';
import StorageService from '../services/StorageService';
import StripeService from '../services/StripeService';

const CompanySubscriptionPlans = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  // Calcular próxima fecha de facturación
  const calculateNextBillingDate = (durationMonths) => {
    const now = new Date();
    const nextBilling = new Date(now);
    nextBilling.setMonth(now.getMonth() + durationMonths);
    return nextBilling.toISOString();
  };

  // Detectar plan específico de la empresa desde sus datos guardados
  const detectCompanyPlan = (companyData, companyId) => {
    console.log(`🔍 Detectando plan para empresa: ${companyId}`);
    console.log('📋 Datos disponibles:', {
      selectedPlan: companyData.selectedPlan,
      planId: companyData.planId,
      monthlyAmount: companyData.monthlyAmount,
      planDuration: companyData.planDuration
    });

    // Definir planes disponibles
    const availablePlans = {
      'Plan 3 Meses': { id: 'plan_3_months', name: 'Plan 3 Meses', price: 499, duration: 3, description: 'Perfecto para campañas cortas' },
      'Plan 6 Meses': { id: 'plan_6_months', name: 'Plan 6 Meses', price: 399, duration: 6, description: 'Ideal para estrategias a medio plazo' },
      'Plan 12 Meses': { id: 'plan_12_months', name: 'Plan 12 Meses', price: 299, duration: 12, description: 'Máximo ahorro para estrategias anuales' }
    };

    // PRIORIDAD 1: Detectar por precio mensual (más confiable)
    if (companyData.monthlyAmount) {
      const monthlyPrice = Number(companyData.monthlyAmount);
      console.log(`💰 Detectando por precio mensual: ${monthlyPrice}€`);
      
      if (monthlyPrice === 499) {
        console.log('✅ Plan detectado por precio: Plan 3 Meses (499€)');
        return availablePlans['Plan 3 Meses'];
      }
      if (monthlyPrice === 399) {
        console.log('✅ Plan detectado por precio: Plan 6 Meses (399€)');
        return availablePlans['Plan 6 Meses'];
      }
      if (monthlyPrice === 299) {
        console.log('✅ Plan detectado por precio: Plan 12 Meses (299€)');
        return availablePlans['Plan 12 Meses'];
      }
    }

    // PRIORIDAD 2: Detectar por nombre del plan
    if (companyData.selectedPlan) {
      console.log(`📋 Detectando por nombre: ${companyData.selectedPlan}`);
      
      if (availablePlans[companyData.selectedPlan]) {
        console.log(`✅ Plan detectado por nombre: ${companyData.selectedPlan}`);
        return availablePlans[companyData.selectedPlan];
      }

      // Buscar por patrones en el nombre
      const planName = String(companyData.selectedPlan).toLowerCase();
      if (planName.includes('3') && planName.includes('mes')) {
        console.log('✅ Plan detectado por patrón: Plan 3 Meses');
        return availablePlans['Plan 3 Meses'];
      }
      if (planName.includes('6') && planName.includes('mes')) {
        console.log('✅ Plan detectado por patrón: Plan 6 Meses');
        return availablePlans['Plan 6 Meses'];
      }
      if (planName.includes('12') && planName.includes('mes')) {
        console.log('✅ Plan detectado por patrón: Plan 12 Meses');
        return availablePlans['Plan 12 Meses'];
      }
    }

    // PRIORIDAD 3: Detectar por duración del plan
    if (companyData.planDuration) {
      const duration = Number(companyData.planDuration);
      console.log(`⏱️ Detectando por duración: ${duration} meses`);
      
      if (duration === 3) {
        console.log('✅ Plan detectado por duración: Plan 3 Meses');
        return availablePlans['Plan 3 Meses'];
      }
      if (duration === 6) {
        console.log('✅ Plan detectado por duración: Plan 6 Meses');
        return availablePlans['Plan 6 Meses'];
      }
      if (duration === 12) {
        console.log('✅ Plan detectado por duración: Plan 12 Meses');
        return availablePlans['Plan 12 Meses'];
      }
    }

    // Plan por defecto (6 meses es el más común)
    console.log('⚠️ No se pudo detectar plan específico, usando Plan 6 Meses por defecto');
    return availablePlans['Plan 6 Meses'];
  };

  // FUNCIÓN PRINCIPAL: Convertir plan guardado al formato de visualización (misma lógica que CompanyDashboard)
  const convertStoredPlanToDisplayFormat = (storedPlan, companyData) => {
    console.log('🔄 Convirtiendo plan guardado al formato de visualización:', storedPlan);
    
    // Mapear el plan guardado al formato de visualización
    const planMappings = {
      'plan_3_months': {
        id: 'plan_3_months',
        name: 'Plan 3 Meses',
        price: 499,
        duration: 3,
        description: 'Perfecto para campañas cortas'
      },
      'plan_6_months': {
        id: 'plan_6_months', 
        name: 'Plan 6 Meses',
        price: 399,
        duration: 6,
        description: 'Ideal para estrategias a medio plazo'
      },
      'plan_12_months': {
        id: 'plan_12_months',
        name: 'Plan 12 Meses', 
        price: 299,
        duration: 12,
        description: 'Máximo ahorro para estrategias anuales'
      }
    };

    // Si el plan guardado es un string simple, mapearlo
    if (typeof storedPlan === 'string') {
      const mappedPlan = planMappings[storedPlan];
      if (mappedPlan) {
        console.log('✅ Plan mapeado desde string:', storedPlan, '→', mappedPlan.name);
        return {
          ...mappedPlan,
          status: companyData.status || 'active',
          nextBillingDate: companyData.nextPaymentDate || calculateNextBillingDate(mappedPlan.duration),
          startDate: companyData.registrationDate || companyData.firstPaymentCompletedDate
        };
      }
    }

    // Si el plan ya es un objeto, usarlo directamente pero asegurar campos necesarios
    if (typeof storedPlan === 'object' && storedPlan !== null) {
      console.log('✅ Plan es objeto, usando directamente:', storedPlan);
      return {
        id: storedPlan.id || 'plan_6_months',
        name: storedPlan.name || 'Plan Personalizado',
        price: storedPlan.price || 399,
        duration: storedPlan.duration || 6,
        description: storedPlan.description || 'Plan personalizado',
        status: companyData.status || 'active',
        nextBillingDate: companyData.nextPaymentDate || calculateNextBillingDate(storedPlan.duration || 6),
        startDate: companyData.registrationDate || companyData.firstPaymentCompletedDate
      };
    }

    // Fallback al plan por defecto
    console.log('⚠️ Plan no reconocido, usando plan por defecto:', storedPlan);
    return getDefaultPlan();
  };

  const loadSubscriptionData = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Cargando datos de suscripción para usuario:', user.id);
      
      // Obtener datos de empresa
      const companyData = await StorageService.getCompanyData(user.id);
      console.log('📋 Datos de empresa obtenidos:', companyData);
      
      if (companyData && companyData.selectedPlan) {
        // Usar la misma lógica que CompanyDashboard para convertir el plan
        const planInfo = convertStoredPlanToDisplayFormat(companyData.selectedPlan, companyData);
        setCurrentPlan(planInfo);
        
        setSubscriptionInfo({
          plan: planInfo,
          startDate: companyData.registrationDate || companyData.firstPaymentCompletedDate,
          nextBillingDate: planInfo.nextBillingDate,
          status: planInfo.status,
          stripe_customer_id: companyData.stripe_customer_id
        });
        
        console.log('✅ Plan detectado desde datos de empresa:', planInfo.name);
        console.log(`   Plan: ${planInfo.name} (${planInfo.price}€/mes, ${planInfo.duration} meses)`);
        console.log(`   Datos: selectedPlan=${companyData.selectedPlan}, monthlyAmount=${companyData.monthlyAmount}`);
      } else {
        console.log('⚠️ No hay selectedPlan en datos de empresa, usando plan por defecto');
        setCurrentPlan(getDefaultPlan());
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('❌ Error cargando datos de suscripción:', error);
      setCurrentPlan(getDefaultPlan());
      setIsLoading(false);
    }
  };

  // NUEVA FUNCIÓN: Detectar plan específico de la empresa
  const detectCompanySpecificPlan = (companyData, companyId) => {
    console.log('🔍 Detectando plan específico para empresa:', companyId);
    console.log('📋 Datos disponibles:', {
      selectedPlan: companyData.selectedPlan,
      planId: companyData.planId,
      monthlyAmount: companyData.monthlyAmount,
      planDuration: companyData.planDuration,
      lastPlanSync: companyData.lastPlanSync
    });

    // PRIORIDAD 1: Si hay sincronización reciente, usar esos datos
    if (companyData.lastPlanSync && companyData.selectedPlan && companyData.monthlyAmount) {
      const syncDate = new Date(companyData.lastPlanSync);
      const now = new Date();
      const hoursSinceSync = (now - syncDate) / (1000 * 60 * 60);
      
      if (hoursSinceSync < 24) { // Datos sincronizados en las últimas 24 horas
        console.log('✅ Usando datos sincronizados recientes');
        return createPlanFromSyncedData(companyData);
      }
    }

    // PRIORIDAD 2: Detectar desde datos específicos de la empresa
    return detectCurrentPlan(companyData);
  };

  // Crear plan desde datos sincronizados
  const createPlanFromSyncedData = (companyData) => {
    const planMappings = {
      'Plan 3 Meses': { id: 'plan_3_months', name: 'Plan 3 Meses', price: 499, duration: 3 },
      'Plan 6 Meses': { id: 'plan_6_months', name: 'Plan 6 Meses', price: 399, duration: 6 },
      'Plan 12 Meses': { id: 'plan_12_months', name: 'Plan 12 Meses', price: 299, duration: 12 }
    };

    const basePlan = planMappings[companyData.selectedPlan] || 
                    Object.values(planMappings).find(p => p.price === companyData.monthlyAmount) ||
                    planMappings['Plan 6 Meses'];

    return {
      ...basePlan,
      status: companyData.status || 'active',
      nextBillingDate: companyData.nextBillingDate,
      startDate: companyData.planStartDate || companyData.registrationDate,
      syncedFromStripe: true,
      lastSync: companyData.lastPlanSync
    };
  };

  // FUNCIÓN ORIGINAL: Detectar plan actual de forma más robusta
  const detectCurrentPlan = (companyData) => {
    console.log('🔍 Detectando plan actual para empresa:', companyData.companyName);
    
    // Buscar en múltiples campos donde puede estar guardado el plan
    const possiblePlanFields = [
      companyData.selectedPlan,
      companyData.planId,
      companyData.plan,
      companyData.subscriptionPlan,
      companyData.currentPlan
    ];
    
    console.log('📋 Campos de plan encontrados:', possiblePlanFields);
    
    // Intentar detectar el plan desde diferentes fuentes
    for (const planField of possiblePlanFields) {
      if (planField) {
        const detectedPlan = mapPlanToDisplayFormat(planField, companyData);
        if (detectedPlan && detectedPlan.id !== 'plan_12_months') {
          console.log('✅ Plan detectado desde campo:', planField, '→', detectedPlan.name);
          return detectedPlan;
        }
      }
    }
    
    // Si no se detectó un plan específico, intentar desde el precio mensual
    if (companyData.monthlyAmount) {
      const planFromPrice = detectPlanFromPrice(companyData.monthlyAmount);
      if (planFromPrice) {
        console.log('✅ Plan detectado desde precio mensual:', companyData.monthlyAmount, '→', planFromPrice.name);
        return {
          ...planFromPrice,
          status: companyData.status || 'active',
          nextBillingDate: companyData.nextPaymentDate,
          startDate: companyData.registrationDate || companyData.firstPaymentCompletedDate
        };
      }
    }
    
    // Si no se detectó nada, usar plan por defecto pero registrar el problema
    console.log('⚠️ No se pudo detectar el plan específico, usando plan por defecto');
    console.log('   Datos disponibles:', {
      selectedPlan: companyData.selectedPlan,
      planId: companyData.planId,
      monthlyAmount: companyData.monthlyAmount,
      plan: companyData.plan
    });
    
    return getDefaultPlan();
  };

  // NUEVA FUNCIÓN: Mapear plan a formato de visualización
  const mapPlanToDisplayFormat = (planIdentifier, companyData) => {
    if (!planIdentifier) return null;
    
    // Convertir a string para comparación
    const planStr = String(planIdentifier).toLowerCase();
    
    // Mapeos directos por ID
    const planMappings = {
      'plan_3_months': {
        id: 'plan_3_months',
        name: 'Plan 3 Meses',
        price: 499,
        duration: 3,
        description: 'Perfecto para campañas cortas'
      },
      'plan_6_months': {
        id: 'plan_6_months', 
        name: 'Plan 6 Meses',
        price: 399,
        duration: 6,
        description: 'Ideal para estrategias a medio plazo'
      },
      'plan_12_months': {
        id: 'plan_12_months',
        name: 'Plan 12 Meses', 
        price: 299,
        duration: 12,
        description: 'Máximo ahorro para estrategias anuales'
      }
    };
    
    // Buscar por ID exacto
    if (planMappings[planStr]) {
      return planMappings[planStr];
    }
    
    // Buscar por patrones en el texto
    if (planStr.includes('3') && (planStr.includes('mes') || planStr.includes('month'))) {
      return planMappings['plan_3_months'];
    }
    
    if (planStr.includes('6') && (planStr.includes('mes') || planStr.includes('month'))) {
      return planMappings['plan_6_months'];
    }
    
    if (planStr.includes('12') && (planStr.includes('mes') || planStr.includes('month'))) {
      return planMappings['plan_12_months'];
    }
    
    // Buscar por nombres comunes
    if (planStr.includes('anual') || planStr.includes('año')) {
      return planMappings['plan_12_months'];
    }
    
    if (planStr.includes('semestral') || planStr.includes('medio')) {
      return planMappings['plan_6_months'];
    }
    
    if (planStr.includes('trimestral') || planStr.includes('corto')) {
      return planMappings['plan_3_months'];
    }
    
    return null;
  };

  // NUEVA FUNCIÓN: Detectar plan desde precio mensual
  const detectPlanFromPrice = (monthlyAmount) => {
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
  };

  const getDefaultPlan = () => {
    return {
      id: 'plan_6_months', // CAMBIO: Usar 6 meses como defecto en lugar de 12
      name: 'Plan 6 Meses',
      price: 399,
      duration: 6,
      description: 'Ideal para estrategias a medio plazo',
      status: 'active',
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      startDate: new Date().toISOString()
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Fecha no válida';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return '#34C759';
      case 'past_due':
        return '#FF9500';
      case 'canceled':
        return '#FF3B30';
      case 'incomplete':
        return '#FF9500';
      default:
        return '#C9A961';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'past_due':
        return 'Pago Pendiente';
      case 'canceled':
        return 'Cancelado';
      case 'incomplete':
        return 'Incompleto';
      default:
        return 'Desconocido';
    }
  };

  const renderCurrentPlanCard = () => {
    if (!currentPlan) return null;
    
    return (
      <View style={styles.currentPlanCard}>
        <View style={styles.planHeader}>
          <View style={styles.planTitleSection}>
            <Text style={styles.planName}>{currentPlan.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(currentPlan.status || 'active') }]}>
              <Text style={styles.statusText}>{getStatusText(currentPlan.status || 'active')}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.planPriceSection}>
          <Text style={styles.planPrice}>
            {StripeService.formatPrice(currentPlan.price)}
            <Text style={styles.priceUnit}>/mes</Text>
          </Text>
          <Text style={styles.planDescription}>{currentPlan.description}</Text>
        </View>

        <View style={styles.planDetailsSection}>
          <View style={styles.detailRow}>
            <MinimalistIcons name="events" size={20} color="#C9A961" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Duración del Plan</Text>
              <Text style={styles.detailValue}>{currentPlan.duration || 6} meses</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <MinimalistIcons name="target" size={20} color="#C9A961" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Próxima Facturación</Text>
              <Text style={styles.detailValue}>
                {formatDate(currentPlan.nextBillingDate || subscriptionInfo?.nextBillingDate)}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <MinimalistIcons name="check" size={20} color="#C9A961" />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Fecha de Activación</Text>
              <Text style={styles.detailValue}>
                {formatDate(subscriptionInfo?.startDate || new Date().toISOString())}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.adminContactSection}>
          <View style={styles.adminContactCard}>
            <MinimalistIcons name="profile" size={24} color="#C9A961" />
            <View style={styles.adminContactContent}>
              <Text style={styles.adminContactTitle}>Gestión de Suscripción</Text>
              <Text style={styles.adminContactText}>
                Para realizar cambios en tu plan o cancelar tu suscripción, por favor contacta con el administrador.
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const handleGoBack = () => {
    navigation?.goBack();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
            <MinimalistIcons name="back" size={24} color="#C9A961" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gestionar Suscripción</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <MinimalistIcons name="back" size={24} color="#C9A961" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestionar Suscripción</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Sección de Plan Actual */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plan Actual</Text>
          <Text style={styles.sectionSubtitle}>
            Información de tu suscripción activa pagada a través de Stripe
          </Text>
          
          {renderCurrentPlanCard()}
        </View>

        {/* Información adicional */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <MinimalistIcons name="help" size={24} color="#C9A961" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Información de Suscripción</Text>
              <Text style={styles.infoText}>
                • Tu suscripción se renovará automáticamente cuando se cumplan los {currentPlan?.duration || 6} meses del plan{'\n'}
                • Si deseas cancelar tu suscripción, debes avisar al administrador antes de la fecha de renovación{'\n'}
                • Para cambios de plan o método de pago, contacta con el administrador{'\n'}
                • Todos los pagos se procesan de forma segura a través de Stripe{'\n'}
                • Recibirás notificaciones por email sobre renovaciones y cambios
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C9A961',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#C9A961',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 20,
  },
  currentPlanCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#C9A961',
  },
  planHeader: {
    marginBottom: 15,
  },
  planTitleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  planName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  planPriceSection: {
    marginBottom: 20,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#C9A961',
    marginBottom: 5,
  },
  priceUnit: {
    fontSize: 18,
    color: '#CCCCCC',
  },
  planDescription: {
    fontSize: 16,
    color: '#CCCCCC',
  },
  planDetailsSection: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  adminContactSection: {
    marginTop: 10,
  },
  adminContactCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#2A2A2A',
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: '#C9A961',
  },
  adminContactContent: {
    flex: 1,
    marginLeft: 12,
  },
  adminContactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C9A961',
    marginBottom: 6,
  },
  adminContactText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },

  infoSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  infoContent: {
    flex: 1,
    marginLeft: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#C9A961',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
});

export default CompanySubscriptionPlans;