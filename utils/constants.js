// App Constants for ZYRO Marketplace

export const COLORS = {
  // Primary colors
  PRIMARY_GOLD: '#C9A961',
  PRIMARY_GOLD_LIGHT: '#D4AF37',
  PRIMARY_GOLD_DARK: '#B8860B',
  
  // Background colors
  BLACK: '#000000',
  DARK_GRAY: '#111111',
  MEDIUM_GRAY: '#333333',
  LIGHT_GRAY: '#666666',
  
  // Text colors
  WHITE: '#FFFFFF',
  LIGHT_TEXT: '#CCCCCC',
  MEDIUM_TEXT: '#999999',
  
  // Status colors
  SUCCESS: '#4CAF50',
  WARNING: '#FF9800',
  ERROR: '#F44336',
  INFO: '#2196F3',
  
  // Transparent overlays
  OVERLAY_DARK: 'rgba(0, 0, 0, 0.8)',
  OVERLAY_LIGHT: 'rgba(0, 0, 0, 0.5)',
  GOLD_OVERLAY: 'rgba(201, 169, 97, 0.1)',
};

export const FONTS = {
  // Font families
  PRIMARY: Platform.OS === 'ios' ? 'Cinzel' : 'serif',
  SECONDARY: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
  
  // Font sizes
  EXTRA_LARGE: 32,
  LARGE: 24,
  MEDIUM_LARGE: 20,
  MEDIUM: 16,
  SMALL: 14,
  EXTRA_SMALL: 12,
  TINY: 10,
  
  // Font weights
  LIGHT: '300',
  REGULAR: '400',
  MEDIUM: '500',
  SEMI_BOLD: '600',
  BOLD: '700',
  EXTRA_BOLD: '800',
};

export const SPACING = {
  // Padding and margin values
  TINY: 4,
  SMALL: 8,
  MEDIUM: 12,
  LARGE: 16,
  EXTRA_LARGE: 20,
  HUGE: 24,
  MASSIVE: 32,
  
  // Border radius
  BORDER_RADIUS_SMALL: 6,
  BORDER_RADIUS_MEDIUM: 8,
  BORDER_RADIUS_LARGE: 12,
  BORDER_RADIUS_EXTRA_LARGE: 16,
  BORDER_RADIUS_ROUND: 50,
};

export const ANIMATIONS = {
  // Animation durations
  FAST: 200,
  MEDIUM: 300,
  SLOW: 500,
  EXTRA_SLOW: 800,
  
  // Easing functions
  EASE_IN: 'ease-in',
  EASE_OUT: 'ease-out',
  EASE_IN_OUT: 'ease-in-out',
  LINEAR: 'linear',
};

export const SCREEN_NAMES = {
  // Main screens
  WELCOME: 'welcome',
  LOGIN: 'login',
  REGISTER_INFLUENCER: 'influencer-register',
  REGISTER_COMPANY: 'company-register',
  
  // Influencer screens
  HOME: 'home',
  MAP: 'map',
  HISTORY: 'history',
  PROFILE: 'profile',
  COLLABORATION_DETAIL: 'collaboration-detail',
  COLLABORATION_REQUEST: 'collaboration-request',
  
  // Company screens
  COMPANY_DASHBOARD: 'company',
  CAMPAIGN_REQUESTS: 'campaign-requests',
  CAMPAIGN_METRICS: 'campaign-metrics',
  COMPANY_ANALYTICS: 'company-analytics',
  SUBSCRIPTION_MANAGEMENT: 'subscription-management',
  
  // Admin screens
  ADMIN_DASHBOARD: 'admin',
  MANAGE_USERS: 'manage-users',
  MANAGE_CAMPAIGNS: 'manage-campaigns',
  FINANCIAL_DASHBOARD: 'financial-dashboard',
  
  // Settings screens
  NOTIFICATIONS: 'notifications',
  SETTINGS: 'settings',
  PERSONAL_DATA: 'personal-data',
  SECURITY: 'security',
  PRIVACY_POLICY: 'privacy-policy',
  TERMS_CONDITIONS: 'terms-conditions',
  HELP: 'help',
};

export const USER_ROLES = {
  INFLUENCER: 'influencer',
  COMPANY: 'company',
  ADMIN: 'admin',
};

export const COLLABORATION_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  APPROVED: 'approved',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
};

export const NOTIFICATION_TYPES = {
  COLLABORATION_APPROVED: 'collaboration_approved',
  COLLABORATION_REJECTED: 'collaboration_rejected',
  NEW_COLLABORATION: 'new_collaboration',
  CONTENT_REMINDER: 'content_reminder',
  PAYMENT_RECEIVED: 'payment_received',
  SYSTEM_UPDATE: 'system_update',
};

export const SUBSCRIPTION_PLANS = {
  THREE_MONTHS: '3months',
  SIX_MONTHS: '6months',
  TWELVE_MONTHS: '12months',
};

export const PAYMENT_METHODS = {
  CARD: 'card',
  TRANSFER: 'transfer',
  SEPA: 'sepa',
  APPLE_PAY: 'apple',
  GOOGLE_PAY: 'google',
  BIZUM: 'bizum',
};

export const CATEGORIES = {
  ALL: 'all',
  RESTAURANTS: 'restaurantes',
  FASHION: 'ropa',
  BEAUTY: 'belleza',
  EVENTS: 'eventos',
  MOBILITY: 'movilidad',
  DELIVERY: 'delivery',
  ACCOMMODATION: 'alojamiento',
  NIGHTLIFE: 'discotecas',
};

export const CITIES = [
  'Madrid',
  'Barcelona',
  'Valencia',
  'Sevilla',
  'Bilbao',
  'Málaga',
  'Zaragoza',
  'Murcia',
  'Palma',
  'Las Palmas',
  'Córdoba',
  'Valladolid',
];

export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^(\+34|0034|34)?[6789]\d{8}$/,
  PASSWORD_MIN_LENGTH: 6,
  INSTAGRAM_USERNAME: /^@?[a-zA-Z0-9._]{1,30}$/,
  CIF: /^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/,
  NIE: /^[XYZ]\d{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/,
  DNI: /^\d{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/,
};

export const API_ENDPOINTS = {
  BASE_URL: 'https://api.zyro.com/v1',
  
  // Auth endpoints
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  
  // User endpoints
  PROFILE: '/user/profile',
  UPLOAD_IMAGE: '/user/profile/image',
  UPDATE_SETTINGS: '/user/settings',
  
  // Collaboration endpoints
  COLLABORATIONS: '/collaborations',
  COLLABORATION_DETAIL: '/collaborations/:id',
  REQUEST_COLLABORATION: '/collaborations/request',
  MY_REQUESTS: '/collaborations/my-requests',
  
  // Notification endpoints
  NOTIFICATIONS: '/notifications',
  MARK_READ: '/notifications/:id/read',
  NOTIFICATION_SETTINGS: '/notifications/settings',
  
  // Company endpoints
  COMPANY_DASHBOARD: '/company/dashboard',
  CREATE_CAMPAIGN: '/company/campaigns',
  CAMPAIGN_REQUESTS: '/company/campaigns/:id/requests',
  APPROVE_REQUEST: '/company/requests/:id/approve',
  REJECT_REQUEST: '/company/requests/:id/reject',
  
  // Admin endpoints
  ADMIN_DASHBOARD: '/admin/dashboard',
  PENDING_APPROVALS: '/admin/approvals/pending',
  APPROVE_USER: '/admin/users/:id/approve',
  REJECT_USER: '/admin/users/:id/reject',
  
  // Payment endpoints
  CREATE_PAYMENT_INTENT: '/payments/create-intent',
  CONFIRM_PAYMENT: '/payments/confirm',
  PAYMENT_HISTORY: '/payments/history',
  
  // Search endpoints
  SEARCH_COLLABORATIONS: '/search/collaborations',
  SEARCH_SUGGESTIONS: '/search/suggestions',
};

export const STORAGE_KEYS = {
  USER_DATA: 'currentUser',
  USER_SETTINGS: 'userSettings',
  COLLABORATION_HISTORY: 'collaborationHistory',
  FAVORITES: 'favorites',
  SEARCH_HISTORY: 'searchHistory',
  ONBOARDING_COMPLETED: 'onboardingCompleted',
  PUSH_TOKEN: 'expoPushToken',
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica tu conexión a internet.',
  INVALID_EMAIL: 'Por favor introduce un email válido.',
  INVALID_PASSWORD: 'La contraseña debe tener al menos 6 caracteres.',
  INVALID_PHONE: 'Por favor introduce un número de teléfono válido.',
  REQUIRED_FIELD: 'Este campo es obligatorio.',
  INVALID_INSTAGRAM: 'Por favor introduce un usuario de Instagram válido.',
  INVALID_CIF: 'Por favor introduce un CIF válido.',
  PERMISSION_DENIED: 'Permisos denegados.',
  LOCATION_UNAVAILABLE: 'No se pudo obtener la ubicación.',
  CAMERA_UNAVAILABLE: 'No se pudo acceder a la cámara.',
  GALLERY_UNAVAILABLE: 'No se pudo acceder a la galería.',
};

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Sesión iniciada correctamente.',
  REGISTER_SUCCESS: 'Registro completado. Revisa tu email para verificar tu cuenta.',
  PROFILE_UPDATED: 'Perfil actualizado correctamente.',
  SETTINGS_SAVED: 'Configuración guardada correctamente.',
  COLLABORATION_REQUESTED: 'Solicitud de colaboración enviada correctamente.',
  NOTIFICATION_MARKED_READ: 'Notificación marcada como leída.',
  PAYMENT_SUCCESS: 'Pago procesado correctamente.',
};

export const DEVICE_DIMENSIONS = {
  SCREEN_WIDTH: Dimensions.get('window').width,
  SCREEN_HEIGHT: Dimensions.get('window').height,
  IS_SMALL_DEVICE: Dimensions.get('window').width < 375,
  IS_LARGE_DEVICE: Dimensions.get('window').width > 414,
};

export const GRADIENTS = {
  PRIMARY: ['#C9A961', '#D4AF37', '#B8860B'],
  SECONDARY: ['#111111', '#333333'],
  OVERLAY: ['transparent', 'rgba(0,0,0,0.8)'],
  BUTTON: ['#C9A961', '#D4AF37'],
  DISABLED: ['#666666', '#555555'],
};