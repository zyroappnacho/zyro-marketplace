// CONFIGURACIÓN ESPECÍFICA PARA SIMULADOR iOS - ZYRO MARKETPLACE
// Recreado desde cero basado en todas las sesiones abiertas

const iOSSimulatorConfig = {
  // Información de la app
  app: {
    name: 'ZYRO Marketplace',
    bundleId: 'com.zyro.marketplace',
    version: '1.0.0',
    buildNumber: '2',
    displayName: 'ZYRO',
  },

  // Configuración del simulador
  simulator: {
    preferredDevices: [
      'iPhone 15 Pro Max',
      'iPhone 15 Pro', 
      'iPhone 15',
      'iPhone 14 Pro Max',
      'iPhone 14 Pro'
    ],
    minIOSVersion: '13.0',
    targetIOSVersion: '17.5',
    orientation: 'portrait',
    statusBarStyle: 'light-content',
  },

  // Variables de entorno optimizadas
  environment: {
    EXPO_NO_FLIPPER: '1',
    RCT_NO_LAUNCH_PACKAGER: '1',
    EXPO_USE_FAST_RESOLVER: '1',
    EXPO_USE_METRO_WORKSPACE_ROOT: '1',
    NODE_OPTIONS: '--max-old-space-size=8192',
    EXPO_DEVTOOLS_LISTEN_ADDRESS: '0.0.0.0',
    REACT_NATIVE_PACKAGER_HOSTNAME: 'localhost',
    ZYRO_ENV: 'ios_simulator',
    ZYRO_DEBUG_MODE: '1',
    ZYRO_ENHANCED_LOGGING: '1',
  },

  // Configuración de Metro
  metro: {
    port: 8083,
    resetCache: true,
    platforms: ['ios', 'android', 'native', 'web'],
    assetExts: ['svg', 'PNG', 'jpg', 'jpeg', 'gif', 'webp', 'ttf', 'otf'],
    sourceExts: ['js', 'jsx', 'ts', 'tsx', 'json'],
  },

  // Funcionalidades implementadas
  features: {
    authentication: {
      enabled: true,
      adminCredentials: {
        username: 'admin_zyrovip',
        password: 'xarrec-2paqra-guftoN'
      },
      mockUsers: true,
    },
    navigation: {
      enabled: true,
      tabs: ['home', 'map', 'history', 'profile'],
      premium: true,
    },
    collaborations: {
      enabled: true,
      mockData: true,
      filters: true,
      categories: [
        'restaurantes', 'movilidad', 'ropa', 'eventos', 
        'delivery', 'salud-belleza', 'alojamiento', 'discotecas'
      ],
      cities: [
        'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 
        'Bilbao', 'Málaga', 'Zaragoza', 'Murcia'
      ],
    },
    map: {
      enabled: true,
      interactive: true,
      spain: true,
      clustering: true,
    },
    notifications: {
      enabled: true,
      push: true,
      firebase: true,
    },
    redux: {
      enabled: true,
      persistence: true,
      slices: ['auth', 'ui', 'collaborations', 'notifications'],
    },
    design: {
      theme: 'premium',
      colors: {
        primary: '#C9A961',
        secondary: '#D4AF37',
        dark: '#000000',
        gray: '#111111',
      },
      logo: 'logozyrotransparente.png',
    },
    chat: {
      enabled: true,
      realtime: false, // Mock implementation
    },
    admin: {
      enabled: true,
      dashboard: true,
      userManagement: true,
      campaignManagement: true,
    },
  },

  // Configuración de desarrollo
  development: {
    hotReload: true,
    debugMode: true,
    logging: true,
    errorBoundary: true,
    devTools: true,
  },

  // Configuración de testing
  testing: {
    jest: true,
    coverage: true,
    e2e: false, // Configurar si es necesario
    mockData: true,
  },

  // Configuración de build
  build: {
    development: {
      simulator: true,
      buildConfiguration: 'Debug',
    },
    preview: {
      simulator: false,
      buildConfiguration: 'Release',
    },
    production: {
      simulator: false,
      buildConfiguration: 'Release',
    },
  },

  // Comandos útiles
  commands: {
    start: 'npx expo start --ios --localhost',
    startClean: 'npx expo start --ios --localhost --clear',
    startEnhanced: './start-ios-enhanced.sh',
    fix: './fix-ios-simulator.sh',
    test: './test-ios-complete.sh',
    build: 'eas build --profile development --platform ios',
  },

  // Información de debugging
  debug: {
    reloadApp: 'Cmd+R en simulador',
    debugMenu: 'Cmd+D en simulador',
    logs: 'npx expo logs --platform ios',
    inspector: 'j en terminal de Expo',
  },
};

module.exports = iOSSimulatorConfig;