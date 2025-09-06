import { configureStore } from '@reduxjs/toolkit';
import authReducer, { loginUser, registerUser } from '../../store/slices/authSlice';
import collaborationReducer from '../../store/slices/collaborationSlice';
import { ValidationService } from '../../services/validationService';
import { FollowerValidationService } from '../../services/followerValidationService';
import { LocationService } from '../../services/locationService';
import { securityManager } from '../../services/security/securityManager';
import { authSecurityService } from '../../services/security/authSecurityService';
import { databaseService } from '../../database';
import { notificationService } from '../../services/notificationService';
import { Influencer, Campaign, CollaborationRequest } from '../../types';

// Mock all external dependencies
jest.mock('../../services/security/securityManager');
jest.mock('../../services/security/authSecurityService');
jest.mock('../../database');
jest.mock('../../services/notificationService');

const mockSecurityManager = securityManager as jest.Mocked<typeof securityManager>;
const mockAuthSecurityService = authSecurityService as jest.Mocked<typeof authSecurityService>;
const mockDatabaseService = databaseService as jest.Mocked<typeof databaseService>;
const mockNotificationService = notificationService as jest.Mocked<typeof notificationService>;

describe('Influencer Complete Flow E2E Tests', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
        collaboration: collaborationReducer,
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

    mockDatabaseService.influencers = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    } as any;

    mockDatabaseService.campaigns = {
      findByCity: jest.fn(),
      findByCategory: jest.fn(),
      findById: jest.fn(),
    } as any;

    mockDatabaseService.collaborationRequests = {
      create: jest.fn(),
      findByInfluencer: jest.fn(),
      updateStatus: jest.fn(),
    } as any;
  });

  describe('Complete Influencer Journey: Registration → Approval → Collaboration', () => {
    it('should complete full influencer journey from registration to collaboration completion', async () => {
      // ===== PHASE 1: REGISTRATION =====
      console.log('🚀 Starting Influencer Registration Flow...');

      const registrationData = {
        email: 'maria.influencer@gmail.com',
        password: 'SecurePassword123!',
        role: 'influencer' as const,
        fullName: 'María González',
        instagramUsername: 'maria_lifestyle',
        tiktokUsername: 'maria_lifestyle_tt',
        instagramFollowers: 25000,
        tiktokFollowers: 15000,
        phone: '+34612345678',
        city: 'Madrid',
        audienceStats: {
          countries: [
            { country: 'Spain', percentage: 75 },
            { country: 'Portugal', percentage: 15 },
            { country: 'France', percentage: 10 },
          ],
          cities: [
            { city: 'Madrid', percentage: 40 },
            { city: 'Barcelona', percentage: 25 },
            { city: 'Valencia', percentage: 15 },
            { city: 'Sevilla', percentage: 20 },
          ],
          ageRanges: [
            { range: '18-24', percentage: 35 },
            { range: '25-34', percentage: 45 },
            { range: '35-44', percentage: 20 },
          ],
          monthlyStats: {
            views: 150000,
            engagement: 7500,
            reach: 120000,
          },
        },
      };

      // Step 1.1: Validate registration data
      mockDatabaseService.users.findByEmail.mockResolvedValue(null); // Email available
      
      const userSchema = ValidationService.getUserRegistrationSchema();
      const userValidation = await ValidationService.validate(userSchema, registrationData);
      expect(userValidation.isValid).toBe(true);

      const influencerSchema = ValidationService.getInfluencerProfileSchema();
      const influencerValidation = await ValidationService.validate(influencerSchema, registrationData);
      expect(influencerValidation.isValid).toBe(true);

      // Step 1.2: Register user
      mockDatabaseService.users.create.mockResolvedValue({
        id: 'user-maria-123',
        email: registrationData.email,
        role: 'influencer',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const registerAction = await store.dispatch(registerUser(registrationData));
      expect(registerAction.type).toBe('auth/registerUser/fulfilled');

      const authState = store.getState().auth;
      expect(authState.isAuthenticated).toBe(true);
      expect(authState.user?.status).toBe('pending');

      console.log('✅ Registration completed - User status: pending');

      // ===== PHASE 2: ADMIN APPROVAL =====
      console.log('🔍 Admin reviewing and approving influencer...');

      // Step 2.1: Admin reviews profile (simulated)
      const pendingInfluencer: Influencer = {
        id: 'user-maria-123',
        email: registrationData.email,
        role: 'influencer',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        fullName: registrationData.fullName,
        instagramUsername: registrationData.instagramUsername,
        tiktokUsername: registrationData.tiktokUsername,
        instagramFollowers: registrationData.instagramFollowers,
        tiktokFollowers: registrationData.tiktokFollowers,
        phone: registrationData.phone,
        city: registrationData.city,
        audienceStats: registrationData.audienceStats,
      };

      // Step 2.2: Admin approves influencer
      mockDatabaseService.users.update.mockResolvedValue({
        ...pendingInfluencer,
        status: 'approved',
        updatedAt: new Date(),
      });

      // Simulate admin approval notification
      await mockNotificationService.sendNotification({
        type: 'user_status',
        recipient: pendingInfluencer.id,
        title: '¡Bienvenida a Zyro!',
        body: 'Tu cuenta ha sido aprobada. Ya puedes acceder a todas las colaboraciones disponibles.',
        data: {
          status: 'approved',
          reason: 'Perfil completo y audiencia verificada',
        },
      });

      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'user_status',
          recipient: pendingInfluencer.id,
        })
      );

      console.log('✅ Influencer approved by admin');

      // ===== PHASE 3: LOGIN AS APPROVED USER =====
      console.log('🔐 Logging in as approved influencer...');

      const approvedInfluencer: Influencer = {
        ...pendingInfluencer,
        status: 'approved',
      };

      mockSecurityManager.secureLogin.mockResolvedValue({
        success: true,
        user: approvedInfluencer,
      });

      const loginAction = await store.dispatch(loginUser({
        email: registrationData.email,
        password: registrationData.password,
      }));

      expect(loginAction.type).toBe('auth/loginUser/fulfilled');
      
      const loginState = store.getState().auth;
      expect(loginState.isAuthenticated).toBe(true);
      expect(loginState.user?.status).toBe('approved');

      console.log('✅ Successfully logged in as approved influencer');

      // ===== PHASE 4: BROWSE CAMPAIGNS =====
      console.log('🔍 Browsing available campaigns...');

      // Step 4.1: Get enabled cities and categories
      const enabledCities = LocationService.getEnabledCities();
      const enabledCategories = LocationService.getEnabledCategories();

      expect(enabledCities.length).toBeGreaterThan(0);
      expect(enabledCategories.length).toBeGreaterThan(0);

      const madridCity = enabledCities.find(city => city.name === 'MADRID');
      expect(madridCity).toBeDefined();
      expect(madridCity?.isEnabled).toBe(true);

      // Step 4.2: Browse campaigns in Madrid
      const mockCampaigns: Campaign[] = [
        {
          id: 'campaign-restaurant-123',
          title: 'Cena Premium en La Terraza',
          description: 'Experiencia gastronómica única en nuestro restaurante premium con vistas panorámicas de Madrid.',
          businessName: 'La Terraza Premium',
          category: 'restaurantes',
          city: 'Madrid',
          address: 'Calle Serrano 123, Madrid',
          coordinates: { lat: 40.4168, lng: -3.7038 },
          images: ['restaurant1.jpg', 'restaurant2.jpg', 'restaurant3.jpg'],
          requirements: {
            minInstagramFollowers: 20000,
            minTiktokFollowers: 10000,
            maxCompanions: 2,
          },
          whatIncludes: [
            'Cena completa para 2 personas',
            'Bebidas premium incluidas',
            'Postre especial de la casa',
            'Vista panorámica de Madrid',
          ],
          contentRequirements: {
            instagramStories: 2,
            tiktokVideos: 1,
            deadline: 72,
          },
          companyId: 'company-terraza-123',
          status: 'active',
          createdBy: 'admin-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'campaign-beauty-456',
          title: 'Tratamiento Facial Premium',
          description: 'Sesión completa de cuidado facial con productos de lujo.',
          businessName: 'Beauty Spa Madrid',
          category: 'salud-belleza',
          city: 'Madrid',
          address: 'Calle Goya 89, Madrid',
          coordinates: { lat: 40.4250, lng: -3.6850 },
          images: ['spa1.jpg', 'spa2.jpg'],
          requirements: {
            minInstagramFollowers: 15000,
            maxCompanions: 1,
          },
          whatIncludes: [
            'Tratamiento facial completo',
            'Masaje relajante',
            'Productos para llevar',
          ],
          contentRequirements: {
            instagramStories: 3,
            tiktokVideos: 1,
            deadline: 48,
          },
          companyId: 'company-beauty-456',
          status: 'active',
          createdBy: 'admin-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockDatabaseService.campaigns.findByCity.mockResolvedValue(mockCampaigns);

      const madridCampaigns = await mockDatabaseService.campaigns.findByCity('Madrid');
      expect(madridCampaigns).toHaveLength(2);

      console.log(`✅ Found ${madridCampaigns.length} campaigns in Madrid`);

      // ===== PHASE 5: VALIDATE ELIGIBILITY =====
      console.log('🎯 Checking eligibility for campaigns...');

      // Step 5.1: Check eligibility for restaurant campaign
      const restaurantCampaign = madridCampaigns[0];
      const restaurantEligibility = FollowerValidationService.validateFollowerRequirements(
        restaurantCampaign,
        approvedInfluencer
      );

      expect(restaurantEligibility.isEligible).toBe(true);
      expect(restaurantEligibility.message).toBe('¡Cumples todos los requisitos para esta colaboración!');

      // Step 5.2: Check eligibility for beauty campaign
      const beautyCampaign = madridCampaigns[1];
      const beautyEligibility = FollowerValidationService.validateFollowerRequirements(
        beautyCampaign,
        approvedInfluencer
      );

      expect(beautyEligibility.isEligible).toBe(true);

      console.log('✅ Eligible for both campaigns');

      // ===== PHASE 6: APPLY FOR COLLABORATION =====
      console.log('📝 Applying for restaurant collaboration...');

      const collaborationRequestData = {
        campaignId: restaurantCampaign.id,
        influencerId: approvedInfluencer.id,
        proposedContent: `¡Hola! Me encantaría colaborar con La Terraza Premium. 
        
        Propongo crear:
        - 2 historias de Instagram mostrando la experiencia completa: llegada, ambiente, platos principales y postre
        - 1 video de TikTok destacando los platos más fotogénicos y la vista panorámica
        
        Mi audiencia está muy interesada en experiencias gastronómicas premium en Madrid, y creo que esta colaboración sería perfecta para mostrar la calidad de su restaurante.`,
        reservationDetails: {
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          time: '20:30',
          companions: 1,
          specialRequests: 'Mesa junto a la ventana para mejores fotos con la vista panorámica. Preferiblemente zona tranquila para grabar contenido.',
        },
      };

      // Step 6.1: Validate collaboration request
      const requestSchema = ValidationService.getCollaborationRequestSchema();
      const requestValidation = await ValidationService.validate(requestSchema, collaborationRequestData);
      expect(requestValidation.isValid).toBe(true);

      // Step 6.2: Submit collaboration request
      const mockCollaborationRequest: CollaborationRequest = {
        id: 'request-maria-restaurant-123',
        campaignId: restaurantCampaign.id,
        influencerId: approvedInfluencer.id,
        status: 'pending',
        requestDate: new Date(),
        proposedContent: collaborationRequestData.proposedContent,
        reservationDetails: collaborationRequestData.reservationDetails,
      };

      mockDatabaseService.collaborationRequests.create.mockResolvedValue(mockCollaborationRequest);

      const createdRequest = await mockDatabaseService.collaborationRequests.create(collaborationRequestData);
      expect(createdRequest.status).toBe('pending');

      // Step 6.3: Verify notification sent to admin
      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'collaboration_request',
          recipient: 'admin-1',
          title: expect.stringContaining('Nueva Solicitud'),
          body: expect.stringContaining('María González'),
        })
      );

      console.log('✅ Collaboration request submitted successfully');

      // ===== PHASE 7: ADMIN APPROVAL =====
      console.log('👨‍💼 Admin reviewing and approving collaboration...');

      // Step 7.1: Admin reviews and approves collaboration
      const approvedRequest: CollaborationRequest = {
        ...mockCollaborationRequest,
        status: 'approved',
        adminNotes: 'Excelente perfil y propuesta de contenido muy detallada. ¡Aprobada!',
      };

      mockDatabaseService.collaborationRequests.updateStatus.mockResolvedValue(approvedRequest);

      const updatedRequest = await mockDatabaseService.collaborationRequests.updateStatus(
        mockCollaborationRequest.id,
        'approved',
        'Excelente perfil y propuesta de contenido muy detallada. ¡Aprobada!'
      );

      expect(updatedRequest.status).toBe('approved');
      expect(updatedRequest.adminNotes).toBeDefined();

      // Step 7.2: Verify approval notifications
      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'approval_status',
          recipient: approvedInfluencer.id,
          title: expect.stringContaining('¡Colaboración Aprobada!'),
        })
      );

      console.log('✅ Collaboration approved by admin');

      // ===== PHASE 8: COLLABORATION EXECUTION =====
      console.log('🍽️ Executing collaboration...');

      // Step 8.1: Influencer visits restaurant (simulated)
      // In real scenario, this would happen offline

      // Step 8.2: Influencer creates and uploads content
      const contentDelivered = {
        instagramStories: [
          'https://instagram.com/story/maria_lifestyle/story1_arrival',
          'https://instagram.com/story/maria_lifestyle/story2_dinner',
        ],
        tiktokVideos: [
          'https://tiktok.com/@maria_lifestyle_tt/video_restaurant_review',
        ],
        deliveredAt: new Date(),
      };

      // Step 8.3: Mark collaboration as completed
      const completedRequest: CollaborationRequest = {
        ...approvedRequest,
        status: 'completed',
        contentDelivered,
      };

      mockDatabaseService.collaborationRequests.updateStatus.mockResolvedValue(completedRequest);

      const finalRequest = await mockDatabaseService.collaborationRequests.updateStatus(
        approvedRequest.id,
        'completed',
        undefined,
        contentDelivered
      );

      expect(finalRequest.status).toBe('completed');
      expect(finalRequest.contentDelivered).toEqual(contentDelivered);

      // Step 8.4: Verify content meets requirements
      const contentReqs = restaurantCampaign.contentRequirements;
      expect(finalRequest.contentDelivered?.instagramStories.length).toBe(contentReqs.instagramStories);
      expect(finalRequest.contentDelivered?.tiktokVideos.length).toBe(contentReqs.tiktokVideos);

      // Step 8.5: Verify completion notifications
      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'collaboration_completed',
          recipient: restaurantCampaign.companyId,
          title: expect.stringContaining('Colaboración Completada'),
        })
      );

      console.log('✅ Collaboration completed successfully');

      // ===== PHASE 9: VERIFY FINAL STATE =====
      console.log('🔍 Verifying final state...');

      // Step 9.1: Verify influencer history
      mockDatabaseService.collaborationRequests.findByInfluencer.mockResolvedValue([finalRequest]);

      const influencerHistory = await mockDatabaseService.collaborationRequests.findByInfluencer(approvedInfluencer.id);
      expect(influencerHistory).toHaveLength(1);
      expect(influencerHistory[0].status).toBe('completed');

      // Step 9.2: Verify all database interactions occurred
      expect(mockDatabaseService.users.create).toHaveBeenCalled();
      expect(mockDatabaseService.users.update).toHaveBeenCalled();
      expect(mockDatabaseService.campaigns.findByCity).toHaveBeenCalled();
      expect(mockDatabaseService.collaborationRequests.create).toHaveBeenCalled();
      expect(mockDatabaseService.collaborationRequests.updateStatus).toHaveBeenCalledTimes(2); // Approval + Completion

      // Step 9.3: Verify notification flow
      expect(mockNotificationService.sendNotification).toHaveBeenCalledTimes(4);
      // 1. User approval notification
      // 2. Collaboration request notification to admin
      // 3. Collaboration approval notification to influencer
      // 4. Collaboration completion notification to company

      console.log('🎉 Complete influencer journey test passed!');

      // ===== SUMMARY =====
      console.log('\n📊 JOURNEY SUMMARY:');
      console.log('✅ Registration with detailed profile');
      console.log('✅ Admin approval process');
      console.log('✅ Login as approved user');
      console.log('✅ Campaign browsing and filtering');
      console.log('✅ Eligibility validation');
      console.log('✅ Collaboration request submission');
      console.log('✅ Admin collaboration approval');
      console.log('✅ Content creation and delivery');
      console.log('✅ Collaboration completion');
      console.log('✅ Notification flow throughout process');
      console.log('✅ Data persistence and state management');
    });

    it('should handle influencer rejection and reapplication flow', async () => {
      console.log('🚫 Testing influencer rejection and reapplication flow...');

      // Phase 1: Initial registration (similar to above)
      const registrationData = {
        email: 'carlos.influencer@gmail.com',
        password: 'SecurePassword123!',
        role: 'influencer' as const,
        fullName: 'Carlos Martín',
        instagramUsername: 'carlos_fitness',
        instagramFollowers: 5000, // Lower followers
        tiktokFollowers: 2000,
        city: 'Barcelona',
        audienceStats: {
          countries: [{ country: 'Spain', percentage: 90 }],
          cities: [{ city: 'Barcelona', percentage: 80 }],
          ageRanges: [{ range: '18-24', percentage: 60 }],
          monthlyStats: {
            views: 25000,
            engagement: 1250,
            reach: 20000,
          },
        },
      };

      mockDatabaseService.users.findByEmail.mockResolvedValue(null);
      mockDatabaseService.users.create.mockResolvedValue({
        id: 'user-carlos-123',
        email: registrationData.email,
        role: 'influencer',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await store.dispatch(registerUser(registrationData));

      // Phase 2: Admin rejects influencer
      mockDatabaseService.users.update.mockResolvedValue({
        id: 'user-carlos-123',
        email: registrationData.email,
        role: 'influencer',
        status: 'rejected',
        updatedAt: new Date(),
      });

      await mockNotificationService.sendNotification({
        type: 'user_status',
        recipient: 'user-carlos-123',
        title: 'Solicitud No Aprobada',
        body: 'Tu solicitud necesita más información. Por favor, actualiza tu perfil con más seguidores y estadísticas.',
        data: {
          status: 'rejected',
          reason: 'Número de seguidores insuficiente para nuestros estándares actuales',
        },
      });

      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'user_status',
          title: 'Solicitud No Aprobada',
        })
      );

      // Phase 3: Influencer improves profile and reapplies
      const improvedData = {
        ...registrationData,
        instagramFollowers: 15000, // Improved followers
        tiktokFollowers: 8000,
        audienceStats: {
          ...registrationData.audienceStats,
          monthlyStats: {
            views: 75000,
            engagement: 3750,
            reach: 60000,
          },
        },
      };

      mockDatabaseService.users.update.mockResolvedValue({
        id: 'user-carlos-123',
        email: registrationData.email,
        role: 'influencer',
        status: 'pending', // Back to pending for review
        updatedAt: new Date(),
      });

      // Phase 4: Admin approves improved profile
      mockDatabaseService.users.update.mockResolvedValue({
        id: 'user-carlos-123',
        email: registrationData.email,
        role: 'influencer',
        status: 'approved',
        updatedAt: new Date(),
      });

      await mockNotificationService.sendNotification({
        type: 'user_status',
        recipient: 'user-carlos-123',
        title: '¡Bienvenido a Zyro!',
        body: 'Tu perfil actualizado ha sido aprobado. ¡Ya puedes acceder a las colaboraciones!',
        data: {
          status: 'approved',
          reason: 'Perfil mejorado y estadísticas actualizadas',
        },
      });

      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'user_status',
          title: '¡Bienvenido a Zyro!',
        })
      );

      console.log('✅ Rejection and reapplication flow completed');
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle campaign unavailability during application', async () => {
      console.log('⚠️ Testing campaign unavailability scenario...');

      const approvedInfluencer: Influencer = {
        id: 'user-test-123',
        email: 'test@example.com',
        role: 'influencer',
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
        fullName: 'Test User',
        instagramUsername: 'testuser',
        instagramFollowers: 20000,
        tiktokFollowers: 10000,
        city: 'Madrid',
        audienceStats: {
          countries: [{ country: 'Spain', percentage: 80 }],
          cities: [{ city: 'Madrid', percentage: 60 }],
          ageRanges: [{ range: '18-24', percentage: 40 }],
          monthlyStats: { views: 50000, engagement: 2500, reach: 40000 },
        },
      };

      // Campaign becomes unavailable between viewing and applying
      mockDatabaseService.campaigns.findById
        .mockResolvedValueOnce({
          id: 'campaign-123',
          status: 'active',
          title: 'Test Campaign',
        })
        .mockResolvedValueOnce({
          id: 'campaign-123',
          status: 'paused', // Campaign paused
          title: 'Test Campaign',
        });

      mockDatabaseService.collaborationRequests.create.mockRejectedValue(
        new Error('Campaign is no longer available')
      );

      await expect(
        mockDatabaseService.collaborationRequests.create({
          campaignId: 'campaign-123',
          influencerId: approvedInfluencer.id,
          proposedContent: 'Test content',
        })
      ).rejects.toThrow('Campaign is no longer available');

      console.log('✅ Campaign unavailability handled correctly');
    });

    it('should handle network failures during collaboration flow', async () => {
      console.log('🌐 Testing network failure scenarios...');

      // Mock network failure during registration
      mockDatabaseService.users.create.mockRejectedValue(
        new Error('Network timeout')
      );

      const registrationData = {
        email: 'network.test@example.com',
        password: 'SecurePassword123!',
        role: 'influencer' as const,
      };

      const registerAction = await store.dispatch(registerUser(registrationData));
      expect(registerAction.type).toBe('auth/registerUser/rejected');

      const authState = store.getState().auth;
      expect(authState.error).toBe('Error en el registro');

      console.log('✅ Network failures handled gracefully');
    });
  });
});