import React, { useState, useEffect } from 'react';
import { ScrollView, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import styled from 'styled-components/native';
import { ZyroLogo } from '../components/ZyroLogo';
import { PremiumButton } from '../components/PremiumButton';
import { FormInput } from '../components/FormInput';
import { colors, spacing, fontSizes, fontWeights, borderRadius } from '../styles/theme';
import { paymentService, PaymentConfig } from '../services/paymentService';

interface PaymentConfigScreenProps {
  navigation: any;
}

interface FormData {
  // Bank Account Details
  iban: string;
  swift: string;
  accountHolder: string;
  
  // Company Details
  companyName: string;
  cif: string;
  address: string;
  taxInfo: string;
  
  // Supported Payment Methods
  supportedMethods: string[];
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

const SectionTitle = styled.Text`
  color: ${colors.goldElegant};
  font-size: ${fontSizes.lg}px;
  font-weight: ${fontWeights.semibold};
  margin-bottom: ${spacing.md}px;
  margin-top: ${spacing.lg}px;
`;

const InfoText = styled.Text`
  color: ${colors.lightGray};
  font-size: ${fontSizes.sm}px;
  font-weight: ${fontWeights.normal};
  margin-bottom: ${spacing.lg}px;
  line-height: 20px;
`;

const PaymentMethodCard = styled.TouchableOpacity<{ isEnabled: boolean }>`
  border: 2px solid ${({ isEnabled }: { isEnabled: boolean }) => 
    isEnabled ? colors.goldElegant : `${colors.goldElegant}40`};
  border-radius: ${borderRadius.md}px;
  background-color: ${({ isEnabled }: { isEnabled: boolean }) => 
    isEnabled ? `${colors.goldElegant}10` : colors.darkGray};
  padding: ${spacing.md}px;
  margin-bottom: ${spacing.sm}px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const PaymentMethodInfo = styled.View`
  flex-direction: row;
  align-items: center;
`;

const PaymentMethodIcon = styled.Text`
  font-size: 20px;
  margin-right: ${spacing.md}px;
`;

const PaymentMethodName = styled.Text<{ isEnabled: boolean }>`
  color: ${({ isEnabled }: { isEnabled: boolean }) => isEnabled ? colors.goldElegant : colors.white};
  font-size: ${fontSizes.md}px;
  font-weight: ${fontWeights.semibold};
`;

const ToggleSwitch = styled.View<{ isEnabled: boolean }>`
  width: 50px;
  height: 30px;
  border-radius: 15px;
  background-color: ${({ isEnabled }: { isEnabled: boolean }) => 
    isEnabled ? colors.goldElegant : colors.mediumGray};
  justify-content: center;
  padding: 2px;
`;

const ToggleKnob = styled.View<{ isEnabled: boolean }>`
  width: 26px;
  height: 26px;
  border-radius: 13px;
  background-color: ${colors.white};
  align-self: ${({ isEnabled }: { isEnabled: boolean }) => isEnabled ? 'flex-end' : 'flex-start'};
`;

const ButtonContainer = styled.View`
  padding: ${spacing.lg}px;
  gap: ${spacing.md}px;
`;

const SuccessMessage = styled.View`
  background-color: ${colors.goldElegant}10;
  border: 1px solid ${colors.goldElegant}40;
  border-radius: ${borderRadius.md}px;
  padding: ${spacing.md}px;
  margin-bottom: ${spacing.lg}px;
`;

const SuccessText = styled.Text`
  color: ${colors.goldElegant};
  font-size: ${fontSizes.sm}px;
  font-weight: ${fontWeights.medium};
  text-align: center;
`;

const paymentMethods = [
  { id: 'card', name: 'Tarjeta de Crédito/Débito', icon: '💳' },
  { id: 'sepa', name: 'Transferencia SEPA', icon: '🏦' },
  { id: 'bizum', name: 'Bizum', icon: '📱' },
  { id: 'apple_pay', name: 'Apple Pay', icon: '🍎' },
  { id: 'google_pay', name: 'Google Pay', icon: '🔍' },
  { id: 'bank_transfer', name: 'Transferencia Bancaria', icon: '🏛️' },
];

export const PaymentConfigScreen: React.FC<PaymentConfigScreenProps> = ({
  navigation,
}) => {
  const [formData, setFormData] = useState<FormData>({
    iban: '',
    swift: '',
    accountHolder: '',
    companyName: '',
    cif: '',
    address: '',
    taxInfo: '',
    supportedMethods: ['card', 'sepa', 'bizum'],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = () => {
    try {
      const config = paymentService.getPaymentConfig();
      setFormData({
        iban: config.adminBankAccount.iban,
        swift: config.adminBankAccount.swift,
        accountHolder: config.adminBankAccount.accountHolder,
        companyName: config.companyDetails.name,
        cif: config.companyDetails.cif,
        address: config.companyDetails.address,
        taxInfo: config.companyDetails.taxInfo,
        supportedMethods: config.supportedMethods,
      });
    } catch (error) {
      console.error('Error loading payment config:', error);
    }
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const togglePaymentMethod = (methodId: string) => {
    const isCurrentlyEnabled = formData.supportedMethods.includes(methodId);
    
    if (isCurrentlyEnabled) {
      // Remove method (but ensure at least one method remains)
      if (formData.supportedMethods.length > 1) {
        updateFormData('supportedMethods', 
          formData.supportedMethods.filter(id => id !== methodId)
        );
      } else {
        Alert.alert('Error', 'Debe mantener al menos un método de pago activo.');
      }
    } else {
      // Add method
      updateFormData('supportedMethods', [...formData.supportedMethods, methodId]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Bank account validation
    if (!formData.iban.trim()) {
      newErrors.iban = 'IBAN es requerido';
    } else if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/.test(formData.iban.replace(/\s/g, ''))) {
      newErrors.iban = 'Formato de IBAN inválido';
    }

    if (!formData.swift.trim()) {
      newErrors.swift = 'Código SWIFT es requerido';
    } else if (!/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(formData.swift)) {
      newErrors.swift = 'Formato de SWIFT inválido';
    }

    if (!formData.accountHolder.trim()) {
      newErrors.accountHolder = 'Titular de la cuenta es requerido';
    }

    // Company details validation
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Nombre de empresa es requerido';
    }

    if (!formData.cif.trim()) {
      newErrors.cif = 'CIF es requerido';
    } else if (!/^[A-Z][0-9]{8}$/.test(formData.cif)) {
      newErrors.cif = 'Formato de CIF inválido (ej: B12345678)';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Dirección es requerida';
    }

    if (!formData.taxInfo.trim()) {
      newErrors.taxInfo = 'Información fiscal es requerida';
    }

    if (formData.supportedMethods.length === 0) {
      newErrors.supportedMethods = 'Debe seleccionar al menos un método de pago';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const newConfig: PaymentConfig = {
        adminBankAccount: {
          iban: formData.iban.replace(/\s/g, ''),
          swift: formData.swift.toUpperCase(),
          accountHolder: formData.accountHolder,
        },
        companyDetails: {
          name: formData.companyName,
          cif: formData.cif.toUpperCase(),
          address: formData.address,
          taxInfo: formData.taxInfo,
        },
        supportedMethods: formData.supportedMethods as any[],
      };

      paymentService.updatePaymentConfig(newConfig);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving payment config:', error);
      Alert.alert('Error', 'No se pudo guardar la configuración. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <Container>
      <StatusBar style="light" backgroundColor={colors.black} />
      
      <Header>
        <BackButton onPress={handleBack}>
          <BackText>← Atrás</BackText>
        </BackButton>
        <ZyroLogo size="small" color={colors.goldElegant} />
        <Title>Configuración de Pagos</Title>
        <Subtitle>Gestiona la cuenta empresarial y métodos de pago</Subtitle>
      </Header>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Content>
          {showSuccess && (
            <SuccessMessage>
              <SuccessText>✓ Configuración guardada exitosamente</SuccessText>
            </SuccessMessage>
          )}

          <SectionTitle>Cuenta Bancaria Empresarial</SectionTitle>
          <InfoText>
            Todos los pagos de suscripciones se depositarán en esta cuenta bancaria.
          </InfoText>
          
          <FormInput
            label="IBAN"
            value={formData.iban}
            onChangeText={(text) => updateFormData('iban', text)}
            error={errors.iban}
            required
            placeholder="ES91 2100 0418 4502 0005 1332"
            autoCapitalize="characters"
          />
          
          <FormInput
            label="Código SWIFT/BIC"
            value={formData.swift}
            onChangeText={(text) => updateFormData('swift', text)}
            error={errors.swift}
            required
            placeholder="CAIXESBBXXX"
            autoCapitalize="characters"
          />
          
          <FormInput
            label="Titular de la Cuenta"
            value={formData.accountHolder}
            onChangeText={(text) => updateFormData('accountHolder', text)}
            error={errors.accountHolder}
            required
            placeholder="ZYRO MARKETPLACE SL"
          />

          <SectionTitle>Datos Fiscales de la Empresa</SectionTitle>
          <InfoText>
            Esta información aparecerá en todas las facturas generadas automáticamente.
          </InfoText>
          
          <FormInput
            label="Nombre de la Empresa"
            value={formData.companyName}
            onChangeText={(text) => updateFormData('companyName', text)}
            error={errors.companyName}
            required
            placeholder="Zyro Marketplace SL"
          />
          
          <FormInput
            label="CIF"
            value={formData.cif}
            onChangeText={(text) => updateFormData('cif', text)}
            error={errors.cif}
            required
            placeholder="B12345678"
            autoCapitalize="characters"
          />
          
          <FormInput
            label="Dirección Fiscal"
            value={formData.address}
            onChangeText={(text) => updateFormData('address', text)}
            error={errors.address}
            required
            placeholder="Calle Ejemplo 123, 28001 Madrid, España"
            multiline
          />
          
          <FormInput
            label="Información Fiscal"
            value={formData.taxInfo}
            onChangeText={(text) => updateFormData('taxInfo', text)}
            error={errors.taxInfo}
            required
            placeholder="IVA incluido (21%)"
          />

          <SectionTitle>Métodos de Pago Disponibles</SectionTitle>
          <InfoText>
            Selecciona qué métodos de pago estarán disponibles para las empresas.
          </InfoText>
          
          {paymentMethods.map((method) => {
            const isEnabled = formData.supportedMethods.includes(method.id);
            return (
              <PaymentMethodCard
                key={method.id}
                isEnabled={isEnabled}
                onPress={() => togglePaymentMethod(method.id)}
                activeOpacity={0.8}
              >
                <PaymentMethodInfo>
                  <PaymentMethodIcon>{method.icon}</PaymentMethodIcon>
                  <PaymentMethodName isEnabled={isEnabled}>
                    {method.name}
                  </PaymentMethodName>
                </PaymentMethodInfo>
                
                <ToggleSwitch isEnabled={isEnabled}>
                  <ToggleKnob isEnabled={isEnabled} />
                </ToggleSwitch>
              </PaymentMethodCard>
            );
          })}
          
          {errors.supportedMethods && (
            <InfoText style={{ color: colors.error, marginTop: spacing.sm }}>
              {errors.supportedMethods}
            </InfoText>
          )}
        </Content>
      </ScrollView>

      <ButtonContainer>
        <PremiumButton
          title="Guardar Configuración"
          variant="primary"
          size="large"
          fullWidth
          onPress={handleSave}
          loading={isLoading}
        />
        
        <InfoText style={{ textAlign: 'center', marginTop: spacing.sm }}>
          Los cambios se aplicarán inmediatamente a todos los nuevos pagos.
        </InfoText>
      </ButtonContainer>
    </Container>
  );
};