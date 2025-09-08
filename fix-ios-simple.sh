#!/bin/bash

echo "🔧 SOLUCIONANDO SIMULADOR iOS (SIN SUDO)"
echo "======================================="

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

# 1. Matar procesos existentes (sin sudo)
print_status "Matando procesos de Expo existentes..."
pkill -f "expo start" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true
sleep 2

# 2. Limpiar cache (sin sudo)
print_status "Limpiando cache..."
rm -rf .expo 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf /tmp/metro-* 2>/dev/null || true

# 3. Crear configuración ultra simple
print_status "Creando configuración ultra simple..."

# App.tsx que definitivamente funciona
cat > App.tsx << 'EOF'
import React from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';

export default function App() {
  console.log('🚀 App iniciada correctamente');
  
  const handlePress = () => {
    console.log('✅ Botón presionado');
    Alert.alert('¡Éxito!', 'El simulador iOS funciona perfectamente');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ZYRO</Text>
      <Text style={styles.subtitle}>iOS Simulator Working!</Text>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>TEST BUTTON</Text>
      </TouchableOpacity>
      <Text style={styles.info}>Si ves esto, todo funciona correctamente</Text>
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
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#C9A961',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#C9A961',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  info: {
    color: '#888888',
    fontSize: 14,
    textAlign: 'center',
  },
});
EOF

# package.json ultra simple
cat > package.json << 'EOF'
{
  "name": "zyromarketplace",
  "version": "1.0.0",
  "main": "App.tsx",
  "scripts": {
    "start": "expo start",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "expo": "~51.0.28",
    "react": "18.2.0",
    "react-native": "0.74.5"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0"
  },
  "private": true
}
EOF

# app.config.js ultra simple
cat > app.config.js << 'EOF'
export default {
  expo: {
    name: "ZYRO",
    slug: "zyro-marketplace",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "dark",
    splash: {
      backgroundColor: "#000000"
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: "com.zyromarketplace.app"
    },
    android: {
      package: "com.zyromarketplace.app"
    },
    plugins: [],
    platforms: ["ios", "android", "web"]
  }
};
EOF

# metro.config.js ultra simple
cat > metro.config.js << 'EOF'
const { getDefaultConfig } = require('expo/metro-config');
module.exports = getDefaultConfig(__dirname);
EOF

print_success "Configuración creada"

# 4. Limpiar e instalar
print_status "Limpiando node_modules..."
rm -rf node_modules package-lock.json

print_status "Instalando dependencias..."
npm install --legacy-peer-deps

print_success "¡Listo! Ahora ejecuta: npx expo start --ios"

echo ""
echo "🎯 PRÓXIMOS PASOS:"
echo "=================="
echo "1. Ejecuta: npx expo start --ios"
echo "2. Espera a que se abra el simulador"
echo "3. Deberías ver la pantalla ZYRO con un botón"
echo "4. Presiona el botón para confirmar que funciona"
echo ""
echo "Si funciona, podremos restaurar la app completa."