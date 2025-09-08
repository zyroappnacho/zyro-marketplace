#!/bin/bash

echo "🔄 RESETEANDO COMPLETAMENTE LA APP ZYRO"
echo "======================================"

# Matar todos los procesos
echo "🛑 Matando procesos..."
pkill -f "expo" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true
pkill -f "node.*8081" 2>/dev/null || true

# Limpiar completamente
echo "🧹 Limpiando cache..."
rm -rf .expo
rm -rf node_modules/.cache
rm -rf /tmp/metro-*
rm -rf /tmp/haste-map-*

# Verificar que App.js esté correcto
echo "📱 Verificando App.js..."
if grep -q "TEST BUTTON" App.js; then
    echo "❌ App.js contiene código de prueba, actualizando..."
    
    cat > App.js << 'EOF'
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider } from 'styled-components/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Text, StyleSheet } from 'react-native';

// Store and theme
import { store, persistor } from './src/store';
import { theme } from './src/styles/theme';

// Navigation
import { AppNavigator } from './src/navigation/AppNavigator';

const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <Text style={styles.loadingText}>ZYRO</Text>
    <Text style={styles.loadingSubtext}>Cargando...</Text>
  </View>
);

export default function App() {
  console.log('🚀 ZYRO Marketplace - App Completa Iniciando...');

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={<LoadingScreen />} persistor={persistor}>
          <ThemeProvider theme={theme}>
            <StatusBar style="light" backgroundColor="#000000" />
            <AppNavigator />
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#C9A961',
    marginBottom: 20,
  },
  loadingSubtext: {
    fontSize: 18,
    color: '#ffffff',
  },
});
EOF
    
    echo "✅ App.js actualizado"
else
    echo "✅ App.js ya está correcto"
fi

# Esperar un momento
sleep 2

# Iniciar con cache limpio
echo "🚀 Iniciando app completa..."
npx expo start --ios --clear --port 8081

echo "✅ ¡App ZYRO completa iniciada!"