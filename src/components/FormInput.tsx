import React from 'react';
import { TextInputProps } from 'react-native';
import styled from 'styled-components/native';
import { colors, fontSizes, fontWeights, borderRadius, spacing } from '../styles/theme';

interface FormInputProps extends TextInputProps {
  label: string;
  error?: string;
  required?: boolean;
}

const Container = styled.View`
  margin-bottom: ${spacing.md}px;
`;

const Label = styled.Text<{ required: boolean }>`
  color: ${colors.white};
  font-size: ${fontSizes.sm}px;
  font-weight: ${fontWeights.medium};
  margin-bottom: ${spacing.xs}px;
`;

const InputContainer = styled.View<{ hasError: boolean }>`
  border: 2px solid ${({ hasError }: { hasError: boolean }) => hasError ? colors.error : `${colors.goldElegant}40`};
  border-radius: ${borderRadius.md}px;
  background-color: ${colors.darkGray};
  padding: ${spacing.sm}px ${spacing.md}px;
`;

const Input = styled.TextInput`
  color: ${colors.white};
  font-size: ${fontSizes.md}px;
  font-weight: ${fontWeights.normal};
  min-height: 24px;
`;

const ErrorText = styled.Text`
  color: ${colors.error};
  font-size: ${fontSizes.xs}px;
  font-weight: ${fontWeights.normal};
  margin-top: ${spacing.xs}px;
`;

const RequiredAsterisk = styled.Text`
  color: ${colors.goldElegant};
`;

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  required = false,
  style,
  ...props
}) => {
  return (
    <Container style={style}>
      <Label required={required}>
        {label}
        {required && <RequiredAsterisk> *</RequiredAsterisk>}
      </Label>
      <InputContainer hasError={!!error}>
        <Input
          placeholderTextColor={colors.mediumGray}
          {...props}
        />
      </InputContainer>
      {error && <ErrorText>{error}</ErrorText>}
    </Container>
  );
};