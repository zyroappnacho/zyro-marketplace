// App configuration constants
export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
    timeout: 10000,
  },
  
  // Admin credentials (as specified in requirements)
  admin: {
    username: 'admin_zyrovip',
    password: 'xarrec-2paqra-guftoN',
  },
  
  // App constants
  app: {
    name: 'Zyro',
    version: '1.0.0',
    contentDeadlineHours: 72,
    approvalWaitTime: '24-48 horas',
  },
  
  // Subscription plans (as specified in requirements)
  subscriptionPlans: {
    '3months': { price: 499, duration: 3 },
    '6months': { price: 399, duration: 6 },
    '12months': { price: 299, duration: 12 },
  },
  
  // Categories (as specified in requirements)
  categories: [
    'RESTAURANTES',
    'MOVILIDAD', 
    'ROPA',
    'EVENTOS',
    'DELIVERY',
    'SALUD Y BELLEZA',
    'ALOJAMIENTO',
    'DISCOTECAS',
  ] as const,
  
  // Content requirements
  contentRequirements: {
    instagramStories: 2,
    tiktokVideos: 1,
    deadlineHours: 72,
  },
};