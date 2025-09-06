import Constants from 'expo-constants';

export type Environment = 'development' | 'staging' | 'production';

export interface EnvironmentConfig {
  NODE_ENV: Environment;
  API_BASE_URL: string;
  API_TIMEOUT: number;
  DATABASE_URL: string;
  DATABASE_POOL_SIZE: number;
  DATABASE_TIMEOUT: number;
  FIREBASE_CONFIG: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  STRIPE_PUBLISHABLE_KEY: string;
  PAYMENT_WEBHOOK_SECRET: string;
  JWT_SECRET: string;
  ENCRYPTION_KEY: string;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  SENTRY_DSN?: string;
  ENABLE_PERFORMANCE_MONITORING: boolean;
  CACHE_TTL: number;
  ADMIN_CREDENTIALS: {
    username: string;
    password: string;
  };
  APP_VERSION: string;
  BUILD_NUMBER: string;
}

const getEnvironment = (): Environment => {
  const releaseChannel = Constants.expoConfig?.releaseChannel;
  
  if (releaseChannel === 'production') return 'production';
  if (releaseChannel === 'staging') return 'staging';
  if (process.env.NODE_ENV === 'production') return 'production';
  
  return 'development';
};

const createConfig = (): EnvironmentConfig => {
  const env = getEnvironment();
  const extra = Constants.expoConfig?.extra || {};
  
  // Default development configuration
  const defaultConfig: EnvironmentConfig = {
    NODE_ENV: 'development',
    API_BASE_URL: 'http://localhost:3000',
    API_TIMEOUT: 10000,
    DATABASE_URL: 'file:./zyro_dev.db',
    DATABASE_POOL_SIZE: 5,
    DATABASE_TIMEOUT: 10000,
    FIREBASE_CONFIG: {
      apiKey: 'dev_api_key',
      authDomain: 'zyromarketplace-dev.firebaseapp.com',
      projectId: 'zyromarketplace-dev',
      storageBucket: 'zyromarketplace-dev.appspot.com',
      messagingSenderId: 'dev_sender_id',
      appId: 'dev_app_id',
    },
    STRIPE_PUBLISHABLE_KEY: 'pk_test_dev_key',
    PAYMENT_WEBHOOK_SECRET: 'whsec_dev_webhook_secret',
    JWT_SECRET: 'dev_jwt_secret',
    ENCRYPTION_KEY: 'dev_encryption_key',
    LOG_LEVEL: 'debug',
    ENABLE_PERFORMANCE_MONITORING: true,
    CACHE_TTL: 60000, // 1 minute for development
    ADMIN_CREDENTIALS: {
      username: 'admin_zyrovip',
      password: 'xarrec-2paqra-guftoN',
    },
    APP_VERSION: '1.0.0-dev',
    BUILD_NUMBER: '1',
  };

  // Override with environment-specific values
  const config: EnvironmentConfig = {
    ...defaultConfig,
    NODE_ENV: env,
    API_BASE_URL: extra.API_BASE_URL || process.env.API_BASE_URL || defaultConfig.API_BASE_URL,
    API_TIMEOUT: parseInt(extra.API_TIMEOUT || process.env.API_TIMEOUT || '10000'),
    DATABASE_URL: extra.DATABASE_URL || process.env.DATABASE_URL || defaultConfig.DATABASE_URL,
    DATABASE_POOL_SIZE: parseInt(extra.DATABASE_POOL_SIZE || process.env.DATABASE_POOL_SIZE || '5'),
    DATABASE_TIMEOUT: parseInt(extra.DATABASE_TIMEOUT || process.env.DATABASE_TIMEOUT || '10000'),
    FIREBASE_CONFIG: {
      apiKey: extra.FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || defaultConfig.FIREBASE_CONFIG.apiKey,
      authDomain: extra.FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || defaultConfig.FIREBASE_CONFIG.authDomain,
      projectId: extra.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || defaultConfig.FIREBASE_CONFIG.projectId,
      storageBucket: extra.FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || defaultConfig.FIREBASE_CONFIG.storageBucket,
      messagingSenderId: extra.FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID || defaultConfig.FIREBASE_CONFIG.messagingSenderId,
      appId: extra.FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || defaultConfig.FIREBASE_CONFIG.appId,
    },
    STRIPE_PUBLISHABLE_KEY: extra.STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY || defaultConfig.STRIPE_PUBLISHABLE_KEY,
    PAYMENT_WEBHOOK_SECRET: extra.PAYMENT_WEBHOOK_SECRET || process.env.PAYMENT_WEBHOOK_SECRET || defaultConfig.PAYMENT_WEBHOOK_SECRET,
    JWT_SECRET: extra.JWT_SECRET || process.env.JWT_SECRET || defaultConfig.JWT_SECRET,
    ENCRYPTION_KEY: extra.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY || defaultConfig.ENCRYPTION_KEY,
    LOG_LEVEL: (extra.LOG_LEVEL || process.env.LOG_LEVEL || defaultConfig.LOG_LEVEL) as 'debug' | 'info' | 'warn' | 'error',
    SENTRY_DSN: extra.SENTRY_DSN || process.env.SENTRY_DSN,
    ENABLE_PERFORMANCE_MONITORING: (extra.ENABLE_PERFORMANCE_MONITORING || process.env.ENABLE_PERFORMANCE_MONITORING || 'true') === 'true',
    CACHE_TTL: parseInt(extra.CACHE_TTL || process.env.CACHE_TTL || '60000'),
    ADMIN_CREDENTIALS: {
      username: extra.ADMIN_USERNAME_ENCRYPTED || process.env.ADMIN_USERNAME_ENCRYPTED || defaultConfig.ADMIN_CREDENTIALS.username,
      password: extra.ADMIN_PASSWORD_ENCRYPTED || process.env.ADMIN_PASSWORD_ENCRYPTED || defaultConfig.ADMIN_CREDENTIALS.password,
    },
    APP_VERSION: extra.APP_VERSION || process.env.APP_VERSION || defaultConfig.APP_VERSION,
    BUILD_NUMBER: extra.BUILD_NUMBER || process.env.BUILD_NUMBER || defaultConfig.BUILD_NUMBER,
  };

  return config;
};

export const config = createConfig();

// Utility functions
export const isDevelopment = () => config.NODE_ENV === 'development';
export const isStaging = () => config.NODE_ENV === 'staging';
export const isProduction = () => config.NODE_ENV === 'production';

// Validation function
export const validateConfig = (): string[] => {
  const errors: string[] = [];

  if (!config.API_BASE_URL) {
    errors.push('API_BASE_URL is required');
  }

  if (!config.DATABASE_URL) {
    errors.push('DATABASE_URL is required');
  }

  if (!config.FIREBASE_CONFIG.apiKey) {
    errors.push('Firebase API key is required');
  }

  if (!config.JWT_SECRET || config.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long');
  }

  if (!config.ENCRYPTION_KEY || config.ENCRYPTION_KEY.length < 32) {
    errors.push('ENCRYPTION_KEY must be at least 32 characters long');
  }

  if (isProduction() && !config.SENTRY_DSN) {
    errors.push('SENTRY_DSN is required in production');
  }

  return errors;
};

// Initialize configuration validation
const configErrors = validateConfig();
if (configErrors.length > 0) {
  console.error('Configuration errors:', configErrors);
  if (isProduction()) {
    throw new Error(`Configuration validation failed: ${configErrors.join(', ')}`);
  }
}