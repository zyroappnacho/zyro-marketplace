import React from 'react';
import styled from 'styled-components/native';
import { colors, spacing, borderRadius } from '../styles/theme';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const Container = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin: ${spacing.lg}px 0;
`;

const StepDot = styled.View<{ isActive: boolean; isCompleted: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 6px;
  margin: 0 ${spacing.xs}px;
  background-color: ${({ isActive, isCompleted }: { isActive: boolean; isCompleted: boolean }) => 
    isCompleted ? colors.goldElegant :
    isActive ? colors.goldElegant : 
    colors.mediumGray};
  opacity: ${({ isActive, isCompleted }: { isActive: boolean; isCompleted: boolean }) => 
    isCompleted || isActive ? 1 : 0.5};
`;

const StepLine = styled.View<{ isCompleted: boolean }>`
  width: 20px;
  height: 2px;
  background-color: ${({ isCompleted }: { isCompleted: boolean }) => 
    isCompleted ? colors.goldElegant : colors.mediumGray};
  opacity: ${({ isCompleted }: { isCompleted: boolean }) => isCompleted ? 1 : 0.5};
`;

export const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  totalSteps,
}) => {
  const steps = Array.from({ length: totalSteps }, (_, index) => index + 1);

  return (
    <Container>
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <StepDot
            isActive={step === currentStep}
            isCompleted={step < currentStep}
          />
          {index < steps.length - 1 && (
            <StepLine isCompleted={step < currentStep} />
          )}
        </React.Fragment>
      ))}
    </Container>
  );
};