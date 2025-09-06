import React, { useState, useEffect } from 'react';
import { ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import styled from 'styled-components/native';
import { ZyroLogo } from '../components/ZyroLogo';
import { PremiumButton } from '../components/PremiumButton';
import { FormInput } from '../components/FormInput';
import { StepIndicator } from '../components/StepIndicator';
import { PlanSelector } from '../components/PlanSelector';
import { PaymentMethodSelector } from '../components/PaymentMethodSelector';
import { PendingApprovalMessage } from '../components';
import { colors, spacing, fontSizes, fontWeights } from '../styles/theme';
import { companyRegistrationSchema } from '../utils/validation';
import { Company, SubscriptionPlan } from '../types';
import { useAppDispatch, useAppSelector } from '../store';
import { registerUser } from '../store/slices/authSlice';
import { useUserStatus } from '../hooks/useUserStatus';
import { subscriptionService } from '../services/subscriptionService';

interface CompanyRegistrationScreenProps {
  navigation: any;
}

interface FormData {
  // Step 1: Company Info
  companyName: string;
  cif: string;
  address: string;
  contactPerson: string;
  
  // Step 2: Contact Details
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  
  // Step 3: Subscription Plan
  selectedPlan: SubscriptionPlan | null;
  
  // Step 4: Payment Method
  paymentMethod: string | null;
}

const Container = styled.View`
  flex: 1;
  background-color: ${colors.black};
`;

const Header = styled.View`
  padding: ${spacing.xl}px ${spacing.lg}px ${spacing.lg}px;
  align-items: center;
  border-bottom: 1px solid ${colors.goldElegant}20;
`;

const BackButton = styled.TouchableOpacity`
  position: absolute;
  left: ${spacing.lg}px;
  top: ${spacing.xl}px;
  padding: ${spacing.sm}px;
`;

const BackText = styled.Text`
  color: ${colors.goldElegant};
  font-size: ${fontSizes.md}px;
  font-weight: ${fontWeights.medium};
`;

const Title = styled.Text`
  color: ${colors.white};
  font-size: ${fontSizes.xl}px;
  font-weight: ${fontWeights.semibold};
  text-align: center;
  margin-top: ${spacing.md}px;
`;

const Subtitle = styled.Text`
  color: ${colors.lightGray};
  font-size: ${fontSizes.sm}px;
  font-weight: ${fontWeights.normal};
  text-align: center;
  margin-top: ${spacing.xs}px;
`;

const Content = styled.View`
  flex: 1;
  padding: ${spacing.lg}px;
`;

const ButtonContainer = styled.View`
  padding: ${spacing.lg}px;
  gap: ${spacing.md}px;
`;

const SectionTitle = styled.Text`
  color: ${colors.goldElegant};
  font-size: ${fontSizes.lg}px;
  font-weight: ${fontWeights.semibold};
  margin-bottom: ${spacing.md}px;
  text-align: center;
`;

const InfoText = styled.Text`
  color: ${colors.lightGray};
  font-size: ${fontSizes.sm}px;
  font-weight: ${fontWeights.normal};
  text-align: center;
  margin-bottom: ${spacing.lg}px;
  line-height: 20px;
`;

const PriceHighlight = styled.View`
  background-color: ${colors.goldElegant}10;
  border: 1px solid ${colors.goldElegant}40;
  border-radius: 8px;
  padding: ${spacing.md}px;
  margin: ${spacing.md}px 0;
`;

const PriceText = styled.Text`
  color: ${colors.goldElegant};
  font-size: ${fontSizes.lg}px;
  font-weight: ${fontWeights.semibold};
  text-align: center;
`;

const PriceSubtext = styled.Text`
  color: ${colors.lightGray};
  font-size: ${fontSizes.sm}px;
  font-weight: ${fontWeights.normal};
  text-align: center;
  margin-top: ${spacing.xs}px;
`;

const initialFormData: FormData = {
  companyName: '',
  cif: '',
  address: '',
  contactPerson: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  selectedPlan: null,
  paymentMethod: null,
};

const getPlanPrice = (plan: SubscriptionPlan): number => {
  switch (plan) {
    case '3months': return 499;
    case '6months': return 399;
    case '12months': return 299;
    default: return 0;
  }
};

const getPlanDuration = (plan: SubscriptionPlan): string => {
  switch (plan) {
    case '3months': return '3 meses';
    case '6months': return '6 meses';
    case '12months': return '12 meses';
    default: return '';
  }
};

export const CompanyRegistrationScreen: React.FC<CompanyRegistrationScreenProps> = ({
  navigation,
}) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector(state => state.auth);
  const { sendWaitingNotification } = useUserStatus();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPendingMessage, setShowPendingMessage] = useState(false);

  // Handle successful registration
  useEffect(() => {
    if (isAuthenticated && user && user.status === 'pending') {
      setShowPendingMessage(true);
      // Send waiting notification
      sendWaitingNotification(user.id, user.email).catch(console.error);
    }
  }, [isAuthenticated, user, sendWaitingNotification]);

  const totalSteps = 4;

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep = async (step: number): Promise<boolean> => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.companyName.trim()) newErrors.companyName = 'Nombre de empresa es requerido';
        if (!formData.cif.trim()) newErrors.cif = 'CIF es requerido';
        if (!formData.address.trim()) newErrors.address = 'Dirección es requerida';
        if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Persona de contacto es requerida';
        break;
      case 2:
        if (!formData.email.trim()) newErrors.email = 'Email es requerido';
        if (!formData.phone.trim()) newErrors.phone = 'Teléfono es requerido';
        if (!formData.password) newErrors.password = 'Contraseña es requerida';
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }
        break;
      case 3:
        if (!formData.selectedPlan) newErrors.selectedPlan = 'Selecciona un plan de suscripción';
        break;
      case 4:
        if (!formData.paymentMethod) newErrors.paymentMethod = 'Selecciona un método de pago';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigation.goBack();
    }
  };

  const handleBackFromPending = () => {
    setShowPendingMessage(false);
    navigation.navigate('Welcome');
  };

  const handleSubmit = async () => {
    try {
      if (!formData.selectedPlan || !formData.paymentMethod) {
        Alert.alert('Error', 'Por favor completa todos los campos requeridos.');
        return;
      }

      // First register the company user
      const companyData = {
        email: formData.email,
        password: formData.password,
        role: 'company' as const,
        companyName: formData.companyName,
        cif: formData.cif,
        address: formData.address,
        phone: formData.phone,
        contactPerson: formData.contactPerson,
        subscription: {
          plan: formData.selectedPlan,
          price: getPlanPrice(formData.selectedPlan),
          startDate: new Date(),
          endDate: new Date(Date.now() + (formData.selectedPlan === '3months' ? 90 : formData.selectedPlan === '6months' ? 180 : 365) * 24 * 60 * 60 * 1000),
          status: 'active' as const,
        },
        paymentMethod: formData.paymentMethod,
      };

      const result = await dispatch(registerUser(companyData));
      
      // If registration successful, create subscription with payment processing
      if (result.type === 'auth/registerUser/fulfilled' && result.payload?.id) {
        try {
          await subscriptionService.createSubscription({
            companyId: result.payload.id,
            plan: formData.selectedPlan,
            paymentMethod: formData.paymentMethod,
          });
        } catch (paymentError) {
          console.error('Payment processing error:', paymentError);
          // Registration was successful but payment failed
          // The user will be notified to complete payment later
          Alert.alert(
            'Registro Completado',
            'Tu cuenta ha sido creada exitosamente. Te contactaremos para finalizar el proceso de pago.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'Hubo un problema al procesar tu registro. Inténtalo de nuevo.');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <SectionTitle>Información de la Empresa</SectionTitle>
            <InfoText>
              Proporciona los datos oficiales de tu empresa
            </InfoText>
            <FormInput
              label="Nombre de la Empresa"
              value={formData.companyName}
              onChangeText={(text) => updateFormData('companyName', text)}
              error={errors.companyName}
              required
              placeholder="Nombre oficial de tu empresa"
            />
            <FormInput
              label="CIF/NIF"
              value={formData.cif}
              onChangeText={(text) => updateFormData('cif', text.toUpperCase())}
              error={errors.cif}
              required
              placeholder="A12345678 o 12345678A"
              autoCapitalize="characters"
            />
            <FormInput
              label="Dirección Fiscal"
              value={formData.address}
              onChangeText={(text) => updateFormData('address', text)}
              error={errors.address}
              required
              placeholder="Dirección completa de la empresa"
              multiline
            />
            <FormInput
              label="Persona de Contacto"
              value={formData.contactPerson}
              onChangeText={(text) => updateFormData('contactPerson', text)}
              error={errors.contactPerson}
              required
              placeholder="Nombre del responsable"
            />
          </>
        );
      case 2:
        return (
          <>
            <SectionTitle>Datos de Contacto</SectionTitle>
            <InfoText>
              Información para comunicarnos contigo
            </InfoText>
            <FormInput
              label="Email Corporativo"
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text)}
              error={errors.email}
              required
              placeholder="contacto@tuempresa.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <FormInput
              label="Teléfono"
              value={formData.phone}
              onChangeText={(text) => updateFormData('phone', text)}
              error={errors.phone}
              required
              placeholder="+34 600 000 000"
              keyboardType="phone-pad"
            />
            <FormInput
              label="Contraseña"
              value={formData.password}
              onChangeText={(text) => updateFormData('password', text)}
              error={errors.password}
              required
              placeholder="Mínimo 8 caracteres"
              secureTextEntry
            />
            <FormInput
              label="Confirmar Contraseña"
              value={formData.confirmPassword}
              onChangeText={(text) => updateFormData('confirmPassword', text)}
              error={errors.confirmPassword}
              required
              placeholder="Repite tu contraseña"
              secureTextEntry
            />
          </>
        );
      case 3:
        return (
          <>
            <SectionTitle>Plan de Suscripción</SectionTitle>
            <InfoText>
              Elige el plan que mejor se adapte a tus necesidades.{'\n'}
              Sin comisiones por colaboración, solo una tarifa fija mensual.
            </InfoText>
            <PlanSelector
              selectedPlan={formData.selectedPlan}
              onPlanSelect={(plan) => updateFormData('selectedPlan', plan)}
            />
            {errors.selectedPlan && (
              <InfoText style={{ color: colors.error }}>
                {errors.selectedPlan}
              </InfoText>
            )}
          </>
        );
      case 4:
        return (
          <>
            <SectionTitle>Método de Pago</SectionTitle>
            <InfoText>
              Selecciona cómo prefieres realizar el pago de tu suscripción
            </InfoText>
            {formData.selectedPlan && (
              <PriceHighlight>
                <PriceText>
                  €{getPlanPrice(formData.selectedPlan)}/mes
                </PriceText>
                <PriceSubtext>
                  Plan de {getPlanDuration(formData.selectedPlan)} • Facturación automática
                </PriceSubtext>
              </PriceHighlight>
            )}
            <PaymentMethodSelector
              selectedMethod={formData.paymentMethod}
              onMethodSelect={(method) => updateFormData('paymentMethod', method)}
            />
            {errors.paymentMethod && (
              <InfoText style={{ color: colors.error }}>
                {errors.paymentMethod}
              </InfoText>
            )}
          </>
        );
      default:
        return null;
    }
  };

  // Show pending approval message if registration was successful
  if (showPendingMessage && user) {
    return (
      <PendingApprovalMessage
        userRole="company"
        registrationDate={user.createdAt}
      />
    );
  }

  return (
    <Container>
      <StatusBar style="light" backgroundColor={colors.black} />
      
      <Header>
        <BackButton onPress={handleBack}>
          <BackText>← Atrás</BackText>
        </BackButton>
        <ZyroLogo size="small" color={colors.goldElegant} />
        <Title>Registro de Empresa</Title>
        <Subtitle>Paso {currentStep} de {totalSteps}</Subtitle>
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
      </Header>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Content>
          {renderStep()}
        </Content>
      </ScrollView>

      <ButtonContainer>
        {error && (
          <InfoText style={{ color: colors.error, marginBottom: spacing.md }}>
            {error}
          </InfoText>
        )}
        <PremiumButton
          title={currentStep === totalSteps ? "Completar Registro" : "Continuar"}
          variant="primary"
          size="large"
          fullWidth
          onPress={handleNext}
          loading={isLoading}
        />
        {currentStep === totalSteps && (
          <InfoText>
            Tu cuenta será revisada y activada en 24-48 horas.{'\n'}
            Te contactaremos para finalizar el proceso de pago.
          </InfoText>
        )}
      </ButtonContainer>
    </Container>
  );
};