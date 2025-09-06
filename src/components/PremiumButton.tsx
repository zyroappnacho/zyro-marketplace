import React, { useState } from 'react';
import { TouchableOpacityProps, ActivityIndicator, Animated } from 'react-native';
import styled from 'styled-components/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontSizes, fontWeights, borderRadius, shadows, animations } from '../styles/theme';

interface PremiumButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
}

const ButtonContainer = styled.TouchableOpacity<{
  variant: string;
  size: string;
  fullWidth: boolean;
  loading: boolean;
}>`
  border-radius: ${borderRadius.lg}px;
  padding: ${({ size }: { size: string }) =>
    size === 'small' ? '8px 16px' :
    size === 'medium' ? '12px 24px' :
    '16px 32px'};
  align-items: center;
  justify-content: center;
  flex-direction: row;
  width: ${({ fullWidth }: { fullWidth: boolean }) => fullWidth ? '100%' : 'auto'};
  min-height: ${({ size }: { size: string }) =>
    size === 'small' ? '40px' :
    size === 'medium' ? '48px' :
    '56px'};
  elevation: ${({ variant }: { variant: string }) => variant === 'outline' ? 2 : 6};
  shadow-color: ${colors.goldElegant};
  shadow-offset: 0px 4px;
  shadow-opacity: 0.3;
  shadow-radius: 8px;
  opacity: ${({ loading }: { loading: boolean }) => loading ? 0.7 : 1};
  border: ${({ variant }: { variant: string }) => 
    variant === 'outline' ? `2px solid ${colors.goldElegant}` : 'none'};
`;

const ButtonGradient = styled(LinearGradient)<{
  variant: string;
}>`
  flex: 1;
  border-radius: ${borderRadius.lg}px;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  min-height: 100%;
`;

const ButtonText = styled.Text<{
  variant: string;
  size: string;
}>`
  color: ${({ variant }: { variant: string }) =>
    variant === 'primary' ? colors.black : 
    variant === 'secondary' ? colors.white :
    colors.goldElegant};
  font-size: ${({ size }: { size: string }) =>
    size === 'small' ? fontSizes.sm :
    size === 'medium' ? fontSizes.md :
    fontSizes.lg}px;
  font-weight: ${fontWeights.semibold};
  text-align: center;
  letter-spacing: 0.5px;
  text-shadow: ${({ variant }: { variant: string }) =>
    variant === 'primary' ? 'none' : `0px 1px 2px ${colors.black}80`};
`;

const ButtonGlow = styled(Animated.View)<{
  variant: string;
}>`
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: ${borderRadius.lg + 4}px;
  background-color: ${colors.goldBright}60;
  opacity: 0;
`;

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  loading = false,
  style,
  disabled,
  onPressIn,
  onPressOut,
  ...props
}) => {
  const [glowAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(1));

  const getGradientColors = () => {
    switch (variant) {
      case 'primary':
        return [colors.goldBright, colors.goldElegant, colors.goldDark];
      case 'secondary':
        return [colors.goldDark, colors.darkGray, colors.black];
      default:
        return ['transparent', 'transparent'];
    }
  };

  const getSpinnerColor = () => {
    switch (variant) {
      case 'primary':
        return colors.black;
      case 'secondary':
        return colors.white;
      default:
        return colors.goldElegant;
    }
  };

  const handlePressIn = (event: any) => {
    Animated.parallel([
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: animations.fast,
        useNativeDriver: false,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: animations.fast,
        useNativeDriver: true,
      }),
    ]).start();
    onPressIn?.(event);
  };

  const handlePressOut = (event: any) => {
    Animated.parallel([
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: animations.fast,
        useNativeDriver: false,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: animations.fast,
        useNativeDriver: true,
      }),
    ]).start();
    onPressOut?.(event);
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <ButtonContainer
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        loading={loading}
        style={style}
        activeOpacity={0.9}
        disabled={disabled || loading}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...props}
      >
        <ButtonGlow 
          variant={variant} 
          style={{ opacity: glowAnim }}
        />
        {variant === 'outline' ? (
          <>
            {loading && (
              <ActivityIndicator 
                size="small" 
                color={getSpinnerColor()} 
                style={{ marginRight: 8 }}
              />
            )}
            <ButtonText variant={variant} size={size}>
              {title}
            </ButtonText>
          </>
        ) : (
          <ButtonGradient
            variant={variant}
            colors={getGradientColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {loading && (
              <ActivityIndicator 
                size="small" 
                color={getSpinnerColor()} 
                style={{ marginRight: 8 }}
              />
            )}
            <ButtonText variant={variant} size={size}>
              {title}
            </ButtonText>
          </ButtonGradient>
        )}
      </ButtonContainer>
    </Animated.View>
  );
};