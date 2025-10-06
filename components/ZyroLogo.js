import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const ZyroLogo = ({ size = 32, style, showText = false, variant = 'default' }) => {
  const logoSize = {
    width: size * 3, // Proporción 3:1 para el logo
    height: size,
  };

  const textSize = size * 0.8;

  // Diferentes variantes del logo
  const variants = {
    default: {
      backgroundColor: 'transparent',
      textColor: '#C9A961',
    },
    welcome: {
      backgroundColor: 'transparent', 
      textColor: '#C9A961',
    },
    header: {
      backgroundColor: 'transparent',
      textColor: '#C9A961',
    },
    loading: {
      backgroundColor: 'transparent',
      textColor: '#CCCCCC',
    }
  };

  const currentVariant = variants[variant] || variants.default;

  return (
    <View style={[styles.container, style]}>
      {/* Logo principal - imagen PNG */}
      <Image 
        source={require('../assets/logozyrotransparente.png')} 
        style={[styles.logoImage, logoSize]}
        resizeMode="contain"
      />
      
      {/* Texto opcional */}
      {showText && (
        <Text style={[
          styles.logoText, 
          { 
            fontSize: textSize * 0.5,
            color: currentVariant.textColor 
          }
        ]}>
          MARKETPLACE
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    // La imagen PNG ya tiene el diseño completo del logo
  },
  logoText: {
    fontFamily: 'Inter-Medium',
    letterSpacing: 2,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default ZyroLogo;