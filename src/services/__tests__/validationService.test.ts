import { ValidationService } from '../validationService';
import { databaseService } from '../../database';

// Mock the database service
jest.mock('../../database', () => ({
  databaseService: {
    users: {
      findByEmail: jest.fn(),
      verifyPassword: jest.fn(),
    },
    companies: {
      findByCif: jest.fn(),
    },
  },
}));

const mockDatabaseService = databaseService as jest.Mocked<typeof databaseService>;

describe('ValidationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Registration Schema', () => {
    it('should validate correct user registration data', async () => {
      mockDatabaseService.users.findByEmail.mockResolvedValue(null);
      
      const validData = {
        email: 'test@example.com',
        password: 'Password123',
        role: 'influencer' as const,
      };

      const schema = ValidationService.getUserRegistrationSchema();
      const result = await ValidationService.validate(schema, validData);

      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(validData);
    });

    it('should reject duplicate email', async () => {
      mockDatabaseService.users.findByEmail.mockResolvedValue({ id: '1', email: 'test@example.com' });
      
      const duplicateEmailData = {
        email: 'test@example.com',
        password: 'Password123',
        role: 'influencer' as const,
      };

      const schema = ValidationService.getUserRegistrationSchema();
      const result = await ValidationService.validate(schema, duplicateEmailData);

      expect(result.isValid).toBe(false);
      expect(result.errors?.email).toContain('already exists');
    });

    it('should reject weak password', async () => {
      mockDatabaseService.users.findByEmail.mockResolvedValue(null);
      
      const weakPasswordData = {
        email: 'test@example.com',
        password: 'weak',
        role: 'influencer' as const,
      };

      const schema = ValidationService.getUserRegistrationSchema();
      const result = await ValidationService.validate(schema, weakPasswordData);

      expect(result.isValid).toBe(false);
      expect(result.errors?.password).toBeDefined();
    });

    it('should reject invalid role', async () => {
      mockDatabaseService.users.findByEmail.mockResolvedValue(null);
      
      const invalidRoleData = {
        email: 'test@example.com',
        password: 'Password123',
        role: 'invalid_role' as any,
      };

      const schema = ValidationService.getUserRegistrationSchema();
      const result = await ValidationService.validate(schema, invalidRoleData);

      expect(result.isValid).toBe(false);
      expect(result.errors?.role).toContain('Invalid role');
    });
  });

  describe('Influencer Profile Schema', () => {
    it('should validate correct influencer profile data', async () => {
      const validData = {
        fullName: 'Test Influencer',
        instagramUsername: 'testuser',
        instagramFollowers: 5000,
        tiktokFollowers: 1000,
        phone: '+34612345678',
        city: 'Madrid',
        audienceStats: {
          countries: [{ country: 'Spain', percentage: 80 }],
          cities: [{ city: 'Madrid', percentage: 60 }],
          ageRanges: [{ range: '18-24', percentage: 40 }],
          monthlyStats: {
            views: 10000,
            engagement: 500,
            reach: 8000,
          },
        },
      };

      const schema = ValidationService.getInfluencerProfileSchema();
      const result = await ValidationService.validate(schema, validData);

      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(validData);
    });

    it('should reject invalid Instagram username', async () => {
      const invalidData = {
        fullName: 'Test Influencer',
        instagramUsername: 'test-user', // hyphens not allowed
        instagramFollowers: 5000,
        city: 'Madrid',
        audienceStats: {
          countries: [{ country: 'Spain', percentage: 80 }],
          cities: [{ city: 'Madrid', percentage: 60 }],
          ageRanges: [{ range: '18-24', percentage: 40 }],
          monthlyStats: {
            views: 10000,
            engagement: 500,
            reach: 8000,
          },
        },
      };

      const schema = ValidationService.getInfluencerProfileSchema();
      const result = await ValidationService.validate(schema, invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors?.instagramUsername).toBeDefined();
    });

    it('should reject negative followers count', async () => {
      const invalidData = {
        fullName: 'Test Influencer',
        instagramFollowers: -100,
        city: 'Madrid',
        audienceStats: {
          countries: [{ country: 'Spain', percentage: 80 }],
          cities: [{ city: 'Madrid', percentage: 60 }],
          ageRanges: [{ range: '18-24', percentage: 40 }],
          monthlyStats: {
            views: 10000,
            engagement: 500,
            reach: 8000,
          },
        },
      };

      const schema = ValidationService.getInfluencerProfileSchema();
      const result = await ValidationService.validate(schema, invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors?.instagramFollowers).toBeDefined();
    });

    it('should reject unrealistic followers count', async () => {
      const invalidData = {
        fullName: 'Test Influencer',
        instagramFollowers: 2000000000, // Too high
        city: 'Madrid',
        audienceStats: {
          countries: [{ country: 'Spain', percentage: 80 }],
          cities: [{ city: 'Madrid', percentage: 60 }],
          ageRanges: [{ range: '18-24', percentage: 40 }],
          monthlyStats: {
            views: 10000,
            engagement: 500,
            reach: 8000,
          },
        },
      };

      const schema = ValidationService.getInfluencerProfileSchema();
      const result = await ValidationService.validate(schema, invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors?.instagramFollowers).toBeDefined();
    });
  });

  describe('Company Profile Schema', () => {
    it('should validate correct company profile data', async () => {
      mockDatabaseService.companies.findByCif.mockResolvedValue(null);
      
      const validData = {
        companyName: 'Test Company',
        cif: 'A12345678',
        address: 'Calle Mayor 123, Madrid',
        phone: '+34612345678',
        contactPerson: 'John Doe',
        subscription: {
          plan: '6months' as const,
          price: 399,
          startDate: new Date(),
          endDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
        },
      };

      const schema = ValidationService.getCompanyProfileSchema();
      const result = await ValidationService.validate(schema, validData);

      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(validData);
    });

    it('should reject duplicate CIF', async () => {
      mockDatabaseService.companies.findByCif.mockResolvedValue({ id: '1', cif: 'A12345678' });
      
      const duplicateCifData = {
        companyName: 'Test Company',
        cif: 'A12345678',
        address: 'Calle Mayor 123, Madrid',
        phone: '+34612345678',
        contactPerson: 'John Doe',
        subscription: {
          plan: '6months' as const,
          price: 399,
          startDate: new Date(),
          endDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
        },
      };

      const schema = ValidationService.getCompanyProfileSchema();
      const result = await ValidationService.validate(schema, duplicateCifData);

      expect(result.isValid).toBe(false);
      expect(result.errors?.cif).toContain('already exists');
    });

    it('should reject invalid CIF format', async () => {
      mockDatabaseService.companies.findByCif.mockResolvedValue(null);
      
      const invalidData = {
        companyName: 'Test Company',
        cif: 'invalid-cif',
        address: 'Calle Mayor 123, Madrid',
        phone: '+34612345678',
        contactPerson: 'John Doe',
        subscription: {
          plan: '6months' as const,
          price: 399,
          startDate: new Date(),
          endDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
        },
      };

      const schema = ValidationService.getCompanyProfileSchema();
      const result = await ValidationService.validate(schema, invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors?.cif).toBeDefined();
    });

    it('should reject invalid subscription plan', async () => {
      mockDatabaseService.companies.findByCif.mockResolvedValue(null);
      
      const invalidData = {
        companyName: 'Test Company',
        cif: 'A12345678',
        address: 'Calle Mayor 123, Madrid',
        phone: '+34612345678',
        contactPerson: 'John Doe',
        subscription: {
          plan: 'invalid_plan' as any,
          price: 399,
          startDate: new Date(),
          endDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
        },
      };

      const schema = ValidationService.getCompanyProfileSchema();
      const result = await ValidationService.validate(schema, invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors?.['subscription.plan']).toBeDefined();
    });
  });

  describe('Campaign Schema', () => {
    it('should validate correct campaign data', async () => {
      const validData = {
        title: 'Test Campaign',
        description: 'This is a test campaign description with enough characters',
        businessName: 'Test Business',
        category: 'restaurantes' as const,
        city: 'Madrid',
        address: 'Calle Mayor 123, Madrid',
        coordinates: { lat: 40.4168, lng: -3.7038 },
        images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
        requirements: {
          minInstagramFollowers: 5000,
          maxCompanions: 2,
        },
        whatIncludes: ['Dinner for 2', 'Drinks included'],
        contentRequirements: {
          instagramStories: 2,
          tiktokVideos: 1,
          deadline: 72,
        },
      };

      const schema = ValidationService.getCampaignSchema();
      const result = await ValidationService.validate(schema, validData);

      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(validData);
    });

    it('should reject invalid category', async () => {
      const invalidData = {
        title: 'Test Campaign',
        description: 'This is a test campaign description with enough characters',
        businessName: 'Test Business',
        category: 'invalid_category' as any,
        city: 'Madrid',
        address: 'Calle Mayor 123, Madrid',
        coordinates: { lat: 40.4168, lng: -3.7038 },
        images: ['https://example.com/image1.jpg'],
        requirements: { maxCompanions: 2 },
        whatIncludes: ['Dinner for 2'],
        contentRequirements: {
          instagramStories: 2,
          tiktokVideos: 1,
          deadline: 72,
        },
      };

      const schema = ValidationService.getCampaignSchema();
      const result = await ValidationService.validate(schema, invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors?.category).toBeDefined();
    });

    it('should reject invalid coordinates', async () => {
      const invalidData = {
        title: 'Test Campaign',
        description: 'This is a test campaign description with enough characters',
        businessName: 'Test Business',
        category: 'restaurantes' as const,
        city: 'Madrid',
        address: 'Calle Mayor 123, Madrid',
        coordinates: { lat: 200, lng: -3.7038 }, // Invalid latitude
        images: ['https://example.com/image1.jpg'],
        requirements: { maxCompanions: 2 },
        whatIncludes: ['Dinner for 2'],
        contentRequirements: {
          instagramStories: 2,
          tiktokVideos: 1,
          deadline: 72,
        },
      };

      const schema = ValidationService.getCampaignSchema();
      const result = await ValidationService.validate(schema, invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors?.['coordinates.lat']).toBeDefined();
    });

    it('should reject too short deadline', async () => {
      const invalidData = {
        title: 'Test Campaign',
        description: 'This is a test campaign description with enough characters',
        businessName: 'Test Business',
        category: 'restaurantes' as const,
        city: 'Madrid',
        address: 'Calle Mayor 123, Madrid',
        coordinates: { lat: 40.4168, lng: -3.7038 },
        images: ['https://example.com/image1.jpg'],
        requirements: { maxCompanions: 2 },
        whatIncludes: ['Dinner for 2'],
        contentRequirements: {
          instagramStories: 2,
          tiktokVideos: 1,
          deadline: 12, // Too short
        },
      };

      const schema = ValidationService.getCampaignSchema();
      const result = await ValidationService.validate(schema, invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors?.['contentRequirements.deadline']).toBeDefined();
    });
  });

  describe('Collaboration Request Schema', () => {
    it('should validate collaboration request with reservation details', async () => {
      const validData = {
        proposedContent: 'I will create 2 Instagram stories showcasing the restaurant experience',
        reservationDetails: {
          date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          time: '19:30',
          companions: 1,
          specialRequests: 'Window table preferred',
        },
      };

      const schema = ValidationService.getCollaborationRequestSchema();
      const result = await ValidationService.validate(schema, validData);

      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(validData);
    });

    it('should validate collaboration request with delivery details', async () => {
      const validData = {
        proposedContent: 'I will create 1 TikTok video showcasing the product',
        deliveryDetails: {
          address: 'Calle Mayor 123, Madrid',
          phone: '+34612345678',
          preferredTime: 'Morning between 9-12',
        },
      };

      const schema = ValidationService.getCollaborationRequestSchema();
      const result = await ValidationService.validate(schema, validData);

      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(validData);
    });

    it('should reject past reservation date', async () => {
      const invalidData = {
        proposedContent: 'I will create 2 Instagram stories showcasing the restaurant experience',
        reservationDetails: {
          date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
          time: '19:30',
          companions: 1,
        },
      };

      const schema = ValidationService.getCollaborationRequestSchema();
      const result = await ValidationService.validate(schema, invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors?.['reservationDetails.date']).toBeDefined();
    });

    it('should reject invalid time format', async () => {
      const invalidData = {
        proposedContent: 'I will create 2 Instagram stories showcasing the restaurant experience',
        reservationDetails: {
          date: new Date(Date.now() + 24 * 60 * 60 * 1000),
          time: '25:70', // Invalid time
          companions: 1,
        },
      };

      const schema = ValidationService.getCollaborationRequestSchema();
      const result = await ValidationService.validate(schema, invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors?.['reservationDetails.time']).toBeDefined();
    });
  });

  describe('Credential Validation', () => {
    it('should validate correct credentials', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        status: 'approved',
      };
      mockDatabaseService.users.verifyPassword.mockResolvedValue(mockUser);

      const result = await ValidationService.validateCredentials('test@example.com', 'password123');

      expect(result.isValid).toBe(true);
      expect(result.user).toEqual(mockUser);
    });

    it('should reject invalid credentials', async () => {
      mockDatabaseService.users.verifyPassword.mockResolvedValue(null);

      const result = await ValidationService.validateCredentials('test@example.com', 'wrongpassword');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid email or password');
    });

    it('should reject unapproved user', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        status: 'pending',
      };
      mockDatabaseService.users.verifyPassword.mockResolvedValue(mockUser);

      const result = await ValidationService.validateCredentials('test@example.com', 'password123');

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Account is not approved yet');
    });
  });

  describe('Influencer Eligibility Validation', () => {
    it('should validate eligible influencer', () => {
      const influencerFollowers = { instagram: 10000, tiktok: 5000 };
      const campaignRequirements = { minInstagramFollowers: 5000, minTiktokFollowers: 1000 };

      const result = ValidationService.validateInfluencerEligibility(
        influencerFollowers,
        campaignRequirements
      );

      expect(result.isEligible).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should reject influencer with insufficient Instagram followers', () => {
      const influencerFollowers = { instagram: 3000, tiktok: 5000 };
      const campaignRequirements = { minInstagramFollowers: 5000 };

      const result = ValidationService.validateInfluencerEligibility(
        influencerFollowers,
        campaignRequirements
      );

      expect(result.isEligible).toBe(false);
      expect(result.reason).toContain('Instagram followers');
    });

    it('should reject influencer with insufficient TikTok followers', () => {
      const influencerFollowers = { instagram: 10000, tiktok: 500 };
      const campaignRequirements = { minTiktokFollowers: 1000 };

      const result = ValidationService.validateInfluencerEligibility(
        influencerFollowers,
        campaignRequirements
      );

      expect(result.isEligible).toBe(false);
      expect(result.reason).toContain('TikTok followers');
    });

    it('should handle missing requirements', () => {
      const influencerFollowers = { instagram: 1000, tiktok: 500 };
      const campaignRequirements = {}; // No requirements

      const result = ValidationService.validateInfluencerEligibility(
        influencerFollowers,
        campaignRequirements
      );

      expect(result.isEligible).toBe(true);
    });
  });
});