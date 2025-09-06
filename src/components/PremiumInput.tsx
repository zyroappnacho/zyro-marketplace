import React, { useState } from 'react';
import { TextInputProps, Animated } from 'react-native';
import styled from 'styled-components/native';
import { colors, fonts, fontSizes, fontWeights, borderRadius, spacing, animations } from '../styles/theme';

interface PremiumInputProps extends TextInputProps {
  label?: string;
  error?: string;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const InputContainer = styled.View<{
  size: string;
}>`
  margin-bottom: ${({ size }: { size: string }) =>
    size === 'small' ? spacing.sm :
    size === 'medium' ? spacing.md :
    spacing.lg}px;
`;

const InputLabel = styled.Text<{
  size: string;
  focused: boolean;
  error: boolean;
}>`
  font-family: ${fonts.primary};
  font-size: ${({ size }: { size: string }) =>
    size === 'small' ? fontSizes.sm :
    size === 'medium' ? fontSizes.md :
    fontSizes.lg}px;
  font-weight: ${fontWeights.medium};
  color: ${({ focused, error }: { focused: boolean; error: boolean }) =>
    error ? colors.error :
    focused ? colors.goldBright :
    colors.textSecondary};
  margin-bottom: ${spacing.xs}px;
  letter-spacing: 0.5px;
`;

const InputWrapper = styled.View<{
  variant: string;
  size: string;
  focused: boolean;
  error: boolean;
}>`
  flex-direction: row;
  align-items: center;
  background-color: ${({ variant }: { variant: string }) =>
    variant === 'filled' ? colors.darkGray : 'transparent'};
  border: 2px solid ${({ focused, error }: { focused: boolean; error: boolean }) =>
    error ? colors.error :
    focused ? colors.goldBright :
    colors.goldElegant}60;
  border-radius: ${borderRadius.lg}px;
  padding: ${({ size }: { size: string }) =>
    size === 'small' ? `${spacing.xs}px ${spacing.sm}px` :
    size === 'medium' ? `${spacing.sm}px ${spacing.md}px` :
    `${spacing.md}px ${spacing.lg}px`};
  min-height: ${({ size }: { size: string }) =>
    size === 'small' ? '40px' :
    size === 'medium' ? '48px' :
    '56px'};
`;

const StyledTextInput = styled.TextInput<{
  size: string;
  hasLeftIcon: boolean;
  hasRightIcon: boolean;
}>`
  flex: 1;
  font-family: ${fonts.primary};
  font-size: ${({ size }: { size: string }) =>
    size === 'small' ? fontSizes.sm :
    size === 'medium' ? fontSizes.md :
    fontSizes.lg}px;
  font-weight: ${fontWeights.normal};
  color: ${colors.white};
  margin-left: ${({ hasLeftIcon }: { hasLeftIcon: boolean }) => 
    hasLeftIcon ? spacing.sm : 0}px;
  margin-right: ${({ hasRightIcon }: { hasRightIcon: boolean }) => 
    hasRightIcon ? spacing.sm : 0}px;
`;

const IconContainer = styled.View`
  align-items: center;
  justify-content: center;
`;

const ErrorText = styled.Text<{
  size: string;
}>`
  font-family: ${fonts.primary};
  font-size: ${({ size }: { size: string }) =>
    size === 'small' ? fontSizes.xs :
    size === 'medium' ? fontSizes.sm :
    fontSizes.md}px;
  font-weight: ${fontWeights.normal};
  color: ${colors.error};
  margin-top: ${spacing.xs}px;
  letter-spacing: 0.3px;
`;

const InputGlow = styled(Animated.View)<{
  focused: boolean;
  error: boolean;
}>`
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: ${borderRadius.lg + 2}px;
  border: 2px solid ${({ error }: { error: boolean }) =>
    error ? colors.error : colors.goldBright};
  opacity: 0;
`;

export const PremiumInput: React.FC<PremiumInputProps> = ({
  label,
  error,
  variant = 'default',
  size = 'medium',
  leftIcon,
  rightIcon,
  style,
  onFocus,
  onBlur,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const [glowAnim] = useState(new Animated.Value(0));

  const handleFocus = (event: any) => {
    setFocused(true);
    Animated.timing(glowAnim, {
      toValue: 1,
      duration: animations.fast,
      useNativeDriver: false,
    }).start();
    onFocus?.(event);
  };

  const handleBlur = (event: any) => {
    setFocused(false);
    Animated.timing(glowAnim, {
      toValue: 0,
      duration: animations.fast,
      useNativeDriver: false,
    }).start();
    onBlur?.(event);
  };

  return (
    <InputContainer size={size} style={style}>
      {label && (
        <InputLabel 
          size={size} 
          focused={focused} 
          error={!!error}
        >
          {label}
        </InputLabel>
      )}
      <InputWrapper
        variant={variant}
        size={size}
        focused={focused}
        error={!!error}
      >
        <InputGlow 
          focused={focused} 
          error={!!error}
          style={{ opacity: focused ? glowAnim : 0 }}
        />
        {leftIcon && (
          <IconContainer>
            {leftIcon}
          </IconContainer>
        )}
        <StyledTextInput
          size={size}
          hasLeftIcon={!!leftIcon}
          hasRightIcon={!!rightIcon}
          placeholderTextColor={colors.textSecondary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {rightIcon && (
          <IconContainer>
            {rightIcon}
          </IconContainer>
        )}
      </InputWrapper>
      {error && (
        <ErrorText size={size}>
          {error}
        </ErrorText>
      )}
    </InputContainer>
  );
};