import { FollowerValidationService } from '../followerValidationService';
import { Campaign, Influencer } from '../../types';

describe('FollowerValidationService', () => {
  const mockInfluencer: Influencer = {
    id: '1',
    email: 'test@example.com',
    role: 'influencer',
    status: 'approved',
    createdAt: new Date(),
    updatedAt: new Date(),
    fullName: 'Test Influencer',
    instagramUsername: 'testuser',
    tiktokUsername: 'testuser_tiktok',
    instagramFollowers: 10000,
    tiktokFollowers: 5000,
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

  const mockCampaign: Campaign = {
    id: '1',
    title: 'Test Campaign',
    description: 'Test campaign description',
    businessName: 'Test Business',
    category: 'restaurantes',
    city: 'Madrid',
    address: 'Test Address',
    coordinates: { lat: 40.4168, lng: -3.7038 },
    images: ['image1.jpg'],
    requirements: {
      minInstagramFollowers: 5000,
      minTiktokFollowers: 2000,
      maxCompanions: 2,
    },
    whatIncludes: ['Dinner'],
    contentRequirements: {
      instagramStories: 2,
      tiktokVideos: 1,
      deadline: 72,
    },
    companyId: 'company1',
    status: 'active',
    createdBy: 'admin1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('validateFollowerRequirements', () => {
    it('should validate eligible influencer', () => {
      const result = FollowerValidationService.validateFollowerRequirements(
        mockCampaign,
        mockInfluencer
      );

      expect(result.isEligible).toBe(true);
      expect(result.missingRequirements).toEqual({});
      expect(result.message).toBe('¡Cumples todos los requisitos para esta colaboración!');
    });

    it('should reject influencer with insufficient Instagram followers', () => {
      const insufficientInfluencer = {
        ...mockInfluencer,
        instagramFollowers: 3000, // Less than required 5000
      };

      const result = FollowerValidationService.validateFollowerRequirements(
        mockCampaign,
        insufficientInfluencer
      );

      expect(result.isEligible).toBe(false);
      expect(result.missingRequirements.instagram).toBe(2000); // 5000 - 3000
      expect(result.message).toContain('Instagram');
      expect(result.message).toContain('2000 seguidores más');
    });

    it('should reject influencer with insufficient TikTok followers', () => {
      const insufficientInfluencer = {
        ...mockInfluencer,
        tiktokFollowers: 1000, // Less than required 2000
      };

      const result = FollowerValidationService.validateFollowerRequirements(
        mockCampaign,
        insufficientInfluencer
      );

      expect(result.isEligible).toBe(false);
      expect(result.missingRequirements.tiktok).toBe(1000); // 2000 - 1000
      expect(result.message).toContain('TikTok');
      expect(result.message).toContain('1000 seguidores más');
    });

    it('should reject influencer with insufficient followers on both platforms', () => {
      const insufficientInfluencer = {
        ...mockInfluencer,
        instagramFollowers: 3000, // Less than required 5000
        tiktokFollowers: 1000, // Less than required 2000
      };

      const result = FollowerValidationService.validateFollowerRequirements(
        mockCampaign,
        insufficientInfluencer
      );

      expect(result.isEligible).toBe(false);
      expect(result.missingRequirements.instagram).toBe(2000);
      expect(result.missingRequirements.tiktok).toBe(1000);
      expect(result.message).toContain('Instagram');
      expect(result.message).toContain('TikTok');
      expect(result.message).toContain(' y ');
    });

    it('should handle campaign with no follower requirements', () => {
      const campaignNoRequirements = {
        ...mockCampaign,
        requirements: {
          maxCompanions: 2,
        },
      };

      const result = FollowerValidationService.validateFollowerRequirements(
        campaignNoRequirements,
        mockInfluencer
      );

      expect(result.isEligible).toBe(true);
      expect(result.missingRequirements).toEqual({});
      expect(result.message).toBe('¡Cumples todos los requisitos para esta colaboración!');
    });

    it('should handle influencer with zero followers', () => {
      const zeroFollowersInfluencer = {
        ...mockInfluencer,
        instagramFollowers: 0,
        tiktokFollowers: 0,
      };

      const result = FollowerValidationService.validateFollowerRequirements(
        mockCampaign,
        zeroFollowersInfluencer
      );

      expect(result.isEligible).toBe(false);
      expect(result.missingRequirements.instagram).toBe(5000);
      expect(result.missingRequirements.tiktok).toBe(2000);
    });

    it('should handle influencer with undefined followers', () => {
      const undefinedFollowersInfluencer = {
        ...mockInfluencer,
        instagramFollowers: undefined as any,
        tiktokFollowers: undefined as any,
      };

      const result = FollowerValidationService.validateFollowerRequirements(
        mockCampaign,
        undefinedFollowersInfluencer
      );

      expect(result.isEligible).toBe(false);
      expect(result.missingRequirements.instagram).toBe(5000);
      expect(result.missingRequirements.tiktok).toBe(2000);
    });
  });

  describe('getRequirementsText', () => {
    it('should format requirements text for both platforms', () => {
      const text = FollowerValidationService.getRequirementsText(mockCampaign);
      
      expect(text).toBe('Mínimo 5000 seguidores en Instagram y 2000 seguidores en TikTok');
    });

    it('should format requirements text for Instagram only', () => {
      const instagramOnlyCampaign = {
        ...mockCampaign,
        requirements: {
          minInstagramFollowers: 5000,
          maxCompanions: 2,
        },
      };

      const text = FollowerValidationService.getRequirementsText(instagramOnlyCampaign);
      
      expect(text).toBe('Mínimo 5000 seguidores en Instagram');
    });

    it('should format requirements text for TikTok only', () => {
      const tiktokOnlyCampaign = {
        ...mockCampaign,
        requirements: {
          minTiktokFollowers: 2000,
          maxCompanions: 2,
        },
      };

      const text = FollowerValidationService.getRequirementsText(tiktokOnlyCampaign);
      
      expect(text).toBe('Mínimo 2000 seguidores en TikTok');
    });

    it('should handle no follower requirements', () => {
      const noRequirementsCampaign = {
        ...mockCampaign,
        requirements: {
          maxCompanions: 2,
        },
      };

      const text = FollowerValidationService.getRequirementsText(noRequirementsCampaign);
      
      expect(text).toBe('Sin requisitos específicos de seguidores');
    });
  });

  describe('hasValidSocialMediaAccounts', () => {
    it('should return true for influencer with valid Instagram account', () => {
      const instagramInfluencer = {
        ...mockInfluencer,
        instagramUsername: 'testuser',
        instagramFollowers: 5000,
        tiktokUsername: undefined,
        tiktokFollowers: 0,
      };

      const result = FollowerValidationService.hasValidSocialMediaAccounts(instagramInfluencer);
      
      expect(result).toBe(true);
    });

    it('should return true for influencer with valid TikTok account', () => {
      const tiktokInfluencer = {
        ...mockInfluencer,
        instagramUsername: undefined,
        instagramFollowers: 0,
        tiktokUsername: 'testuser',
        tiktokFollowers: 5000,
      };

      const result = FollowerValidationService.hasValidSocialMediaAccounts(tiktokInfluencer);
      
      expect(result).toBe(true);
    });

    it('should return true for influencer with both valid accounts', () => {
      const result = FollowerValidationService.hasValidSocialMediaAccounts(mockInfluencer);
      
      expect(result).toBe(true);
    });

    it('should return false for influencer with no valid accounts', () => {
      const noAccountsInfluencer = {
        ...mockInfluencer,
        instagramUsername: undefined,
        instagramFollowers: 0,
        tiktokUsername: undefined,
        tiktokFollowers: 0,
      };

      const result = FollowerValidationService.hasValidSocialMediaAccounts(noAccountsInfluencer);
      
      expect(result).toBe(false);
    });

    it('should return false for influencer with username but no followers', () => {
      const noFollowersInfluencer = {
        ...mockInfluencer,
        instagramUsername: 'testuser',
        instagramFollowers: 0,
        tiktokUsername: 'testuser',
        tiktokFollowers: 0,
      };

      const result = FollowerValidationService.hasValidSocialMediaAccounts(noFollowersInfluencer);
      
      expect(result).toBe(false);
    });

    it('should return false for influencer with followers but no username', () => {
      const noUsernameInfluencer = {
        ...mockInfluencer,
        instagramUsername: undefined,
        instagramFollowers: 5000,
        tiktokUsername: undefined,
        tiktokFollowers: 5000,
      };

      const result = FollowerValidationService.hasValidSocialMediaAccounts(noUsernameInfluencer);
      
      expect(result).toBe(false);
    });
  });

  describe('getTotalFollowers', () => {
    it('should calculate total followers correctly', () => {
      const total = FollowerValidationService.getTotalFollowers(mockInfluencer);
      
      expect(total).toBe(15000); // 10000 + 5000
    });

    it('should handle zero followers', () => {
      const zeroFollowersInfluencer = {
        ...mockInfluencer,
        instagramFollowers: 0,
        tiktokFollowers: 0,
      };

      const total = FollowerValidationService.getTotalFollowers(zeroFollowersInfluencer);
      
      expect(total).toBe(0);
    });

    it('should handle undefined followers', () => {
      const undefinedFollowersInfluencer = {
        ...mockInfluencer,
        instagramFollowers: undefined as any,
        tiktokFollowers: undefined as any,
      };

      const total = FollowerValidationService.getTotalFollowers(undefinedFollowersInfluencer);
      
      expect(total).toBe(0); // undefined || 0 = 0
    });

    it('should handle mixed defined and undefined followers', () => {
      const mixedInfluencer = {
        ...mockInfluencer,
        instagramFollowers: 5000,
        tiktokFollowers: undefined as any,
      };

      const total = FollowerValidationService.getTotalFollowers(mixedInfluencer);
      
      expect(total).toBe(5000); // 5000 + 0
    });
  });
});