const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configuración para react-native-svg
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

// Resolver extensiones SVG
config.resolver.assetExts.push('svg');

module.exports = config;
