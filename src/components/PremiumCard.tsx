import React, { useState } from 'react';
import { ViewProps, Animated } from 'react-native';
import styled from 'styled-components/native';
import { colors, borderRadius, shadows, animations, spacing } from '../styles/theme';

interface PremiumCardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'small' | 'medium' | 'large';
  focusable?: boolean;
  onPress?: () => void;
}

const CardContainer = styled.TouchableOpacity<{
  variant: string;
  padding: string;
  focusable: boolean;
}>`
  background-color: ${colors.darkGray};
  border-radius: ${borderRadius.lg}px;
  border: ${({ variant }: { variant: string }) => 
    variant === 'outlined' ? `2px solid ${colors.goldElegant}` : 
    `1px solid ${colors.goldElegant}40`};
  padding: ${({ padding }: { padding: string }) =>
    padding === 'small' ? `${spacing.sm}px` :
    padding === 'medium' ? `${spacing.md}px` :
    `${spacing.lg}px`};
  elevation: ${({ variant }: { variant: string }) => 
    variant === 'elevated' ? 8 : 4};
  shadow-color: ${colors.goldElegant};
  shadow-offset: 0px 4px;
  shadow-opacity: ${({ variant }: { variant: string }) => 
    variant === 'elevated' ? 0.4 : 0.2};
  shadow-radius: ${({ variant }: { variant: string }) => 
    variant === 'elevated' ? 12 : 8}px;
  margin: ${spacing.xs}px;
`;

const CardGlow = styled(Animated.View)<{
  variant: string;
}>`
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: ${borderRadius.lg + 2}px;
  border: 2px solid ${colors.goldBright};
  opacity: 0;
`;

const CardContent = styled.View`
  flex: 1;
`;

const CardBackdrop = styled.View<{
  variant: string;
}>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: ${borderRadius.lg}px;
  background-color: ${({ variant }: { variant: string }) => 
    variant === 'elevated' ? `${colors.goldElegant}10` : 'transparent'};
`;

export const PremiumCard: React.FC<PremiumCardProps> = ({
  children,
  variant = 'default',
  padding = 'medium',
  focusable = false,
  onPress,
  style,
  ...props
}) => {
  const [glowAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    if (!focusable || !onPress) return;
    
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
  };

  const handlePressOut = () => {
    if (!focusable || !onPress) return;
    
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
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <CardContainer
        variant={variant}
        padding={padding}
        focusable={focusable}
        activeOpacity={focusable && onPress ? 0.9 : 1}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={!onPress}
        {...props}
      >
        <CardBackdrop variant={variant} />
        {focusable && (
          <CardGlow 
            variant={variant} 
            style={{ opacity: glowAnim }}
          />
        )}
        <CardContent>
          {children}
        </CardContent>
      </CardContainer>
    </Animated.View>
  );
};