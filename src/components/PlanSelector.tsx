import React from 'react';
import styled from 'styled-components/native';
import { colors, spacing, borderRadius, fontSizes, fontWeights } from '../styles/theme';
import { SubscriptionPlan } from '../types';

interface PlanOption {
  plan: SubscriptionPlan;
  duration: string;
  price: number;
  originalPrice: number;
  savings: string;
  popular?: boolean;
}

interface PlanSelectorProps {
  selectedPlan: SubscriptionPlan | null;
  onPlanSelect: (plan: SubscriptionPlan) => void;
}

const planOptions: PlanOption[] = [
  {
    plan: '3months',
    duration: '3 Meses',
    price: 499,
    originalPrice: 499,
    savings: '',
  },
  {
    plan: '6months',
    duration: '6 Meses',
    price: 399,
    originalPrice: 499,
    savings: 'Ahorra 20%',
    popular: true,
  },
  {
    plan: '12months',
    duration: '12 Meses',
    price: 299,
    originalPrice: 499,
    savings: 'Ahorra 40%',
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

const PlanCard = styled.TouchableOpacity<{ isSelected: boolean; isPopular: boolean }>`
  border: 2px solid ${({ isSelected, isPopular }: { isSelected: boolean; isPopular: boolean }) => 
    isSelected ? colors.goldElegant :
    isPopular ? colors.goldBright :
    `${colors.goldElegant}40`};
  border-radius: ${borderRadius.lg}px;
  background-color: ${({ isSelected }: { isSelected: boolean }) => 
    isSelected ? `${colors.goldElegant}10` : colors.darkGray};
  padding: ${spacing.lg}px;
  margin-bottom: ${spacing.md}px;
  position: relative;
`;

const PopularBadge = styled.View`
  position: absolute;
  top: -10px;
  right: ${spacing.lg}px;
  background-color: ${colors.goldBright};
  padding: ${spacing.xs}px ${spacing.sm}px;
  border-radius: ${borderRadius.sm}px;
`;

const PopularText = styled.Text`
  color: ${colors.black};
  font-size: ${fontSizes.xs}px;
  font-weight: ${fontWeights.semibold};
  text-transform: uppercase;
`;

const PlanHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing.sm}px;
`;

const PlanDuration = styled.Text<{ isSelected: boolean }>`
  color: ${({ isSelected }: { isSelected: boolean }) => isSelected ? colors.goldElegant : colors.white};
  font-size: ${fontSizes.lg}px;
  font-weight: ${fontWeights.semibold};
`;

const PriceContainer = styled.View`
  align-items: flex-end;
`;

const Price = styled.Text<{ isSelected: boolean }>`
  color: ${({ isSelected }: { isSelected: boolean }) => isSelected ? colors.goldElegant : colors.white};
  font-size: ${fontSizes.xl}px;
  font-weight: ${fontWeights.bold};
`;

const OriginalPrice = styled.Text`
  color: ${colors.mediumGray};
  font-size: ${fontSizes.sm}px;
  font-weight: ${fontWeights.normal};
  text-decoration-line: line-through;
`;

const SavingsText = styled.Text`
  color: ${colors.goldBright};
  font-size: ${fontSizes.sm}px;
  font-weight: ${fontWeights.semibold};
  margin-top: ${spacing.xs}px;
`;

const PlanFeatures = styled.View`
  margin-top: ${spacing.sm}px;
`;

const FeatureText = styled.Text<{ isSelected: boolean }>`
  color: ${({ isSelected }: { isSelected: boolean }) => isSelected ? colors.white : colors.lightGray};
  font-size: ${fontSizes.sm}px;
  font-weight: ${fontWeights.normal};
  margin-bottom: ${spacing.xs}px;
`;

const MonthlyPrice = styled.Text<{ isSelected: boolean }>`
  color: ${({ isSelected }: { isSelected: boolean }) => isSelected ? colors.goldElegant : colors.lightGray};
  font-size: ${fontSizes.sm}px;
  font-weight: ${fontWeights.normal};
`;

export const PlanSelector: React.FC<PlanSelectorProps> = ({
  selectedPlan,
  onPlanSelect,
}) => {
  return (
    <Container>
      <Title>Selecciona tu Plan de Suscripción</Title>
      {planOptions.map((option) => {
        const isSelected = selectedPlan === option.plan;
        return (
          <PlanCard
            key={option.plan}
            isSelected={isSelected}
            isPopular={!!option.popular}
            onPress={() => onPlanSelect(option.plan)}
            activeOpacity={0.8}
          >
            {option.popular && (
              <PopularBadge>
                <PopularText>Más Popular</PopularText>
              </PopularBadge>
            )}
            
            <PlanHeader>
              <PlanDuration isSelected={isSelected}>
                {option.duration}
              </PlanDuration>
              <PriceContainer>
                <Price isSelected={isSelected}>
                  €{option.price}/mes
                </Price>
                {option.originalPrice !== option.price && (
                  <OriginalPrice>€{option.originalPrice}/mes</OriginalPrice>
                )}
              </PriceContainer>
            </PlanHeader>

            {option.savings && (
              <SavingsText>{option.savings}</SavingsText>
            )}

            <PlanFeatures>
              <FeatureText isSelected={isSelected}>
                ✓ Acceso completo a influencers verificados
              </FeatureText>
              <FeatureText isSelected={isSelected}>
                ✓ Gestión de campañas por administrador
              </FeatureText>
              <FeatureText isSelected={isSelected}>
                ✓ Sin comisiones por colaboración
              </FeatureText>
              <FeatureText isSelected={isSelected}>
                ✓ Soporte premium 24/7
              </FeatureText>
              <MonthlyPrice isSelected={isSelected}>
                Total: €{option.price * (option.plan === '3months' ? 3 : option.plan === '6months' ? 6 : 12)} 
                ({option.duration.toLowerCase()})
              </MonthlyPrice>
            </PlanFeatures>
          </PlanCard>
        );
      })}
    </Container>
  );
};