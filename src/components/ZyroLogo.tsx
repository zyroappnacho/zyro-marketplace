import React from 'react';
import { View, Image } from 'react-native';
import styled from 'styled-components/native';
import { colors, fonts, fontWeights } from '../styles/theme';

interface ZyroLogoProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  variant?: 'text' | 'image' | 'full';
}

const LogoContainer = styled.View<{ size: string }>`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const LogoText = styled.Text<{ size: string; color: string }>`
  font-family: ${fonts.logo};
  font-size: ${({ size }: { size: string }) => 
    size === 'small' ? '28px' : 
    size === 'medium' ? '36px' : 
    '48px'};
  font-weight: ${fontWeights.bold};
  color: ${({ color }: { color: string }) => color};
  letter-spacing: 4px;
  text-shadow: 0px 2px 8px rgba(201, 169, 97, 0.3);
`;

const LogoImageContainer = styled.View<{ size: string }>`
  width: ${({ size }: { size: string }) => 
    size === 'small' ? '120px' : 
    size === 'medium' ? '160px' : 
    '200px'};
  height: ${({ size }: { size: string }) => 
    size === 'small' ? '60px' : 
    size === 'medium' ? '80px' : 
    '100px'};
  align-items: center;
  justify-content: center;
`;

const CircleBackground = styled.View<{ size: string }>`
  width: ${({ size }: { size: string }) => 
    size === 'small' ? '80px' : 
    size === 'medium' ? '100px' : 
    '120px'};
  height: ${({ size }: { size: string }) => 
    size === 'small' ? '80px' : 
    size === 'medium' ? '100px' : 
    '120px'};
  border-radius: ${({ size }: { size: string }) => 
    size === 'small' ? '40px' : 
    size === 'medium' ? '50px' : 
    '60px'};
  background-color: rgba(40, 40, 40, 0.8);
  border: 2px solid rgba(201, 169, 97, 0.3);
  position: absolute;
  align-items: center;
  justify-content: center;
`;

export const ZyroLogo: React.FC<ZyroLogoProps> = ({ 
  size = 'medium', 
  color = colors.goldElegant,
  variant = 'full'
}) => {
  
  if (variant === 'text') {
    return (
      <LogoContainer size={size}>
        <LogoText size={size} color={color}>
          ZYRO
        </LogoText>
      </LogoContainer>
    );
  }

  if (variant === 'image') {
    return (
      <LogoImageContainer size={size}>
        <CircleBackground size={size} />
        <LogoText size={size} color={color}>
          ZYRO
        </LogoText>
      </LogoImageContainer>
    );
  }

  // variant === 'full' (default)
  return (
    <LogoImageContainer size={size}>
      <CircleBackground size={size} />
      <LogoText size={size} color={color}>
        ZYRO
      </LogoText>
    </LogoImageContainer>
  );
};