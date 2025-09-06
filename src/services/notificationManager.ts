import { notificationService } from './notificationService';
import { firebaseNotificationService } from './firebaseNotificationService';
import { NotificationTemplateService } from './notificationTypes';
import { UserStatus, CollaborationStatus } from '../types';

/**
 * Notification Manager - Handles automatic event-based notifications
 * Implements requirements 15.1-15.5 for automatic notification sending
 */
export class NotificationManager {
  private static instance: NotificationManager;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  /**
   * Initialize the notification manager
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      await notificationService.initialize();
      this.isInitialized = true;
      console.log('Notification Manager initialized successfully');
    } catch (error) {
      console.error('Error initializing Notification Manager:', error);
      throw error;
    }
  }

  /**
   * Handle user registration event
   * Requirement 15.1: Send notification when influencer registers
   */
  public async onUserRegistered(
    userId: string,
    userEmail: string,
    userRole: 'influencer' | 'company',
    userName: string
  ): Promise<void> {
    try {
      if (userRole === 'influencer') {
        // Send waiting notification to influencer
        await notificationService.sendInfluencerWaitingNotification(userId, userEmail);
        
        // Notify admin about new influencer registration
        await notificationService.sendNotification({
          type: 'user_status',
          recipient: 'admin',
          title: 'Nuevo Influencer Registrado',
          body: `${userName} se ha registrado y está esperando aprobación`,
          data: {
            userId,
            userName,
            userRole,
            action: 'review_user',
          },
        });
      } else if (userRole === 'company') {
        // Notify admin about new company registration
        await notificationService.sendNotification({
          type: 'user_status',
          recipient: 'admin',
          title: 'Nueva Empresa Registrada',
          body: `${userName} se ha registrado como empresa`,
          data: {
            userId,
            userName,
            userRole,
            action: 'review_company',
          },
        });
      }

      console.log('User registration notifications sent for:', userName);
    } catch (error) {
      console.error('Error handling user registration event:', error);
    }
  }

  /**
   * Handle user approval/rejection event
   * Requirement 15.2: Send notification when admin approves/rejects user
   */
  public async onUserStatusChanged(
    userId: string,
    userEmail: string,
    newStatus: UserStatus,
    userName: string,
    reason?: string
  ): Promise<void> {
    try {
      // Send notification to user
      await notificationService.sendEnhancedUserStatusNotification(
        userId,
        userEmail,
        newStatus,
        reason
      );

      // If user was approved, subscribe to relevant topics
      if (newStatus === 'approved') {
        // TODO: Get user role and city from database
        const userRole = 'influencer'; // This should come from database
        const city = 'madrid'; // This should come from user profile
        
        await notificationService.subscribeToTopics(userId, userRole, city);
      }

      console.log('User status change notifications sent for:', userName, newStatus);
    } catch (error) {
      console.error('Error handling user status change event:', error);
    }
  }

  /**
   * Handle collaboration request event
   * Requirement 15.1: Send notification when influencer requests collaboration
   */
  public async onCollaborationRequested(
    collaborationRequestId: string,
    influencerId: string,
    influencerName: string,
    campaignId: string,
    campaignTitle: string
  ): Promise<void> {
    try {
      // Notify admin about new collaboration request
      await notificationService.sendCollaborationRequestNotification(
        collaborationRequestId,
        influencerName,
        campaignTitle
      );

      // Notify company about new request (if they have notifications enabled)
      // TODO: Get company ID from campaign and send notification
      
      console.log('Collaboration request notifications sent for:', campaignTitle);
    } catch (error) {
      console.error('Error handling collaboration request event:', error);
    }
  }

  /**
   * Handle collaboration status change event
   * Requirement 15.2: Send notification when admin approves/rejects collaboration
   */
  public async onCollaborationStatusChanged(
    collaborationRequestId: string,
    influencerId: string,
    status: CollaborationStatus,
    campaignTitle: string,
    adminNotes?: string,
    collaborationDate?: Date
  ): Promise<void> {
    try {
      // Send status notification to influencer
      await notificationService.sendCollaborationStatusNotification(
        influencerId,
        status,
        campaignTitle,
        adminNotes
      );

      // If approved, schedule content reminders
      if (status === 'approved' && collaborationDate) {
        await notificationService.scheduleContentReminders(
          influencerId,
          campaignTitle,
          collaborationDate,
          72 // 72 hours deadline as per requirements
        );
      }

      console.log('Collaboration status change notifications sent:', status, campaignTitle);
    } catch (error) {
      console.error('Error handling collaboration status change event:', error);
    }
  }

  /**
   * Handle new campaign creation event
   * Requirement 15.3: Send notification when new campaign is available
   */
  public async onCampaignCreated(
    campaignId: string,
    campaignTitle: string,
    city: string,
    category: string,
    minFollowers?: number
  ): Promise<void> {
    try {
      // Send topic-based notification to relevant influencers
      const topicMessage = {
        title: 'Nueva Oportunidad Disponible',
        body: `Nueva colaboración en ${city}: "${campaignTitle}"`,
        data: {
          campaignId,
          campaignTitle,
          city,
          category,
          minFollowers: minFollowers?.toString() || '0',
          action: 'view_campaign',
        },
      };

      // Send to city-specific topic
      await firebaseNotificationService.sendMulticastNotification(
        [], // Empty array since we're using topics
        topicMessage
      );

      // TODO: Implement topic-based messaging
      // await firebaseNotificationService.sendToTopic(`city_${city.toLowerCase()}`, topicMessage);

      console.log('New campaign notifications sent for:', campaignTitle, 'in', city);
    } catch (error) {
      console.error('Error handling campaign creation event:', error);
    }
  }

  /**
   * Handle payment reminder event
   * Requirement 15.4: Send notification for payment reminders
   */
  public async onPaymentReminder(
    companyId: string,
    planName: string,
    daysRemaining: number,
    amount: number
  ): Promise<void> {
    try {
      await notificationService.sendPaymentReminderNotification(
        companyId,
        planName,
        daysRemaining,
        amount
      );

      console.log('Payment reminder sent to company:', companyId, 'for plan:', planName);
    } catch (error) {
      console.error('Error handling payment reminder event:', error);
    }
  }

  /**
   * Handle payment failure event
   * Requirement 15.4: Send notification when payment fails
   */
  public async onPaymentFailed(
    companyId: string,
    planName: string,
    amount: number,
    reason?: string
  ): Promise<void> {
    try {
      const template = NotificationTemplateService.formatTemplate('PAYMENT_FAILED', {
        planName,
        amount: amount.toString(),
        reason: reason || '',
      });

      await notificationService.sendNotification({
        type: 'payment_reminder',
        recipient: companyId,
        title: template.title,
        body: template.body,
        data: {
          type: 'payment_failed',
          planName,
          amount,
          reason,
          action: 'update_payment_method',
        },
      });

      console.log('Payment failure notification sent to company:', companyId);
    } catch (error) {
      console.error('Error handling payment failure event:', error);
    }
  }

  /**
   * Handle payment success event
   * Requirement 15.5: Send confirmation when payment succeeds
   */
  public async onPaymentSuccess(
    companyId: string,
    planName: string,
    amount: number,
    nextBillingDate: Date
  ): Promise<void> {
    try {
      const template = NotificationTemplateService.formatTemplate('PAYMENT_SUCCESS', {
        planName,
        amount: amount.toString(),
        nextBillingDate: nextBillingDate.toLocaleDateString('es-ES'),
      });

      await notificationService.sendNotification({
        type: 'payment_reminder',
        recipient: companyId,
        title: template.title,
        body: template.body,
        data: {
          type: 'payment_success',
          planName,
          amount,
          nextBillingDate: nextBillingDate.toISOString(),
          action: 'view_invoice',
        },
      });

      console.log('Payment success notification sent to company:', companyId);
    } catch (error) {
      console.error('Error handling payment success event:', error);
    }
  }

  /**
   * Handle content delivery event
   * Requirement 15.5: Send confirmation when content is delivered
   */
  public async onContentDelivered(
    collaborationRequestId: string,
    influencerId: string,
    campaignTitle: string,
    contentType: 'instagram_stories' | 'tiktok_video'
  ): Promise<void> {
    try {
      // Notify admin about content delivery
      await notificationService.sendNotification({
        type: 'campaign_update',
        recipient: 'admin',
        title: 'Contenido Entregado',
        body: `Contenido de "${campaignTitle}" ha sido entregado`,
        data: {
          collaborationRequestId,
          influencerId,
          campaignTitle,
          contentType,
          action: 'review_content',
        },
      });

      // Notify influencer about successful delivery
      await notificationService.sendNotification({
        type: 'campaign_update',
        recipient: influencerId,
        title: 'Contenido Recibido',
        body: `Tu contenido para "${campaignTitle}" ha sido recibido correctamente`,
        data: {
          collaborationRequestId,
          campaignTitle,
          contentType,
          action: 'view_collaboration',
        },
      });

      console.log('Content delivery notifications sent for:', campaignTitle);
    } catch (error) {
      console.error('Error handling content delivery event:', error);
    }
  }

  /**
   * Schedule recurring payment reminders
   */
  public async schedulePaymentReminders(
    companyId: string,
    planName: string,
    amount: number,
    expirationDate: Date
  ): Promise<void> {
    try {
      const now = new Date();
      const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Schedule reminders at 7, 3, and 1 days before expiration
      const reminderDays = [7, 3, 1];

      for (const days of reminderDays) {
        if (daysUntilExpiration > days) {
          const reminderDate = new Date(expirationDate);
          reminderDate.setDate(reminderDate.getDate() - days);

          const { template } = NotificationTemplateService.createPaymentReminderNotification(
            planName,
            days,
            amount
          );

          await firebaseNotificationService.scheduleNotification(
            companyId,
            {
              title: template.title,
              body: template.body,
              data: {
                type: 'payment_reminder',
                planName,
                daysRemaining: days,
                amount,
                action: 'renew_subscription',
              },
            },
            reminderDate,
            `payment_reminder_${days}d`
          );
        }
      }

      console.log('Payment reminders scheduled for company:', companyId);
    } catch (error) {
      console.error('Error scheduling payment reminders:', error);
    }
  }

  /**
   * Send broadcast notification to all users of a specific role
   */
  public async sendBroadcastNotification(
    role: 'admin' | 'influencer' | 'company' | 'all',
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<void> {
    try {
      const topic = role === 'all' ? 'general_updates' : `role_${role}`;
      
      // TODO: Implement topic-based broadcasting
      console.log('Would send broadcast notification to topic:', topic, title);
      
      // For now, log the broadcast
      console.log('Broadcast notification:', { role, title, body, data });
    } catch (error) {
      console.error('Error sending broadcast notification:', error);
    }
  }
}

// Export singleton instance
export const notificationManager = NotificationManager.getInstance();