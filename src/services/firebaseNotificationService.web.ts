// Web-compatible version of Firebase Notification Service
import { Platform } from 'react-native';

export interface FCMToken {
  token: string;
  platform: 'ios' | 'android' | 'web';
  userId?: string;
  deviceId?: string;
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  imageUrl?: string;
  sound?: string;
  badge?: number;
}

export interface ScheduledNotification {
  id: string;
  payload: NotificationPayload;
  scheduledAt: Date;
  userId: string;
  type: string;
}

/**
 * Web-compatible Firebase Cloud Messaging service
 */
export class FirebaseNotificationService {
  private static instance: FirebaseNotificationService;
  private fcmToken: string | null = null;
  private isInitialized = false;
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map();
  private notificationListeners: ((notification: any) => void)[] = [];

  private constructor() {}

  public static getInstance(): FirebaseNotificationService {
    if (!FirebaseNotificationService.instance) {
      FirebaseNotificationService.instance = new FirebaseNotificationService();
    }
    return FirebaseNotificationService.instance;
  }

  /**
   * Initialize Firebase Cloud Messaging (Web version)
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('Initializing Firebase Notification Service for web...');
      
      // For web, we'll use browser notifications API
      if (Platform.OS === 'web' && 'Notification' in window) {
        await this.requestWebNotificationPermission();
      }

      this.isInitialized = true;
      console.log('Firebase Notification Service initialized successfully (web)');
    } catch (error) {
      console.error('Error initializing Firebase Notification Service:', error);
      // Don't throw error on web to prevent app crash
    }
  }

  /**
   * Request web notification permission
   */
  private async requestWebNotificationPermission(): Promise<boolean> {
    try {
      if (!('Notification' in window)) {
        console.warn('This browser does not support notifications');
        return false;
      }

      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting web notification permission:', error);
      return false;
    }
  }

  /**
   * Get FCM token (mock for web)
   */
  public async getFCMToken(): Promise<string | null> {
    try {
      if (this.fcmToken) {
        return this.fcmToken;
      }

      // Generate a mock token for web
      this.fcmToken = `web-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('Mock FCM Token generated for web:', this.fcmToken);
      return this.fcmToken;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Send push notification (mock for web)
   */
  public async sendPushNotification(
    userToken: string,
    payload: NotificationPayload
  ): Promise<void> {
    try {
      console.log('Mock push notification sent:', { userToken, payload });
      
      // Show browser notification if supported
      if (Platform.OS === 'web' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(payload.title, {
          body: payload.body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        });
      }
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  /**
   * Send notification to multiple users (mock for web)
   */
  public async sendMulticastNotification(
    userTokens: string[],
    payload: NotificationPayload
  ): Promise<void> {
    try {
      console.log('Mock multicast notification sent:', { userTokens, payload });
      
      // Show browser notification if supported
      if (Platform.OS === 'web' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(payload.title, {
          body: payload.body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        });
      }
    } catch (error) {
      console.error('Error sending multicast notification:', error);
    }
  }

  /**
   * Schedule a notification (mock for web)
   */
  public async scheduleNotification(
    userId: string,
    payload: NotificationPayload,
    scheduledAt: Date,
    type: string
  ): Promise<string> {
    try {
      const notificationId = `scheduled-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const scheduledNotification: ScheduledNotification = {
        id: notificationId,
        payload,
        scheduledAt,
        userId,
        type,
      };

      this.scheduledNotifications.set(notificationId, scheduledNotification);

      console.log('Mock notification scheduled:', notificationId, 'for', scheduledAt);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  /**
   * Cancel a scheduled notification (mock for web)
   */
  public async cancelScheduledNotification(notificationId: string): Promise<void> {
    try {
      this.scheduledNotifications.delete(notificationId);
      console.log('Mock scheduled notification cancelled:', notificationId);
    } catch (error) {
      console.error('Error cancelling scheduled notification:', error);
    }
  }

  /**
   * Get all scheduled notifications for a user
   */
  public getScheduledNotifications(userId: string): ScheduledNotification[] {
    return Array.from(this.scheduledNotifications.values())
      .filter(notification => notification.userId === userId);
  }

  /**
   * Subscribe to topic (mock for web)
   */
  public async subscribeToTopic(topic: string): Promise<void> {
    try {
      console.log('Mock subscribed to topic:', topic);
    } catch (error) {
      console.error('Error subscribing to topic:', error);
    }
  }

  /**
   * Unsubscribe from topic (mock for web)
   */
  public async unsubscribeFromTopic(topic: string): Promise<void> {
    try {
      console.log('Mock unsubscribed from topic:', topic);
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
    }
  }

  /**
   * Add notification listener
   */
  public onNotification(listener: (notification: any) => void): () => void {
    this.notificationListeners.push(listener);
    
    return () => {
      const index = this.notificationListeners.indexOf(listener);
      if (index > -1) {
        this.notificationListeners.splice(index, 1);
      }
    };
  }

  /**
   * Get notification badge count (mock for web)
   */
  public async getBadgeCount(): Promise<number> {
    return 0;
  }

  /**
   * Set notification badge count (mock for web)
   */
  public async setBadgeCount(count: number): Promise<void> {
    console.log('Mock badge count set to:', count);
  }

  /**
   * Clear all notifications (mock for web)
   */
  public async clearAllNotifications(): Promise<void> {
    console.log('Mock all notifications cleared');
  }

  /**
   * Check if notifications are enabled
   */
  public async areNotificationsEnabled(): Promise<boolean> {
    if (Platform.OS === 'web' && 'Notification' in window) {
      return Notification.permission === 'granted';
    }
    return false;
  }
}

// Export singleton instance
export const firebaseNotificationService = FirebaseNotificationService.getInstance();