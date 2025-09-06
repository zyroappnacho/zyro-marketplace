const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      babel: {
        dangerouslyAddModulePathsToTranspile: [
          '@react-navigation',
          '@react-native-async-storage',
          'react-native-gesture-handler',
          'react-native-reanimated',
          'react-native-screens',
          'react-native-safe-area-context',
          'react-native-vector-icons',
          'styled-components',
        ],
      },
    },
    argv
  );

  // Customize the config before returning it.
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': require('path').resolve(__dirname, 'src'),
    '@components': require('path').resolve(__dirname, 'src/components'),
    '@screens': require('path').resolve(__dirname, 'src/screens'),
    '@services': require('path').resolve(__dirname, 'src/services'),
    '@store': require('path').resolve(__dirname, 'src/store'),
    '@utils': require('path').resolve(__dirname, 'src/utils'),
    '@config': require('path').resolve(__dirname, 'src/config'),
    '@types': require('path').resolve(__dirname, 'src/types'),
  };

  return config;
};