import React, { useEffect, useRef } from 'react';
import { Platform, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function NotificationManager({ onNotificationReceived }) {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync();

    // Listen for incoming notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    });

    // Listen for notification responses (when user taps notification)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      handleNotificationResponse(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  const registerForPushNotificationsAsync = async () => {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#C9A961',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        Alert.alert(
          'Permisos de Notificación',
          'Para recibir notificaciones sobre colaboraciones, necesitamos permisos de notificación.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })).data;
      
      console.log('Expo push token:', token);
    } else {
      Alert.alert('Dispositivo Físico Requerido', 'Las notificaciones push requieren un dispositivo físico');
    }

    return token;
  };

  const handleNotificationResponse = (response) => {
    const { notification } = response;
    const { data } = notification.request.content;
    
    // Handle different notification types
    if (data?.type === 'collaboration_approved') {
      // Navigate to collaboration details or history
      console.log('Navigate to collaboration approved');
    } else if (data?.type === 'new_collaboration') {
      // Navigate to home screen
      console.log('Navigate to new collaboration');
    } else if (data?.type === 'message') {
      // Navigate to chat
      console.log('Navigate to chat');
    }
  };

  // Schedule a local notification
  const scheduleLocalNotification = async (title, body, data = {}, trigger = null) => {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: 'default',
        },
        trigger: trigger || { seconds: 1 },
      });
      return id;
    } catch (error) {
      console.error('Error scheduling notification:', error);
      return null;
    }
  };

  // Send push notification (for testing)
  const sendTestNotification = async () => {
    await scheduleLocalNotification(
      '¡Nueva Colaboración!',
      'Hay una nueva colaboración disponible en tu ciudad',
      { type: 'new_collaboration' }
    );
  };

  return null; // This component doesn't render anything
}

// Export utility functions
export const NotificationUtils = {
  async scheduleCollaborationReminder(collaborationTitle, date) {
    const trigger = new Date(date);
    trigger.setHours(trigger.getHours() - 2); // 2 hours before

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Recordatorio de Colaboración',
        body: `Tu colaboración "${collaborationTitle}" es en 2 horas`,
        data: { type: 'collaboration_reminder' },
      },
      trigger,
    });
  },

  async scheduleContentReminder(collaborationTitle, deadline) {
    const trigger = new Date(deadline);
    trigger.setHours(trigger.getHours() - 24); // 24 hours before deadline

    return await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Recordatorio de Contenido',
        body: `Recuerda publicar el contenido de "${collaborationTitle}" antes del plazo`,
        data: { type: 'content_reminder' },
      },
      trigger,
    });
  },

  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },

  async cancelNotification(notificationId) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }
};