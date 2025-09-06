module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      'babel-preset-expo',
      ['@babel/preset-env', { targets: { node: 'current' } }],
      '@babel/preset-typescript',
    ],
    plugins: [
      // React Native Reanimated plugin (must be last)
      'react-native-reanimated/plugin',
      
      // Styled components plugin
      [
        'babel-plugin-styled-components',
        {
          ssr: false,
          displayName: true,
          fileName: false,
        },
      ],
      
      // Module resolver for absolute imports
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@navigation': './src/navigation',
            '@services': './src/services',
            '@store': './src/store',
            '@types': './src/types',
            '@utils': './src/utils',
            '@config': './src/config',
            '@assets': './assets',
          },
        },
      ],
      
      // Transform inline environment variables
      [
        'transform-inline-environment-variables',
        {
          include: [
            'NODE_ENV',
            'EXPO_PUBLIC_API_URL',
            'EXPO_PUBLIC_FIREBASE_API_KEY',
            'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
          ],
        },
      ],
    ],
    env: {
      production: {
        plugins: [
          // Remove console.log in production
          ['transform-remove-console', { exclude: ['error', 'warn'] }],
        ],
      },
    },
  };
};