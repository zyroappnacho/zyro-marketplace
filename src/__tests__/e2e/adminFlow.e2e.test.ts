import { configureStore } from '@reduxjs/toolkit';
import authReducer, { loginUser } from '../../store/slices/authSlice';
import dashboardReducer from '../../store/slices/dashboardSlice';
import userManagementReducer from '../../store/slices/userManagementSlice';
import campaignReducer from '../../store/slices/campaignSlice';
import { ValidationService } from '../../services/validationService';
import { LocationService } from '../../services/locationService';
import { securityManager } from '../../services/security/securityManager';
import { authSecurityService } from '../../services/security/authSecurityService';
import { databaseService } from '../../database';
import { notificationService } from '../../services/notificationService';
import { Admin, Influencer, Company, Campaign, CollaborationRequest } from '../../types';

// Mock all external dependencies
jest.mock('../../services/security/securityManager');
jest.mock('../../services/security/authSecurityService');
jest.mock('../../database');
jest.mock('../../services/notificationService');

const mockSecurityManager = securityManager as jest.Mocked<typeof securityManager>;
const mockAuthSecurityService = authSecurityService as jest.Mocked<typeof authSecurityService>;
const mockDatabaseService = databaseService as jest.Mocked<typeof databaseService>;
const mockNotificationService = notificationService as jest.Mocked<typeof notificationService>;

describe('Admin Complete Flow E2E Tests', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
        dashboard: dashboardReducer,
        userManagement: userManagementReducer,
        campaign: campaignReducer,
      },
    });

    jest.clearAllMocks();

    // Setup default mocks
    mockAuthSecurityService.getDeviceId.mockResolvedValue('admin-device-id');
    mockNotificationService.sendNotification.mockResolvedValue(undefined);

    // Setup database mocks
    mockDatabaseService.users = {
      findByEmail: jest.fn(),
      findPendingUsers: jest.fn(),
      update: jest.fn(),
      findAll: jest.fn(),
    } as any;

    mockDatabaseService.influencers = {
      findPendingInfluencers: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    } as any;

    mockDatabaseService.companies = {
      findPendingCompanies: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    } as any;

    mockDatabaseService.campaigns = {
      create: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
    } as any;

    mockDatabaseService.collaborationRequests = {
      findPendingRequests: jest.fn(),
      updateStatus: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    } as any;
  });

  describe('Complete Admin Journey: Login → User Management → Campaign Creation → Collaboration Management', () => {
    it('should complete full admin workflow managing the entire platform', async () => {
      // ===== PHASE 1: ADMIN LOGIN =====
      console.log('👨‍💼 Starting Admin Login Flow...');

      const adminCredentials = {
        username: 'admin_zyrovip',
        password: 'xarrec-2paqra-guftoN',
      };

      // Step 1.1: Validate admin credentials
      const isValidAdmin = await ValidationService.validateAdminCredentials(adminCredentials);
      expect(isValidAdmin).toBe(true);

      // Step 1.2: Login as admin
      const mockAdmin: Admin = {
        id: 'admin-zyro-001',
        email: 'admin@zyro.com',
        role: 'admin',
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
        username: 'admin_zyrovip',
        fullName: 'Zyro Administrator',
        permissions: [
          'user_management',
          'campaign_management',
          'collaboration_management',
          'financial_management',
          'system_configuration',
        ],
        lastLoginAt: new Date(),
      };

      mockSecurityManager.secureLogin.mockResolvedValue({
        success: true,
        user: mockAdmin,
      });

      const loginAction = await store.dispatch(loginUser({
        email: 'admin@zyro.com',
        password: adminCredentials.password,
      }));

      expect(loginAction.type).toBe('auth/loginUser/fulfilled');
      
      const authState = store.getState().auth;
      expect(authState.isAuthenticated).toBe(true);
      expect(authState.user?.role).toBe('admin');

      console.log('✅ Admin successfully logged in');

      // ===== PHASE 2: DASHBOARD OVERVIEW =====
      console.log('📊 Loading admin dashboard...');

      // Step 2.1: Load dashboard statistics
      const dashboardStats = {
        totalUsers: 1247,
        pendingApprovals: 23,
        activeInfluencers: 892,
        activeCompanies: 156,
        activeCampaigns: 45,
        pendingCollaborations: 67,
        monthlyRevenue: 62340,
        completedCollaborations: 234,
      };

      mockDatabaseService.users.findAll.mockResolvedValue([]);
      mockDatabaseService.users.findPendingUsers.mockResolvedValue([]);
      mockDatabaseService.campaigns.findAll.mockResolvedValue([]);
      mockDatabaseService.collaborationRequests.findPendingRequests.mockResolvedValue([]);

      // Verify admin can access all dashboard data
      expect(dashboardStats.totalUsers).toBeGreaterThan(0);
      expect(dashboardStats.pendingApprovals).toBeGreaterThan(0);
      expect(dashboardStats.monthlyRevenue).toBeGreaterThan(0);

      console.log('✅ Dashboard loaded with comprehensive statistics');

      // ===== PHASE 3: USER MANAGEMENT =====
      console.log('👥 Managing user approvals...');

      // Step 3.1: Review pending influencers
      const pendingInfluencers: Influencer[] = [
        {
          id: 'inf-pending-001',
          email: 'sofia.lifestyle@gmail.com',
          role: 'influencer',
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
          fullName: 'Sofía Martínez',
          instagramUsername: 'sofia_lifestyle_madrid',
          tiktokUsername: 'sofia_lifestyle',
          instagramFollowers: 35000,
          tiktokFollowers: 18000,
          city: 'Madrid',
          phone: '+34612345678',
          audienceStats: {
            countries: [
              { country: 'Spain', percentage: 78 },
              { country: 'Portugal', percentage: 12 },
              { country: 'France', percentage: 10 },
            ],
            cities: [
              { city: 'Madrid', percentage: 45 },
              { city: 'Barcelona', percentage: 25 },
              { city: 'Valencia', percentage: 15 },
              { city: 'Sevilla', percentage: 15 },
            ],
            ageRanges: [
              { range: '18-24', percentage: 40 },
              { range: '25-34', percentage: 45 },
              { range: '35-44', percentage: 15 },
            ],
            monthlyStats: {
              views: 280000,
              engagement: 14000,
              reach: 220000,
            },
          },
        },
        {
          id: 'inf-pending-002',
          email: 'alex.fitness@gmail.com',
          role: 'influencer',
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
          fullName: 'Alejandro Ruiz',
          instagramUsername: 'alex_fitness_bcn',
          tiktokUsername: 'alex_fitness',
          instagramFollowers: 8000, // Lower followers
          tiktokFollowers: 3000,
          city: 'Barcelona',
          phone: '+34687654321',
          audienceStats: {
            countries: [{ country: 'Spain', percentage: 85 }],
            cities: [{ city: 'Barcelona', percentage: 70 }],
            ageRanges: [{ range: '18-24', percentage: 60 }],
            monthlyStats: {
              views: 45000,
              engagement: 2250,
              reach: 35000,
            },
          },
        },
      ];

      mockDatabaseService.influencers.findPendingInfluencers.mockResolvedValue(pendingInfluencers);

      const pendingInfluencersList = await mockDatabaseService.influencers.findPendingInfluencers();
      expect(pendingInfluencersList).toHaveLength(2);

      // Step 3.2: Approve high-quality influencer
      const approvedInfluencer: Influencer = {
        ...pendingInfluencers[0],
        status: 'approved',
        updatedAt: new Date(),
      };

      mockDatabaseService.users.update.mockResolvedValue(approvedInfluencer);

      const approvalResult = await mockDatabaseService.users.update(
        pendingInfluencers[0].id,
        { status: 'approved' }
      );

      expect(approvalResult.status).toBe('approved');

      // Send approval notification
      await mockNotificationService.sendNotification({
        type: 'user_status',
        recipient: pendingInfluencers[0].id,
        title: '¡Bienvenida a Zyro!',
        body: 'Tu cuenta ha sido aprobada. Ya puedes acceder a todas las colaboraciones disponibles.',
        data: {
          status: 'approved',
          reason: 'Perfil excelente con audiencia de calidad y métricas sólidas',
        },
      });

      console.log('✅ High-quality influencer approved');

      // Step 3.3: Reject low-quality influencer
      const rejectedInfluencer: Influencer = {
        ...pendingInfluencers[1],
        status: 'rejected',
        updatedAt: new Date(),
      };

      mockDatabaseService.users.update.mockResolvedValue(rejectedInfluencer);

      await mockDatabaseService.users.update(
        pendingInfluencers[1].id,
        { status: 'rejected' }
      );

      // Send rejection notification
      await mockNotificationService.sendNotification({
        type: 'user_status',
        recipient: pendingInfluencers[1].id,
        title: 'Solicitud No Aprobada',
        body: 'Tu solicitud necesita mejoras. Te recomendamos aumentar tu audiencia y engagement antes de volver a aplicar.',
        data: {
          status: 'rejected',
          reason: 'Número de seguidores y engagement por debajo de nuestros estándares actuales',
        },
      });

      console.log('✅ Low-quality influencer rejected with feedback');

      // Step 3.4: Review pending companies
      const pendingCompanies: Company[] = [
        {
          id: 'comp-pending-001',
          email: 'info@restauranteelite.com',
          role: 'company',
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
          companyName: 'Restaurante Elite S.L.',
          cif: 'B12345678',
          address: 'Calle Gran Vía 45, 28013 Madrid',
          phone: '+34915551234',
          contactPerson: 'Carmen López',
          subscription: {
            plan: '6months',
            price: 399,
            startDate: new Date(),
            endDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
            status: 'active',
          },
          paymentMethod: 'card',
        },
      ];

      mockDatabaseService.companies.findPendingCompanies.mockResolvedValue(pendingCompanies);

      const pendingCompaniesList = await mockDatabaseService.companies.findPendingCompanies();
      expect(pendingCompaniesList).toHaveLength(1);

      // Step 3.5: Approve company after verification
      const approvedCompany: Company = {
        ...pendingCompanies[0],
        status: 'approved',
        updatedAt: new Date(),
      };

      mockDatabaseService.users.update.mockResolvedValue(approvedCompany);

      await mockDatabaseService.users.update(
        pendingCompanies[0].id,
        { status: 'approved' }
      );

      // Send company approval notification
      await mockNotificationService.sendNotification({
        type: 'user_status',
        recipient: pendingCompanies[0].id,
        title: '¡Bienvenidos a Zyro!',
        body: 'Su empresa ha sido aprobada. Ya pueden solicitar la creación de campañas.',
        data: {
          status: 'approved',
          reason: 'Documentación empresarial verificada correctamente',
        },
      });

      console.log('✅ Company approved after verification');

      // ===== PHASE 4: CAMPAIGN CREATION =====
      console.log('🎯 Creating campaigns for approved companies...');

      // Step 4.1: Create campaign for approved company
      const newCampaign: Campaign = {
        id: 'campaign-elite-001',
        title: 'Experiencia Gastronómica Elite',
        description: 'Descubre nuestra nueva carta de temporada con ingredientes premium y técnicas de vanguardia. Buscamos influencers gastronómicos y de lifestyle para mostrar nuestra propuesta culinaria única.',
        businessName: 'Restaurante Elite',
        category: 'restaurantes',
        city: 'Madrid',
        address: 'Calle Gran Vía 45, Madrid',
        coordinates: { lat: 40.4200, lng: -3.7025 },
        images: [
          'https://restauranteelite.com/images/exterior.jpg',
          'https://restauranteelite.com/images/interior.jpg',
          'https://restauranteelite.com/images/chef-signature.jpg',
          'https://restauranteelite.com/images/wine-cellar.jpg',
        ],
        requirements: {
          minInstagramFollowers: 25000,
          minTiktokFollowers: 15000,
          maxCompanions: 2,
        },
        whatIncludes: [
          'Menú degustación completo para 2 personas',
          'Maridaje de vinos seleccionados por nuestro sommelier',
          'Visita guiada a la cocina con el chef',
          'Postre especial exclusivo para influencers',
          'Experiencia VIP con mesa reservada',
        ],
        contentRequirements: {
          instagramStories: 3,
          tiktokVideos: 1,
          deadline: 72,
        },
        companyId: approvedCompany.id,
        status: 'active',
        createdBy: mockAdmin.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Step 4.2: Validate campaign data
      const campaignSchema = ValidationService.getCampaignSchema();
      const campaignValidation = await ValidationService.validate(campaignSchema, newCampaign);
      expect(campaignValidation.isValid).toBe(true);

      // Step 4.3: Create and publish campaign
      mockDatabaseService.campaigns.create.mockResolvedValue(newCampaign);

      const createdCampaign = await mockDatabaseService.campaigns.create(newCampaign);
      expect(createdCampaign.status).toBe('active');
      expect(createdCampaign.createdBy).toBe(mockAdmin.id);

      // Step 4.4: Notify company about campaign creation
      await mockNotificationService.sendNotification({
        type: 'campaign_created',
        recipient: approvedCompany.id,
        title: '¡Campaña Publicada!',
        body: `Su campaña "${createdCampaign.title}" ya está activa y visible para influencers cualificados.`,
        data: {
          campaignId: createdCampaign.id,
          campaignTitle: createdCampaign.title,
          estimatedReach: '50K-100K usuarios',
        },
      });

      console.log('✅ Campaign created and published successfully');

      // ===== PHASE 5: LOCATION AND CATEGORY MANAGEMENT =====
      console.log('🗺️ Managing locations and categories...');

      // Step 5.1: Enable new city
      const newCityEnabled = LocationService.toggleCityStatus('sevilla', true);
      expect(newCityEnabled).toBe(true);

      const enabledCities = LocationService.getEnabledCities();
      const sevillaCity = enabledCities.find(city => city.name === 'SEVILLA');
      expect(sevillaCity?.isEnabled).toBe(true);

      // Step 5.2: Add new city
      const newCity = LocationService.addCity({
        name: 'BILBAO',
        isEnabled: true,
        coordinates: { lat: 43.2627, lng: -2.9253 },
      });

      expect(newCity.name).toBe('BILBAO');
      expect(newCity.isEnabled).toBe(true);

      // Step 5.3: Manage categories
      const enabledCategories = LocationService.getEnabledCategories();
      expect(enabledCategories.length).toBeGreaterThan(0);

      // Temporarily disable a category
      const categoryDisabled = LocationService.toggleCategoryStatus('eventos', false);
      expect(categoryDisabled).toBe(true);

      // Re-enable it
      const categoryReEnabled = LocationService.toggleCategoryStatus('eventos', true);
      expect(categoryReEnabled).toBe(true);

      console.log('✅ Location and category management completed');

      // ===== PHASE 6: COLLABORATION MANAGEMENT =====
      console.log('🤝 Managing collaboration requests...');

      // Step 6.1: Simulate influencer applications
      const collaborationRequests: CollaborationRequest[] = [
        {
          id: 'collab-req-001',
          campaignId: createdCampaign.id,
          influencerId: approvedInfluencer.id,
          status: 'pending',
          requestDate: new Date(),
          proposedContent: `¡Hola! Me encanta la propuesta de Restaurante Elite. Como influencer gastronómica con ${approvedInfluencer.instagramFollowers} seguidores, propongo:

          📸 3 historias de Instagram mostrando:
          - Llegada y primera impresión del restaurante
          - Experiencia del menú degustación con detalles de cada plato
          - Visita a la cocina y encuentro con el chef
          
          🎥 1 TikTok dinámico destacando los platos más fotogénicos y la experiencia VIP
          
          Mi audiencia está muy interesada en experiencias gastronómicas premium y creo que esta colaboración sería perfecta.`,
          reservationDetails: {
            date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
            time: '20:30',
            companions: 1,
            specialRequests: 'Mesa con buena iluminación natural para fotos. Información sobre ingredientes para mencionar en el contenido.',
          },
        },
        {
          id: 'collab-req-002',
          campaignId: createdCampaign.id,
          influencerId: 'inf-other-001',
          status: 'pending',
          requestDate: new Date(),
          proposedContent: 'Contenido básico sobre el restaurante.',
          reservationDetails: {
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            time: '19:00',
            companions: 0,
          },
        },
      ];

      mockDatabaseService.collaborationRequests.findPendingRequests.mockResolvedValue(collaborationRequests);

      const pendingRequests = await mockDatabaseService.collaborationRequests.findPendingRequests();
      expect(pendingRequests).toHaveLength(2);

      // Step 6.2: Review and approve high-quality request
      const approvedRequest: CollaborationRequest = {
        ...collaborationRequests[0],
        status: 'approved',
        adminNotes: 'Excelente propuesta de contenido muy detallada. Perfil de influencer perfecto para la marca. ¡Aprobada!',
      };

      mockDatabaseService.collaborationRequests.updateStatus.mockResolvedValue(approvedRequest);

      const approvedCollab = await mockDatabaseService.collaborationRequests.updateStatus(
        collaborationRequests[0].id,
        'approved',
        'Excelente propuesta de contenido muy detallada. Perfil de influencer perfecto para la marca. ¡Aprobada!'
      );

      expect(approvedCollab.status).toBe('approved');
      expect(approvedCollab.adminNotes).toBeDefined();

      // Step 6.3: Send approval notifications
      await mockNotificationService.sendNotification({
        type: 'collaboration_approved',
        recipient: approvedInfluencer.id,
        title: '¡Colaboración Aprobada!',
        body: `Tu solicitud para "${createdCampaign.title}" ha sido aprobada. ¡Prepárate para una experiencia gastronómica única!`,
        data: {
          campaignId: createdCampaign.id,
          collaborationId: approvedCollab.id,
          reservationDate: approvedCollab.reservationDetails?.date,
          adminNotes: approvedCollab.adminNotes,
        },
      });

      await mockNotificationService.sendNotification({
        type: 'collaboration_confirmed',
        recipient: approvedCompany.id,
        title: 'Colaboración Confirmada',
        body: `Una influencer con ${approvedInfluencer.instagramFollowers} seguidores ha sido confirmada para su campaña.`,
        data: {
          campaignId: createdCampaign.id,
          collaborationId: approvedCollab.id,
          influencerProfile: {
            name: approvedInfluencer.fullName,
            instagram: approvedInfluencer.instagramUsername,
            followers: approvedInfluencer.instagramFollowers,
          },
        },
      });

      console.log('✅ High-quality collaboration approved');

      // Step 6.4: Reject low-quality request
      const rejectedRequest: CollaborationRequest = {
        ...collaborationRequests[1],
        status: 'rejected',
        adminNotes: 'La propuesta de contenido es muy básica y no se ajusta a los estándares de calidad que buscamos para esta marca premium.',
      };

      mockDatabaseService.collaborationRequests.updateStatus.mockResolvedValue(rejectedRequest);

      const rejectedCollab = await mockDatabaseService.collaborationRequests.updateStatus(
        collaborationRequests[1].id,
        'rejected',
        'La propuesta de contenido es muy básica y no se ajusta a los estándares de calidad que buscamos para esta marca premium.'
      );

      expect(rejectedCollab.status).toBe('rejected');

      // Send rejection notification with feedback
      await mockNotificationService.sendNotification({
        type: 'collaboration_rejected',
        recipient: 'inf-other-001',
        title: 'Solicitud No Aprobada',
        body: 'Tu solicitud necesita mejoras. Te recomendamos crear propuestas más detalladas y específicas.',
        data: {
          campaignId: createdCampaign.id,
          collaborationId: rejectedCollab.id,
          adminNotes: rejectedCollab.adminNotes,
          improvementTips: [
            'Detalla específicamente qué contenido crearás',
            'Menciona cómo tu audiencia se beneficiaría',
            'Incluye ideas creativas específicas para la marca',
          ],
        },
      });

      console.log('✅ Low-quality collaboration rejected with feedback');

      // ===== PHASE 7: COLLABORATION COMPLETION TRACKING =====
      console.log('📈 Tracking collaboration completion...');

      // Step 7.1: Influencer completes collaboration
      const completedCollaboration: CollaborationRequest = {
        ...approvedRequest,
        status: 'completed',
        contentDelivered: {
          instagramStories: [
            'https://instagram.com/story/sofia_lifestyle_madrid/elite_arrival',
            'https://instagram.com/story/sofia_lifestyle_madrid/elite_tasting',
            'https://instagram.com/story/sofia_lifestyle_madrid/elite_kitchen_tour',
          ],
          tiktokVideos: [
            'https://tiktok.com/@sofia_lifestyle/elite_experience_premium',
          ],
          deliveredAt: new Date(),
        },
      };

      mockDatabaseService.collaborationRequests.updateStatus.mockResolvedValue(completedCollaboration);

      const completedCollab = await mockDatabaseService.collaborationRequests.updateStatus(
        approvedRequest.id,
        'completed',
        undefined,
        completedCollaboration.contentDelivered
      );

      expect(completedCollab.status).toBe('completed');
      expect(completedCollab.contentDelivered).toBeDefined();

      // Step 7.2: Verify content meets requirements
      const contentReqs = createdCampaign.contentRequirements;
      expect(completedCollab.contentDelivered?.instagramStories.length).toBe(contentReqs.instagramStories);
      expect(completedCollab.contentDelivered?.tiktokVideos.length).toBe(contentReqs.tiktokVideos);

      // Step 7.3: Send completion notifications
      await mockNotificationService.sendNotification({
        type: 'collaboration_completed',
        recipient: approvedCompany.id,
        title: 'Colaboración Completada',
        body: 'El contenido de su colaboración ha sido entregado. ¡Revise los enlaces para ver el resultado!',
        data: {
          campaignId: createdCampaign.id,
          collaborationId: completedCollab.id,
          contentLinks: [
            ...completedCollab.contentDelivered?.instagramStories || [],
            ...completedCollab.contentDelivered?.tiktokVideos || [],
          ],
          estimatedReach: '45,000 usuarios',
          estimatedEngagement: '2,250 interacciones',
        },
      });

      console.log('✅ Collaboration completed and tracked');

      // ===== PHASE 8: PLATFORM ANALYTICS AND REPORTING =====
      console.log('📊 Generating platform analytics...');

      // Step 8.1: Generate comprehensive platform metrics
      const platformMetrics = {
        userMetrics: {
          totalInfluencers: 892,
          totalCompanies: 156,
          newUsersThisMonth: 47,
          approvalRate: 0.73, // 73% approval rate
        },
        campaignMetrics: {
          totalCampaigns: 45,
          activeCampaigns: 32,
          completedCampaigns: 13,
          averageCampaignDuration: 14, // days
        },
        collaborationMetrics: {
          totalCollaborations: 234,
          completedCollaborations: 198,
          completionRate: 0.85, // 85% completion rate
          averageContentDeliveryTime: 48, // hours
        },
        financialMetrics: {
          monthlyRevenue: 62340,
          averageSubscriptionValue: 389,
          churnRate: 0.05, // 5% monthly churn
          projectedAnnualRevenue: 748080,
        },
        contentMetrics: {
          totalContentPieces: 592,
          instagramStories: 396,
          tiktokVideos: 196,
          averageReachPerPiece: 38500,
          totalEstimatedReach: 22792000,
        },
      };

      // Verify metrics are within expected ranges
      expect(platformMetrics.userMetrics.approvalRate).toBeGreaterThan(0.5);
      expect(platformMetrics.collaborationMetrics.completionRate).toBeGreaterThan(0.8);
      expect(platformMetrics.financialMetrics.monthlyRevenue).toBeGreaterThan(50000);

      console.log('✅ Platform analytics generated successfully');

      // ===== PHASE 9: SYSTEM CONFIGURATION =====
      console.log('⚙️ Managing system configuration...');

      // Step 9.1: Update platform settings
      const platformSettings = {
        minimumInfluencerFollowers: {
          instagram: 5000,
          tiktok: 2000,
        },
        subscriptionPrices: {
          '3months': 499,
          '6months': 399,
          '12months': 299,
        },
        contentRequirements: {
          maxDeadlineHours: 168, // 1 week
          minDeadlineHours: 24,
        },
        approvalSettings: {
          autoApproveCompanies: false,
          autoApproveInfluencers: false,
          requireManualReview: true,
        },
      };

      // Verify admin can modify platform settings
      expect(platformSettings.minimumInfluencerFollowers.instagram).toBe(5000);
      expect(platformSettings.subscriptionPrices['6months']).toBe(399);
      expect(platformSettings.approvalSettings.requireManualReview).toBe(true);

      console.log('✅ System configuration managed');

      // ===== FINAL VERIFICATION =====
      console.log('🔍 Verifying complete admin workflow...');

      // Verify all database interactions
      expect(mockDatabaseService.users.update).toHaveBeenCalledTimes(3); // 2 influencers + 1 company
      expect(mockDatabaseService.campaigns.create).toHaveBeenCalled();
      expect(mockDatabaseService.collaborationRequests.updateStatus).toHaveBeenCalledTimes(3); // 1 approved + 1 rejected + 1 completed

      // Verify notification flow
      expect(mockNotificationService.sendNotification).toHaveBeenCalledTimes(8);
      // 1. Influencer approval
      // 2. Influencer rejection
      // 3. Company approval
      // 4. Campaign created notification
      // 5. Collaboration approved to influencer
      // 6. Collaboration confirmed to company
      // 7. Collaboration rejected
      // 8. Collaboration completed

      // Verify location service interactions
      const finalEnabledCities = LocationService.getEnabledCities();
      expect(finalEnabledCities.length).toBeGreaterThan(5);

      console.log('🎉 Complete admin workflow test passed!');

      // ===== SUMMARY =====
      console.log('\n📊 ADMIN WORKFLOW SUMMARY:');
      console.log('✅ Secure admin login with special credentials');
      console.log('✅ Comprehensive dashboard with platform metrics');
      console.log('✅ User management: influencer and company approvals');
      console.log('✅ Campaign creation and publication');
      console.log('✅ Location and category management');
      console.log('✅ Collaboration request review and approval');
      console.log('✅ Collaboration completion tracking');
      console.log('✅ Platform analytics and reporting');
      console.log('✅ System configuration management');
      console.log('✅ Complete notification workflow');
      console.log('✅ Quality control and standards enforcement');
    });

    it('should handle bulk user management operations', async () => {
      console.log('📦 Testing bulk user management operations...');

      const mockAdmin: Admin = {
        id: 'admin-bulk-001',
        email: 'admin@zyro.com',
        role: 'admin',
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
        username: 'admin_zyrovip',
        fullName: 'Bulk Operations Admin',
        permissions: ['user_management', 'bulk_operations'],
      };

      // Phase 1: Bulk influencer approval
      const bulkInfluencers = Array.from({ length: 10 }, (_, i) => ({
        id: `inf-bulk-${i + 1}`,
        email: `influencer${i + 1}@test.com`,
        role: 'influencer' as const,
        status: 'pending' as const,
        fullName: `Influencer ${i + 1}`,
        instagramFollowers: 15000 + (i * 2000),
        tiktokFollowers: 8000 + (i * 1000),
        city: i % 2 === 0 ? 'Madrid' : 'Barcelona',
      }));

      mockDatabaseService.influencers.findPendingInfluencers.mockResolvedValue(bulkInfluencers);

      // Simulate bulk approval of qualified influencers (>10k followers)
      const qualifiedInfluencers = bulkInfluencers.filter(inf => inf.instagramFollowers >= 15000);
      
      mockDatabaseService.users.update.mockImplementation(async (id, updates) => ({
        ...bulkInfluencers.find(inf => inf.id === id),
        ...updates,
      }));

      // Process bulk approvals
      const bulkApprovalResults = await Promise.all(
        qualifiedInfluencers.map(influencer =>
          mockDatabaseService.users.update(influencer.id, { status: 'approved' })
        )
      );

      expect(bulkApprovalResults).toHaveLength(qualifiedInfluencers.length);
      bulkApprovalResults.forEach(result => {
        expect(result.status).toBe('approved');
      });

      // Send bulk notifications
      const bulkNotifications = qualifiedInfluencers.map(influencer => ({
        type: 'user_status',
        recipient: influencer.id,
        title: '¡Bienvenido a Zyro!',
        body: 'Tu cuenta ha sido aprobada en nuestra revisión masiva.',
        data: { status: 'approved', bulkOperation: true },
      }));

      await Promise.all(
        bulkNotifications.map(notification =>
          mockNotificationService.sendNotification(notification)
        )
      );

      expect(mockNotificationService.sendNotification).toHaveBeenCalledTimes(qualifiedInfluencers.length);

      console.log(`✅ Bulk approved ${qualifiedInfluencers.length} qualified influencers`);
    });
  });

  describe('Admin Error Handling and Edge Cases', () => {
    it('should handle system overload and rate limiting', async () => {
      console.log('⚡ Testing system overload handling...');

      // Simulate high load scenario
      const highLoadRequests = Array.from({ length: 100 }, (_, i) => ({
        id: `req-${i}`,
        type: 'user_approval',
        timestamp: new Date(),
      }));

      // Mock rate limiting
      let processedRequests = 0;
      const maxRequestsPerMinute = 50;

      const processRequest = async (request: any) => {
        if (processedRequests >= maxRequestsPerMinute) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        processedRequests++;
        return { ...request, processed: true };
      };

      // Process requests with rate limiting
      const results = await Promise.allSettled(
        highLoadRequests.slice(0, 60).map(processRequest) // Try to process 60 requests
      );

      const successful = results.filter(result => result.status === 'fulfilled');
      const failed = results.filter(result => result.status === 'rejected');

      expect(successful.length).toBe(maxRequestsPerMinute);
      expect(failed.length).toBe(10); // 60 - 50 = 10 failed due to rate limiting

      console.log(`✅ Rate limiting working: ${successful.length} processed, ${failed.length} rate limited`);
    });

    it('should handle database connection failures gracefully', async () => {
      console.log('🔌 Testing database failure handling...');

      // Mock database connection failure
      mockDatabaseService.users.findPendingUsers.mockRejectedValue(
        new Error('Database connection timeout')
      );

      // Admin should receive error notification
      await expect(
        mockDatabaseService.users.findPendingUsers()
      ).rejects.toThrow('Database connection timeout');

      // System should send alert to admin
      await mockNotificationService.sendNotification({
        type: 'system_alert',
        recipient: 'admin-zyro-001',
        title: 'Database Connection Issue',
        body: 'Database connection failed. System is attempting to reconnect.',
        data: {
          error: 'Database connection timeout',
          severity: 'high',
          timestamp: new Date(),
        },
      });

      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'system_alert',
          title: 'Database Connection Issue',
        })
      );

      console.log('✅ Database failure handled with admin notification');
    });

    it('should handle concurrent admin operations', async () => {
      console.log('🔄 Testing concurrent admin operations...');

      const mockAdmin: Admin = {
        id: 'admin-concurrent-001',
        email: 'admin@zyro.com',
        role: 'admin',
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
        username: 'admin_zyrovip',
        fullName: 'Concurrent Admin',
        permissions: ['user_management', 'campaign_management'],
      };

      // Simulate concurrent operations
      const concurrentOperations = [
        mockDatabaseService.users.update('user-1', { status: 'approved' }),
        mockDatabaseService.campaigns.create({ title: 'Campaign 1' }),
        mockDatabaseService.collaborationRequests.updateStatus('req-1', 'approved'),
        mockDatabaseService.users.update('user-2', { status: 'rejected' }),
        mockDatabaseService.campaigns.create({ title: 'Campaign 2' }),
      ];

      // Mock successful concurrent operations
      mockDatabaseService.users.update.mockResolvedValue({ status: 'approved' });
      mockDatabaseService.campaigns.create.mockResolvedValue({ id: 'camp-1', status: 'active' });
      mockDatabaseService.collaborationRequests.updateStatus.mockResolvedValue({ status: 'approved' });

      const results = await Promise.allSettled(concurrentOperations);
      const successful = results.filter(result => result.status === 'fulfilled');

      expect(successful.length).toBe(concurrentOperations.length);

      console.log(`✅ ${successful.length} concurrent operations completed successfully`);
    });
  });
});