import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { PushNotification } from './notificationService';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

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
 * Firebase Cloud Messaging service for handling push notifications
 * Integrates with Expo Notifications for local notifications
 */
export class FirebaseNotificationService {
  private static instance: FirebaseNotificationService;
  private fcmToken: string | null = null;
  private isInitialized = false;
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map();
  private notificationListeners: ((notification: FirebaseMessagingTypes.RemoteMessage) => void)[] = [];

  private constructor() {}

  public static getInstance(): FirebaseNotificationService {
    if (!FirebaseNotificationService.instance) {
      FirebaseNotificationService.instance = new FirebaseNotificationService();
    }
    return FirebaseNotificationService.instance;
  }

  /**
   * Initialize Firebase Cloud Messaging
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Request permission for notifications
      await this.requestPermissions();

      // Get FCM token
      await this.getFCMToken();

      // Set up message handlers
      this.setupMessageHandlers();

      // Set up notification categories
      await this.setupNotificationCategories();

      this.isInitialized = true;
      console.log('Firebase Notification Service initialized successfully');
    } catch (error) {
      console.error('Error initializing Firebase Notification Service:', error);
      throw error;
    }
  }

  /**
   * Request notification permissions
   */
  private async requestPermissions(): Promise<boolean> {
    try {
      // Request Firebase messaging permission
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        console.warn('Firebase messaging permission not granted');
        return false;
      }

      // Request Expo notifications permission
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Expo notifications permission not granted');
        return false;
      }

      console.log('Notification permissions granted');
      return true;
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Get FCM token for this device
   */
  public async getFCMToken(): Promise<string | null> {
    try {
      if (this.fcmToken) {
        return this.fcmToken;
      }

      const token = await messaging().getToken();
      this.fcmToken = token;
      
      console.log('FCM Token obtained:', token);
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Setup message handlers for foreground and background messages
   */
  private setupMessageHandlers(): void {
    // Handle messages when app is in foreground
    messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground message received:', remoteMessage);
      
      // Show local notification when app is in foreground
      await this.showLocalNotification(remoteMessage);
      
      // Notify listeners
      this.notificationListeners.forEach(listener => {
        try {
          listener(remoteMessage);
        } catch (error) {
          console.error('Error in notification listener:', error);
        }
      });
    });

    // Handle messages when app is opened from background state
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Notification opened app from background:', remoteMessage);
      this.handleNotificationOpen(remoteMessage);
    });

    // Handle messages when app is opened from quit state
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('Notification opened app from quit state:', remoteMessage);
          this.handleNotificationOpen(remoteMessage);
        }
      });

    // Handle token refresh
    messaging().onTokenRefresh((token) => {
      console.log('FCM token refreshed:', token);
      this.fcmToken = token;
      // TODO: Send updated token to server
    });
  }

  /**
   * Setup notification categories for different types
   */
  private async setupNotificationCategories(): Promise<void> {
    try {
      await Notifications.setNotificationCategoryAsync('collaboration_request', [
        {
          identifier: 'view',
          buttonTitle: 'Ver Detalles',
          options: { opensAppToForeground: true },
        },
        {
          identifier: 'dismiss',
          buttonTitle: 'Descartar',
          options: { opensAppToForeground: false },
        },
      ]);

      await Notifications.setNotificationCategoryAsync('approval_status', [
        {
          identifier: 'open_app',
          buttonTitle: 'Abrir App',
          options: { opensAppToForeground: true },
        },
      ]);

      await Notifications.setNotificationCategoryAsync('campaign_update', [
        {
          identifier: 'view_campaign',
          buttonTitle: 'Ver Campaña',
          options: { opensAppToForeground: true },
        },
      ]);

      await Notifications.setNotificationCategoryAsync('payment_reminder', [
        {
          identifier: 'pay_now',
          buttonTitle: 'Pagar Ahora',
          options: { opensAppToForeground: true },
        },
        {
          identifier: 'remind_later',
          buttonTitle: 'Recordar Después',
          options: { opensAppToForeground: false },
        },
      ]);

      console.log('Notification categories set up successfully');
    } catch (error) {
      console.error('Error setting up notification categories:', error);
    }
  }

  /**
   * Show local notification
   */
  private async showLocalNotification(remoteMessage: FirebaseMessagingTypes.RemoteMessage): Promise<void> {
    try {
      const { notification, data } = remoteMessage;
      
      if (!notification) {
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title || 'Zyro',
          body: notification.body || '',
          data: data || {},
          sound: 'default',
          categoryIdentifier: data?.type || 'default',
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Error showing local notification:', error);
    }
  }

  /**
   * Handle notification open/tap
   */
  private handleNotificationOpen(remoteMessage: FirebaseMessagingTypes.RemoteMessage): void {
    const { data } = remoteMessage;
    
    if (!data) {
      return;
    }

    // Handle different notification types
    switch (data.type) {
      case 'collaboration_request':
        // Navigate to admin panel or collaboration details
        console.log('Opening collaboration request:', data.collaborationRequestId);
        break;
      
      case 'approval_status':
        // Navigate to appropriate screen based on status
        console.log('Opening approval status:', data.status);
        break;
      
      case 'campaign_update':
        // Navigate to campaign details
        console.log('Opening campaign update:', data.campaignId);
        break;
      
      case 'payment_reminder':
        // Navigate to payment screen
        console.log('Opening payment reminder:', data.subscriptionId);
        break;
      
      default:
        console.log('Opening default notification:', data);
    }
  }

  /**
   * Send push notification to specific user
   */
  public async sendPushNotification(
    userToken: string,
    payload: NotificationPayload
  ): Promise<void> {
    try {
      // In a real implementation, this would call your backend API
      // which would then send the notification via Firebase Admin SDK
      
      const message = {
        token: userToken,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl,
        },
        data: payload.data || {},
        android: {
          notification: {
            sound: payload.sound || 'default',
            channelId: 'zyro_notifications',
            priority: 'high' as const,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: payload.sound || 'default',
              badge: payload.badge,
              'content-available': 1,
            },
          },
        },
      };

      console.log('Would send push notification:', message);
      
      // TODO: Replace with actual API call to your backend
      // await this.callBackendAPI('/api/notifications/send', message);
      
    } catch (error) {
      console.error('Error sending push notification:', error);
      throw error;
    }
  }

  /**
   * Send notification to multiple users
   */
  public async sendMulticastNotification(
    userTokens: string[],
    payload: NotificationPayload
  ): Promise<void> {
    try {
      const message = {
        tokens: userTokens,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl,
        },
        data: payload.data || {},
      };

      console.log('Would send multicast notification:', message);
      
      // TODO: Replace with actual API call to your backend
      // await this.callBackendAPI('/api/notifications/multicast', message);
      
    } catch (error) {
      console.error('Error sending multicast notification:', error);
      throw error;
    }
  }

  /**
   * Schedule a notification for later delivery
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

      // Store scheduled notification
      this.scheduledNotifications.set(notificationId, scheduledNotification);

      // Schedule with Expo Notifications
      await Notifications.scheduleNotificationAsync({
        content: {
          title: payload.title,
          body: payload.body,
          data: payload.data || {},
          sound: payload.sound || 'default',
          categoryIdentifier: type,
        },
        trigger: {
          date: scheduledAt,
        },
        identifier: notificationId,
      });

      console.log('Notification scheduled:', notificationId, 'for', scheduledAt);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      throw error;
    }
  }

  /**
   * Cancel a scheduled notification
   */
  public async cancelScheduledNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      this.scheduledNotifications.delete(notificationId);
      console.log('Scheduled notification cancelled:', notificationId);
    } catch (error) {
      console.error('Error cancelling scheduled notification:', error);
      throw error;
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
   * Subscribe to topic for broadcast notifications
   */
  public async subscribeToTopic(topic: string): Promise<void> {
    try {
      await messaging().subscribeToTopic(topic);
      console.log('Subscribed to topic:', topic);
    } catch (error) {
      console.error('Error subscribing to topic:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from topic
   */
  public async unsubscribeFromTopic(topic: string): Promise<void> {
    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log('Unsubscribed from topic:', topic);
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
      throw error;
    }
  }

  /**
   * Add notification listener
   */
  public onNotification(listener: (notification: FirebaseMessagingTypes.RemoteMessage) => void): () => void {
    this.notificationListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.notificationListeners.indexOf(listener);
      if (index > -1) {
        this.notificationListeners.splice(index, 1);
      }
    };
  }

  /**
   * Get notification badge count
   */
  public async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }

  /**
   * Set notification badge count
   */
  public async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  /**
   * Clear all notifications
   */
  public async clearAllNotifications(): Promise<void> {
    try {
      await Notifications.dismissAllNotificationsAsync();
      await this.setBadgeCount(0);
      console.log('All notifications cleared');
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  /**
   * Check if notifications are enabled
   */
  public async areNotificationsEnabled(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return false;
    }
  }
}

// Export singleton instance
export const firebaseNotificationService = FirebaseNotificationService.getInstance();