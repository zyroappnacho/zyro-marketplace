import React, { useState, useEffect } from 'react';
import { Modal, ModalProps, Animated, Dimensions } from 'react-native';
import styled from 'styled-components/native';
import { BlurView } from '@react-native-community/blur';
import { colors, borderRadius, spacing, animations } from '../styles/theme';

interface PremiumModalProps extends ModalProps {
  children: React.ReactNode;
  isVisible: boolean;
  onClose: () => void;
  variant?: 'center' | 'bottom' | 'fullscreen';
  blurType?: 'light' | 'dark' | 'xlight';
  blurAmount?: number;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ModalOverlay = styled.View`
  flex: 1;
  background-color: ${colors.black}80;
  justify-content: ${({ variant }: { variant: string }) =>
    variant === 'bottom' ? 'flex-end' :
    variant === 'fullscreen' ? 'stretch' :
    'center'};
  align-items: center;
  padding: ${({ variant }: { variant: string }) =>
    variant === 'fullscreen' ? '0px' : `${spacing.lg}px`};
`;

const ModalContent = styled(Animated.View)<{
  variant: string;
}>`
  background-color: ${colors.darkGray};
  border-radius: ${({ variant }: { variant: string }) =>
    variant === 'fullscreen' ? 0 : borderRadius.xl}px;
  border: 2px solid ${colors.goldElegant}60;
  padding: ${spacing.lg}px;
  width: ${({ variant }: { variant: string }) =>
    variant === 'fullscreen' ? '100%' :
    variant === 'bottom' ? '100%' :
    '90%'};
  max-width: ${({ variant }: { variant: string }) =>
    variant === 'fullscreen' ? '100%' : '400px'};
  max-height: ${({ variant }: { variant: string }) =>
    variant === 'fullscreen' ? '100%' : '80%'};
  elevation: 12;
  shadow-color: ${colors.goldElegant};
  shadow-offset: 0px 8px;
  shadow-opacity: 0.4;
  shadow-radius: 16px;
`;

const ModalGlow = styled(Animated.View)`
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border-radius: ${borderRadius.xl + 4}px;
  border: 2px solid ${colors.goldBright};
  opacity: 0.6;
`;

const CloseButton = styled.TouchableOpacity`
  position: absolute;
  top: ${spacing.md}px;
  right: ${spacing.md}px;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: ${colors.goldElegant}20;
  border: 1px solid ${colors.goldElegant};
  align-items: center;
  justify-content: center;
  z-index: 10;
`;

const CloseButtonText = styled.Text`
  color: ${colors.goldElegant};
  font-size: 18px;
  font-weight: bold;
  line-height: 18px;
`;

const BackdropTouchable = styled.TouchableOpacity`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

export const PremiumModal: React.FC<PremiumModalProps> = ({
  children,
  isVisible,
  onClose,
  variant = 'center',
  blurType = 'dark',
  blurAmount = 10,
  ...props
}) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [slideAnim] = useState(new Animated.Value(screenHeight));

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: animations.normal,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: animations.normal,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: animations.normal,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: animations.fast,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: animations.fast,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: screenHeight,
          duration: animations.fast,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  const getTransform = () => {
    switch (variant) {
      case 'bottom':
        return [{ translateY: slideAnim }];
      case 'fullscreen':
        return [{ scale: scaleAnim }];
      default:
        return [{ scale: scaleAnim }];
    }
  };

  return (
    <Modal
      transparent
      visible={isVisible}
      animationType="none"
      onRequestClose={onClose}
      {...props}
    >
      <BlurView
        style={{ flex: 1 }}
        blurType={blurType}
        blurAmount={blurAmount}
        reducedTransparencyFallbackColor={colors.black}
      >
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <ModalOverlay variant={variant}>
            <BackdropTouchable onPress={onClose} />
            <ModalContent
              variant={variant}
              style={{
                transform: getTransform(),
              }}
            >
              <ModalGlow />
              <CloseButton onPress={onClose} activeOpacity={0.8}>
                <CloseButtonText>×</CloseButtonText>
              </CloseButton>
              {children}
            </ModalContent>
          </ModalOverlay>
        </Animated.View>
      </BlurView>
    </Modal>
  );
};