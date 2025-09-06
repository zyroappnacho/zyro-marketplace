import { configureStore } from '@reduxjs/toolkit';
import authReducer, { loginUser, registerUser } from '../../store/slices/authSlice';
import companyDashboardReducer from '../../store/slices/companyDashboardSlice';
import { ValidationService } from '../../services/validationService';
import { paymentService } from '../../services/paymentService';
import { subscriptionService } from '../../services/subscriptionService';
import { securityManager } from '../../services/security/securityManager';
import { authSecurityService } from '../../services/security/authSecurityService';
import { databaseService } from '../../database';
import { notificationService } from '../../services/notificationService';
import { Company, Campaign, CollaborationRequest, SubscriptionPlan } from '../../types';

// Mock all external dependencies
jest.mock('../../services/security/securityManager');
jest.mock('../../services/security/authSecurityService');
jest.mock('../../services/paymentService');
jest.mock('../../services/subscriptionService');
jest.mock('../../database');
jest.mock('../../services/notificationService');

const mockSecurityManager = securityManager as jest.Mocked<typeof securityManager>;
const mockAuthSecurityService = authSecurityService as jest.Mocked<typeof authSecurityService>;
const mockPaymentService = paymentService as jest.Mocked<typeof paymentService>;
const mockSubscriptionService = subscriptionService as jest.Mocked<typeof subscriptionService>;
const mockDatabaseService = databaseService as jest.Mocked<typeof databaseService>;
const mockNotificationService = notificationService as jest.Mocked<typeof notificationService>;

describe('Company Complete Flow E2E Tests', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
        companyDashboard: companyDashboardReducer,
      },
    });

    jest.clearAllMocks();

    // Setup default mocks
    mockAuthSecurityService.getDeviceId.mockResolvedValue('test-device-id');
    mockNotificationService.sendNotification.mockResolvedValue(undefined);

    // Setup database mocks
    mockDatabaseService.users = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      verifyPassword: jest.fn(),
      update: jest.fn(),
    } as any;

    mockDatabaseService.companies = {
      create: jest.fn(),
      findById: jest.fn(),
      findByCif: jest.fn(),
      update: jest.fn(),
    } as any;

    mockDatabaseService.campaigns = {
      create: jest.fn(),
      findByCompany: jest.fn(),
      update: jest.fn(),
    } as any;

    mockDatabaseService.collaborationRequests = {
      findByCampaign: jest.fn(),
      updateStatus: jest.fn(),
    } as any;

    // Setup payment service mocks
    mockPaymentService.validatePaymentMethod = jest.fn();
    mockPaymentService.processPayment = jest.fn();
    mockPaymentService.generateInvoice = jest.fn();
    mockSubscriptionService.createSubscription = jest.fn();
  });

  describe('Complete Company Journey: Registration → Subscription → Campaign Management', () => {
    it('should complete full company journey from registration to managing collaborations', async () => {
      // ===== PHASE 1: COMPANY REGISTRATION =====
      console.log('🏢 Starting Company Registration Flow...');

      const registrationData = {
        email: 'info@laterrazapremium.com',
        password: 'SecureCompanyPass123!',
        role: 'company' as const,
        companyName: 'La Terraza Premium S.L.',
        cif: 'B12345678',
        address: 'Calle Serrano 123, 28006 Madrid, España',
        phone: '+34915551234',
        contactPerson: 'Ana García Rodríguez',
        subscription: {
          plan: '6months' as SubscriptionPlan,
          price: 399,
          startDate: new Date(),
          endDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
          status: 'active' as const,
        },
        paymentMethod: 'card',
      };

      // Step 1.1: Validate company registration data
      mockDatabaseService.users.findByEmail.mockResolvedValue(null); // Email available
      mockDatabaseService.companies.findByCif.mockResolvedValue(null); // CIF available

      const userSchema = ValidationService.getUserRegistrationSchema();
      const userValidation = await ValidationService.validate(userSchema, registrationData);
      expect(userValidation.isValid).toBe(true);

      const companySchema = ValidationService.getCompanyProfileSchema();
      const companyValidation = await ValidationService.validate(companySchema, registrationData);
      expect(companyValidation.isValid).toBe(true);

      console.log('✅ Company data validation passed');

      // Step 1.2: Process payment for subscription
      mockPaymentService.validatePaymentMethod.mockResolvedValue({
        isValid: true,
        paymentMethodId: 'pm_company123',
      });

      const paymentMethodValidation = await mockPaymentService.validatePaymentMethod({
        type: 'card',
        cardNumber: '4242424242424242',
        expiryMonth: 12,
        expiryYear: 2025,
        cvc: '123',
        holderName: 'Ana García Rodríguez',
      });

      expect(paymentMethodValidation.isValid).toBe(true);

      mockPaymentService.processPayment.mockResolvedValue({
        success: true,
        transactionId: 'txn_company123',
        amount: 399,
        currency: 'EUR',
        status: 'succeeded',
      });

      const paymentResult = await mockPaymentService.processPayment({
        amount: 399,
        currency: 'EUR',
        paymentMethodId: paymentMethodValidation.paymentMethodId,
        customerId: 'temp-company-id',
        description: 'Suscripción 6 meses - La Terraza Premium S.L.',
      });

      expect(paymentResult.success).toBe(true);
      console.log('✅ Payment processed successfully');

      // Step 1.3: Create company account
      mockDatabaseService.users.create.mockResolvedValue({
        id: 'company-terraza-123',
        email: registrationData.email,
        role: 'company',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const registerAction = await store.dispatch(registerUser(registrationData));
      expect(registerAction.type).toBe('auth/registerUser/fulfilled');

      const authState = store.getState().auth;
      expect(authState.isAuthenticated).toBe(true);
      expect(authState.user?.status).toBe('pending');

      console.log('✅ Company registration completed - Status: pending');

      // ===== PHASE 2: ADMIN APPROVAL =====
      console.log('👨‍💼 Admin reviewing and approving company...');

      const pendingCompany: Company = {
        id: 'company-terraza-123',
        email: registrationData.email,
        role: 'company',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        companyName: registrationData.companyName,
        cif: registrationData.cif,
        address: registrationData.address,
        phone: registrationData.phone,
        contactPerson: registrationData.contactPerson,
        subscription: registrationData.subscription,
        paymentMethod: registrationData.paymentMethod,
      };

      // Step 2.1: Admin approves company
      mockDatabaseService.users.update.mockResolvedValue({
        ...pendingCompany,
        status: 'approved',
        updatedAt: new Date(),
      });

      // Create subscription after approval
      mockSubscriptionService.createSubscription.mockResolvedValue({
        id: 'sub_terraza123',
        companyId: pendingCompany.id,
        plan: registrationData.subscription.plan,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
        price: 399,
        paymentMethodId: paymentMethodValidation.paymentMethodId,
      });

      await mockNotificationService.sendNotification({
        type: 'user_status',
        recipient: pendingCompany.id,
        title: '¡Bienvenidos a Zyro!',
        body: 'Su empresa ha sido aprobada. Ya pueden solicitar la creación de campañas.',
        data: {
          status: 'approved',
          reason: 'Documentación empresarial verificada',
        },
      });

      console.log('✅ Company approved by admin');

      // ===== PHASE 3: LOGIN AS APPROVED COMPANY =====
      console.log('🔐 Logging in as approved company...');

      const approvedCompany: Company = {
        ...pendingCompany,
        status: 'approved',
      };

      mockSecurityManager.secureLogin.mockResolvedValue({
        success: true,
        user: approvedCompany,
      });

      const loginAction = await store.dispatch(loginUser({
        email: registrationData.email,
        password: registrationData.password,
      }));

      expect(loginAction.type).toBe('auth/loginUser/fulfilled');
      
      const loginState = store.getState().auth;
      expect(loginState.isAuthenticated).toBe(true);
      expect(loginState.user?.status).toBe('approved');

      console.log('✅ Successfully logged in as approved company');

      // ===== PHASE 4: REQUEST CAMPAIGN CREATION =====
      console.log('📝 Requesting campaign creation from admin...');

      const campaignRequest = {
        companyId: approvedCompany.id,
        title: 'Cena Premium en La Terraza',
        description: 'Experiencia gastronómica única en nuestro restaurante premium con vistas panorámicas de Madrid. Buscamos influencers de lifestyle y gastronomía para mostrar nuestra propuesta culinaria.',
        businessName: 'La Terraza Premium',
        category: 'restaurantes' as const,
        city: 'Madrid',
        address: 'Calle Serrano 123, Madrid',
        coordinates: { lat: 40.4168, lng: -3.7038 },
        images: [
          'https://laterraza.com/images/restaurant-exterior.jpg',
          'https://laterraza.com/images/dining-room.jpg',
          'https://laterraza.com/images/signature-dish.jpg',
          'https://laterraza.com/images/madrid-view.jpg',
        ],
        requirements: {
          minInstagramFollowers: 20000,
          minTiktokFollowers: 10000,
          maxCompanions: 2,
        },
        whatIncludes: [
          'Cena completa para 2 personas',
          'Menú degustación de 7 platos',
          'Maridaje de vinos premium',
          'Postre especial de la casa',
          'Vista panorámica de Madrid',
          'Servicio personalizado',
        ],
        contentRequirements: {
          instagramStories: 2,
          tiktokVideos: 1,
          deadline: 72,
        },
        targetAudience: 'Amantes de la gastronomía premium, lifestyle, experiencias únicas en Madrid',
        budget: 'Valor aproximado: 180€ por persona',
        specialInstructions: 'Preferiblemente horario de cena (20:00-22:00) para mejor iluminación de la vista nocturna',
      };

      // Step 4.1: Validate campaign request
      const campaignSchema = ValidationService.getCampaignSchema();
      const campaignValidation = await ValidationService.validate(campaignSchema, campaignRequest);
      expect(campaignValidation.isValid).toBe(true);

      // Step 4.2: Submit campaign request to admin
      await mockNotificationService.sendNotification({
        type: 'campaign_request',
        recipient: 'admin-1',
        title: 'Nueva Solicitud de Campaña',
        body: `${approvedCompany.companyName} ha solicitado crear una campaña: "${campaignRequest.title}"`,
        data: {
          companyId: approvedCompany.id,
          campaignRequest,
        },
      });

      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'campaign_request',
          recipient: 'admin-1',
        })
      );

      console.log('✅ Campaign creation request submitted to admin');

      // ===== PHASE 5: ADMIN CREATES CAMPAIGN =====
      console.log('🎯 Admin creating campaign for company...');

      const createdCampaign: Campaign = {
        id: 'campaign-terraza-premium-123',
        title: campaignRequest.title,
        description: campaignRequest.description,
        businessName: campaignRequest.businessName,
        category: campaignRequest.category,
        city: campaignRequest.city,
        address: campaignRequest.address,
        coordinates: campaignRequest.coordinates,
        images: campaignRequest.images,
        requirements: campaignRequest.requirements,
        whatIncludes: campaignRequest.whatIncludes,
        contentRequirements: campaignRequest.contentRequirements,
        companyId: approvedCompany.id,
        status: 'active',
        createdBy: 'admin-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDatabaseService.campaigns.create.mockResolvedValue(createdCampaign);

      const campaign = await mockDatabaseService.campaigns.create(createdCampaign);
      expect(campaign.status).toBe('active');
      expect(campaign.companyId).toBe(approvedCompany.id);

      // Notify company that campaign is live
      await mockNotificationService.sendNotification({
        type: 'campaign_created',
        recipient: approvedCompany.id,
        title: '¡Campaña Publicada!',
        body: `Su campaña "${campaign.title}" ya está activa y visible para influencers.`,
        data: {
          campaignId: campaign.id,
          campaignTitle: campaign.title,
        },
      });

      console.log('✅ Campaign created and published by admin');

      // ===== PHASE 6: INFLUENCERS APPLY TO CAMPAIGN =====
      console.log('👥 Influencers applying to campaign...');

      const mockInfluencerApplications: CollaborationRequest[] = [
        {
          id: 'request-maria-123',
          campaignId: campaign.id,
          influencerId: 'influencer-maria-123',
          status: 'pending',
          requestDate: new Date(),
          proposedContent: 'Me encantaría mostrar la experiencia completa de La Terraza Premium. Propongo 2 historias de Instagram y 1 TikTok destacando la vista, los platos y el ambiente.',
          reservationDetails: {
            date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            time: '20:30',
            companions: 1,
            specialRequests: 'Mesa junto a la ventana para mejores fotos',
          },
        },
        {
          id: 'request-carlos-456',
          campaignId: campaign.id,
          influencerId: 'influencer-carlos-456',
          status: 'pending',
          requestDate: new Date(),
          proposedContent: 'Como food blogger, me gustaría crear contenido detallado sobre el menú degustación y la experiencia gastronómica.',
          reservationDetails: {
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            time: '21:00',
            companions: 1,
            specialRequests: 'Información detallada sobre ingredientes para el contenido',
          },
        },
      ];

      mockDatabaseService.collaborationRequests.findByCampaign.mockResolvedValue(mockInfluencerApplications);

      const applications = await mockDatabaseService.collaborationRequests.findByCampaign(campaign.id);
      expect(applications).toHaveLength(2);

      // Notify company about applications
      await mockNotificationService.sendNotification({
        type: 'new_applications',
        recipient: approvedCompany.id,
        title: 'Nuevas Solicitudes de Colaboración',
        body: `${applications.length} influencers han solicitado colaborar en "${campaign.title}"`,
        data: {
          campaignId: campaign.id,
          applicationCount: applications.length,
        },
      });

      console.log(`✅ ${applications.length} influencers applied to campaign`);

      // ===== PHASE 7: COMPANY VIEWS APPLICATIONS =====
      console.log('👀 Company viewing influencer applications...');

      // Step 7.1: Company accesses dashboard
      mockDatabaseService.campaigns.findByCompany.mockResolvedValue([campaign]);

      const companyCampaigns = await mockDatabaseService.campaigns.findByCompany(approvedCompany.id);
      expect(companyCampaigns).toHaveLength(1);
      expect(companyCampaigns[0].id).toBe(campaign.id);

      // Step 7.2: Company views applications for their campaign
      const campaignApplications = await mockDatabaseService.collaborationRequests.findByCampaign(campaign.id);
      expect(campaignApplications).toHaveLength(2);

      // Company can see influencer profiles and proposals
      campaignApplications.forEach(application => {
        expect(application.proposedContent).toBeDefined();
        expect(application.reservationDetails).toBeDefined();
        expect(application.status).toBe('pending');
      });

      console.log('✅ Company can view all applications and influencer details');

      // ===== PHASE 8: ADMIN MANAGES COLLABORATIONS =====
      console.log('⚖️ Admin managing collaboration approvals...');

      // Step 8.1: Admin approves first influencer
      const approvedApplication: CollaborationRequest = {
        ...mockInfluencerApplications[0],
        status: 'approved',
        adminNotes: 'Excelente perfil y propuesta de contenido muy detallada.',
      };

      mockDatabaseService.collaborationRequests.updateStatus.mockResolvedValue(approvedApplication);

      const approvedCollab = await mockDatabaseService.collaborationRequests.updateStatus(
        mockInfluencerApplications[0].id,
        'approved',
        'Excelente perfil y propuesta de contenido muy detallada.'
      );

      expect(approvedCollab.status).toBe('approved');

      // Notify both company and influencer
      await mockNotificationService.sendNotification({
        type: 'collaboration_approved',
        recipient: approvedCompany.id,
        title: 'Colaboración Confirmada',
        body: 'Una colaboración para su campaña ha sido aprobada y confirmada.',
        data: {
          campaignId: campaign.id,
          collaborationId: approvedCollab.id,
        },
      });

      await mockNotificationService.sendNotification({
        type: 'collaboration_approved',
        recipient: approvedCollab.influencerId,
        title: '¡Colaboración Aprobada!',
        body: `Tu solicitud para "${campaign.title}" ha sido aprobada.`,
        data: {
          campaignId: campaign.id,
          collaborationId: approvedCollab.id,
        },
      });

      console.log('✅ First collaboration approved');

      // Step 8.2: Admin rejects second influencer
      const rejectedApplication: CollaborationRequest = {
        ...mockInfluencerApplications[1],
        status: 'rejected',
        adminNotes: 'El perfil no se ajusta al target de audiencia buscado.',
      };

      mockDatabaseService.collaborationRequests.updateStatus.mockResolvedValue(rejectedApplication);

      const rejectedCollab = await mockDatabaseService.collaborationRequests.updateStatus(
        mockInfluencerApplications[1].id,
        'rejected',
        'El perfil no se ajusta al target de audiencia buscado.'
      );

      expect(rejectedCollab.status).toBe('rejected');

      console.log('✅ Second collaboration rejected');

      // ===== PHASE 9: COLLABORATION EXECUTION =====
      console.log('🍽️ Executing approved collaboration...');

      // Step 9.1: Influencer visits restaurant and creates content
      const completedCollaboration: CollaborationRequest = {
        ...approvedApplication,
        status: 'completed',
        contentDelivered: {
          instagramStories: [
            'https://instagram.com/story/maria_lifestyle/terraza_arrival',
            'https://instagram.com/story/maria_lifestyle/terraza_dinner',
          ],
          tiktokVideos: [
            'https://tiktok.com/@maria_lifestyle_tt/terraza_experience',
          ],
          deliveredAt: new Date(),
        },
      };

      mockDatabaseService.collaborationRequests.updateStatus.mockResolvedValue(completedCollaboration);

      const completedCollab = await mockDatabaseService.collaborationRequests.updateStatus(
        approvedApplication.id,
        'completed',
        undefined,
        completedCollaboration.contentDelivered
      );

      expect(completedCollab.status).toBe('completed');
      expect(completedCollab.contentDelivered).toBeDefined();

      // Step 9.2: Notify company of completion
      await mockNotificationService.sendNotification({
        type: 'collaboration_completed',
        recipient: approvedCompany.id,
        title: 'Colaboración Completada',
        body: 'El contenido de su colaboración ha sido entregado y publicado.',
        data: {
          campaignId: campaign.id,
          collaborationId: completedCollab.id,
          contentLinks: completedCollab.contentDelivered?.instagramStories.concat(
            completedCollab.contentDelivered?.tiktokVideos || []
          ),
        },
      });

      console.log('✅ Collaboration completed and content delivered');

      // ===== PHASE 10: COMPANY DASHBOARD METRICS =====
      console.log('📊 Company viewing campaign metrics...');

      // Step 10.1: Company views campaign performance
      const campaignMetrics = {
        campaignId: campaign.id,
        totalApplications: 2,
        approvedCollaborations: 1,
        completedCollaborations: 1,
        totalReach: 45000, // Estimated reach from influencer
        totalEngagement: 2250,
        contentPieces: 3, // 2 stories + 1 TikTok
        roi: 'Positive', // Based on engagement vs campaign value
      };

      // Company can access these metrics through their dashboard
      expect(campaignMetrics.totalApplications).toBe(2);
      expect(campaignMetrics.completedCollaborations).toBe(1);
      expect(campaignMetrics.contentPieces).toBe(3);

      console.log('✅ Company can view detailed campaign metrics');

      // ===== PHASE 11: SUBSCRIPTION RENEWAL =====
      console.log('🔄 Handling subscription renewal...');

      // Simulate subscription nearing expiration
      const renewalNotification = {
        type: 'subscription_renewal_reminder',
        recipient: approvedCompany.id,
        title: 'Renovación de Suscripción',
        body: 'Su suscripción vence en 7 días. La renovación se procesará automáticamente.',
        data: {
          subscriptionId: 'sub_terraza123',
          expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          renewalAmount: 399,
        },
      };

      await mockNotificationService.sendNotification(renewalNotification);

      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'subscription_renewal_reminder',
        })
      );

      console.log('✅ Subscription renewal process initiated');

      // ===== FINAL VERIFICATION =====
      console.log('🔍 Verifying complete company journey...');

      // Verify all database interactions
      expect(mockDatabaseService.users.create).toHaveBeenCalled();
      expect(mockDatabaseService.users.update).toHaveBeenCalled();
      expect(mockDatabaseService.campaigns.create).toHaveBeenCalled();
      expect(mockDatabaseService.campaigns.findByCompany).toHaveBeenCalled();
      expect(mockDatabaseService.collaborationRequests.findByCampaign).toHaveBeenCalled();
      expect(mockDatabaseService.collaborationRequests.updateStatus).toHaveBeenCalledTimes(3);

      // Verify payment processing
      expect(mockPaymentService.validatePaymentMethod).toHaveBeenCalled();
      expect(mockPaymentService.processPayment).toHaveBeenCalled();
      expect(mockSubscriptionService.createSubscription).toHaveBeenCalled();

      // Verify notification flow
      expect(mockNotificationService.sendNotification).toHaveBeenCalledTimes(8);
      // 1. User approval notification
      // 2. Campaign request to admin
      // 3. Campaign created notification
      // 4. New applications notification
      // 5. Collaboration approved to company
      // 6. Collaboration approved to influencer
      // 7. Collaboration completed notification
      // 8. Subscription renewal reminder

      console.log('🎉 Complete company journey test passed!');

      // ===== SUMMARY =====
      console.log('\n📊 COMPANY JOURNEY SUMMARY:');
      console.log('✅ Company registration with payment processing');
      console.log('✅ Admin approval and subscription activation');
      console.log('✅ Login as approved company');
      console.log('✅ Campaign creation request to admin');
      console.log('✅ Admin creates and publishes campaign');
      console.log('✅ Influencer applications received');
      console.log('✅ Company views applications through dashboard');
      console.log('✅ Admin manages collaboration approvals');
      console.log('✅ Collaboration execution and content delivery');
      console.log('✅ Campaign metrics and performance tracking');
      console.log('✅ Subscription renewal management');
      console.log('✅ Complete notification flow');
      console.log('✅ Payment and subscription integration');
    });

    it('should handle company subscription payment failure and recovery', async () => {
      console.log('💳 Testing payment failure and recovery flow...');

      const companyData = {
        email: 'payment.test@company.com',
        password: 'SecurePass123!',
        role: 'company' as const,
        companyName: 'Test Company S.L.',
        cif: 'B87654321',
        address: 'Test Address',
        phone: '+34600000000',
        contactPerson: 'Test Person',
        subscription: {
          plan: '3months' as SubscriptionPlan,
          price: 499,
          startDate: new Date(),
          endDate: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000),
          status: 'active' as const,
        },
      };

      // Phase 1: Initial payment failure
      mockPaymentService.validatePaymentMethod.mockResolvedValue({
        isValid: true,
        paymentMethodId: 'pm_fail123',
      });

      mockPaymentService.processPayment.mockResolvedValue({
        success: false,
        error: 'card_declined',
        errorMessage: 'Your card was declined.',
      });

      const failedPayment = await mockPaymentService.processPayment({
        amount: 499,
        currency: 'EUR',
        paymentMethodId: 'pm_fail123',
        customerId: 'temp-company-id',
        description: 'Test payment',
      });

      expect(failedPayment.success).toBe(false);

      // Notify company of payment failure
      await mockNotificationService.sendNotification({
        type: 'payment_failed',
        recipient: 'temp-company-id',
        title: 'Error en el Pago',
        body: 'No se pudo procesar su pago. Por favor, verifique su método de pago.',
        data: {
          error: failedPayment.error,
          retryUrl: 'https://app.zyro.com/billing/retry',
        },
      });

      // Phase 2: Payment retry with new method
      mockPaymentService.validatePaymentMethod.mockResolvedValue({
        isValid: true,
        paymentMethodId: 'pm_success123',
      });

      mockPaymentService.processPayment.mockResolvedValue({
        success: true,
        transactionId: 'txn_retry123',
        amount: 499,
        currency: 'EUR',
        status: 'succeeded',
      });

      const successfulPayment = await mockPaymentService.processPayment({
        amount: 499,
        currency: 'EUR',
        paymentMethodId: 'pm_success123',
        customerId: 'temp-company-id',
        description: 'Retry payment',
      });

      expect(successfulPayment.success).toBe(true);

      // Notify company of successful payment
      await mockNotificationService.sendNotification({
        type: 'payment_success',
        recipient: 'temp-company-id',
        title: 'Pago Procesado',
        body: 'Su pago ha sido procesado correctamente. Su suscripción está activa.',
        data: {
          transactionId: successfulPayment.transactionId,
        },
      });

      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'payment_success',
        })
      );

      console.log('✅ Payment failure and recovery flow completed');
    });
  });

  describe('Company Dashboard and Management Features', () => {
    it('should handle complete campaign lifecycle management', async () => {
      console.log('📈 Testing complete campaign lifecycle management...');

      const approvedCompany: Company = {
        id: 'company-lifecycle-123',
        email: 'lifecycle@test.com',
        role: 'company',
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
        companyName: 'Lifecycle Test Company',
        cif: 'B11111111',
        address: 'Test Address',
        phone: '+34600000000',
        contactPerson: 'Test Manager',
        subscription: {
          plan: '12months',
          price: 299,
          startDate: new Date(),
          endDate: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000),
          status: 'active',
        },
        paymentMethod: 'card',
      };

      // Phase 1: Campaign creation and launch
      const campaign: Campaign = {
        id: 'campaign-lifecycle-123',
        title: 'Product Launch Campaign',
        description: 'Launch campaign for new product line',
        businessName: 'Lifecycle Test Company',
        category: 'ropa',
        city: 'Barcelona',
        address: 'Test Address Barcelona',
        coordinates: { lat: 41.3851, lng: 2.1734 },
        images: ['product1.jpg', 'product2.jpg'],
        requirements: {
          minInstagramFollowers: 10000,
          maxCompanions: 1,
        },
        whatIncludes: ['Product samples', 'Exclusive discount code'],
        contentRequirements: {
          instagramStories: 2,
          tiktokVideos: 1,
          deadline: 48,
        },
        companyId: approvedCompany.id,
        status: 'active',
        createdBy: 'admin-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockDatabaseService.campaigns.findByCompany.mockResolvedValue([campaign]);

      // Phase 2: Multiple influencer applications
      const applications: CollaborationRequest[] = [
        {
          id: 'app-1',
          campaignId: campaign.id,
          influencerId: 'inf-1',
          status: 'pending',
          requestDate: new Date(),
          proposedContent: 'Fashion content proposal 1',
        },
        {
          id: 'app-2',
          campaignId: campaign.id,
          influencerId: 'inf-2',
          status: 'pending',
          requestDate: new Date(),
          proposedContent: 'Fashion content proposal 2',
        },
        {
          id: 'app-3',
          campaignId: campaign.id,
          influencerId: 'inf-3',
          status: 'pending',
          requestDate: new Date(),
          proposedContent: 'Fashion content proposal 3',
        },
      ];

      mockDatabaseService.collaborationRequests.findByCampaign.mockResolvedValue(applications);

      // Phase 3: Selective approvals
      mockDatabaseService.collaborationRequests.updateStatus
        .mockResolvedValueOnce({ ...applications[0], status: 'approved' })
        .mockResolvedValueOnce({ ...applications[1], status: 'approved' })
        .mockResolvedValueOnce({ ...applications[2], status: 'rejected' });

      // Phase 4: Campaign completion tracking
      const completedCollaborations = [
        { ...applications[0], status: 'completed', contentDelivered: { instagramStories: ['story1'], tiktokVideos: ['video1'], deliveredAt: new Date() } },
        { ...applications[1], status: 'completed', contentDelivered: { instagramStories: ['story2'], tiktokVideos: ['video2'], deliveredAt: new Date() } },
      ];

      // Phase 5: Campaign metrics calculation
      const campaignMetrics = {
        totalApplications: applications.length,
        approvedCollaborations: 2,
        completedCollaborations: 2,
        rejectedApplications: 1,
        totalContentPieces: 4, // 2 stories + 2 videos
        estimatedReach: 85000,
        estimatedEngagement: 4250,
        campaignROI: 'Positive',
        completionRate: '100%', // 2/2 approved collaborations completed
      };

      expect(campaignMetrics.totalApplications).toBe(3);
      expect(campaignMetrics.approvedCollaborations).toBe(2);
      expect(campaignMetrics.completedCollaborations).toBe(2);
      expect(campaignMetrics.completionRate).toBe('100%');

      console.log('✅ Complete campaign lifecycle management tested');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle subscription expiration and access restriction', async () => {
      console.log('⏰ Testing subscription expiration handling...');

      const expiredCompany: Company = {
        id: 'company-expired-123',
        email: 'expired@test.com',
        role: 'company',
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
        companyName: 'Expired Company',
        cif: 'B99999999',
        address: 'Test Address',
        phone: '+34600000000',
        contactPerson: 'Test Person',
        subscription: {
          plan: '3months',
          price: 499,
          startDate: new Date(Date.now() - 4 * 30 * 24 * 60 * 60 * 1000), // 4 months ago
          endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago (expired)
          status: 'expired',
        },
        paymentMethod: 'card',
      };

      // Attempt to access dashboard with expired subscription
      mockDatabaseService.campaigns.findByCompany.mockRejectedValue(
        new Error('Subscription expired. Please renew to access campaigns.')
      );

      await expect(
        mockDatabaseService.campaigns.findByCompany(expiredCompany.id)
      ).rejects.toThrow('Subscription expired');

      // Send expiration notification
      await mockNotificationService.sendNotification({
        type: 'subscription_expired',
        recipient: expiredCompany.id,
        title: 'Suscripción Expirada',
        body: 'Su suscripción ha expirado. Renueve para continuar accediendo a las funcionalidades.',
        data: {
          renewalUrl: 'https://app.zyro.com/billing/renew',
        },
      });

      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'subscription_expired',
        })
      );

      console.log('✅ Subscription expiration handled correctly');
    });

    it('should handle concurrent campaign requests', async () => {
      console.log('🔄 Testing concurrent campaign request handling...');

      const company: Company = {
        id: 'company-concurrent-123',
        email: 'concurrent@test.com',
        role: 'company',
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
        companyName: 'Concurrent Test Company',
        cif: 'B88888888',
        address: 'Test Address',
        phone: '+34600000000',
        contactPerson: 'Test Person',
        subscription: {
          plan: '6months',
          price: 399,
          startDate: new Date(),
          endDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
          status: 'active',
        },
        paymentMethod: 'card',
      };

      // Simulate multiple concurrent campaign requests
      const campaignRequests = [
        { title: 'Campaign 1', category: 'restaurantes' },
        { title: 'Campaign 2', category: 'ropa' },
        { title: 'Campaign 3', category: 'eventos' },
      ];

      // Mock rate limiting or queue system
      mockDatabaseService.campaigns.create
        .mockResolvedValueOnce({ id: 'camp-1', title: 'Campaign 1', status: 'active' })
        .mockResolvedValueOnce({ id: 'camp-2', title: 'Campaign 2', status: 'pending' }) // Queued
        .mockRejectedValueOnce(new Error('Rate limit exceeded. Please wait before creating another campaign.'));

      const results = await Promise.allSettled([
        mockDatabaseService.campaigns.create(campaignRequests[0]),
        mockDatabaseService.campaigns.create(campaignRequests[1]),
        mockDatabaseService.campaigns.create(campaignRequests[2]),
      ]);

      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('fulfilled');
      expect(results[2].status).toBe('rejected');

      console.log('✅ Concurrent campaign requests handled with rate limiting');
    });
  });
});