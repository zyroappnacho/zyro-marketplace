import { NotificationTemplateService, NOTIFICATION_TYPES, NOTIFICATION_TEMPLATES } from '../notificationTypes';

describe('Notification Types and Templates', () => {
  it('should have all required notification types defined', () => {
    expect(NOTIFICATION_TYPES.COLLABORATION_REQUEST_SUBMITTED).toBeDefined();
    expect(NOTIFICATION_TYPES.COLLABORATION_REQUEST_APPROVED).toBeDefined();
    expect(NOTIFICATION_TYPES.USER_APPROVED).toBeDefined();
    expect(NOTIFICATION_TYPES.CONTENT_REMINDER_24H).toBeDefined();
    expect(NOTIFICATION_TYPES.PAYMENT_REMINDER).toBeDefined();
  });

  it('should have all required notification templates defined', () => {
    expect(NOTIFICATION_TEMPLATES.COLLABORATION_REQUEST_SUBMITTED).toBeDefined();
    expect(NOTIFICATION_TEMPLATES.COLLABORATION_REQUEST_APPROVED).toBeDefined();
    expect(NOTIFICATION_TEMPLATES.USER_APPROVED).toBeDefined();
    expect(NOTIFICATION_TEMPLATES.CONTENT_REMINDER_24H).toBeDefined();
    expect(NOTIFICATION_TEMPLATES.PAYMENT_REMINDER).toBeDefined();
  });

  it('should have correct notification type properties', () => {
    const collabType = NOTIFICATION_TYPES.COLLABORATION_REQUEST_SUBMITTED;
    expect(collabType.type).toBe('collaboration_request');
    expect(collabType.priority).toBe('high');
    expect(collabType.category).toBe('collaboration_request');
  });
});

describe('NotificationTemplateService', () => {
  it('should format template with variables', () => {
    const template = NotificationTemplateService.formatTemplate(
      'COLLABORATION_REQUEST_SUBMITTED',
      {
        influencerName: 'Test Influencer',
        campaignTitle: 'Test Campaign',
      }
    );

    expect(template.title).toBe('Nueva Solicitud de Colaboración');
    expect(template.body).toContain('Test Influencer');
    expect(template.body).toContain('Test Campaign');
  });

  it('should create collaboration request notification data', () => {
    const influencerName = 'Test Influencer';
    const campaignTitle = 'Test Campaign';
    const collaborationRequestId = 'collab-123';

    const { template, type, data } = NotificationTemplateService.createCollaborationRequestNotification(
      influencerName,
      campaignTitle,
      collaborationRequestId
    );

    expect(template.title).toBe('Nueva Solicitud de Colaboración');
    expect(template.body).toContain(influencerName);
    expect(template.body).toContain(campaignTitle);
    expect(type.type).toBe('collaboration_request');
    expect(data.collaborationRequestId).toBe(collaborationRequestId);
  });

  it('should create collaboration status notification data', () => {
    const status = 'approved';
    const campaignTitle = 'Test Campaign';
    const adminNotes = 'Great profile!';

    const { template, type, data } = NotificationTemplateService.createCollaborationStatusNotification(
      status,
      campaignTitle,
      adminNotes
    );

    expect(template.title).toBe('¡Colaboración Aprobada!');
    expect(template.body).toContain(campaignTitle);
    expect(type.type).toBe('approval_status');
    expect(data.status).toBe(status);
    expect(data.adminNotes).toBe(adminNotes);
  });

  it('should create user status notification data', () => {
    const userStatus = 'approved';
    const reason = 'Profile meets requirements';

    const { template, type, data } = NotificationTemplateService.createUserStatusNotification(
      userStatus,
      reason
    );

    expect(template.title).toBe('¡Bienvenido a Zyro!');
    expect(template.body).toContain('aprobada');
    expect(type.type).toBe('user_status');
    expect(data.status).toBe(userStatus);
    expect(data.reason).toBe(reason);
  });

  it('should create content reminder notification data', () => {
    const campaignTitle = 'Test Campaign';
    const hoursRemaining = 6;

    const { template, type, data } = NotificationTemplateService.createContentReminderNotification(
      campaignTitle,
      hoursRemaining
    );

    expect(template.title).toBe('⚠️ Contenido Pendiente');
    expect(template.body).toContain('6 horas');
    expect(template.body).toContain(campaignTitle);
    expect(type.type).toBe('campaign_update');
    expect(data.hoursRemaining).toBe(hoursRemaining);
  });

  it('should create payment reminder notification data', () => {
    const planName = 'Plan 6 meses';
    const daysRemaining = 3;
    const amount = 399;

    const { template, type, data } = NotificationTemplateService.createPaymentReminderNotification(
      planName,
      daysRemaining,
      amount
    );

    expect(template.title).toBe('Recordatorio de Pago');
    expect(template.body).toContain(planName);
    expect(template.body).toContain('3 días');
    expect(template.body).toContain('399');
    expect(type.type).toBe('payment_reminder');
    expect(data.daysRemaining).toBe(daysRemaining);
    expect(data.amount).toBe(amount);
  });

  it('should throw error for unknown template', () => {
    expect(() => {
      NotificationTemplateService.formatTemplate('UNKNOWN_TEMPLATE', {});
    }).toThrow('Notification template not found: UNKNOWN_TEMPLATE');
  });

  it('should throw error for unknown notification type', () => {
    expect(() => {
      NotificationTemplateService.getNotificationType('UNKNOWN_TYPE');
    }).toThrow('Notification type not found: UNKNOWN_TYPE');
  });
});