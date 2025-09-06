#!/bin/bash

echo "🔧 Instalando dependencias faltantes para Zyro Marketplace..."

# Dependencias principales que pueden faltar
DEPS=(
  "expo-sqlite"
  "expo-crypto"
  "@react-native-community/datetimepicker"
  "@react-native-picker/picker"
  "react-native-image-picker"
  "@react-native-firebase/app"
  "@react-native-firebase/messaging"
  "react-native-keychain"
  "react-native-device-info"
  "@react-native-community/netinfo"
)

for dep in "${DEPS[@]}"; do
  echo "📦 Instalando $dep..."
  npm install "$dep" --legacy-peer-deps --silent
done

echo "✅ Todas las dependencias instaladas correctamente"
echo "🚀 Ahora puedes ejecutar: npm run ios"