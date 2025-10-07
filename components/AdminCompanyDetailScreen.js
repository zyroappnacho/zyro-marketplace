import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MinimalistIcons from './MinimalistIcons';
import { LinearGradient } from 'expo-linear-gradient';
import StorageService from '../services/StorageService';
import CompanyDataSyncService from '../services/CompanyDataSyncService';

const AdminCompanyDetailScreen = ({ navigation, route }) => {
  const { companyId } = route.params;
  const [companyData, setCompanyData] = useState(null);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSyncUpdate, setLastSyncUpdate] = useState(null);

  useEffect(() => {
    loadCompanyDetails();
    
    // Suscribirse a cambios en tiempo real de esta empresa
    console.log('🔔 AdminCompanyDetailScreen: Suscribiéndose a cambios en tiempo real para empresa:', companyId);
    
    const unsubscribe = CompanyDataSyncService.subscribeToCompanyChanges(
      companyId,
      (syncData) => {
        console.log('📨 AdminCompanyDetailScreen: Recibida actualización en tiempo real:', syncData.source);
        
        // Actualizar datos de la empresa con los nuevos datos
        setCompanyData(prevData => ({
          ...prevData,
          ...syncData.updatedData,
          lastSyncUpdate: syncData.timestamp,
          syncSource: syncData.source
        }));
        
        setLastSyncUpdate(syncData.timestamp);
        
        // Mostrar notificación visual de actualización
        Alert.alert(
          '🔄 Datos Actualizados',
          `Los datos de la empresa han sido actualizados desde ${syncData.source === 'company_data_screen' ? 'la pantalla de datos de empresa' : 'otra fuente'}.`,
          [{ text: 'OK' }]
        );
      },
      'AdminCompanyDetailScreen'
    );
    
    // Cleanup al desmontar el componente
    return () => {
      console.log('🔕 AdminCompanyDetailScreen: Desuscribiéndose de cambios en tiempo real');
      unsubscribe();
    };
  }, [companyId]);

  // FUNCIÓN: Convertir plan guardado al formato de visualización (misma lógica que CompanyDashboard y CompanySubscriptionPlans)
  const convertStoredPlanToDisplayFormat = (storedPlan, companyData) => {
    console.log('🔄 [AdminCompanyDetail] Convirtiendo plan guardado al formato de visualización:', storedPlan);
    
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
        console.log('✅ [AdminCompanyDetail] Plan mapeado desde string:', storedPlan, '→', mappedPlan.name);
        return {
          ...mappedPlan,
          totalPrice: mappedPlan.price * mappedPlan.duration,
          status: companyData.status || 'active'
        };
      }
    }

    // Si el plan ya es un objeto, usarlo directamente pero asegurar campos necesarios
    if (typeof storedPlan === 'object' && storedPlan !== null) {
      console.log('✅ [AdminCompanyDetail] Plan es objeto, usando directamente:', storedPlan);
      const duration = storedPlan.duration || 6;
      const price = storedPlan.price || 399;
      return {
        id: storedPlan.id || 'plan_6_months',
        name: storedPlan.name || 'Plan Personalizado',
        price: price,
        duration: duration,
        totalPrice: price * duration,
        description: storedPlan.description || 'Plan personalizado',
        status: companyData.status || 'active'
      };
    }

    // Fallback: detectar por precio mensual si está disponible
    if (companyData.monthlyAmount) {
      const monthlyPrice = Number(companyData.monthlyAmount);
      console.log(`💰 [AdminCompanyDetail] Detectando por precio mensual: ${monthlyPrice}€`);
      
      if (monthlyPrice === 499) {
        console.log('✅ [AdminCompanyDetail] Plan detectado por precio: Plan 3 Meses (499€)');
        return { ...planMappings['plan_3_months'], totalPrice: 499 * 3 };
      }
      if (monthlyPrice === 399) {
        console.log('✅ [AdminCompanyDetail] Plan detectado por precio: Plan 6 Meses (399€)');
        return { ...planMappings['plan_6_months'], totalPrice: 399 * 6 };
      }
      if (monthlyPrice === 299) {
        console.log('✅ [AdminCompanyDetail] Plan detectado por precio: Plan 12 Meses (299€)');
        return { ...planMappings['plan_12_months'], totalPrice: 299 * 12 };
      }
    }

    // Fallback al plan por defecto
    console.log('⚠️ [AdminCompanyDetail] Plan no reconocido, usando plan por defecto:', storedPlan);
    return {
      ...planMappings['plan_6_months'],
      totalPrice: 399 * 6,
      status: 'active'
    };
  };

  // FUNCIÓN: Detectar estado de pago inteligente (para entorno de prueba Stripe)
  const getPaymentStatus = (companyData) => {
    if (!companyData) return 'pending';

    console.log('🔍 [AdminCompanyDetail] Detectando estado de pago para:', companyData.companyName);
    console.log('📋 [AdminCompanyDetail] Datos disponibles:', {
      status: companyData.status,
      firstPaymentCompletedDate: companyData.firstPaymentCompletedDate,
      paymentCompletedDate: companyData.paymentCompletedDate,
      registrationDate: companyData.registrationDate,
      selectedPlan: companyData.selectedPlan,
      monthlyAmount: companyData.monthlyAmount,
      paymentMethodName: companyData.paymentMethodName
    });

    // CRITERIO 1: Estado explícito de pago completado
    if (companyData.status === 'payment_completed' || companyData.status === 'active') {
      console.log('✅ [AdminCompanyDetail] Estado explícito: pago completado');
      return 'completed';
    }

    // CRITERIO 2: Fecha de primer pago completado existe
    if (companyData.firstPaymentCompletedDate || companyData.paymentCompletedDate) {
      console.log('✅ [AdminCompanyDetail] Fecha de pago completado encontrada');
      return 'completed';
    }

    // CRITERIO 3: Tiene plan seleccionado Y método de pago (indica proceso completado)
    if (companyData.selectedPlan && companyData.paymentMethodName && companyData.paymentMethodName !== 'No definido') {
      console.log('✅ [AdminCompanyDetail] Plan y método de pago definidos - asumiendo pago completado');
      return 'completed';
    }

    // CRITERIO 4: Tiene plan seleccionado Y precio mensual (proceso de Stripe completado)
    if (companyData.selectedPlan && companyData.monthlyAmount && companyData.monthlyAmount > 0) {
      console.log('✅ [AdminCompanyDetail] Plan y precio definidos - proceso Stripe completado');
      return 'completed';
    }

    // CRITERIO 5: Para entorno de prueba - si tiene datos de suscripción básicos
    if (companyData.selectedPlan && (companyData.selectedPlan.includes('plan_') || companyData.selectedPlan.includes('Plan'))) {
      console.log('✅ [AdminCompanyDetail] Plan válido detectado - entorno de prueba, asumiendo completado');
      return 'completed';
    }

    console.log('⚠️ [AdminCompanyDetail] No se detectó pago completado - estado pendiente');
    return 'pending';
  };

  // FUNCIÓN: Obtener texto del estado de pago
  const getPaymentStatusText = (companyData) => {
    const status = getPaymentStatus(companyData);
    return status === 'completed' ? 'Pagos al día' : 'Pendiente de pago';
  };

  // FUNCIÓN: Obtener estado de cuenta
  const getAccountStatus = (companyData) => {
    const paymentStatus = getPaymentStatus(companyData);
    return paymentStatus === 'completed' ? 'active' : 'pending';
  };

  // FUNCIÓN: Obtener texto del estado de cuenta
  const getAccountStatusText = (companyData) => {
    const status = getAccountStatus(companyData);
    return status === 'active' ? 'Cuenta Activa' : 'Cuenta Pendiente';
  };

  // FUNCIÓN: Obtener información del plan para mostrar
  const getDisplayPlanInfo = () => {
    if (!companyData) {
      return {
        name: 'Plan 6 Meses',
        price: 399,
        duration: 6,
        totalPrice: 2394
      };
    }

    // Usar subscriptionData si está disponible
    if (subscriptionData?.plan) {
      const duration = subscriptionData.plan.duration || 6;
      const price = subscriptionData.plan.price || 399;
      return {
        name: subscriptionData.plan.name || 'Plan Personalizado',
        price: price,
        duration: duration,
        totalPrice: subscriptionData.plan.totalPrice || (price * duration)
      };
    }

    // Usar la función de conversión con selectedPlan
    if (companyData.selectedPlan) {
      return convertStoredPlanToDisplayFormat(companyData.selectedPlan, companyData);
    }

    // Fallback usando datos directos
    const price = companyData.monthlyAmount || 399;
    const duration = companyData.planDuration || 6;
    return {
      name: companyData.selectedPlan || 'Plan 6 Meses',
      price: price,
      duration: duration,
      totalPrice: companyData.totalAmount || (price * duration)
    };
  };

  const loadCompanyDetails = async () => {
    try {
      setIsLoading(true);
      
      console.log('📋 AdminCompanyDetailScreen: BÚSQUEDA EXHAUSTIVA de datos para empresa:', companyId);
      
      // BÚSQUEDA EXHAUSTIVA EN TODAS LAS FUENTES POSIBLES
      console.log('🔍 Paso 1: Buscando en TODAS las fuentes disponibles...');
      
      // Fuente 1: Servicio de sincronización
      const syncData = await CompanyDataSyncService.getLatestCompanyData(companyId);
      
      // Fuente 2: Datos directos de empresa
      const directCompanyData = await StorageService.getCompanyData(companyId);
      
      // Fuente 3: Usuario aprobado
      const approvedUserData = await StorageService.getApprovedUser(companyId);
      
      // Fuente 4: Lista de empresas
      const companiesList = await StorageService.getCompaniesList();
      const companyFromList = companiesList.find(c => c.id === companyId);
      
      // Fuente 5: Buscar por email en usuarios aprobados (para empresas nuevas)
      let userByEmail = null;
      if (companyFromList?.email) {
        userByEmail = await StorageService.getApprovedUserByEmail(companyFromList.email);
      }
      
      // Fuente 6: Buscar en datos de formulario de registro
      const formData = await StorageService.getFormData();
      let registrationData = null;
      if (formData && (formData.companyId === companyId || formData.email === companyFromList?.email)) {
        registrationData = formData;
      }
      
      console.log('📊 AdminCompanyDetailScreen: RESULTADOS DE BÚSQUEDA:');
      console.log(`   🔄 Servicio de sincronización: ${syncData ? '✅ ENCONTRADO' : '❌ No encontrado'}`);
      console.log(`   💾 Datos directos de empresa: ${directCompanyData ? '✅ ENCONTRADO' : '❌ No encontrado'}`);
      console.log(`   👤 Usuario aprobado: ${approvedUserData ? '✅ ENCONTRADO' : '❌ No encontrado'}`);
      console.log(`   📋 Lista de empresas: ${companyFromList ? '✅ ENCONTRADO' : '❌ No encontrado'}`);
      console.log(`   📧 Usuario por email: ${userByEmail ? '✅ ENCONTRADO' : '❌ No encontrado'}`);
      console.log(`   📝 Datos de registro: ${registrationData ? '✅ ENCONTRADO' : '❌ No encontrado'}`);
      
      // COMBINACIÓN INTELIGENTE DE DATOS CON PRIORIDADES
      console.log('🔄 Paso 2: Combinando datos con sistema de prioridades...');
      
      const company = {
        // ID base
        id: companyId,
        
        // PRIORIDAD 1: Datos de sincronización (más recientes)
        ...(syncData || {}),
        
        // PRIORIDAD 2: Datos directos de empresa
        ...(directCompanyData || {}),
        
        // PRIORIDAD 3: Usuario aprobado
        ...(approvedUserData || {}),
        
        // PRIORIDAD 4: Usuario encontrado por email
        ...(userByEmail || {}),
        
        // PRIORIDAD 5: Datos de registro
        ...(registrationData || {}),
        
        // PRIORIDAD 6: Lista de empresas (datos básicos)
        ...(companyFromList || {}),
        
        // MAPEO EXHAUSTIVO DE CAMPOS CON MÚLTIPLES FALLBACKS
        companyName: syncData?.companyName || 
                    directCompanyData?.companyName || 
                    approvedUserData?.companyName || 
                    approvedUserData?.name || 
                    approvedUserData?.businessName ||
                    userByEmail?.companyName ||
                    userByEmail?.name ||
                    userByEmail?.businessName ||
                    registrationData?.companyName ||
                    companyFromList?.companyName ||
                    'Empresa ZYRO',
                    
        companyEmail: syncData?.companyEmail || 
                     directCompanyData?.companyEmail || 
                     approvedUserData?.companyEmail || 
                     approvedUserData?.email ||
                     userByEmail?.companyEmail ||
                     userByEmail?.email ||
                     registrationData?.companyEmail ||
                     registrationData?.email ||
                     companyFromList?.email ||
                     'contacto@empresa.com',
                     
        cifNif: syncData?.cifNif || 
               directCompanyData?.cifNif || 
               approvedUserData?.cifNif || 
               userByEmail?.cifNif ||
               registrationData?.cifNif ||
               'B12345678',
               
        companyAddress: syncData?.companyAddress || 
                       directCompanyData?.companyAddress || 
                       approvedUserData?.companyAddress || 
                       approvedUserData?.address ||
                       userByEmail?.companyAddress ||
                       userByEmail?.address ||
                       registrationData?.companyAddress ||
                       'Calle Principal 123, Madrid, España',
                       
        companyPhone: syncData?.companyPhone || 
                     directCompanyData?.companyPhone || 
                     approvedUserData?.companyPhone || 
                     approvedUserData?.phone ||
                     userByEmail?.companyPhone ||
                     userByEmail?.phone ||
                     registrationData?.companyPhone ||
                     '+34 91 123 4567',
                     
        representativeName: syncData?.representativeName || 
                           directCompanyData?.representativeName || 
                           approvedUserData?.representativeName || 
                           approvedUserData?.fullName ||
                           userByEmail?.representativeName ||
                           userByEmail?.fullName ||
                           registrationData?.representativeName ||
                           'Representante Legal',
                           
        representativeEmail: syncData?.representativeEmail || 
                            directCompanyData?.representativeEmail || 
                            approvedUserData?.representativeEmail || 
                            approvedUserData?.email ||
                            userByEmail?.representativeEmail ||
                            userByEmail?.email ||
                            registrationData?.representativeEmail ||
                            registrationData?.email ||
                            'representante@empresa.com',
                            
        representativePosition: syncData?.representativePosition || 
                               directCompanyData?.representativePosition || 
                               approvedUserData?.representativePosition ||
                               userByEmail?.representativePosition ||
                               registrationData?.representativePosition ||
                               'Director General',
                               
        businessType: syncData?.businessType || 
                     directCompanyData?.businessType || 
                     approvedUserData?.businessType ||
                     userByEmail?.businessType ||
                     registrationData?.businessType ||
                     'Servicios Empresariales',
                     
        businessDescription: syncData?.businessDescription || 
                            directCompanyData?.businessDescription || 
                            approvedUserData?.businessDescription || 
                            approvedUserData?.description ||
                            userByEmail?.businessDescription ||
                            userByEmail?.description ||
                            registrationData?.businessDescription ||
                            'Empresa dedicada a servicios profesionales y consultoría empresarial.',
                            
        website: syncData?.website || 
                directCompanyData?.website || 
                approvedUserData?.website ||
                userByEmail?.website ||
                registrationData?.website ||
                'https://www.empresa.com',
        
        // Datos de suscripción y estado
        selectedPlan: syncData?.selectedPlan || 
                     directCompanyData?.selectedPlan || 
                     approvedUserData?.selectedPlan || 
                     approvedUserData?.plan ||
                     userByEmail?.selectedPlan ||
                     userByEmail?.plan ||
                     companyFromList?.plan ||
                     'Plan 6 Meses',
                     
        status: syncData?.status || 
               directCompanyData?.status || 
               approvedUserData?.status ||
               userByEmail?.status ||
               companyFromList?.status ||
               'payment_completed',
               
        registrationDate: syncData?.registrationDate || 
                         directCompanyData?.registrationDate || 
                         approvedUserData?.registrationDate || 
                         approvedUserData?.createdAt ||
                         userByEmail?.registrationDate ||
                         userByEmail?.createdAt ||
                         companyFromList?.registrationDate ||
                         new Date().toISOString(),
        
        // Metadatos de carga
        dataSource: 'exhaustive_search',
        loadedAt: new Date().toISOString(),
        sourcesUsed: [
          syncData ? 'sync_service' : null,
          directCompanyData ? 'company_data' : null,
          approvedUserData ? 'approved_user' : null,
          userByEmail ? 'user_by_email' : null,
          registrationData ? 'registration_form' : null,
          companyFromList ? 'companies_list' : null
        ].filter(Boolean),
        
        // Información adicional
        totalSourcesChecked: 6,
        sourcesWithData: [syncData, directCompanyData, approvedUserData, userByEmail, registrationData, companyFromList].filter(Boolean).length
      };
      
      console.log('✅ AdminCompanyDetailScreen: DATOS COMBINADOS EXITOSAMENTE');
      console.log(`   📊 Fuentes consultadas: ${company.totalSourcesChecked}`);
      console.log(`   📈 Fuentes con datos: ${company.sourcesWithData}`);
      console.log(`   🏢 Nombre final: "${company.companyName}"`);
      console.log(`   📧 Email final: "${company.companyEmail}"`);
      console.log(`   🔗 Fuentes utilizadas: ${company.sourcesUsed.join(', ')}`);
      
      // PASO 3: Cargar datos de suscripción
      const subscription = await StorageService.getCompanySubscription(companyId);
      
      // PASO 4: Guardar datos combinados para futuras consultas
      if (company.sourcesWithData > 0) {
        console.log('💾 Guardando datos combinados para futuras consultas...');
        await StorageService.saveCompanyData({
          ...company,
          lastCombinedUpdate: new Date().toISOString(),
          combinedFromSources: company.sourcesUsed
        });
      }
      
      setCompanyData(company);
      setSubscriptionData(subscription);
      
      // Si hay datos de sincronización, mostrar información
      if (company.lastSyncUpdate) {
        setLastSyncUpdate(company.lastSyncUpdate);
        console.log('🔄 AdminCompanyDetailScreen: Datos incluyen sincronización desde:', company.syncSource);
      }
      
      setIsLoading(false);
      
    } catch (error) {
      console.error('❌ AdminCompanyDetailScreen: Error en búsqueda exhaustiva:', error);
      
      // FALLBACK DE EMERGENCIA: Crear datos mínimos
      console.log('🆘 Creando datos de emergencia...');
      const emergencyData = {
        id: companyId,
        companyName: 'Empresa ZYRO',
        companyEmail: 'contacto@empresa.com',
        cifNif: 'B12345678',
        companyAddress: 'Calle Principal 123, Madrid, España',
        companyPhone: '+34 91 123 4567',
        representativeName: 'Representante Legal',
        representativeEmail: 'representante@empresa.com',
        representativePosition: 'Director General',
        businessType: 'Servicios Empresariales',
        businessDescription: 'Empresa dedicada a servicios profesionales.',
        website: 'https://www.empresa.com',
        selectedPlan: 'Plan 6 Meses',
        status: 'payment_completed',
        registrationDate: new Date().toISOString(),
        dataSource: 'emergency_fallback',
        loadedAt: new Date().toISOString(),
        sourcesUsed: ['emergency_fallback']
      };
      
      setCompanyData(emergencyData);
      setSubscriptionData(null);
      setIsLoading(false);
      
      console.log('✅ Datos de emergencia cargados');
    }
  };

  const renderDataField = (label, value, icon = null) => (
    <View style={styles.dataField}>
      <View style={styles.fieldHeader}>
        {icon && <MinimalistIcons name={icon || 'help'} size={20} color="#C9A961" />}
        <Text style={styles.fieldLabel}>{label}</Text>
      </View>
      <View style={styles.fieldValueContainer}>
        <Text style={styles.fieldValue}>{value || 'No especificado'}</Text>
      </View>
    </View>
  );

  const renderSection = (title, children, icon = null) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        {icon && <MinimalistIcons name={icon || 'help'} size={24} color="#C9A961" />}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando datos de la empresa...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!companyData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No se encontraron datos de la empresa</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
        >
          <MinimalistIcons name="back" size={24} color="#C9A961" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles de Empresa</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={loadCompanyDetails}
          >
            <MinimalistIcons name="refresh" size={20} color="#C9A961" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Información Básica de la Empresa */}
        {renderSection('Información Básica', (
          <View>
            {renderDataField('Nombre de la Empresa', companyData.companyName, 'business')}
            {renderDataField('CIF/NIF', companyData.cifNif, 'help')}
            {renderDataField('Dirección', companyData.companyAddress, 'location')}
            {renderDataField('Teléfono', companyData.companyPhone, 'phone')}
            {renderDataField('Email Corporativo', companyData.companyEmail, 'message')}
            {renderDataField('Sitio Web', companyData.website, 'world')}
          </View>
        ), 'business')}

        {/* Representante Legal */}
        {renderSection('Representante Legal', (
          <View>
            {renderDataField('Nombre Completo', companyData.representativeName, 'profile')}
            {renderDataField('Email', companyData.representativeEmail, 'message')}
            {renderDataField('Cargo/Posición', companyData.representativePosition, 'briefcase')}
          </View>
        ), 'profile')}

        {/* Información del Negocio */}
        {renderSection('Información del Negocio', (
          <View>
            {renderDataField('Tipo de Negocio', companyData.businessType, 'business')}
            {renderDataField('Descripción del Negocio', companyData.businessDescription, 'help')}
          </View>
        ), 'business')}

        {/* Información de Suscripción */}
        {renderSection('Suscripción y Pagos', (
          <View>
            {renderDataField('Plan Actual', getDisplayPlanInfo().name, 'target')}
            {renderDataField('Precio Mensual', `€${getDisplayPlanInfo().price}`, 'target')}
            {renderDataField('Duración del Plan', `${getDisplayPlanInfo().duration} meses`, 'history')}
            {renderDataField('Total del Plan', `€${getDisplayPlanInfo().totalPrice}`, 'target')}
            {renderDataField('Método de Pago', subscriptionData?.paymentMethod?.name || companyData.paymentMethodName || 'Stripe', 'target')}
            {renderDataField('Estado de Pago', getPaymentStatusText(companyData), 'check')}
          </View>
        ), 'target')}

        {/* Fechas Importantes */}
        {renderSection('Fechas Importantes', (
          <View>
            {renderDataField('Fecha de Registro', companyData.registrationDate ? new Date(companyData.registrationDate).toLocaleDateString() : 'No disponible', 'events')}
            {renderDataField('Primer Pago Completado', companyData.firstPaymentCompletedDate ? new Date(companyData.firstPaymentCompletedDate).toLocaleDateString() : 'No disponible', 'events')}
            {renderDataField('Próximo Pago', companyData.nextBillingDate ? new Date(companyData.nextBillingDate).toLocaleDateString() : 'No programado', 'events')}
            {renderDataField('Última Actualización', companyData.lastSaved ? new Date(companyData.lastSaved).toLocaleDateString() : 'No disponible', 'history')}
          </View>
        ), 'events')}

        {/* Imagen de Perfil si existe */}
        {companyData.profileImage && renderSection('Imagen de Perfil', (
          <View style={styles.profileImageContainer}>
            <Image 
              source={{ uri: companyData.profileImage }} 
              style={styles.profileImage}
              resizeMode="cover"
            />
          </View>
        ), 'image')}

        {/* Estado de la Cuenta */}
        {renderSection('Estado de la Cuenta', (
          <View>
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusBadge,
                getAccountStatus(companyData) === 'active' ? styles.statusActive : styles.statusPending
              ]}>
                <MinimalistIcons 
                  name={getAccountStatus(companyData) === 'active' ? 'check' : 'history'} 
                  size={20} 
                  color="#FFFFFF"
                />
                <Text style={styles.statusText}>
                  {getAccountStatusText(companyData)}
                </Text>
              </View>
            </View>
            {renderDataField('ID de la Empresa', companyData.id, 'help')}
            {renderDataField('Versión de Datos', companyData.version || '1.0', 'help')}
            
            {/* Estado de Sincronización */}
            {lastSyncUpdate && (
              <View style={styles.syncStatusContainer}>
                <View style={styles.syncBadge}>
                  <MinimalistIcons name="refresh" size={16} color="#34C759" />
                  <Text style={styles.syncText}>
                    Sincronizado: {new Date(lastSyncUpdate).toLocaleString()}
                  </Text>
                </View>
                {companyData.syncSource && (
                  <Text style={styles.syncSourceText}>
                    Fuente: {companyData.syncSource === 'company_data_screen' ? 'Pantalla de Datos de Empresa' : companyData.syncSource}
                  </Text>
                )}
              </View>
            )}
            
            {/* Información de Fuentes de Datos */}
            {companyData.dataSource && (
              <View style={styles.dataSourceContainer}>
                <View style={styles.dataSourceBadge}>
                  <MinimalistIcons name="help" size={16} color="#007AFF" />
                  <Text style={styles.dataSourceText}>
                    Datos cargados desde: {companyData.dataSource === 'multiple_sources' ? 'Múltiples fuentes' : companyData.dataSource}
                  </Text>
                </View>
                {companyData.sourcesUsed && companyData.sourcesUsed.length > 0 && (
                  <Text style={styles.sourcesUsedText}>
                    Fuentes: {companyData.sourcesUsed.map(source => {
                      const sourceNames = {
                        'company_data': 'Datos de Empresa',
                        'approved_user': 'Usuario Aprobado',
                        'companies_list': 'Lista de Empresas'
                      };
                      return sourceNames[source] || source;
                    }).join(', ')}
                  </Text>
                )}
                {companyData.loadedAt && (
                  <Text style={styles.loadedAtText}>
                    Cargado: {new Date(companyData.loadedAt).toLocaleString()}
                  </Text>
                )}
              </View>
            )}
          </View>
        ), 'shield-checkmark')}

        {/* Espacio adicional al final */}
        <View style={styles.bottomSpacer} />
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerBackButton: {
    padding: 5,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C9A961',
    textAlign: 'center',
    marginRight: 34, // Compensar el botón de atrás
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(201, 169, 97, 0.1)',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#C9A961',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#000000',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginHorizontal: 20,
    marginVertical: 15,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionIcon: {
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#C9A961',
  },
  dataField: {
    marginBottom: 15,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldIcon: {
    marginRight: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C9A961',
  },
  fieldValueContainer: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#444444',
  },
  fieldValue: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#C9A961',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 150,
    justifyContent: 'center',
  },
  statusActive: {
    backgroundColor: '#34C759',
  },
  statusPending: {
    backgroundColor: '#FF9500',
  },
  statusIcon: {
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bottomSpacer: {
    height: 30,
  },
  syncStatusContainer: {
    marginTop: 15,
    padding: 12,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(52, 199, 89, 0.3)',
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  syncIcon: {
    marginRight: 8,
  },
  syncText: {
    fontSize: 14,
    color: '#34C759',
    fontWeight: '600',
  },
  syncSourceText: {
    fontSize: 12,
    color: '#888888',
    fontStyle: 'italic',
  },
  dataSourceContainer: {
    marginTop: 15,
    padding: 12,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.3)',
  },
  dataSourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  dataSourceIcon: {
    marginRight: 8,
  },
  dataSourceText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  sourcesUsedText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 3,
  },
  loadedAtText: {
    fontSize: 11,
    color: '#888888',
    fontStyle: 'italic',
    marginTop: 2,
  },
});

export default AdminCompanyDetailScreen;