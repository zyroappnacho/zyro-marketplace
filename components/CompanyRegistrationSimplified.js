/**
 * Formulario de Registro de Empresa Simplificado
 * Va directo a Stripe después del formulario
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch } from 'react-redux';
import { setCompanyData } from '../store/slices/authSlice';
import StripeService from '../services/StripeService';

const CompanyRegistrationSimplified = ({ navigation }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [companyData, setCompanyDataState] = useState({
    name: '',
    email: '',
    password: '', // Añadimos contraseña
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'España',
    businessType: '',
    description: '',
    website: '',
    contactPerson: ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!companyData.name.trim()) {
      newErrors.name = 'El nombre de la empresa es obligatorio';
    }

    if (!companyData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(companyData.email)) {
      newErrors.email = 'El email no es válido';
    }

    if (!companyData.password.trim()) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (companyData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!companyData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    }

    if (!companyData.address.trim()) {
      newErrors.address = 'La dirección es obligatoria';
    }

    if (!companyData.city.trim()) {
      newErrors.city = 'La ciudad es obligatoria';
    }

    if (!companyData.contactPerson.trim()) {
      newErrors.contactPerson = 'El nombre de contacto es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setCompanyDataState(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleProceedToPayment = async () => {
    if (!validateForm()) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    setLoading(true);

    try {
      // Mostrar selector de plan antes de ir a Stripe
      Alert.alert(
        'Seleccionar Plan',
        'Elige tu plan de suscripción:',
        [
          {
            text: 'Plan 3 Meses - 499€/mes',
            onPress: () => redirectToStripe('plan_3_months')
          },
          {
            text: 'Plan 6 Meses - 399€/mes ⭐',
            onPress: () => redirectToStripe('plan_6_months')
          },
          {
            text: 'Plan 12 Meses - 299€/mes',
            onPress: () => redirectToStripe('plan_12_months')
          },
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => setLoading(false)
          }
        ]
      );

    } catch (error) {
      setLoading(false);
      console.error('Error preparando pago:', error);
      Alert.alert('Error', 'Error preparando el pago. Inténtalo de nuevo.');
    }
  };

  const redirectToStripe = async (selectedPlan) => {
    try {
      // Preparar datos de la empresa con ID único
      const companyWithId = {
        ...companyData,
        id: Date.now().toString(),
        registrationDate: new Date().toISOString()
      };

      // NUEVO: Capturar plan seleccionado para esta empresa específica
      console.log(`🎯 Capturando plan seleccionado: ${selectedPlan} para empresa: ${companyWithId.name}`);
      
      // Importar sistema de captura de planes
      const StripePlanCaptureSystem = require('../stripe-plan-capture-system').default;
      
      // Capturar plan específico de esta empresa
      const captureResult = await StripePlanCaptureSystem.capturePlanFromStripeRegistration(
        companyWithId, 
        selectedPlan
      );
      
      if (captureResult.success) {
        console.log('✅ Plan capturado exitosamente:', captureResult.capturedPlan.name);
      } else {
        console.log('⚠️ Error capturando plan:', captureResult.error);
      }

      // Guardar temporalmente los datos (se completarán después del pago)
      await saveCompanyDataTemporarily(companyWithId, selectedPlan);

      // Redirigir a Stripe
      const result = await StripeService.redirectToCheckout(companyWithId, selectedPlan);

      setLoading(false);

      // Manejar resultado del pago
      if (result.type === 'success') {
        // Verificar pago y completar registro
        await handlePaymentVerification(companyWithId, selectedPlan);
      } else if (result.type === 'cancel') {
        Alert.alert('Pago Cancelado', 'Puedes intentarlo de nuevo cuando estés listo.');
      }

    } catch (error) {
      setLoading(false);
      console.error('Error en redirección a Stripe:', error);
      Alert.alert('Error', 'No se pudo procesar el pago. Inténtalo de nuevo.');
    }
  };

  const saveCompanyDataTemporarily = async (companyWithId, selectedPlan) => {
    try {
      // Guardar en AsyncStorage temporalmente
      const tempData = {
        company: companyWithId,
        plan: selectedPlan,
        timestamp: Date.now()
      };

      // En una implementación real, esto se guardaría en tu backend
      console.log('Datos temporales guardados:', tempData);

    } catch (error) {
      console.error('Error guardando datos temporales:', error);
    }
  };

  const handlePaymentVerification = async (companyWithId, selectedPlan) => {
    try {
      // Simular verificación de pago exitosa
      // En producción, esto se haría via webhook de Stripe

      const completeCompanyData = {
        ...companyWithId,
        subscriptionStatus: 'active',
        subscriptionPlan: selectedPlan,
        paymentStatus: 'completed',
        stripeCustomerId: 'cus_' + Date.now(), // En producción vendría de Stripe
        subscriptionId: 'sub_' + Date.now() // En producción vendría de Stripe
      };

      // Guardar credenciales de login
      await saveCompanyCredentials(completeCompanyData);

      // Guardar en Redux
      dispatch(setCompanyData(completeCompanyData));

      Alert.alert(
        '¡Registro Completado!',
        `¡Bienvenido ${companyWithId.name}!\n\nTu empresa ha sido registrada exitosamente y el pago ha sido procesado.\n\nCredenciales de acceso:\n• Usuario: ${companyWithId.email}\n• Contraseña: ${companyWithId.password}\n\n¡Ya puedes acceder a tu panel de control!`,
        [
          {
            text: 'Acceder al Panel',
            onPress: () => {
              // Navegar al dashboard de empresa
              navigation.reset({
                index: 0,
                routes: [{ name: 'CompanyDashboard' }],
              });
            }
          }
        ]
      );

    } catch (error) {
      console.error('Error completando registro:', error);
      Alert.alert('Error', 'Hubo un problema completando el registro. Contacta con soporte.');
    }
  };

  const saveCompanyCredentials = async (companyData) => {
    try {
      // Guardar credenciales para login futuro
      const credentials = {
        email: companyData.email,
        password: companyData.password,
        userType: 'company',
        companyId: companyData.id,
        registrationDate: companyData.registrationDate
      };

      // En una implementación real, esto se guardaría de forma segura
      console.log('Credenciales guardadas:', credentials);

    } catch (error) {
      console.error('Error guardando credenciales:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Preparando pago...</Text>
        <Text style={styles.loadingSubtext}>
          Serás redirigido a Stripe para completar el pago de forma segura
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Registro de Empresa</Text>
          <Text style={styles.subtitle}>
            Completa los datos de tu empresa y procede al pago seguro
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre de la Empresa *</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={companyData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Ej: Mi Empresa SL"
              placeholderTextColor="#94a3b8"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Corporativo * (Usuario de acceso)</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              value={companyData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="contacto@miempresa.com"
              placeholderTextColor="#94a3b8"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña * (Para acceder a tu panel)</Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              value={companyData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#94a3b8"
              secureTextEntry
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Teléfono *</Text>
            <TextInput
              style={[styles.input, errors.phone && styles.inputError]}
              value={companyData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              placeholder="+34 600 000 000"
              placeholderTextColor="#94a3b8"
              keyboardType="phone-pad"
            />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Persona de Contacto *</Text>
            <TextInput
              style={[styles.input, errors.contactPerson && styles.inputError]}
              value={companyData.contactPerson}
              onChangeText={(value) => handleInputChange('contactPerson', value)}
              placeholder="Nombre del responsable"
              placeholderTextColor="#94a3b8"
            />
            {errors.contactPerson && <Text style={styles.errorText}>{errors.contactPerson}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dirección *</Text>
            <TextInput
              style={[styles.input, errors.address && styles.inputError]}
              value={companyData.address}
              onChangeText={(value) => handleInputChange('address', value)}
              placeholder="Calle, número, piso..."
              placeholderTextColor="#94a3b8"
            />
            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 2, marginRight: 10 }]}>
              <Text style={styles.label}>Ciudad *</Text>
              <TextInput
                style={[styles.input, errors.city && styles.inputError]}
                value={companyData.city}
                onChangeText={(value) => handleInputChange('city', value)}
                placeholder="Madrid"
                placeholderTextColor="#94a3b8"
              />
              {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Código Postal</Text>
              <TextInput
                style={styles.input}
                value={companyData.postalCode}
                onChangeText={(value) => handleInputChange('postalCode', value)}
                placeholder="28001"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tipo de Negocio</Text>
            <TextInput
              style={styles.input}
              value={companyData.businessType}
              onChangeText={(value) => handleInputChange('businessType', value)}
              placeholder="Ej: Restaurante, Tienda de ropa, Gimnasio..."
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sitio Web</Text>
            <TextInput
              style={styles.input}
              value={companyData.website}
              onChangeText={(value) => handleInputChange('website', value)}
              placeholder="https://www.miempresa.com"
              placeholderTextColor="#94a3b8"
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción del Negocio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={companyData.description}
              onChangeText={(value) => handleInputChange('description', value)}
              placeholder="Describe brevemente tu negocio y qué servicios ofreces..."
              placeholderTextColor="#94a3b8"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.paymentInfo}>
            <Text style={styles.paymentTitle}>💳 Información de Pago</Text>
            <Text style={styles.paymentText}>
              • Primer pago: Plan mensual + 150€ configuración inicial
            </Text>
            <Text style={styles.paymentText}>
              • Métodos: Tarjeta de débito/crédito y transferencia bancaria
            </Text>
            <Text style={styles.paymentText}>
              • Pago 100% seguro procesado por Stripe
            </Text>
          </View>

          <TouchableOpacity
            style={styles.paymentButton}
            onPress={handleProceedToPayment}
            disabled={loading}
          >
            <LinearGradient
              colors={['#6366f1', '#8b5cf6']}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>
                🔒 Proceder al Pago Seguro
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.requiredNote}>
            * Campos obligatorios
          </Text>

          <Text style={styles.securityNote}>
            🔒 Tus datos están protegidos. El pago se procesa de forma segura a través de Stripe.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
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
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1f2937',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
  },
  paymentInfo: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0c4a6e',
    marginBottom: 8,
  },
  paymentText: {
    fontSize: 14,
    color: '#0c4a6e',
    marginBottom: 4,
  },
  paymentButton: {
    marginTop: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    padding: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  requiredNote: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  securityNote: {
    fontSize: 12,
    color: '#10b981',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
});

export default CompanyRegistrationSimplified;