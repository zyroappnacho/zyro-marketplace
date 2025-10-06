import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import StripeService from '../services/StripeService';
import CompanyRegistrationService from '../services/CompanyRegistrationService';

const CompanyRegistrationWithStripe = ({ onSuccess, onBack }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [companyData, setCompanyData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    selectedPlan: 'basic',
    password: '' // Agregar campo de contraseña
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isProcessingRegistration, setIsProcessingRegistration] = useState(false); // DUPLICATE_PREVENTION

  const plans = [
    {
      id: 'basic',
      name: 'Plan 3 Meses',
      price: '499€/mes',
      originalPrice: null,
      duration: '3 meses',
      setupFee: '150€ (pago único)',
      totalFirstPayment: '649€',
      monthlyPrice: 499,
      setupPrice: 150,
      features: [
        'Promoción en Instagram',
        'Acceso a todos los influencers',
        'Configuración completa de anuncios',
        'Soporte prioritario'
      ]
    },
    {
      id: 'premium',
      name: 'Plan 6 Meses',
      price: '399€/mes',
      originalPrice: '499€/mes',
      duration: '6 meses',
      setupFee: '150€ (pago único)',
      totalFirstPayment: '549€',
      monthlyPrice: 399,
      setupPrice: 150,
      popular: true,
      savings: '20% de descuento',
      features: [
        'Promoción en Instagram',
        'Acceso a todos los influencers',
        'Configuración completa de anuncios',
        'Soporte prioritario',
        'Descuento del 20%'
      ]
    },
    {
      id: 'enterprise',
      name: 'Plan 12 Meses',
      price: '299€/mes',
      originalPrice: '499€/mes',
      duration: '12 meses',
      setupFee: '150€ (pago único)',
      totalFirstPayment: '449€',
      monthlyPrice: 299,
      setupPrice: 150,
      savings: '40% de descuento',
      features: [
        'Promoción en Instagram',
        'Acceso a todos los influencers',
        'Configuración completa de anuncios',
        'Soporte prioritario',
        'Descuento del 40%',
        'Consultoría personalizada'
      ]
    }
  ];

  const validateStep1 = () => {
    const newErrors = {};

    if (!companyData.name.trim()) {
      newErrors.name = 'El nombre de la empresa es obligatorio';
    }

    if (!companyData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(companyData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!companyData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    }

    if (!companyData.address.trim()) {
      newErrors.address = 'La dirección es obligatoria';
    }

    if (!companyData.password.trim()) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (companyData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePayment = async () => {
    // DUPLICATE_PREVENTION: Evitar procesamiento múltiple
    if (isProcessingRegistration) {
      console.log('🛑 Registro ya en proceso, ignorando solicitud duplicada');
      return;
    }

    setLoading(true);
    setIsProcessingRegistration(true); // DUPLICATE_PREVENTION
    try {
      console.log('🔄 Iniciando proceso de pago externo...');

      // Obtener datos del plan seleccionado
      const selectedPlanData = plans.find(p => p.id === companyData.selectedPlan);

      // Mapear plan seleccionado al formato del StripeService
      const planMapping = {
        'basic': 'plan_3_months',
        'premium': 'plan_6_months',
        'enterprise': 'plan_12_months'
      };

      const mappedPlan = planMapping[companyData.selectedPlan] || 'plan_3_months';

      // Preparar datos de la empresa
      const companyPaymentData = {
        id: `company_${Date.now()}`,
        name: companyData.name,
        email: companyData.email,
        phone: companyData.phone,
        address: companyData.address
      };

      console.log('📋 Datos de empresa:', companyPaymentData);
      console.log('📋 Plan seleccionado:', mappedPlan);
      console.log('📋 Datos del plan:', selectedPlanData);

      // Mostrar información antes de redirigir
      Alert.alert(
        'Redirigiendo al Pago',
        'Serás redirigido al navegador para completar el pago de forma segura con Stripe. Esto evita las comisiones de Apple.',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => setLoading(false)
          },
          {
            text: 'Continuar',
            onPress: async () => {
              try {
                // Usar el StripeService para redirigir al checkout externo
                const result = await StripeService.redirectToCheckout(companyPaymentData, mappedPlan);

                console.log('✅ Redirección completada:', result);

                if (result.type === 'demo_success') {
                  // Solo en modo demo - simular pago exitoso
                  console.log('⚠️ MODO DEMO: Simulando pago exitoso');
                  handlePaymentSuccess({
                    success: true,
                    sessionId: result.sessionId,
                    companyData: companyPaymentData,
                    plan: mappedPlan,
                    isDemoMode: true
                  });
                } else if (result.type === 'real_checkout') {
                  // Pago real - NO crear usuario aún, esperar confirmación
                  console.log('✅ Checkout real iniciado, esperando confirmación...');

                  Alert.alert(
                    'Pago en Proceso',
                    'El proceso de pago se ha iniciado en el navegador. Una vez que completes el pago exitosamente, tu cuenta será creada automáticamente.\n\n⚠️ IMPORTANTE: Tu cuenta solo se creará si el pago se completa correctamente.',
                    [
                      {
                        text: 'Entendido',
                        onPress: () => {
                          // Mostrar pantalla de espera de confirmación
                          handlePaymentPending({
                            sessionId: result.sessionId,
                            companyData: companyPaymentData,
                            plan: mappedPlan
                          });
                        }
                      }
                    ]
                  );
                } else {
                  // Otros tipos de resultado
                  console.log('ℹ️ Resultado de checkout:', result.type);
                  setLoading(false);
                }

              } catch (error) {
                console.error('❌ Error en redirección:', error);

                // No mostrar error si el usuario canceló
                if (error.message !== 'Pago cancelado por el usuario') {
                  Alert.alert('Error', 'No se pudo iniciar el proceso de pago. Inténtalo de nuevo.');
                }
                setLoading(false);
              }
            }
          }
        ]
      );

    } catch (error) {
      console.error('❌ Error en registro:', error);
      Alert.alert('Error', error.message || 'Error en el registro');
    } finally {
      setLoading(false);
      setIsProcessingRegistration(false); // DUPLICATE_PREVENTION: Limpiar estado
    }
  };

  const handlePaymentPending = async (paymentData) => {
    console.log('⏳ Pago pendiente de confirmación...');
    console.log('📋 SessionId:', paymentData.sessionId);

    try {
      setLoading(true);

      // Mostrar pantalla de espera
      Alert.alert(
        '⏳ Esperando Confirmación de Pago',
        'Tu pago está siendo procesado por Stripe. Una vez confirmado, tu cuenta será creada automáticamente.\n\n' +
        '• No cierres la aplicación\n' +
        '• El proceso puede tardar unos minutos\n' +
        '• Recibirás una notificación cuando esté listo',
        [
          {
            text: 'Verificar Pago Ahora',
            onPress: () => checkPaymentStatus(paymentData)
          },
          {
            text: 'Esperar',
            style: 'cancel',
            onPress: () => {
              // Iniciar verificación automática cada 30 segundos
              startPaymentVerification(paymentData);
            }
          }
        ]
      );

    } catch (error) {
      console.error('❌ Error en registro:', error);
      Alert.alert('Error', error.message || 'Error en el registro');
    }
  };

  const checkPaymentStatus = async (paymentData) => {
    try {
      console.log('🔍 Verificando estado del pago...');

      // Verificar estado del pago con Stripe
      const paymentStatus = await StripeService.verifyPaymentStatus(paymentData.sessionId);

      console.log('📊 Estado del pago:', paymentStatus);

      if (paymentStatus.status === 'complete' || paymentStatus.status === 'paid' || paymentStatus.is_valid_for_registration) {
        console.log('✅ Pago confirmado por Stripe');

        // Determinar el tipo de pago
        const paymentType = paymentStatus.is_test_mode ? 'test_payment' :
          paymentStatus.metadata?.demo_mode ? 'demo_payment' : 'real_payment';

        console.log(`💳 Tipo de pago detectado: ${paymentType}`);

        // Ahora SÍ crear el usuario empresa
        await handlePaymentSuccess({
          ...paymentData,
          success: true,
          paymentConfirmed: true,
          stripeStatus: paymentStatus,
          paymentType: paymentType,
          isTestMode: paymentStatus.is_test_mode || false
        });

      } else if (paymentStatus.status === 'open' || paymentStatus.status === 'pending') {
        console.log('⏳ Pago aún pendiente');

        Alert.alert(
          'Pago Pendiente',
          'Tu pago aún está siendo procesado. Por favor, espera unos minutos más.',
          [
            {
              text: 'Verificar de Nuevo',
              onPress: () => {
                setTimeout(() => checkPaymentStatus(paymentData), 10000); // Verificar en 10 segundos
              }
            },
            {
              text: 'Esperar',
              style: 'cancel'
            }
          ]
        );

      } else {
        console.log('❌ Pago no completado:', paymentStatus.status);

        Alert.alert(
          'Pago No Completado',
          'Tu pago no se ha completado exitosamente. Tu cuenta no será creada hasta que el pago sea confirmado.',
          [
            {
              text: 'Intentar de Nuevo',
              onPress: () => {
                // Volver al paso de pago
                setLoading(false);
              }
            },
            {
              text: 'Contactar Soporte',
              onPress: () => {
                Alert.alert(
                  'Contactar Soporte',
                  'Por favor, contacta con nuestro equipo de soporte con el ID de sesión: ' + paymentData.sessionId,
                  [{ text: 'OK' }]
                );
              }
            }
          ]
        );
      }

    } catch (error) {
      console.error('❌ Error verificando estado del pago:', error);

      Alert.alert(
        'Error de Verificación',
        'No se pudo verificar el estado del pago. Por favor, inténtalo de nuevo o contacta con soporte.',
        [
          {
            text: 'Reintentar',
            onPress: () => checkPaymentStatus(paymentData)
          },
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => setLoading(false)
          }
        ]
      );
    }
  };

  const startPaymentVerification = (paymentData) => {
    console.log('🔄 Iniciando verificación automática del pago...');

    let attempts = 0;
    const maxAttempts = 20; // 10 minutos máximo (30 segundos x 20)

    const verificationInterval = setInterval(async () => {
      attempts++;
      console.log(`🔍 Verificación automática #${attempts}/${maxAttempts}`);

      try {
        const paymentStatus = await StripeService.verifyPaymentStatus(paymentData.sessionId);

        if (paymentStatus.status === 'complete' || paymentStatus.status === 'paid' || paymentStatus.is_valid_for_registration) {
          console.log('✅ Pago confirmado automáticamente');
          clearInterval(verificationInterval);

          // Determinar el tipo de pago
          const paymentType = paymentStatus.is_test_mode ? 'test_payment' :
            paymentStatus.metadata?.demo_mode ? 'demo_payment' : 'real_payment';

          console.log(`💳 Tipo de pago detectado automáticamente: ${paymentType}`);

          await handlePaymentSuccess({
            ...paymentData,
            success: true,
            paymentConfirmed: true,
            stripeStatus: paymentStatus,
            autoVerified: true,
            paymentType: paymentType,
            isTestMode: paymentStatus.is_test_mode || false
          });

        } else if (attempts >= maxAttempts) {
          console.log('⏰ Tiempo de verificación agotado');
          clearInterval(verificationInterval);

          Alert.alert(
            'Verificación Agotada',
            'No se pudo confirmar tu pago automáticamente. Por favor, verifica manualmente o contacta con soporte.',
            [
              {
                text: 'Verificar Manualmente',
                onPress: () => checkPaymentStatus(paymentData)
              },
              {
                text: 'Contactar Soporte',
                onPress: () => {
                  Alert.alert(
                    'Información de Soporte',
                    `ID de Sesión: ${paymentData.sessionId}\nEmail: ${paymentData.companyData.email}`,
                    [{ text: 'OK' }]
                  );
                }
              }
            ]
          );
        }

      } catch (error) {
        console.error(`❌ Error en verificación automática #${attempts}:`, error);

        if (attempts >= maxAttempts) {
          clearInterval(verificationInterval);
          setLoading(false);
        }
      }
    }, 30000); // Verificar cada 30 segundos
  };

  const handlePaymentSuccess = async (paymentData) => {
    console.log('✅ Pago completado exitosamente');
    console.log('🏢 Iniciando creación de perfil de empresa...');

    try {
      setLoading(true);

      // 🛡️ VERIFICACIÓN CRÍTICA: Solo proceder si el pago está confirmado
      const isValidPayment = paymentData.isDemoMode ||
        paymentData.paymentConfirmed ||
        paymentData.isTestMode ||
        paymentData.paymentType === 'test_payment';

      if (!isValidPayment) {
        console.log('❌ SEGURIDAD: Pago no confirmado, no se creará el usuario');
        console.log('   isDemoMode:', paymentData.isDemoMode);
        console.log('   paymentConfirmed:', paymentData.paymentConfirmed);
        console.log('   isTestMode:', paymentData.isTestMode);
        console.log('   paymentType:', paymentData.paymentType);

        Alert.alert(
          'Error de Seguridad',
          'No se puede crear la cuenta sin confirmación de pago exitoso.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Log del tipo de pago para debugging
      console.log('✅ PAGO VÁLIDO DETECTADO:');
      console.log('   Tipo:', paymentData.paymentType || 'unknown');
      console.log('   Demo Mode:', paymentData.isDemoMode || false);
      console.log('   Test Mode:', paymentData.isTestMode || false);
      console.log('   Payment Confirmed:', paymentData.paymentConfirmed || false);

      // 🛡️ PROTECCIÓN ANTI-DUPLICADOS MEJORADA
      console.log('🔍 Verificando duplicados antes del procesamiento...');

      const registrationKey = `stripe_processing_${companyData.email.toLowerCase()}`;
      const sessionKey = `stripe_session_${paymentData.sessionId}`;

      // Verificar si ya se está procesando este registro
      const existingProcess = await AsyncStorage.getItem(registrationKey);
      const existingSession = await AsyncStorage.getItem(sessionKey);

      if (existingProcess) {
        const processData = JSON.parse(existingProcess);
        const timeDiff = Date.now() - processData.timestamp;

        // Si el proceso tiene menos de 5 minutos, evitar duplicado
        if (timeDiff < 300000) {
          console.log('⚠️ Registro ya en proceso, evitando duplicado');
          console.log('   Email:', companyData.email);
          console.log('   Tiempo transcurrido:', Math.round(timeDiff / 1000), 'segundos');

          Alert.alert(
            'Registro en Proceso',
            'Tu registro ya se está procesando. Por favor espera un momento.',
            [{ text: 'OK' }]
          );
          return;
        } else {
          // Limpiar proceso expirado
          await AsyncStorage.removeItem(registrationKey);
        }
      }

      if (existingSession) {
        console.log('⚠️ SessionId ya procesado, evitando duplicado');
        console.log('   SessionId:', paymentData.sessionId);

        Alert.alert(
          'Pago Ya Procesado',
          'Este pago ya ha sido procesado anteriormente.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Marcar como en proceso
      const processData = {
        timestamp: Date.now(),
        companyName: companyData.name,
        email: companyData.email,
        sessionId: paymentData.sessionId,
        status: 'processing',
        paymentConfirmed: paymentData.paymentConfirmed || false,
        isDemoMode: paymentData.isDemoMode || false
      };

      await AsyncStorage.setItem(registrationKey, JSON.stringify(processData));
      await AsyncStorage.setItem(sessionKey, JSON.stringify(processData));

      console.log('✅ Registro marcado como en proceso');

      // Agregar contraseña a los datos de la empresa
      const completeCompanyData = {
        ...paymentData.companyData,
        password: companyData.password // Usar la contraseña configurada por el usuario
      };

      // Crear perfil de empresa después del pago exitoso CONFIRMADO
      const registrationResult = await CompanyRegistrationService.handlePaymentSuccess({
        ...paymentData,
        companyData: completeCompanyData
      });

      if (registrationResult.success) {
        console.log('🎉 Empresa registrada exitosamente');

        // Limpiar marcas de proceso
        await AsyncStorage.removeItem(registrationKey);
        await AsyncStorage.removeItem(sessionKey);
        console.log('✅ Marcas de proceso limpiadas');

        // Mostrar mensaje de éxito adicional
        setTimeout(() => {
          let successMessage = '✅ ¡Registro Completado!';
          let paymentInfo = '';

          // Determinar mensaje según el tipo de pago
          switch (paymentData.paymentType) {
            case 'demo_payment':
              successMessage = '✅ ¡Registro Completado! (Modo Demo)';
              paymentInfo = '\n⚠️ Este es un registro de prueba sin pago real.';
              break;
            case 'test_payment':
              successMessage = '✅ ¡Registro Completado! (Pago de Prueba)';
              paymentInfo = '\n🧪 Pago de prueba de Stripe procesado exitosamente.';
              break;
            case 'real_payment':
              successMessage = '✅ ¡Registro y Pago Completados!';
              paymentInfo = '\n✅ Tu pago real ha sido procesado exitosamente.';
              break;
            default:
              if (paymentData.isDemoMode) {
                successMessage = '✅ ¡Registro Completado! (Modo Demo)';
                paymentInfo = '\n⚠️ Este es un registro de prueba.';
              } else if (paymentData.isTestMode) {
                successMessage = '✅ ¡Registro Completado! (Modo Test)';
                paymentInfo = '\n🧪 Pago de prueba procesado exitosamente.';
              } else {
                successMessage = '✅ ¡Registro y Pago Completados!';
                paymentInfo = '\n✅ Tu pago ha sido procesado exitosamente.';
              }
          }

          Alert.alert(
            successMessage,
            `Tu empresa "${completeCompanyData.name}" ha sido registrada exitosamente.${paymentInfo}\n\n` +
            `📧 Usuario: ${completeCompanyData.email}\n` +
            `🔑 Contraseña: ${completeCompanyData.password}\n\n` +
            `Ya puedes iniciar sesión con estas credenciales.`,
            [
              {
                text: 'Ir al Login',
                onPress: () => {
                  onSuccess && onSuccess({
                    ...paymentData,
                    registrationComplete: true,
                    companyId: registrationResult.companyId,
                    redirectTo: 'login'
                  });
                }
              }
            ]
          );
        }, 1000);

      } else {
        throw new Error(registrationResult.error || 'Error en el registro');
      }

    } catch (error) {
      console.error('❌ Error creando perfil de empresa:', error);

      // Limpiar marcas de proceso en caso de error
      const registrationKey = `stripe_processing_${companyData.email.toLowerCase()}`;
      const sessionKey = `stripe_session_${paymentData.sessionId}`;
      await AsyncStorage.removeItem(registrationKey);
      await AsyncStorage.removeItem(sessionKey);
      console.log('✅ Marcas de proceso limpiadas después del error');

      Alert.alert(
        'Error en el Registro',
        'Hubo un problema creando tu cuenta. Por favor, contacta con soporte con tu ID de sesión: ' + paymentData.sessionId,
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Registro de Empresa</Text>
        <Text style={styles.subtitle}>Paso 1: Información de la empresa</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre de la empresa *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={companyData.name}
            onChangeText={(text) => setCompanyData({ ...companyData, name: text })}
            placeholder="Ingresa el nombre de tu empresa"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email corporativo *</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            value={companyData.email}
            onChangeText={(text) => setCompanyData({ ...companyData, email: text })}
            placeholder="empresa@ejemplo.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Teléfono *</Text>
          <TextInput
            style={[styles.input, errors.phone && styles.inputError]}
            value={companyData.phone}
            onChangeText={(text) => setCompanyData({ ...companyData, phone: text })}
            placeholder="+34 600 000 000"
            keyboardType="phone-pad"
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Dirección *</Text>
          <TextInput
            style={[styles.input, errors.address && styles.inputError]}
            value={companyData.address}
            onChangeText={(text) => setCompanyData({ ...companyData, address: text })}
            placeholder="Dirección completa"
            multiline
          />
          {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contraseña *</Text>
          <TextInput
            style={[styles.input, errors.password && styles.inputError]}
            value={companyData.password}
            onChangeText={(text) => setCompanyData({ ...companyData, password: text })}
            placeholder="Contraseña para acceder a tu cuenta"
            secureTextEntry
            autoCapitalize="none"
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          <Text style={styles.helpText}>
            Esta será tu contraseña para acceder a la plataforma con tu email corporativo
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNextStep}>
          <Text style={styles.nextButtonText}>Siguiente</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Selecciona tu Plan</Text>
        <Text style={styles.subtitle}>Paso 2: Elige el plan que mejor se adapte a tu empresa</Text>
      </View>

      <View style={styles.plansContainer}>
        {plans.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard,
              companyData.selectedPlan === plan.id && styles.selectedPlan,
              plan.popular && styles.popularPlan
            ]}
            onPress={() => setCompanyData({ ...companyData, selectedPlan: plan.id })}
          >
            {plan.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>MÁS POPULAR</Text>
              </View>
            )}

            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planDuration}>{plan.duration}</Text>

            <View style={styles.priceContainer}>
              <Text style={styles.planPrice}>{plan.price}</Text>
              {plan.originalPrice && (
                <Text style={styles.originalPrice}>{plan.originalPrice}</Text>
              )}
            </View>

            {plan.savings && (
              <Text style={styles.savings}>{plan.savings}</Text>
            )}

            <Text style={styles.setupFee}>+ {plan.setupFee}</Text>

            <View style={styles.firstPaymentContainer}>
              <Text style={styles.firstPaymentLabel}>Primer pago:</Text>
              <Text style={styles.firstPaymentAmount}>{plan.totalFirstPayment}</Text>
            </View>

            <View style={styles.featuresContainer}>
              {plan.features.map((feature, index) => (
                <Text key={index} style={styles.feature}>✓ {feature}</Text>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.paymentInfo}>
        <Text style={styles.paymentInfoTitle}>💳 Pago Seguro</Text>
        <Text style={styles.paymentInfoText}>
          El pago se procesará de forma segura a través de Stripe en tu navegador web,
          evitando las comisiones adicionales de Apple.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setCurrentStep(1)}
        >
          <Text style={styles.backButtonText}>Atrás</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.payButton, loading && styles.disabledButton]}
          onPress={handlePayment}
          disabled={loading}
        >
          <Text style={styles.payButtonText}>
            {loading ? 'Procesando...' : 'Proceder al Pago'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {currentStep === 1 ? renderStep1() : renderStep2()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
  helpText: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  plansContainer: {
    padding: 20,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedPlan: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
    transform: [{ scale: 1.02 }],
  },
  popularPlan: {
    borderColor: '#10b981',
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  planName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: 4,
  },
  planDuration: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginRight: 12,
  },
  originalPrice: {
    fontSize: 18,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  savings: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
    marginBottom: 8,
  },
  setupFee: {
    fontSize: 14,
    color: '#f59e0b',
    fontWeight: '500',
    marginBottom: 8,
  },
  firstPaymentContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  firstPaymentLabel: {
    fontSize: 16,
    color: '#1e40af',
    fontWeight: '600',
  },
  firstPaymentAmount: {
    fontSize: 18,
    color: '#1e40af',
    fontWeight: 'bold',
  },
  featuresContainer: {
    marginTop: 8,
  },
  feature: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 6,
    lineHeight: 20,
  },
  paymentInfo: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  paymentInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
  },
  paymentInfoText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  backButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  backButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 10,
  },
  nextButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  payButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 10,
  },
  payButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
});

export default CompanyRegistrationWithStripe;