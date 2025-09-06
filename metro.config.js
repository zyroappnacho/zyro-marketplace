const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for additional file extensions
config.resolver.assetExts.push(
  // Fonts
  'ttf',
  'otf',
  'woff',
  'woff2',
  // Images
  'svg',
  'png',
  'jpg',
  'jpeg',
  'gif',
  'webp',
  // Audio
  'mp3',
  'wav',
  'aac',
  // Video
  'mp4',
  'mov',
  'avi'
);

// Add support for TypeScript and JavaScript source maps
config.resolver.sourceExts.push('ts', 'tsx', 'js', 'jsx', 'json');

// Configure transformer for SVG files
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts.push('svg');

// Enable symlinks (useful for monorepos)
config.resolver.unstable_enableSymlinks = true;

// Configure watchman ignore patterns
config.watchFolders = [__dirname];

// Increase memory limit for large projects
config.maxWorkers = 2;

// Configure caching (simplified)
config.resetCache = true;

// Web-specific configuration
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Alias configuration for better module resolution
config.resolver.alias = {
  '@': path.resolve(__dirname, 'src'),
  '@components': path.resolve(__dirname, 'src/components'),
  '@screens': path.resolve(__dirname, 'src/screens'),
  '@services': path.resolve(__dirname, 'src/services'),
  '@store': path.resolve(__dirname, 'src/store'),
  '@utils': path.resolve(__dirname, 'src/utils'),
  '@config': path.resolve(__dirname, 'src/config'),
  '@types': path.resolve(__dirname, 'src/types'),
};

module.exports = config;