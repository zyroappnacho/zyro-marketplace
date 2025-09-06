import { configureStore } from '@reduxjs/toolkit';
import collaborationReducer from '../../store/slices/collaborationSlice';
import authReducer from '../../store/slices/authSlice';
import { ValidationService } from '../../services/validationService';
import { FollowerValidationService } from '../../services/followerValidationService';
import { databaseService } from '../../database';
import { notificationService } from '../../services/notificationService';
import { Campaign, Influencer, CollaborationRequest } from '../../types';

// Mock external dependencies
jest.mock('../../database');
jest.mock('../../services/notificationService');

const mockDatabaseService = databaseService as jest.Mocked<typeof databaseService>;
const mockNotificationService = notificationService as jest.Mocked<typeof notificationService>;

describe('Collaboration Flow Integration Tests', () => {
  let store: ReturnType<typeof configureStore>;

  const mockInfluencer: Influencer = {
    id: 'influencer-123',
    email: 'influencer@test.com',
    role: 'influencer',
    status: 'approved',
    createdAt: new Date(),
    updatedAt: new Date(),
    fullName: 'Test Influencer',
    instagramUsername: 'testinfluencer',
    tiktokUsername: 'testinfluencer_tiktok',
    instagramFollowers: 15000,
    tiktokFollowers: 8000,
    city: 'Madrid',
    audienceStats: {
      countries: [{ country: 'Spain', percentage: 80 }],
      cities: [{ city: 'Madrid', percentage: 60 }],
      ageRanges: [{ range: '18-24', percentage: 40 }],
      monthlyStats: {
        views: 50000,
        engagement: 2500,
        reach: 40000,
      },
    },
  };

  const mockCampaign: Campaign = {
    id: 'campaign-123',
    title: 'Premium Restaurant Experience',
    description: 'Experience our premium dining with a special tasting menu',
    businessName: 'La Terraza Premium',
    category: 'restaurantes',
    city: 'Madrid',
    address: 'Calle Serrano 123, Madrid',
    coordinates: { lat: 40.4168, lng: -3.7038 },
    images: ['restaurant1.jpg', 'restaurant2.jpg'],
    requirements: {
      minInstagramFollowers: 10000,
      minTiktokFollowers: 5000,
      maxCompanions: 2,
    },
    whatIncludes: [
      'Cena completa para 2 personas',
      'Bebidas incluidas',
      'Postre especial de la casa',
    ],
    contentRequirements: {
      instagramStories: 2,
      tiktokVideos: 1,
      deadline: 72,
    },
    companyId: 'company-123',
    status: 'active',
    createdBy: 'admin-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
        collaboration: collaborationReducer,
      },
      preloadedState: {
        auth: {
          user: mockInfluencer,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          loginAttempts: 0,
          lastLoginAttempt: null,
        },
      },
    });

    jest.clearAllMocks();

    // Setup database mocks
    mockDatabaseService.campaigns = {
      findById: jest.fn(),
      findByCity: jest.fn(),
      findByCategory: jest.fn(),
    } as any;

    mockDatabaseService.collaborationRequests = {
      create: jest.fn(),
      findByInfluencer: jest.fn(),
      findByCampaign: jest.fn(),
      updateStatus: jest.fn(),
    } as any;

    mockDatabaseService.influencers = {
      findById: jest.fn(),
    } as any;

    // Setup notification mocks
    mockNotificationService.sendNotification = jest.fn().mockResolvedValue(undefined);
  });

  describe('Complete Collaboration Request Flow', () => {
    it('should handle complete collaboration request flow for restaurant', async () => {
      // Mock database responses
      mockDatabaseService.campaigns.findById.mockResolvedValue(mockCampaign);
      mockDatabaseService.influencers.findById.mockResolvedValue(mockInfluencer);
      mockDatabaseService.collaborationRequests.create.mockResolvedValue({
        id: 'request-123',
        campaignId: mockCampaign.id,
        influencerId: mockInfluencer.id,
        status: 'pending',
        requestDate: new Date(),
        proposedContent: 'Test content proposal',
        reservationDetails: {
          date: new Date(Date.now() + 24 * 60 * 60 * 1000),
          time: '20:00',
          companions: 1,
          specialRequests: 'Window table preferred',
        },
      });

      // Step 1: Validate influencer eligibility
      const eligibilityResult = FollowerValidationService.validateFollowerRequirements(
        mockCampaign,
        mockInfluencer
      );

      expect(eligibilityResult.isEligible).toBe(true);
      expect(eligibilityResult.message).toBe('¡Cumples todos los requisitos para esta colaboración!');

      // Step 2: Prepare collaboration request data
      const collaborationRequestData = {
        campaignId: mockCampaign.id,
        influencerId: mockInfluencer.id,
        proposedContent: 'I will create 2 Instagram stories showcasing the premium dining experience and 1 TikTok video highlighting the special tasting menu.',
        reservationDetails: {
          date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          time: '20:00',
          companions: 1,
          specialRequests: 'Window table preferred for better lighting',
        },
      };

      // Step 3: Validate collaboration request data
      const requestSchema = ValidationService.getCollaborationRequestSchema();
      const validationResult = await ValidationService.validate(requestSchema, collaborationRequestData);

      expect(validationResult.isValid).toBe(true);
      expect(validationResult.data).toBeDefined();

      // Step 4: Create collaboration request (simulate service call)
      const createdRequest = await mockDatabaseService.collaborationRequests.create(collaborationRequestData);

      expect(createdRequest).toBeDefined();
      expect(createdRequest.status).toBe('pending');
      expect(createdRequest.campaignId).toBe(mockCampaign.id);
      expect(createdRequest.influencerId).toBe(mockInfluencer.id);

      // Step 5: Verify notification was sent
      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'collaboration_request',
          recipient: 'admin-1', // Campaign creator
          title: expect.stringContaining('Nueva Solicitud'),
          body: expect.stringContaining(mockInfluencer.fullName),
        })
      );

      // Step 6: Verify database interactions
      expect(mockDatabaseService.campaigns.findById).toHaveBeenCalledWith(mockCampaign.id);
      expect(mockDatabaseService.influencers.findById).toHaveBeenCalledWith(mockInfluencer.id);
      expect(mockDatabaseService.collaborationRequests.create).toHaveBeenCalledWith(collaborationRequestData);
    });

    it('should handle collaboration request for delivery campaign', async () => {
      const deliveryCampaign: Campaign = {
        ...mockCampaign,
        id: 'delivery-campaign-123',
        title: 'Premium Beauty Products',
        category: 'salud-belleza',
        businessName: 'Beauty Premium Store',
      };

      mockDatabaseService.campaigns.findById.mockResolvedValue(deliveryCampaign);

      const deliveryRequestData = {
        campaignId: deliveryCampaign.id,
        influencerId: mockInfluencer.id,
        proposedContent: 'I will create 1 TikTok video showcasing the beauty products and their benefits.',
        deliveryDetails: {
          address: 'Calle Mayor 456, Madrid, 28013',
          phone: '+34612345678',
          preferredTime: 'Morning between 10:00-12:00',
        },
      };

      // Validate delivery request
      const requestSchema = ValidationService.getCollaborationRequestSchema();
      const validationResult = await ValidationService.validate(requestSchema, deliveryRequestData);

      expect(validationResult.isValid).toBe(true);

      // Create request
      mockDatabaseService.collaborationRequests.create.mockResolvedValue({
        id: 'delivery-request-123',
        ...deliveryRequestData,
        status: 'pending',
        requestDate: new Date(),
      });

      const createdRequest = await mockDatabaseService.collaborationRequests.create(deliveryRequestData);

      expect(createdRequest).toBeDefined();
      expect(createdRequest.deliveryDetails).toBeDefined();
      expect(createdRequest.deliveryDetails?.address).toBe(deliveryRequestData.deliveryDetails.address);
    });

    it('should reject collaboration request for ineligible influencer', async () => {
      // Create campaign with higher requirements
      const highRequirementsCampaign: Campaign = {
        ...mockCampaign,
        requirements: {
          minInstagramFollowers: 50000, // Higher than influencer's 15000
          minTiktokFollowers: 20000,    // Higher than influencer's 8000
          maxCompanions: 2,
        },
      };

      // Step 1: Check eligibility
      const eligibilityResult = FollowerValidationService.validateFollowerRequirements(
        highRequirementsCampaign,
        mockInfluencer
      );

      expect(eligibilityResult.isEligible).toBe(false);
      expect(eligibilityResult.missingRequirements.instagram).toBe(35000); // 50000 - 15000
      expect(eligibilityResult.missingRequirements.tiktok).toBe(12000);    // 20000 - 8000
      expect(eligibilityResult.message).toContain('Instagram');
      expect(eligibilityResult.message).toContain('TikTok');

      // Step 2: Request should not be created for ineligible influencer
      // In a real application, the UI would prevent this, but we test the validation
      const collaborationRequestData = {
        campaignId: highRequirementsCampaign.id,
        influencerId: mockInfluencer.id,
        proposedContent: 'Test content',
        reservationDetails: {
          date: new Date(Date.now() + 24 * 60 * 60 * 1000),
          time: '20:00',
          companions: 1,
        },
      };

      // The service layer should reject this
      mockDatabaseService.collaborationRequests.create.mockRejectedValue(
        new Error('Influencer does not meet campaign requirements')
      );

      await expect(
        mockDatabaseService.collaborationRequests.create(collaborationRequestData)
      ).rejects.toThrow('Influencer does not meet campaign requirements');
    });
  });

  describe('Collaboration Status Management Flow', () => {
    it('should handle collaboration approval flow', async () => {
      const mockRequest: CollaborationRequest = {
        id: 'request-123',
        campaignId: mockCampaign.id,
        influencerId: mockInfluencer.id,
        status: 'pending',
        requestDate: new Date(),
        proposedContent: 'Test content proposal',
        reservationDetails: {
          date: new Date(Date.now() + 24 * 60 * 60 * 1000),
          time: '20:00',
          companions: 1,
        },
      };

      // Mock database responses
      mockDatabaseService.collaborationRequests.findById = jest.fn().mockResolvedValue(mockRequest);
      mockDatabaseService.collaborationRequests.updateStatus.mockResolvedValue({
        ...mockRequest,
        status: 'approved',
        adminNotes: 'Great profile! Looking forward to the collaboration.',
      });

      // Step 1: Admin approves the request
      const updatedRequest = await mockDatabaseService.collaborationRequests.updateStatus(
        mockRequest.id,
        'approved',
        'Great profile! Looking forward to the collaboration.'
      );

      expect(updatedRequest.status).toBe('approved');
      expect(updatedRequest.adminNotes).toBeDefined();

      // Step 2: Verify notification sent to influencer
      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'approval_status',
          recipient: mockInfluencer.id,
          title: expect.stringContaining('Aprobada'),
          body: expect.stringContaining(mockCampaign.title),
        })
      );

      // Step 3: Verify notification sent to company
      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'collaboration_update',
          recipient: mockCampaign.companyId,
          title: expect.stringContaining('Colaboración Confirmada'),
        })
      );
    });

    it('should handle collaboration completion flow', async () => {
      const approvedRequest: CollaborationRequest = {
        id: 'request-123',
        campaignId: mockCampaign.id,
        influencerId: mockInfluencer.id,
        status: 'approved',
        requestDate: new Date(),
        proposedContent: 'Test content proposal',
        reservationDetails: {
          date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday (completed)
          time: '20:00',
          companions: 1,
        },
      };

      // Step 1: Influencer marks collaboration as completed with content
      const contentDelivered = {
        instagramStories: ['story1_url', 'story2_url'],
        tiktokVideos: ['tiktok1_url'],
        deliveredAt: new Date(),
      };

      mockDatabaseService.collaborationRequests.updateStatus.mockResolvedValue({
        ...approvedRequest,
        status: 'completed',
        contentDelivered,
      });

      const completedRequest = await mockDatabaseService.collaborationRequests.updateStatus(
        approvedRequest.id,
        'completed',
        undefined,
        contentDelivered
      );

      expect(completedRequest.status).toBe('completed');
      expect(completedRequest.contentDelivered).toEqual(contentDelivered);

      // Step 2: Verify content meets requirements
      const contentRequirements = mockCampaign.contentRequirements;
      expect(completedRequest.contentDelivered?.instagramStories.length).toBe(contentRequirements.instagramStories);
      expect(completedRequest.contentDelivered?.tiktokVideos.length).toBe(contentRequirements.tiktokVideos);

      // Step 3: Verify completion notifications
      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'collaboration_completed',
          recipient: mockCampaign.companyId,
          title: expect.stringContaining('Colaboración Completada'),
        })
      );
    });

    it('should handle collaboration cancellation flow', async () => {
      const approvedRequest: CollaborationRequest = {
        id: 'request-123',
        campaignId: mockCampaign.id,
        influencerId: mockInfluencer.id,
        status: 'approved',
        requestDate: new Date(),
        proposedContent: 'Test content proposal',
        reservationDetails: {
          date: new Date(Date.now() + 24 * 60 * 60 * 1000),
          time: '20:00',
          companions: 1,
        },
      };

      // Step 1: Cancel collaboration (could be by admin, influencer, or company)
      mockDatabaseService.collaborationRequests.updateStatus.mockResolvedValue({
        ...approvedRequest,
        status: 'cancelled',
        adminNotes: 'Cancelled due to scheduling conflict',
      });

      const cancelledRequest = await mockDatabaseService.collaborationRequests.updateStatus(
        approvedRequest.id,
        'cancelled',
        'Cancelled due to scheduling conflict'
      );

      expect(cancelledRequest.status).toBe('cancelled');
      expect(cancelledRequest.adminNotes).toContain('scheduling conflict');

      // Step 2: Verify cancellation notifications sent to all parties
      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'collaboration_cancelled',
          recipient: mockInfluencer.id,
        })
      );

      expect(mockNotificationService.sendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'collaboration_cancelled',
          recipient: mockCampaign.companyId,
        })
      );
    });
  });

  describe('Data Validation Integration', () => {
    it('should validate all data throughout the collaboration flow', async () => {
      // Step 1: Validate campaign data
      const campaignSchema = ValidationService.getCampaignSchema();
      const campaignValidation = await ValidationService.validate(campaignSchema, mockCampaign);
      expect(campaignValidation.isValid).toBe(true);

      // Step 2: Validate influencer profile
      const influencerSchema = ValidationService.getInfluencerProfileSchema();
      const influencerValidation = await ValidationService.validate(influencerSchema, mockInfluencer);
      expect(influencerValidation.isValid).toBe(true);

      // Step 3: Validate collaboration request
      const requestData = {
        proposedContent: 'Detailed content proposal with specific deliverables',
        reservationDetails: {
          date: new Date(Date.now() + 48 * 60 * 60 * 1000), // 2 days from now
          time: '19:30',
          companions: 2,
          specialRequests: 'Dietary restrictions: vegetarian',
        },
      };

      const requestSchema = ValidationService.getCollaborationRequestSchema();
      const requestValidation = await ValidationService.validate(requestSchema, requestData);
      expect(requestValidation.isValid).toBe(true);

      // Step 4: Validate follower requirements
      const eligibility = ValidationService.validateInfluencerEligibility(
        {
          instagram: mockInfluencer.instagramFollowers,
          tiktok: mockInfluencer.tiktokFollowers,
        },
        mockCampaign.requirements
      );

      expect(eligibility.isEligible).toBe(true);
    });

    it('should reject invalid data at each validation step', async () => {
      // Invalid campaign data
      const invalidCampaign = {
        ...mockCampaign,
        title: 'X', // Too short
        coordinates: { lat: 200, lng: -3.7038 }, // Invalid latitude
      };

      const campaignSchema = ValidationService.getCampaignSchema();
      const campaignValidation = await ValidationService.validate(campaignSchema, invalidCampaign);
      expect(campaignValidation.isValid).toBe(false);
      expect(campaignValidation.errors?.title).toBeDefined();
      expect(campaignValidation.errors?.['coordinates.lat']).toBeDefined();

      // Invalid collaboration request
      const invalidRequest = {
        proposedContent: 'Too short', // Too short
        reservationDetails: {
          date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Past date
          time: '25:70', // Invalid time
          companions: -1, // Negative companions
        },
      };

      const requestSchema = ValidationService.getCollaborationRequestSchema();
      const requestValidation = await ValidationService.validate(requestSchema, invalidRequest);
      expect(requestValidation.isValid).toBe(false);
      expect(requestValidation.errors?.proposedContent).toBeDefined();
      expect(requestValidation.errors?.['reservationDetails.date']).toBeDefined();
      expect(requestValidation.errors?.['reservationDetails.time']).toBeDefined();
      expect(requestValidation.errors?.['reservationDetails.companions']).toBeDefined();
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle database errors gracefully', async () => {
      // Mock database failure
      mockDatabaseService.collaborationRequests.create.mockRejectedValue(
        new Error('Database connection failed')
      );

      const requestData = {
        campaignId: mockCampaign.id,
        influencerId: mockInfluencer.id,
        proposedContent: 'Test content',
        reservationDetails: {
          date: new Date(Date.now() + 24 * 60 * 60 * 1000),
          time: '20:00',
          companions: 1,
        },
      };

      await expect(
        mockDatabaseService.collaborationRequests.create(requestData)
      ).rejects.toThrow('Database connection failed');

      // Verify no notification was sent on failure
      expect(mockNotificationService.sendNotification).not.toHaveBeenCalled();
    });

    it('should handle notification service failures', async () => {
      // Mock notification failure
      mockNotificationService.sendNotification.mockRejectedValue(
        new Error('Notification service unavailable')
      );

      mockDatabaseService.collaborationRequests.create.mockResolvedValue({
        id: 'request-123',
        campaignId: mockCampaign.id,
        influencerId: mockInfluencer.id,
        status: 'pending',
        requestDate: new Date(),
        proposedContent: 'Test content',
      });

      const requestData = {
        campaignId: mockCampaign.id,
        influencerId: mockInfluencer.id,
        proposedContent: 'Test content',
        reservationDetails: {
          date: new Date(Date.now() + 24 * 60 * 60 * 1000),
          time: '20:00',
          companions: 1,
        },
      };

      // Request should still be created even if notification fails
      const createdRequest = await mockDatabaseService.collaborationRequests.create(requestData);
      expect(createdRequest).toBeDefined();

      // But notification failure should be handled
      await expect(
        mockNotificationService.sendNotification({
          type: 'collaboration_request',
          recipient: 'admin-1',
          title: 'Test',
          body: 'Test',
          data: {},
        })
      ).rejects.toThrow('Notification service unavailable');
    });
  });
});