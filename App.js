import React from 'react';
import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ZyroAppNew from './components/ZyroAppNew';
import ZyroLogo from './components/ZyroLogo';

// Loading component
const LoadingScreen = () => (
  <View style={{ 
    flex: 1, 
    backgroundColor: '#000', 
    justifyContent: 'center', 
    alignItems: 'center' 
  }}>
    <ZyroLogo size={64} />
    <Text style={{ 
      color: '#CCCCCC', 
      marginTop: 20,
      fontSize: 16
    }}>
      Cargando ZYRO...
    </Text>
  </View>
);

// Main App Component
export default function App() {
  return (
    <>
      <StatusBar style="light" backgroundColor="#000000" />
      <ZyroAppNew />
    </>
  );
}