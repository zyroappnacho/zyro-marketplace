import { Platform } from 'react-native';

/**
 * Initialize notifications based on platform
 */
export const initializeNotifications = async (): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      // Use web notification service
      const { firebaseNotificationService } = require('./firebaseNotificationService.web');
      await firebaseNotificationService.initialize();
    } else {
      // Try to use native notification service
      try {
        const { initializeNotifications: initNative } = require('./firebaseNotificationService');
        await initNative();
      } catch (error) {
        console.warn('Native notifications not available, using web fallback');
        const { firebaseNotificationService } = require('./firebaseNotificationService.web');
        await firebaseNotificationService.initialize();
      }
    }
  } catch (error) {
    console.error('Notification initialization failed:', error);
    // Don't throw to prevent app crash
  }
};