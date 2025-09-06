import React from 'react';
import { StatusBar } from 'expo-status-bar';
import styled from 'styled-components/native';
import { ZyroLogo } from '../components/ZyroLogo';
import { PremiumButton } from '../components/PremiumButton';
import { colors, spacing, fontSizes, fontWeights } from '../styles/theme';

interface WelcomeScreenProps {
  navigation: any;
}

const Container = styled.View`
  flex: 1;
  background-color: ${colors.black};
  justify-content: center;
  align-items: center;
  padding: ${spacing.xl}px;
`;

const ContentContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 400px;
`;

const LogoContainer = styled.View`
  margin-bottom: ${spacing.xxl * 2}px;
  align-items: center;
`;

const WelcomeText = styled.Text`
  color: ${colors.white};
  font-size: ${fontSizes.lg}px;
  font-weight: ${fontWeights.normal};
  text-align: center;
  margin-top: ${spacing.lg}px;
  margin-bottom: ${spacing.xxl}px;
  opacity: 0.9;
  line-height: 24px;
`;

const ButtonsContainer = styled.View`
  width: 100%;
  gap: ${spacing.lg}px;
`;

const Divider = styled.View`
  height: 1px;
  background-color: ${colors.goldElegant}40;
  width: 60%;
  margin: ${spacing.xl}px 0;
`;

const FooterText = styled.Text`
  color: ${colors.lightGray};
  font-size: ${fontSizes.sm}px;
  font-weight: ${fontWeights.normal};
  text-align: center;
  margin-top: ${spacing.xl}px;
  opacity: 0.7;
`;

const GradientOverlay = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    circle at center,
    ${colors.goldElegant}08 0%,
    transparent 70%
  );
`;

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  navigation,
}) => {
  const handleInfluencerPress = () => {
    navigation.navigate('InfluencerRegistration');
  };

  const handleCompanyPress = () => {
    navigation.navigate('CompanyRegistration');
  };

  const handleLoginPress = () => {
    navigation.navigate('Login');
  };
  return (
    <Container>
      <StatusBar style="light" backgroundColor={colors.black} />
      <GradientOverlay />
      
      <ContentContainer>
        <LogoContainer>
          <ZyroLogo size="large" color={colors.goldElegant} />
          <WelcomeText>
            Conectamos influencers con marcas{'\n'}
            para colaboraciones exclusivas
          </WelcomeText>
        </LogoContainer>

        <ButtonsContainer>
          <PremiumButton
            title="SOY INFLUENCER"
            variant="primary"
            size="large"
            fullWidth
            onPress={handleInfluencerPress}
          />
          
          <Divider />
          
          <PremiumButton
            title="SOY EMPRESA"
            variant="secondary"
            size="large"
            fullWidth
            onPress={handleCompanyPress}
          />
          
          <Divider />
          
          <PremiumButton
            title="INICIAR SESIÓN"
            variant="outline"
            size="medium"
            fullWidth
            onPress={handleLoginPress}
          />
        </ButtonsContainer>

        <FooterText>
          Marketplace premium para colaboraciones de calidad
        </FooterText>
      </ContentContainer>
    </Container>
  );
};