import React from 'react';
import styled from 'styled-components/native';
import { colors, spacing, borderRadius, fontSizes, fontWeights } from '../styles/theme';

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface PaymentMethodSelectorProps {
  selectedMethod: string | null;
  onMethodSelect: (methodId: string) => void;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'card',
    name: 'Tarjeta de Crédito/Débito',
    icon: '💳',
    description: 'Visa, Mastercard, American Express',
  },
  {
    id: 'sepa',
    name: 'Transferencia SEPA',
    icon: '🏦',
    description: 'Transferencia bancaria europea',
  },
  {
    id: 'bizum',
    name: 'Bizum',
    icon: '📱',
    description: 'Pago móvil instantáneo',
  },
  {
    id: 'apple_pay',
    name: 'Apple Pay',
    icon: '🍎',
    description: 'Pago rápido y seguro',
  },
  {
    id: 'google_pay',
    name: 'Google Pay',
    icon: '🔍',
    description: 'Pago con Google',
  },
  {
    id: 'bank_transfer',
    name: 'Transferencia Bancaria',
    icon: '🏛️',
    description: 'Transferencia tradicional',
  },
];

const Container = styled.View`
  margin: ${spacing.md}px 0;
`;

const Title = styled.Text`
  color: ${colors.white};
  font-size: ${fontSizes.lg}px;
  font-weight: ${fontWeights.semibold};
  margin-bottom: ${spacing.md}px;
  text-align: center;
`;

const MethodCard = styled.TouchableOpacity<{ isSelected: boolean }>`
  border: 2px solid ${({ isSelected }: { isSelected: boolean }) => 
    isSelected ? colors.goldElegant : `${colors.goldElegant}40`};
  border-radius: ${borderRadius.md}px;
  background-color: ${({ isSelected }: { isSelected: boolean }) => 
    isSelected ? `${colors.goldElegant}10` : colors.darkGray};
  padding: ${spacing.md}px;
  margin-bottom: ${spacing.sm}px;
  flex-direction: row;
  align-items: center;
`;

const IconContainer = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${colors.goldElegant}20;
  justify-content: center;
  align-items: center;
  margin-right: ${spacing.md}px;
`;

const IconText = styled.Text`
  font-size: 20px;
`;

const MethodInfo = styled.View`
  flex: 1;
`;

const MethodName = styled.Text<{ isSelected: boolean }>`
  color: ${({ isSelected }: { isSelected: boolean }) => isSelected ? colors.goldElegant : colors.white};
  font-size: ${fontSizes.md}px;
  font-weight: ${fontWeights.semibold};
  margin-bottom: ${spacing.xs}px;
`;

const MethodDescription = styled.Text<{ isSelected: boolean }>`
  color: ${({ isSelected }: { isSelected: boolean }) => isSelected ? colors.white : colors.lightGray};
  font-size: ${fontSizes.sm}px;
  font-weight: ${fontWeights.normal};
`;

const CheckMark = styled.View<{ isSelected: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  border: 2px solid ${colors.goldElegant};
  background-color: ${({ isSelected }: { isSelected: boolean }) => 
    isSelected ? colors.goldElegant : 'transparent'};
  justify-content: center;
  align-items: center;
`;

const CheckMarkText = styled.Text`
  color: ${colors.black};
  font-size: 14px;
  font-weight: ${fontWeights.bold};
`;

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onMethodSelect,
}) => {
  return (
    <Container>
      <Title>Método de Pago</Title>
      {paymentMethods.map((method) => {
        const isSelected = selectedMethod === method.id;
        return (
          <MethodCard
            key={method.id}
            isSelected={isSelected}
            onPress={() => onMethodSelect(method.id)}
            activeOpacity={0.8}
          >
            <IconContainer>
              <IconText>{method.icon}</IconText>
            </IconContainer>
            
            <MethodInfo>
              <MethodName isSelected={isSelected}>
                {method.name}
              </MethodName>
              <MethodDescription isSelected={isSelected}>
                {method.description}
              </MethodDescription>
            </MethodInfo>

            <CheckMark isSelected={isSelected}>
              {isSelected && <CheckMarkText>✓</CheckMarkText>}
            </CheckMark>
          </MethodCard>
        );
      })}
    </Container>
  );
};