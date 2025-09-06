import { CollaborationStatus, UserStatus } from '../types';

/**
 * Specific notification types for Zyro Marketplace
 * Based on requirements 15.1-15.5
 */

export interface ZyroNotificationType {
  type: 'collaboration_request' | 'approval_status' | 'campaign_update' | 'payment_reminder' | 'user_status';
  category: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  sound?: string;
  vibration?: number[];
  icon?: string;
}

export const NOTIFICATION_TYPES: Record<string, ZyroNotificationType> = {
  // Collaboration Request Notifications
  COLLABORATION_REQUEST_SUBMITTED: {
    type: 'collaboration_request',
    category: 'collaboration_request',
    priority: 'high',
    sound: 'collaboration_request.wav',
    vibration: [0, 250, 250, 250],
    icon: 'collaboration',
  },
  
  COLLABORATION_REQUEST_APPROVED: {
    type: 'approval_status',
    category: 'approval_status',
    priority: 'high',
    sound: 'success.wav',
    vibration: [0, 500],
    icon: 'check_circle',
  },
  
  COLLABORATION_REQUEST_REJECTED: {
    type: 'approval_status',
    category: 'approval_status',
    priority: 'normal',
    sound: 'notification.wav',
    vibration: [0, 250],
    icon: 'cancel',
  },
  
  // Campaign Update Notifications
  NEW_CAMPAIGN_AVAILABLE: {
    type: 'campaign_update',
    category: 'campaign_update',
    priority: 'normal',
    sound: 'new_opportunity.wav',
    vibration: [0, 250, 100, 250],
    icon: 'campaign',
  },
  
  CAMPAIGN_UPDATED: {
    type: 'campaign_update',
    category: 'campaign_update',
    priority: 'normal',
    sound: 'notification.wav',
    vibration: [0, 250],
    icon: 'update',
  },
  
  CONTENT_REMINDER_24H: {
    type: 'campaign_update',
    category: 'campaign_update',
    priority: 'high',
    sound: 'reminder.wav',
    vibration: [0, 250, 250, 250],
    icon: 'schedule',
  },
  
  CONTENT_REMINDER_6H: {
    type: 'campaign_update',
    category: 'campaign_update',
    priority: 'urgent',
    sound: 'urgent_reminder.wav',
    vibration: [0, 500, 250, 500],
    icon: 'warning',
  },
  
  CONTENT_OVERDUE: {
    type: 'campaign_update',
    category: 'campaign_update',
    priority: 'urgent',
    sound: 'alert.wav',
    vibration: [0, 1000, 500, 1000],
    icon: 'error',
  },
  
  // User Status Notifications
  USER_APPROVED: {
    type: 'user_status',
    category: 'approval_status',
    priority: 'high',
    sound: 'welcome.wav',
    vibration: [0, 500, 250, 500],
    icon: 'verified_user',
  },
  
  USER_REJECTED: {
    type: 'user_status',
    category: 'approval_status',
    priority: 'normal',
    sound: 'notification.wav',
    vibration: [0, 250],
    icon: 'person_off',
  },
  
  USER_SUSPENDED: {
    type: 'user_status',
    category: 'approval_status',
    priority: 'urgent',
    sound: 'alert.wav',
    vibration: [0, 1000],
    icon: 'block',
  },
  
  // Payment Notifications
  PAYMENT_REMINDER: {
    type: 'payment_reminder',
    category: 'payment_reminder',
    priority: 'high',
    sound: 'payment_reminder.wav',
    vibration: [0, 250, 250, 250],
    icon: 'payment',
  },
  
  PAYMENT_FAILED: {
    type: 'payment_reminder',
    category: 'payment_reminder',
    priority: 'urgent',
    sound: 'payment_failed.wav',
    vibration: [0, 500, 250, 500, 250, 500],
    icon: 'payment_failed',
  },
  
  PAYMENT_SUCCESS: {
    type: 'payment_reminder',
    category: 'payment_reminder',
    priority: 'normal',
    sound: 'payment_success.wav',
    vibration: [0, 500],
    icon: 'payment_success',
  },
  
  SUBSCRIPTION_EXPIRING: {
    type: 'payment_reminder',
    category: 'payment_reminder',
    priority: 'high',
    sound: 'subscription_reminder.wav',
    vibration: [0, 250, 250, 250],
    icon: 'schedule',
  },
};

/**
 * Notification templates with Spanish content
 */
export interface NotificationTemplate {
  title: string;
  body: string;
  actionText?: string;
  imageUrl?: string;
}

export const NOTIFICATION_TEMPLATES: Record<string, NotificationTemplate> = {
  // Collaboration Request Templates
  COLLABORATION_REQUEST_SUBMITTED: {
    title: 'Nueva Solicitud de Colaboración',
    body: '{influencerName} ha solicitado colaborar en "{campaignTitle}"',
    actionText: 'Ver Detalles',
  },
  
  COLLABORATION_REQUEST_APPROVED: {
    title: '¡Colaboración Aprobada!',
    body: 'Tu solicitud para "{campaignTitle}" ha sido aprobada. ¡Prepárate para la experiencia!',
    actionText: 'Ver Detalles',
  },
  
  COLLABORATION_REQUEST_REJECTED: {
    title: 'Colaboración Rechazada',
    body: 'Tu solicitud para "{campaignTitle}" ha sido rechazada. {adminNotes}',
    actionText: 'Ver Más',
  },
  
  // Campaign Update Templates
  NEW_CAMPAIGN_AVAILABLE: {
    title: 'Nueva Oportunidad Disponible',
    body: 'Hay una nueva colaboración en {city} que podría interesarte: "{campaignTitle}"',
    actionText: 'Ver Campaña',
  },
  
  CAMPAIGN_UPDATED: {
    title: 'Campaña Actualizada',
    body: 'La campaña "{campaignTitle}" ha sido actualizada con nueva información',
    actionText: 'Ver Cambios',
  },
  
  CONTENT_REMINDER_24H: {
    title: 'Recordatorio de Contenido',
    body: 'Tienes 24 horas para entregar el contenido de "{campaignTitle}"',
    actionText: 'Subir Contenido',
  },
  
  CONTENT_REMINDER_6H: {
    title: '⚠️ Contenido Pendiente',
    body: '¡Solo quedan 6 horas! Recuerda entregar el contenido de "{campaignTitle}"',
    actionText: 'Subir Ahora',
  },
  
  CONTENT_OVERDUE: {
    title: '🚨 Contenido Vencido',
    body: 'El plazo para entregar el contenido de "{campaignTitle}" ha expirado. Contacta con soporte.',
    actionText: 'Contactar Soporte',
  },
  
  // User Status Templates
  USER_APPROVED: {
    title: '¡Bienvenido a Zyro!',
    body: 'Tu cuenta ha sido aprobada. Ya puedes explorar colaboraciones exclusivas.',
    actionText: 'Explorar',
  },
  
  USER_REJECTED: {
    title: 'Solicitud de Registro',
    body: 'Tu solicitud no ha sido aprobada en esta ocasión. {reason}',
    actionText: 'Más Info',
  },
  
  USER_SUSPENDED: {
    title: 'Cuenta Suspendida',
    body: 'Tu cuenta ha sido suspendida temporalmente. Contacta con soporte para más información.',
    actionText: 'Contactar Soporte',
  },
  
  // Payment Templates
  PAYMENT_REMINDER: {
    title: 'Recordatorio de Pago',
    body: 'Tu suscripción de {planName} vence en {daysRemaining} días. Renueva por {amount}€ para seguir accediendo.',
    actionText: 'Renovar',
  },
  
  PAYMENT_FAILED: {
    title: 'Error en el Pago',
    body: 'No pudimos procesar tu pago de {amount}€. Actualiza tu método de pago.',
    actionText: 'Actualizar Pago',
  },
  
  PAYMENT_SUCCESS: {
    title: 'Pago Confirmado',
    body: 'Tu suscripción de {planName} ha sido renovada exitosamente por {amount}€.',
    actionText: 'Ver Factura',
  },
  
  SUBSCRIPTION_EXPIRING: {
    title: 'Suscripción por Vencer',
    body: 'Tu suscripción {planName} expira el {expirationDate}. Renueva para continuar.',
    actionText: 'Renovar Ahora',
  },
};

/**
 * Utility functions for notification templates
 */
export class NotificationTemplateService {
  /**
   * Replace template variables with actual values
   */
  public static formatTemplate(
    templateKey: string,
    variables: Record<string, string | number>
  ): NotificationTemplate {
    const template = NOTIFICATION_TEMPLATES[templateKey];
    
    if (!template) {
      throw new Error(`Notification template not found: ${templateKey}`);
    }

    const formatString = (str: string): string => {
      return str.replace(/\{(\w+)\}/g, (match, key) => {
        return variables[key]?.toString() || match;
      });
    };

    return {
      title: formatString(template.title),
      body: formatString(template.body),
      actionText: template.actionText ? formatString(template.actionText) : undefined,
      imageUrl: template.imageUrl,
    };
  }

  /**
   * Get notification type configuration
   */
  public static getNotificationType(typeKey: string): ZyroNotificationType {
    const notificationType = NOTIFICATION_TYPES[typeKey];
    
    if (!notificationType) {
      throw new Error(`Notification type not found: ${typeKey}`);
    }

    return notificationType;
  }

  /**
   * Create collaboration request notification data
   */
  public static createCollaborationRequestNotification(
    influencerName: string,
    campaignTitle: string,
    collaborationRequestId: string
  ): { template: NotificationTemplate; type: ZyroNotificationType; data: Record<string, any> } {
    const template = this.formatTemplate('COLLABORATION_REQUEST_SUBMITTED', {
      influencerName,
      campaignTitle,
    });

    const type = this.getNotificationType('COLLABORATION_REQUEST_SUBMITTED');

    const data = {
      type: 'collaboration_request',
      collaborationRequestId,
      influencerName,
      campaignTitle,
      action: 'view_request',
    };

    return { template, type, data };
  }

  /**
   * Create collaboration status notification data
   */
  public static createCollaborationStatusNotification(
    status: CollaborationStatus,
    campaignTitle: string,
    adminNotes?: string
  ): { template: NotificationTemplate; type: ZyroNotificationType; data: Record<string, any> } {
    const templateKey = status === 'approved' 
      ? 'COLLABORATION_REQUEST_APPROVED' 
      : 'COLLABORATION_REQUEST_REJECTED';

    const typeKey = status === 'approved'
      ? 'COLLABORATION_REQUEST_APPROVED'
      : 'COLLABORATION_REQUEST_REJECTED';

    const template = this.formatTemplate(templateKey, {
      campaignTitle,
      adminNotes: adminNotes || '',
    });

    const type = this.getNotificationType(typeKey);

    const data = {
      type: 'approval_status',
      status,
      campaignTitle,
      adminNotes,
      action: 'view_collaboration',
    };

    return { template, type, data };
  }

  /**
   * Create user status notification data
   */
  public static createUserStatusNotification(
    userStatus: UserStatus,
    reason?: string
  ): { template: NotificationTemplate; type: ZyroNotificationType; data: Record<string, any> } {
    let templateKey: string;
    let typeKey: string;

    switch (userStatus) {
      case 'approved':
        templateKey = 'USER_APPROVED';
        typeKey = 'USER_APPROVED';
        break;
      case 'rejected':
        templateKey = 'USER_REJECTED';
        typeKey = 'USER_REJECTED';
        break;
      case 'suspended':
        templateKey = 'USER_SUSPENDED';
        typeKey = 'USER_SUSPENDED';
        break;
      default:
        throw new Error(`Unsupported user status: ${userStatus}`);
    }

    const template = this.formatTemplate(templateKey, {
      reason: reason || '',
    });

    const type = this.getNotificationType(typeKey);

    const data = {
      type: 'user_status',
      status: userStatus,
      reason,
      action: 'view_profile',
    };

    return { template, type, data };
  }

  /**
   * Create content reminder notification data
   */
  public static createContentReminderNotification(
    campaignTitle: string,
    hoursRemaining: number
  ): { template: NotificationTemplate; type: ZyroNotificationType; data: Record<string, any> } {
    const templateKey = hoursRemaining <= 6 ? 'CONTENT_REMINDER_6H' : 'CONTENT_REMINDER_24H';
    const typeKey = hoursRemaining <= 6 ? 'CONTENT_REMINDER_6H' : 'CONTENT_REMINDER_24H';

    const template = this.formatTemplate(templateKey, {
      campaignTitle,
      hoursRemaining: hoursRemaining.toString(),
    });

    const type = this.getNotificationType(typeKey);

    const data = {
      type: 'campaign_update',
      campaignTitle,
      hoursRemaining,
      action: 'upload_content',
    };

    return { template, type, data };
  }

  /**
   * Create payment reminder notification data
   */
  public static createPaymentReminderNotification(
    planName: string,
    daysRemaining: number,
    amount: number
  ): { template: NotificationTemplate; type: ZyroNotificationType; data: Record<string, any> } {
    const template = this.formatTemplate('PAYMENT_REMINDER', {
      planName,
      daysRemaining: daysRemaining.toString(),
      amount: amount.toString(),
    });

    const type = this.getNotificationType('PAYMENT_REMINDER');

    const data = {
      type: 'payment_reminder',
      planName,
      daysRemaining,
      amount,
      action: 'renew_subscription',
    };

    return { template, type, data };
  }
}