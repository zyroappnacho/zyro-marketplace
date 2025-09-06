/**
 * Application constants for Zyro Marketplace
 * Contains all the business logic constants as specified in requirements
 */

// Subscription plans - EXACTLY as specified in requirements
export const subscriptionPlans = {
  '3months': {
    duration: 3,
    price: 499,
    currency: 'EUR',
    name: 'Plan 3 meses',
    description: 'Acceso completo por 3 meses',
    pricePerMonth: 499,
  },
  '6months': {
    duration: 6,
    price: 399,
    currency: 'EUR',
    name: 'Plan 6 meses',
    description: 'Acceso completo por 6 meses',
    pricePerMonth: 399,
  },
  '12months': {
    duration: 12,
    price: 299,
    currency: 'EUR',
    name: 'Plan 12 meses',
    description: 'Acceso completo por 12 meses',
    pricePerMonth: 299,
  },
} as const;

// Cities enabled in the platform
export const enabledCities = [
  'MADRID',
  'BARCELONA',
  'VALENCIA',
  'SEVILLA',
  'BILBAO',
  'MÁLAGA',
  'ZARAGOZA',
  'MURCIA',
  'PALMA',
  'LAS PALMAS',
  'CÓRDOBA',
  'VALLADOLID',
  'VIGO',
  'GIJÓN',
  'ALICANTE',
  'SANTANDER',
  'GRANADA',
  'VITORIA',
  'OVIEDO',
  'PAMPLONA',
] as const;

// Categories - EXACTLY as specified in requirements (9 categories)
export const categories = [
  'RESTAURANTES',
  'MOVILIDAD',
  'ROPA',
  'EVENTOS',
  'DELIVERY',
  'SALUD Y BELLEZA',
  'ALOJAMIENTO',
  'DISCOTECAS',
] as const;

// Content requirements - EXACTLY as specified in requirements
export const contentRequirements = {
  instagram: {
    stories: 2,
    videoRequired: 1, // At least 1 video story
    deadline: 72, // hours
    description: '2 historias de Instagram (1 en video)',
  },
  tiktok: {
    videos: 1,
    deadline: 72, // hours
    description: '1 video de TikTok',
  },
  alternativeText: '2 historias Instagram o 1 TikTok',
} as const;

// Payment methods supported - EXACTLY as specified in requirements
export const paymentMethods = [
  {
    id: 'card',
    name: 'Tarjeta Débito/Crédito',
    icon: 'credit-card',
    enabled: true,
  },
  {
    id: 'sepa',
    name: 'Transferencia SEPA',
    icon: 'bank',
    enabled: true,
  },
  {
    id: 'bizum',
    name: 'Bizum',
    icon: 'mobile-alt',
    enabled: true,
  },
  {
    id: 'apple_pay',
    name: 'Apple Pay',
    icon: 'apple',
    enabled: true,
  },
  {
    id: 'google_pay',
    name: 'Google Pay',
    icon: 'google',
    enabled: true,
  },
  {
    id: 'bank_transfer',
    name: 'Transferencia Bancaria',
    icon: 'university',
    enabled: true,
  },
] as const;

// User status messages
export const statusMessages = {
  pending: {
    influencer: 'Tu solicitud está siendo revisada. Recibirás una respuesta en 24-48 horas.',
    company: 'Tu solicitud empresarial está siendo validada. Te contactaremos pronto.',
  },
  approved: {
    influencer: '¡Felicidades! Tu perfil ha sido aprobado. Ya puedes acceder a todas las colaboraciones.',
    company: 'Tu empresa ha sido aprobada. Puedes comenzar a solicitar campañas.',
  },
  rejected: {
    influencer: 'Tu solicitud no ha sido aprobada en esta ocasión. Puedes volver a aplicar en 30 días.',
    company: 'Tu solicitud empresarial no ha sido aprobada. Contacta con soporte para más información.',
  },
  suspended: {
    influencer: 'Tu cuenta ha sido suspendida temporalmente. Contacta con soporte.',
    company: 'Tu cuenta empresarial ha sido suspendida. Contacta con soporte.',
  },
} as const;

// Validation rules
export const validationRules = {
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false, // Made more flexible
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  },
  username: {
    minLength: 3,
    maxLength: 30,
    allowedChars: /^[a-zA-Z0-9._-]+$/,
  },
  followers: {
    minInstagram: 1000,
    minTikTok: 1000,
    maxFollowers: 10000000,
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  phone: {
    pattern: /^(\+34|0034|34)?[6789]\d{8}$/,
  },
  cif: {
    pattern: /^[ABCDEFGHJNPQRSUVW]\d{7}[0-9A-J]$/,
  },
} as const;

// Notification types and priorities
export const notificationTypes = {
  COLLABORATION_REQUEST: 'collaboration_request',
  APPROVAL_STATUS: 'approval_status',
  CAMPAIGN_UPDATE: 'campaign_update',
  PAYMENT_REMINDER: 'payment_reminder',
  CONTENT_REMINDER: 'content_reminder',
  SYSTEM_ANNOUNCEMENT: 'system_announcement',
} as const;

export const notificationPriorities = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

// App navigation constants
export const tabNames = {
  HOME: 'Home',
  MAP: 'Map',
  HISTORY: 'History',
  PROFILE: 'Profile',
} as const;

// Cache keys
export const cacheKeys = {
  USER_PROFILE: 'user_profile',
  CAMPAIGNS: 'campaigns',
  COLLABORATIONS: 'collaborations',
  CITIES: 'cities',
  CATEGORIES: 'categories',
  NOTIFICATIONS: 'notifications',
} as const;

// API timeouts
export const apiTimeouts = {
  DEFAULT: 10000, // 10 seconds
  UPLOAD: 30000, // 30 seconds
  PAYMENT: 60000, // 60 seconds
} as const;

// Image constraints
export const imageConstraints = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 0.8,
} as const;

// Business rules
export const businessRules = {
  maxCompanionsDefault: 2,
  contentDeadlineHours: 72,
  approvalTimeoutHours: 48,
  maxCampaignsPerCompany: 10,
  maxActiveCollaborationsPerInfluencer: 5,
  minFollowersForPremiumCampaigns: 10000,
} as const;

// Error codes
export const errorCodes = {
  // Authentication
  INVALID_CREDENTIALS: 'AUTH_001',
  ACCOUNT_SUSPENDED: 'AUTH_002',
  ACCOUNT_PENDING: 'AUTH_003',
  
  // Collaboration
  INSUFFICIENT_FOLLOWERS: 'COLLAB_001',
  CAMPAIGN_NOT_AVAILABLE: 'COLLAB_002',
  ALREADY_APPLIED: 'COLLAB_003',
  
  // Payment
  PAYMENT_FAILED: 'PAY_001',
  SUBSCRIPTION_EXPIRED: 'PAY_002',
  INVALID_PAYMENT_METHOD: 'PAY_003',
  
  // General
  NETWORK_ERROR: 'NET_001',
  SERVER_ERROR: 'SRV_001',
  VALIDATION_ERROR: 'VAL_001',
} as const;

// Success messages
export const successMessages = {
  REGISTRATION_SUBMITTED: 'Registro enviado correctamente. Recibirás una respuesta pronto.',
  COLLABORATION_REQUESTED: 'Solicitud de colaboración enviada correctamente.',
  PROFILE_UPDATED: 'Perfil actualizado correctamente.',
  PAYMENT_SUCCESSFUL: 'Pago procesado correctamente.',
  CONTENT_UPLOADED: 'Contenido subido correctamente.',
} as const;

// Company information for legal documents
export const companyInfo = {
  name: 'Zyro Marketplace S.L.',
  cif: 'B12345678',
  address: 'Calle Serrano 123, 28006 Madrid, España',
  phone: '+34 900 123 456',
  email: 'info@zyromarketplace.com',
  supportEmail: 'soporte@zyromarketplace.com',
  legalEmail: 'legal@zyromarketplace.com',
  privacyEmail: 'privacy@zyromarketplace.com',
  gdprEmail: 'gdpr@zyromarketplace.com',
} as const;

// Social media platforms
export const socialPlatforms = {
  INSTAGRAM: 'instagram',
  TIKTOK: 'tiktok',
} as const;

// Export types for TypeScript
export type SubscriptionPlan = keyof typeof subscriptionPlans;
export type EnabledCity = typeof enabledCities[number];
export type Category = typeof categories[number];
export type PaymentMethod = typeof paymentMethods[number]['id'];
export type NotificationType = typeof notificationTypes[keyof typeof notificationTypes];
export type NotificationPriority = typeof notificationPriorities[keyof typeof notificationPriorities];
export type TabName = typeof tabNames[keyof typeof tabNames];
export type SocialPlatform = typeof socialPlatforms[keyof typeof socialPlatforms];