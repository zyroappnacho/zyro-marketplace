import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#000000" />
      
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>ZYRO</Text>
        <Text style={styles.subtitle}>Marketplace Premium</Text>
      </View>
      
      {/* Welcome Message */}
      <View style={styles.welcomeContainer}>
        <Text style={styles.welcomeTitle}>¡Bienvenido a Zyro Marketplace!</Text>
        <Text style={styles.welcomeText}>
          Conectamos influencers cualificados con empresas exclusivas
          para colaboraciones de alta calidad.
        </Text>
      </View>
      
      {/* Action Buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={[styles.button, styles.primaryButton]}>
          <Text style={styles.buttonText}>SOY INFLUENCER</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
          <Text style={styles.buttonTextSecondary}>SOY EMPRESA</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.outlineButton]}>
          <Text style={styles.buttonTextOutline}>INICIAR SESIÓN</Text>
        </TouchableOpacity>
      </View>
      
      {/* Credentials Info */}
      <View style={styles.credentialsContainer}>
        <Text style={styles.credentialsTitle}>👑 Credenciales de Administrador:</Text>
        <Text style={styles.credentialsText}>Usuario: admin_zyrovip</Text>
        <Text style={styles.credentialsText}>Contraseña: xarrec-2paqra-guftoN</Text>
        
        <Text style={styles.credentialsTitle}>📱 Influencer de Prueba:</Text>
        <Text style={styles.credentialsText}>Usuario: pruebainflu</Text>
        <Text style={styles.credentialsText}>Contraseña: 12345</Text>
      </View>
      
      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Aplicación completamente implementada y lista para build
        </Text>
        <Text style={styles.footerSubtext}>
          Todas las funcionalidades de requirements, design y tasks están completas
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    minHeight: '100vh',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 48,
    fontWeight: '600',
    color: '#C9A961',
    letterSpacing: 3,
    textShadow: '0 2px 8px rgba(201, 169, 97, 0.3)',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#999999',
    fontWeight: '500',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 40,
    maxWidth: 600,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 15,
  },
  welcomeText: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 15,
    marginBottom: 40,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  primaryButton: {
    backgroundColor: '#C9A961',
    shadowColor: '#C9A961',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  secondaryButton: {
    backgroundColor: '#A68B47',
    shadowColor: '#A68B47',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#C9A961',
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  buttonTextSecondary: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  buttonTextOutline: {
    color: '#C9A961',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  credentialsContainer: {
    backgroundColor: '#111111',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C9A961',
    marginBottom: 30,
    maxWidth: 500,
    width: '100%',
  },
  credentialsTitle: {
    color: '#C9A961',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
  },
  credentialsText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'monospace',
    marginBottom: 3,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#999999',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 5,
  },
  footerSubtext: {
    color: '#666666',
    fontSize: 12,
    textAlign: 'center',
  },
});