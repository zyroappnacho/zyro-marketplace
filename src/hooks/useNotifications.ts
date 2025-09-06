import { useEffect, useState, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { notificationService } from '../services/notificationService';
import { firebaseNotificationService } from '../services/firebaseNotificationService';
import { notificationManager } from '../services/notificationManager';
import { PushNotification } from '../services/notificationService';

export interface NotificationState {
  isInitialized: boolean;
  fcmToken: string | null;
  badgeCount: number;
  lastNotification: PushNotification | null;
  permissionsGranted: boolean;
}

export interface UseNotificationsReturn {
  state: NotificationState;
  initialize: () => Promise<void>;
  requestPermissions: () => Promise<boolean>;
  clearBadge: () => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  subscribeToTopics: (userId: string, userRole: string, city?: string) => Promise<void>;
  unsubscribeFromTopics: (userRole: string, city?: string) => Promise<void>;
  onNotificationReceived: (callback: (notification: PushNotification) => void) => () => void;
}

/**
 * Custom hook for managing push notifications in the Zyro app
 * Handles initialization, permissions, and notification events
 */
export function useNotifications(): UseNotificationsReturn {
  const [state, setState] = useState<NotificationState>({
    isInitialized: false,
    fcmToken: null,
    badgeCount: 0,
    lastNotification: null,
    permissionsGranted: false,
  });

  /**
   * Initialize notification services
   */
  const initialize = useCallback(async (): Promise<void> => {
    try {
      // Initialize notification manager
      await notificationManager.initialize();
      
      // Get FCM token
      const token = await firebaseNotificationService.getFCMToken();
      
      // Check permissions
      const permissionsGranted = await firebaseNotificationService.areNotificationsEnabled();
      
      // Get current badge count
      const badgeCount = await firebaseNotificationService.getBadgeCount();

      setState(prev => ({
        ...prev,
        isInitialized: true,
        fcmToken: token,
        permissionsGranted,
        badgeCount,
      }));

      console.log('Notifications initialized successfully');
    } catch (error) {
      console.error('Error initializing notifications:', error);
      setState(prev => ({
        ...prev,
        isInitialized: false,
      }));
    }
  }, []);

  /**
   * Request notification permissions
   */
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      // This is handled internally by firebaseNotificationService.initialize()
      await firebaseNotificationService.initialize();
      
      const permissionsGranted = await firebaseNotificationService.areNotificationsEnabled();
      
      setState(prev => ({
        ...prev,
        permissionsGranted,
      }));

      return permissionsGranted;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }, []);

  /**
   * Clear notification badge
   */
  const clearBadge = useCallback(async (): Promise<void> => {
    try {
      await firebaseNotificationService.setBadgeCount(0);
      setState(prev => ({
        ...prev,
        badgeCount: 0,
      }));
    } catch (error) {
      console.error('Error clearing badge:', error);
    }
  }, []);

  /**
   * Clear all notifications
   */
  const clearAllNotifications = useCallback(async (): Promise<void> => {
    try {
      await firebaseNotificationService.clearAllNotifications();
      setState(prev => ({
        ...prev,
        badgeCount: 0,
      }));
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  }, []);

  /**
   * Subscribe to notification topics
   */
  const subscribeToTopics = useCallback(async (
    userId: string,
    userRole: string,
    city?: string
  ): Promise<void> => {
    try {
      await notificationService.subscribeToTopics(userId, userRole, city);
    } catch (error) {
      console.error('Error subscribing to topics:', error);
    }
  }, []);

  /**
   * Unsubscribe from notification topics
   */
  const unsubscribeFromTopics = useCallback(async (
    userRole: string,
    city?: string
  ): Promise<void> => {
    try {
      await notificationService.unsubscribeFromTopics(userRole, city);
    } catch (error) {
      console.error('Error unsubscribing from topics:', error);
    }
  }, []);

  /**
   * Add notification listener
   */
  const onNotificationReceived = useCallback((
    callback: (notification: PushNotification) => void
  ): (() => void) => {
    return notificationService.onNotification(callback);
  }, []);

  /**
   * Handle app state changes
   */
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App became active, update badge count
        try {
          const badgeCount = await firebaseNotificationService.getBadgeCount();
          setState(prev => ({
            ...prev,
            badgeCount,
          }));
        } catch (error) {
          console.error('Error updating badge count:', error);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, []);

  /**
   * Set up notification listeners
   */
  useEffect(() => {
    if (!state.isInitialized) {
      return;
    }

    // Listen for incoming notifications
    const unsubscribe = firebaseNotificationService.onNotification((remoteMessage) => {
      console.log('Notification received in hook:', remoteMessage);
      
      // Update state with last notification
      setState(prev => ({
        ...prev,
        lastNotification: {
          type: remoteMessage.data?.type as any || 'campaign_update',
          recipient: 'current_user', // This should be the current user ID
          title: remoteMessage.notification?.title || 'Zyro',
          body: remoteMessage.notification?.body || '',
          data: remoteMessage.data || {},
        },
        badgeCount: prev.badgeCount + 1,
      }));
    });

    return unsubscribe;
  }, [state.isInitialized]);

  /**
   * Auto-initialize on mount
   */
  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    state,
    initialize,
    requestPermissions,
    clearBadge,
    clearAllNotifications,
    subscribeToTopics,
    unsubscribeFromTopics,
    onNotificationReceived,
  };
}

/**
 * Hook for handling notification actions and navigation
 */
export function useNotificationActions() {
  const handleNotificationAction = useCallback((notification: PushNotification) => {
    const { type, data } = notification;

    switch (type) {
      case 'collaboration_request':
        // Navigate to admin panel or collaboration details
        console.log('Navigate to collaboration request:', data.collaborationRequestId);
        break;

      case 'approval_status':
        // Navigate to appropriate screen based on status
        if (data.status === 'approved') {
          console.log('Navigate to home screen - user approved');
        } else {
          console.log('Navigate to status screen - user rejected/suspended');
        }
        break;

      case 'campaign_update':
        // Navigate to campaign details or content upload
        if (data.action === 'upload_content') {
          console.log('Navigate to content upload screen');
        } else {
          console.log('Navigate to campaign details:', data.campaignId);
        }
        break;

      case 'payment_reminder':
        // Navigate to payment screen
        console.log('Navigate to payment screen:', data.subscriptionId);
        break;

      default:
        console.log('Handle default notification action:', notification);
    }
  }, []);

  return {
    handleNotificationAction,
  };
}

/**
 * Hook for notification preferences and settings
 */
export function useNotificationSettings() {
  const [settings, setSettings] = useState({
    collaborationRequests: true,
    approvalUpdates: true,
    campaignUpdates: true,
    paymentReminders: true,
    contentReminders: true,
    quietHours: {
      enabled: false,
      start: 22, // 10 PM
      end: 8,    // 8 AM
    },
  });

  const updateSetting = useCallback((key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const updateQuietHours = useCallback((enabled: boolean, start?: number, end?: number) => {
    setSettings(prev => ({
      ...prev,
      quietHours: {
        enabled,
        start: start ?? prev.quietHours.start,
        end: end ?? prev.quietHours.end,
      },
    }));
  }, []);

  return {
    settings,
    updateSetting,
    updateQuietHours,
  };
}