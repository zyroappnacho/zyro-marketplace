import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { logoZyroBase64 } from '../assets/logoBase64';

// Componente del Logo ZYRO usando base64
const ZyroLogo = ({ size = 32 }) => (
    <View style={styles.logoContainer}>
        <Image 
            source={{ uri: logoZyroBase64 }}
            style={[styles.logoImage, { width: size, height: size }]}
            resizeMode="contain"
        />
    </View>
);

const styles = StyleSheet.create({
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoImage: {
        // La imagen se redimensiona según el prop size
    },
});

export default ZyroLogo;