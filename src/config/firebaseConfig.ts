/**
 * Firebase configuration for Zyro Marketplace
 * This file contains the Firebase project configuration
 */

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// Firebase configuration object
// TODO: Replace with actual Firebase project credentials
export const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "zyro-marketplace.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "zyro-marketplace",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "zyro-marketplace.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789012",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:123456789012:web:abcdef123456",
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX",
};

// Notification channel configuration for Android
export const notificationChannels = {
  default: {
    id: 'zyro_notifications',
    name: 'Zyro Notifications',
    description: 'General notifications from Zyro',
    importance: 'high' as const,
    sound: 'default',
    vibration: [0, 250, 250, 250],
    lightColor: '#C9A961', // Zyro gold color
  },
  collaboration_request: {
    id: 'collaboration_requests',
    name: 'Collaboration Requests',
    description: 'New collaboration requests and updates',
    importance: 'high' as const,
    sound: 'collaboration_request.wav',
    vibration: [0, 250, 250, 250],
    lightColor: '#C9A961',
  },
  approval_status: {
    id: 'approval_status',
    name: 'Approval Status',
    description: 'User and collaboration approval updates',
    importance: 'high' as const,
    sound: 'success.wav',
    vibration: [0, 500],
    lightColor: '#D4AF37',
  },
  campaign_update: {
    id: 'campaign_updates',
    name: 'Campaign Updates',
    description: 'New campaigns and content reminders',
    importance: 'normal' as const,
    sound: 'notification.wav',
    vibration: [0, 250],
    lightColor: '#C9A961',
  },
  payment_reminder: {
    id: 'payment_reminders',
    name: 'Payment Reminders',
    description: 'Subscription and payment notifications',
    importance: 'high' as const,
    sound: 'payment_reminder.wav',
    vibration: [0, 250, 250, 250],
    lightColor: '#A68B47',
  },
  urgent: {
    id: 'urgent_notifications',
    name: 'Urgent Notifications',
    description: 'Critical notifications requiring immediate attention',
    importance: 'max' as const,
    sound: 'alert.wav',
    vibration: [0, 1000, 500, 1000],
    lightColor: '#FF4444',
  },
};

// Topic names for Firebase Cloud Messaging
export const notificationTopics = {
  // Role-based topics
  ROLE_ADMIN: 'role_admin',
  ROLE_INFLUENCER: 'role_influencer',
  ROLE_COMPANY: 'role_company',
  
  // City-based topics (examples)
  CITY_MADRID: 'city_madrid',
  CITY_BARCELONA: 'city_barcelona',
  CITY_VALENCIA: 'city_valencia',
  CITY_SEVILLA: 'city_sevilla',
  CITY_BILBAO: 'city_bilbao',
  
  // Category-based topics
  CATEGORY_RESTAURANTES: 'category_restaurantes',
  CATEGORY_MOVILIDAD: 'category_movilidad',
  CATEGORY_ROPA: 'category_ropa',
  CATEGORY_EVENTOS: 'category_eventos',
  CATEGORY_DELIVERY: 'category_delivery',
  CATEGORY_SALUD_BELLEZA: 'category_salud_belleza',
  CATEGORY_ALOJAMIENTO: 'category_alojamiento',
  CATEGORY_DISCOTECAS: 'category_discotecas',
  
  // General topics
  GENERAL_UPDATES: 'general_updates',
  MAINTENANCE: 'maintenance',
  ANNOUNCEMENTS: 'announcements',
};

// Notification scheduling configuration
export const notificationScheduling = {
  // Content reminder timings (in hours before deadline)
  contentReminders: [24, 6],
  
  // Payment reminder timings (in days before expiration)
  paymentReminders: [7, 3, 1],
  
  // Retry configuration for failed notifications
  retryConfig: {
    maxRetries: 3,
    retryDelay: 5000, // 5 seconds
    backoffMultiplier: 2,
  },
  
  // Quiet hours (notifications will be scheduled for later)
  quietHours: {
    start: 22, // 10 PM
    end: 8,    // 8 AM
  },
};

// Notification priority levels
export const notificationPriorities = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
} as const;

export type NotificationPriority = typeof notificationPriorities[keyof typeof notificationPriorities];

// Export validation function for Firebase config
export function validateFirebaseConfig(config: FirebaseConfig): boolean {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  
  for (const field of requiredFields) {
    if (!config[field as keyof FirebaseConfig] || config[field as keyof FirebaseConfig] === `your-${field.toLowerCase()}`) {
      console.error(`Firebase config missing or invalid: ${field}`);
      return false;
    }
  }
  
  return true;
}