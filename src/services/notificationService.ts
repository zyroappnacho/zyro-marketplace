import { UserStatusNotification } from '../store/slices/userManagementSlice';
import { UserStatus, CollaborationStatus } from '../types';
import { firebaseNotificationService, NotificationPayload } from './firebaseNotificationService';
import { NotificationTemplateService, NOTIFICATION_TYPES } from './notificationTypes';

// Extended notification types for collaborations
export interface PushNotification {
  type: 'collaboration_request' | 'approval_status' | 'campaign_update' | 'payment_reminder' | 'user_status';
  recipient: string;
  title: string;
  body: string;
  data: Record<string, any>;
  scheduledAt?: Date;
}

export interface CollaborationNotification {
  id: string;
  collaborationRequestId: string;
  type: 'request_submitted' | 'status_changed' | 'content_reminder' | 'content_overdue';
  message: string;
  timestamp: Date;
  read: boolean;
}

// Notification service for handling push notifications and status updates
export class NotificationService {
  private static instance: NotificationService;
  private notificationQueue: UserStatusNotification[] = [];
  private collaborationNotifications: CollaborationNotification[] = [];
  private notificationListeners: ((notification: PushNotification) => void)[] = [];

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Send push notification for user status change
  public async sendUserStatusNotification(
    userId: string,
    newStatus: UserStatus,
    customMessage?: string
  ): Promise<UserStatusNotification> {
    try {
      const notification: UserStatusNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        type: this.getNotificationType(newStatus),
        message: customMessage || this.getDefaultMessage(newStatus),
        timestamp: new Date(),
        read: false,
      };

      // TODO: Integrate with actual push notification service (Firebase, OneSignal, etc.)
      await this.sendPushNotification(notification);
      
      // Add to local queue for tracking
      this.notificationQueue.push(notification);
      
      return notification;
    } catch (error) {
      console.error('Error sending user status notification:', error);
      throw new Error('Failed to send notification');
    }
  }

  // Send email notification for status changes
  public async sendEmailNotification(
    userEmail: string,
    newStatus: UserStatus,
    customMessage?: string
  ): Promise<void> {
    try {
      const emailData = {
        to: userEmail,
        subject: this.getEmailSubject(newStatus),
        body: customMessage || this.getEmailBody(newStatus),
        template: this.getEmailTemplate(newStatus),
      };

      // TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
      await this.sendEmail(emailData);
      
      console.log(`Email notification sent to ${userEmail} for status: ${newStatus}`);
    } catch (error) {
      console.error('Error sending email notification:', error);
      throw new Error('Failed to send email notification');
    }
  }

  // Send notification for influencer waiting period
  public async sendInfluencerWaitingNotification(userId: string, userEmail: string): Promise<UserStatusNotification> {
    const waitingMessage = 'Tu solicitud está siendo revisada por nuestro equipo. Este proceso puede tomar entre 24-48 horas. Te notificaremos por email una vez que tu cuenta sea aprobada.';
    
    const notification: UserStatusNotification = {
      id: `waiting-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type: 'approval',
      message: waitingMessage,
      timestamp: new Date(),
      read: false,
    };

    // Send both push and email notifications
    await Promise.all([
      this.sendPushNotification(notification),
      this.sendEmailNotification(userEmail, 'pending', waitingMessage)
    ]);

    return notification;
  }

  // Get notification type based on status
  private getNotificationType(status: UserStatus): UserStatusNotification['type'] {
    switch (status) {
      case 'approved':
        return 'approval';
      case 'rejected':
        return 'rejection';
      case 'suspended':
        return 'suspension';
      default:
        return 'approval';
    }
  }

  // Get default notification message
  private getDefaultMessage(status: UserStatus): string {
    switch (status) {
      case 'approved':
        return '¡Felicidades! Tu cuenta ha sido aprobada. Ya puedes acceder a todas las funcionalidades de Zyro.';
      case 'rejected':
        return 'Tu solicitud de registro ha sido rechazada. Por favor, contacta con soporte para más información.';
      case 'suspended':
        return 'Tu cuenta ha sido suspendida temporalmente. Contacta con soporte para más detalles.';
      case 'pending':
        return 'Tu solicitud está siendo revisada. Te notificaremos cuando tengamos una respuesta.';
      default:
        return 'El estado de tu cuenta ha sido actualizado.';
    }
  }

  // Get email subject based on status
  private getEmailSubject(status: UserStatus): string {
    switch (status) {
      case 'approved':
        return '¡Bienvenido a Zyro! Tu cuenta ha sido aprobada';
      case 'rejected':
        return 'Actualización sobre tu solicitud de registro en Zyro';
      case 'suspended':
        return 'Importante: Estado de tu cuenta Zyro';
      case 'pending':
        return 'Confirmación de registro en Zyro - En revisión';
      default:
        return 'Actualización de tu cuenta Zyro';
    }
  }

  // Get email body based on status
  private getEmailBody(status: UserStatus): string {
    const baseMessage = 'Estimado usuario,\n\n';
    const signature = '\n\nSaludos,\nEl equipo de Zyro\n\nEste es un mensaje automático, por favor no respondas a este email.';

    switch (status) {
      case 'approved':
        return baseMessage + 
          '¡Excelentes noticias! Tu cuenta de Zyro ha sido aprobada y ya puedes comenzar a explorar colaboraciones exclusivas.\n\n' +
          'Puedes iniciar sesión en la aplicación con tus credenciales y comenzar a solicitar colaboraciones que se ajusten a tu perfil.\n\n' +
          'Recuerda que como parte de nuestra comunidad premium, esperamos contenido de alta calidad y cumplimiento de los compromisos adquiridos.' +
          signature;
      
      case 'rejected':
        return baseMessage +
          'Lamentamos informarte que tu solicitud de registro en Zyro no ha sido aprobada en esta ocasión.\n\n' +
          'Esto puede deberse a varios factores como requisitos de seguidores, calidad del contenido, o información incompleta.\n\n' +
          'Si crees que esto es un error o deseas más información, puedes contactar con nuestro equipo de soporte.' +
          signature;
      
      case 'suspended':
        return baseMessage +
          'Te informamos que tu cuenta de Zyro ha sido suspendida temporalmente.\n\n' +
          'Esta medida puede deberse al incumplimiento de nuestras normas de uso o términos de servicio.\n\n' +
          'Para más información sobre los motivos de la suspensión y cómo proceder, contacta con nuestro equipo de soporte.' +
          signature;
      
      case 'pending':
        return baseMessage +
          'Hemos recibido tu solicitud de registro en Zyro y está siendo revisada por nuestro equipo.\n\n' +
          'Este proceso puede tomar entre 24-48 horas. Te notificaremos por email una vez que tengamos una respuesta.\n\n' +
          'Gracias por tu paciencia y por elegir Zyro.' +
          signature;
      
      default:
        return baseMessage + 'El estado de tu cuenta ha sido actualizado.' + signature;
    }
  }

  // Get email template based on status
  private getEmailTemplate(status: UserStatus): string {
    // Return template name/ID for email service
    switch (status) {
      case 'approved':
        return 'user-approved';
      case 'rejected':
        return 'user-rejected';
      case 'suspended':
        return 'user-suspended';
      case 'pending':
        return 'user-pending';
      default:
        return 'user-status-update';
    }
  }

  // Send push notification using Firebase
  private async sendPushNotification(notification: UserStatusNotification): Promise<void> {
    try {
      // Initialize Firebase service if not already done
      await firebaseNotificationService.initialize();

      // Get user's FCM token (in real app, this would be stored in database)
      const userToken = await this.getUserFCMToken(notification.userId);
      
      if (!userToken) {
        console.warn('No FCM token found for user:', notification.userId);
        return;
      }

      const payload: NotificationPayload = {
        title: 'Actualización de Zyro',
        body: notification.message,
        data: {
          type: notification.type,
          notificationId: notification.id,
          userId: notification.userId,
        },
        sound: 'default',
      };

      await firebaseNotificationService.sendPushNotification(userToken, payload);
      console.log('Push notification sent successfully:', notification.id);
    } catch (error) {
      console.error('Error sending push notification:', error);
      // Fallback to local notification
      await this.sendLocalNotification(notification);
    }
  }

  // Get user's FCM token (mock implementation)
  private async getUserFCMToken(userId: string): Promise<string | null> {
    // TODO: Implement actual token retrieval from database
    // For now, return the current device token
    return await firebaseNotificationService.getFCMToken();
  }

  // Send local notification as fallback
  private async sendLocalNotification(notification: UserStatusNotification): Promise<void> {
    try {
      const payload: NotificationPayload = {
        title: 'Actualización de Zyro',
        body: notification.message,
        data: {
          type: notification.type,
          notificationId: notification.id,
          userId: notification.userId,
        },
      };

      await firebaseNotificationService.scheduleNotification(
        notification.userId,
        payload,
        new Date(),
        notification.type
      );
    } catch (error) {
      console.error('Error sending local notification:', error);
    }
  }

  // Mock email sender (replace with actual service)
  private async sendEmail(emailData: {
    to: string;
    subject: string;
    body: string;
    template: string;
  }): Promise<void> {
    // TODO: Integrate with SendGrid, AWS SES, or similar
    console.log('Sending email:', emailData);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  // Get pending notifications for a user
  public getPendingNotifications(userId: string): UserStatusNotification[] {
    return this.notificationQueue.filter(n => n.userId === userId && !n.read);
  }

  // Mark notification as read
  public markAsRead(notificationId: string): void {
    const notification = this.notificationQueue.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  // Clear all notifications for a user
  public clearUserNotifications(userId: string): void {
    this.notificationQueue = this.notificationQueue.filter(n => n.userId !== userId);
  }

  // === COLLABORATION NOTIFICATION METHODS ===

  // Send general push notification
  public async sendNotification(notification: PushNotification): Promise<void> {
    try {
      // Send push notification
      await this.sendPushNotification({
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId: notification.recipient,
        type: 'approval', // Default type for compatibility
        message: notification.body,
        timestamp: new Date(),
        read: false,
      });

      // Notify listeners
      this.notificationListeners.forEach(listener => {
        try {
          listener(notification);
        } catch (error) {
          console.error('Error in notification listener:', error);
        }
      });

      console.log('Notification sent:', notification);
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  // Send collaboration request notification to admin
  public async sendCollaborationRequestNotification(
    collaborationRequestId: string,
    influencerName: string,
    campaignTitle: string
  ): Promise<void> {
    try {
      const { template, type, data } = NotificationTemplateService.createCollaborationRequestNotification(
        influencerName,
        campaignTitle,
        collaborationRequestId
      );

      const notification: PushNotification = {
        type: 'collaboration_request',
        recipient: 'admin',
        title: template.title,
        body: template.body,
        data,
      };

      await this.sendNotificationWithType(notification, type);
    } catch (error) {
      console.error('Error sending collaboration request notification:', error);
      throw error;
    }
  }

  // Send collaboration status update notification
  public async sendCollaborationStatusNotification(
    recipientId: string,
    status: CollaborationStatus,
    campaignTitle: string,
    adminNotes?: string
  ): Promise<void> {
    try {
      const { template, type, data } = NotificationTemplateService.createCollaborationStatusNotification(
        status,
        campaignTitle,
        adminNotes
      );

      const notification: PushNotification = {
        type: 'approval_status',
        recipient: recipientId,
        title: template.title,
        body: template.body,
        data,
      };

      await this.sendNotificationWithType(notification, type);
    } catch (error) {
      console.error('Error sending collaboration status notification:', error);
      throw error;
    }
  }

  // Send content delivery reminder
  public async sendContentReminderNotification(
    influencerId: string,
    campaignTitle: string,
    hoursRemaining: number
  ): Promise<void> {
    try {
      const { template, type, data } = NotificationTemplateService.createContentReminderNotification(
        campaignTitle,
        hoursRemaining
      );

      const notification: PushNotification = {
        type: 'campaign_update',
        recipient: influencerId,
        title: template.title,
        body: template.body,
        data,
      };

      await this.sendNotificationWithType(notification, type);
    } catch (error) {
      console.error('Error sending content reminder notification:', error);
      throw error;
    }
  }

  // Send content overdue notification
  public async sendContentOverdueNotification(
    influencerId: string,
    campaignTitle: string
  ): Promise<void> {
    try {
      const { template, type } = NotificationTemplateService.formatTemplate('CONTENT_OVERDUE', {
        campaignTitle,
      });

      const notification: PushNotification = {
        type: 'campaign_update',
        recipient: influencerId,
        title: template.title,
        body: template.body,
        data: {
          campaignTitle,
          type: 'content_overdue',
          action: 'contact_support',
        },
      };

      const notificationType = NOTIFICATION_TYPES.CONTENT_OVERDUE;
      await this.sendNotificationWithType(notification, notificationType);
    } catch (error) {
      console.error('Error sending content overdue notification:', error);
      throw error;
    }
  }

  // Add notification listener
  public onNotification(listener: (notification: PushNotification) => void): () => void {
    this.notificationListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.notificationListeners.indexOf(listener);
      if (index > -1) {
        this.notificationListeners.splice(index, 1);
      }
    };
  }

  // Get collaboration status notification title
  private getCollaborationStatusTitle(status: CollaborationStatus): string {
    switch (status) {
      case 'approved':
        return '¡Colaboración Aprobada!';
      case 'rejected':
        return 'Colaboración Rechazada';
      case 'completed':
        return 'Colaboración Completada';
      case 'cancelled':
        return 'Colaboración Cancelada';
      default:
        return 'Actualización de Colaboración';
    }
  }

  // Get collaboration status notification body
  private getCollaborationStatusBody(
    status: CollaborationStatus,
    campaignTitle: string,
    adminNotes?: string
  ): string {
    const baseMessages = {
      approved: `Tu solicitud para "${campaignTitle}" ha sido aprobada. ¡Prepárate para la experiencia!`,
      rejected: `Tu solicitud para "${campaignTitle}" ha sido rechazada.`,
      completed: `Tu colaboración en "${campaignTitle}" ha sido completada. ¡Gracias!`,
      cancelled: `Tu colaboración en "${campaignTitle}" ha sido cancelada.`,
    };

    const baseMessage = baseMessages[status as keyof typeof baseMessages] || 
      `Tu colaboración en "${campaignTitle}" ha sido actualizada.`;
    
    return adminNotes ? `${baseMessage} Nota: ${adminNotes}` : baseMessage;
  }

  // Send notification with specific type configuration
  private async sendNotificationWithType(
    notification: PushNotification,
    notificationType: any
  ): Promise<void> {
    try {
      await firebaseNotificationService.initialize();

      const userToken = await this.getUserFCMToken(notification.recipient);
      
      if (!userToken) {
        console.warn('No FCM token found for user:', notification.recipient);
        return;
      }

      const payload: NotificationPayload = {
        title: notification.title,
        body: notification.body,
        data: notification.data,
        sound: notificationType.sound || 'default',
      };

      await firebaseNotificationService.sendPushNotification(userToken, payload);
      
      // Notify listeners
      this.notificationListeners.forEach(listener => {
        try {
          listener(notification);
        } catch (error) {
          console.error('Error in notification listener:', error);
        }
      });

      console.log('Typed notification sent:', notification.type, notification.title);
    } catch (error) {
      console.error('Error sending typed notification:', error);
      throw error;
    }
  }

  // Send payment reminder notification
  public async sendPaymentReminderNotification(
    companyId: string,
    planName: string,
    daysRemaining: number,
    amount: number
  ): Promise<void> {
    try {
      const { template, type, data } = NotificationTemplateService.createPaymentReminderNotification(
        planName,
        daysRemaining,
        amount
      );

      const notification: PushNotification = {
        type: 'payment_reminder',
        recipient: companyId,
        title: template.title,
        body: template.body,
        data,
      };

      await this.sendNotificationWithType(notification, type);
    } catch (error) {
      console.error('Error sending payment reminder notification:', error);
      throw error;
    }
  }

  // Send new campaign available notification
  public async sendNewCampaignNotification(
    influencerId: string,
    campaignTitle: string,
    city: string
  ): Promise<void> {
    try {
      const template = NotificationTemplateService.formatTemplate('NEW_CAMPAIGN_AVAILABLE', {
        campaignTitle,
        city,
      });

      const notification: PushNotification = {
        type: 'campaign_update',
        recipient: influencerId,
        title: template.title,
        body: template.body,
        data: {
          type: 'new_campaign',
          campaignTitle,
          city,
          action: 'view_campaign',
        },
      };

      const notificationType = NOTIFICATION_TYPES.NEW_CAMPAIGN_AVAILABLE;
      await this.sendNotificationWithType(notification, notificationType);
    } catch (error) {
      console.error('Error sending new campaign notification:', error);
      throw error;
    }
  }

  // Send user status notification with enhanced templates
  public async sendEnhancedUserStatusNotification(
    userId: string,
    userEmail: string,
    newStatus: UserStatus,
    reason?: string
  ): Promise<UserStatusNotification> {
    try {
      const { template, type, data } = NotificationTemplateService.createUserStatusNotification(
        newStatus,
        reason
      );

      const notification: UserStatusNotification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        userId,
        type: this.getNotificationType(newStatus),
        message: template.body,
        timestamp: new Date(),
        read: false,
      };

      // Send push notification with enhanced template
      const pushNotification: PushNotification = {
        type: 'user_status',
        recipient: userId,
        title: template.title,
        body: template.body,
        data,
      };

      await this.sendNotificationWithType(pushNotification, type);
      
      // Send email notification
      await this.sendEmailNotification(userEmail, newStatus, template.body);
      
      // Add to local queue for tracking
      this.notificationQueue.push(notification);
      
      return notification;
    } catch (error) {
      console.error('Error sending enhanced user status notification:', error);
      throw error;
    }
  }

  // Schedule content reminder notifications with Firebase
  public async scheduleContentReminders(
    influencerId: string,
    campaignTitle: string,
    collaborationDate: Date,
    deadlineHours: number
  ): Promise<void> {
    try {
      await firebaseNotificationService.initialize();

      const deadline = new Date(collaborationDate);
      deadline.setHours(deadline.getHours() + deadlineHours);

      // Schedule reminder 24 hours before deadline
      const reminder24h = new Date(deadline);
      reminder24h.setHours(reminder24h.getHours() - 24);
      
      if (reminder24h > new Date()) {
        const { template, type } = NotificationTemplateService.createContentReminderNotification(
          campaignTitle,
          24
        );

        await firebaseNotificationService.scheduleNotification(
          influencerId,
          {
            title: template.title,
            body: template.body,
            data: template.data,
            sound: type.sound,
          },
          reminder24h,
          'content_reminder_24h'
        );
      }

      // Schedule reminder 6 hours before deadline
      const reminder6h = new Date(deadline);
      reminder6h.setHours(reminder6h.getHours() - 6);
      
      if (reminder6h > new Date()) {
        const { template, type } = NotificationTemplateService.createContentReminderNotification(
          campaignTitle,
          6
        );

        await firebaseNotificationService.scheduleNotification(
          influencerId,
          {
            title: template.title,
            body: template.body,
            data: template.data,
            sound: type.sound,
          },
          reminder6h,
          'content_reminder_6h'
        );
      }

      // Schedule overdue notification
      const overdueTemplate = NotificationTemplateService.formatTemplate('CONTENT_OVERDUE', {
        campaignTitle,
      });

      await firebaseNotificationService.scheduleNotification(
        influencerId,
        {
          title: overdueTemplate.title,
          body: overdueTemplate.body,
          data: { campaignTitle, type: 'content_overdue' },
          sound: NOTIFICATION_TYPES.CONTENT_OVERDUE.sound,
        },
        deadline,
        'content_overdue'
      );

      console.log('Content reminders scheduled for:', campaignTitle);
    } catch (error) {
      console.error('Error scheduling content reminders:', error);
      throw error;
    }
  }

  // Initialize notification service
  public async initialize(): Promise<void> {
    try {
      await firebaseNotificationService.initialize();
      console.log('Notification service initialized successfully');
    } catch (error) {
      console.error('Error initializing notification service:', error);
      throw error;
    }
  }

  // Subscribe to notification topics
  public async subscribeToTopics(userId: string, userRole: string, city?: string): Promise<void> {
    try {
      await firebaseNotificationService.initialize();

      // Subscribe to role-based topics
      await firebaseNotificationService.subscribeToTopic(`role_${userRole}`);
      
      // Subscribe to city-based topics for influencers
      if (userRole === 'influencer' && city) {
        await firebaseNotificationService.subscribeToTopic(`city_${city.toLowerCase()}`);
      }

      // Subscribe to general updates
      await firebaseNotificationService.subscribeToTopic('general_updates');

      console.log('Subscribed to notification topics for:', userRole, city);
    } catch (error) {
      console.error('Error subscribing to topics:', error);
      throw error;
    }
  }

  // Unsubscribe from notification topics
  public async unsubscribeFromTopics(userRole: string, city?: string): Promise<void> {
    try {
      await firebaseNotificationService.unsubscribeFromTopic(`role_${userRole}`);
      
      if (userRole === 'influencer' && city) {
        await firebaseNotificationService.unsubscribeFromTopic(`city_${city.toLowerCase()}`);
      }

      await firebaseNotificationService.unsubscribeFromTopic('general_updates');

      console.log('Unsubscribed from notification topics for:', userRole, city);
    } catch (error) {
      console.error('Error unsubscribing from topics:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();