import React, { useState, useEffect } from 'react';
import { ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import styled from 'styled-components/native';
import { ZyroLogo } from '../components/ZyroLogo';
import { PremiumButton } from '../components/PremiumButton';
import { FormInput } from '../components/FormInput';
import { StepIndicator } from '../components/StepIndicator';
import { PendingApprovalMessage } from '../components';
import { colors, spacing, fontSizes, fontWeights } from '../styles/theme';
import { influencerRegistrationSchema } from '../utils/validation';
import { Influencer } from '../types';
import { useAppDispatch, useAppSelector } from '../store';
import { registerUser } from '../store/slices/authSlice';
import { useUserStatus } from '../hooks/useUserStatus';

interface InfluencerRegistrationScreenProps {
  navigation: any;
}

interface FormData {
  // Step 1: Basic Info
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  
  // Step 2: Social Media
  instagramUsername: string;
  tiktokUsername: string;
  instagramFollowers: string;
  tiktokFollowers: string;
  
  // Step 3: Location & Contact
  city: string;
  phone: string;
  
  // Step 4: Audience Stats
  topCountries: Array<{ country: string; percentage: string }>;
  topCities: Array<{ city: string; percentage: string }>;
  ageRanges: Array<{ range: string; percentage: string }>;
  monthlyViews: string;
  monthlyEngagement: string;
  monthlyReach: string;
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

const initialFormData: FormData = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  instagramUsername: '',
  tiktokUsername: '',
  instagramFollowers: '',
  tiktokFollowers: '0',
  city: '',
  phone: '',
  topCountries: [
    { country: '', percentage: '' },
    { country: '', percentage: '' },
    { country: '', percentage: '' }
  ],
  topCities: [
    { city: '', percentage: '' },
    { city: '', percentage: '' },
    { city: '', percentage: '' }
  ],
  ageRanges: [
    { range: '18-24', percentage: '' },
    { range: '25-34', percentage: '' },
    { range: '35-44', percentage: '' },
    { range: '45+', percentage: '' }
  ],
  monthlyViews: '',
  monthlyEngagement: '',
  monthlyReach: ''
};

export const InfluencerRegistrationScreen: React.FC<InfluencerRegistrationScreenProps> = ({
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
        if (!formData.fullName.trim()) newErrors.fullName = 'Nombre completo es requerido';
        if (!formData.email.trim()) newErrors.email = 'Email es requerido';
        if (!formData.password) newErrors.password = 'Contraseña es requerida';
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }
        break;
      case 2:
        if (!formData.instagramUsername.trim()) {
          newErrors.instagramUsername = 'Usuario de Instagram es requerido';
        }
        if (!formData.instagramFollowers.trim()) {
          newErrors.instagramFollowers = 'Número de seguidores es requerido';
        } else if (isNaN(Number(formData.instagramFollowers))) {
          newErrors.instagramFollowers = 'Debe ser un número válido';
        }
        break;
      case 3:
        if (!formData.city.trim()) newErrors.city = 'Ciudad es requerida';
        break;
      case 4:
        if (!formData.monthlyViews.trim()) newErrors.monthlyViews = 'Visualizaciones mensuales son requeridas';
        if (!formData.monthlyEngagement.trim()) newErrors.monthlyEngagement = 'Engagement mensual es requerido';
        if (!formData.monthlyReach.trim()) newErrors.monthlyReach = 'Alcance mensual es requerido';
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
      const influencerData = {
        email: formData.email,
        password: formData.password,
        role: 'influencer' as const,
        fullName: formData.fullName,
        instagramUsername: formData.instagramUsername,
        tiktokUsername: formData.tiktokUsername || undefined,
        instagramFollowers: Number(formData.instagramFollowers),
        tiktokFollowers: Number(formData.tiktokFollowers),
        city: formData.city,
        phone: formData.phone || undefined,
        audienceStats: {
          countries: formData.topCountries
            .filter(c => c.country && c.percentage)
            .map(c => ({ country: c.country, percentage: Number(c.percentage) })),
          cities: formData.topCities
            .filter(c => c.city && c.percentage)
            .map(c => ({ city: c.city, percentage: Number(c.percentage) })),
          ageRanges: formData.ageRanges
            .filter(a => a.percentage)
            .map(a => ({ range: a.range, percentage: Number(a.percentage) })),
          monthlyStats: {
            views: Number(formData.monthlyViews),
            engagement: Number(formData.monthlyEngagement),
            reach: Number(formData.monthlyReach)
          }
        }
      };

      await dispatch(registerUser(influencerData));
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al procesar tu registro. Inténtalo de nuevo.');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <SectionTitle>Información Básica</SectionTitle>
            <InfoText>
              Completa tus datos personales para comenzar el proceso de registro
            </InfoText>
            <FormInput
              label="Nombre Completo"
              value={formData.fullName}
              onChangeText={(text) => updateFormData('fullName', text)}
              error={errors.fullName}
              required
              placeholder="Tu nombre completo"
            />
            <FormInput
              label="Email"
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text)}
              error={errors.email}
              required
              placeholder="tu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
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
      case 2:
        return (
          <>
            <SectionTitle>Redes Sociales</SectionTitle>
            <InfoText>
              Conecta tus perfiles de redes sociales para validar tu alcance
            </InfoText>
            <FormInput
              label="Usuario de Instagram"
              value={formData.instagramUsername}
              onChangeText={(text) => updateFormData('instagramUsername', text)}
              error={errors.instagramUsername}
              required
              placeholder="@tuusuario"
              autoCapitalize="none"
            />
            <FormInput
              label="Seguidores de Instagram"
              value={formData.instagramFollowers}
              onChangeText={(text) => updateFormData('instagramFollowers', text)}
              error={errors.instagramFollowers}
              required
              placeholder="Ej: 10000"
              keyboardType="numeric"
            />
            <FormInput
              label="Usuario de TikTok (Opcional)"
              value={formData.tiktokUsername}
              onChangeText={(text) => updateFormData('tiktokUsername', text)}
              placeholder="@tuusuario"
              autoCapitalize="none"
            />
            <FormInput
              label="Seguidores de TikTok"
              value={formData.tiktokFollowers}
              onChangeText={(text) => updateFormData('tiktokFollowers', text)}
              placeholder="Ej: 5000"
              keyboardType="numeric"
            />
          </>
        );
      case 3:
        return (
          <>
            <SectionTitle>Ubicación y Contacto</SectionTitle>
            <InfoText>
              Información de ubicación para colaboraciones locales
            </InfoText>
            <FormInput
              label="Ciudad"
              value={formData.city}
              onChangeText={(text) => updateFormData('city', text)}
              error={errors.city}
              required
              placeholder="Madrid, Barcelona, Valencia..."
            />
            <FormInput
              label="Teléfono (Opcional)"
              value={formData.phone}
              onChangeText={(text) => updateFormData('phone', text)}
              placeholder="+34 600 000 000"
              keyboardType="phone-pad"
            />
          </>
        );
      case 4:
        return (
          <>
            <SectionTitle>Estadísticas de Audiencia</SectionTitle>
            <InfoText>
              Datos de los últimos 30 días para validar tu perfil
            </InfoText>
            <FormInput
              label="Visualizaciones Mensuales"
              value={formData.monthlyViews}
              onChangeText={(text) => updateFormData('monthlyViews', text)}
              error={errors.monthlyViews}
              required
              placeholder="Ej: 50000"
              keyboardType="numeric"
            />
            <FormInput
              label="Engagement Mensual"
              value={formData.monthlyEngagement}
              onChangeText={(text) => updateFormData('monthlyEngagement', text)}
              error={errors.monthlyEngagement}
              required
              placeholder="Ej: 5000"
              keyboardType="numeric"
            />
            <FormInput
              label="Alcance Mensual"
              value={formData.monthlyReach}
              onChangeText={(text) => updateFormData('monthlyReach', text)}
              error={errors.monthlyReach}
              required
              placeholder="Ej: 25000"
              keyboardType="numeric"
            />
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
        userRole="influencer"
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
        <Title>Registro de Influencer</Title>
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
            Tu solicitud será revisada en 24-48 horas.{'\n'}
            Te notificaremos por email cuando sea aprobada.
          </InfoText>
        )}
      </ButtonContainer>
    </Container>
  );
};