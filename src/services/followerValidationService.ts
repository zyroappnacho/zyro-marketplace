import { Campaign, Influencer } from '../types';

export interface FollowerValidationResult {
  isEligible: boolean;
  missingRequirements: {
    instagram?: number;
    tiktok?: number;
  };
  message: string;
}

export class FollowerValidationService {
  /**
   * Validates if an influencer meets the follower requirements for a campaign
   */
  static validateFollowerRequirements(
    campaign: Campaign,
    influencer: Influencer
  ): FollowerValidationResult {
    const { requirements } = campaign;
    const missingRequirements: { instagram?: number; tiktok?: number } = {};
    let isEligible = true;
    let message = '';

    // Check Instagram followers requirement
    if (requirements.minInstagramFollowers) {
      if (!influencer.instagramFollowers || influencer.instagramFollowers < requirements.minInstagramFollowers) {
        isEligible = false;
        missingRequirements.instagram = requirements.minInstagramFollowers - (influencer.instagramFollowers || 0);
      }
    }

    // Check TikTok followers requirement
    if (requirements.minTiktokFollowers) {
      if (!influencer.tiktokFollowers || influencer.tiktokFollowers < requirements.minTiktokFollowers) {
        isEligible = false;
        missingRequirements.tiktok = requirements.minTiktokFollowers - (influencer.tiktokFollowers || 0);
      }
    }

    // Generate appropriate message
    if (isEligible) {
      message = '¡Cumples todos los requisitos para esta colaboración!';
    } else {
      const missingPlatforms: string[] = [];
      
      if (missingRequirements.instagram) {
        missingPlatforms.push(`Instagram (necesitas ${missingRequirements.instagram.toLocaleString()} seguidores más)`);
      }
      
      if (missingRequirements.tiktok) {
        missingPlatforms.push(`TikTok (necesitas ${missingRequirements.tiktok.toLocaleString()} seguidores más)`);
      }

      if (missingPlatforms.length === 1) {
        message = `No cumples el requisito mínimo de seguidores en ${missingPlatforms[0]}.`;
      } else {
        message = `No cumples los requisitos mínimos de seguidores en ${missingPlatforms.join(' y ')}.`;
      }
    }

    return {
      isEligible,
      missingRequirements,
      message,
    };
  }

  /**
   * Gets a formatted string of the follower requirements for display
   */
  static getRequirementsText(campaign: Campaign): string {
    const { requirements } = campaign;
    const requirementTexts: string[] = [];

    if (requirements.minInstagramFollowers) {
      requirementTexts.push(`${requirements.minInstagramFollowers.toLocaleString()} seguidores en Instagram`);
    }

    if (requirements.minTiktokFollowers) {
      requirementTexts.push(`${requirements.minTiktokFollowers.toLocaleString()} seguidores en TikTok`);
    }

    if (requirementTexts.length === 0) {
      return 'Sin requisitos específicos de seguidores';
    }

    if (requirementTexts.length === 1) {
      return `Mínimo ${requirementTexts[0]}`;
    }

    return `Mínimo ${requirementTexts.join(' y ')}`;
  }

  /**
   * Checks if an influencer has any social media accounts configured
   */
  static hasValidSocialMediaAccounts(influencer: Influencer): boolean {
    return !!(
      (influencer.instagramUsername && influencer.instagramFollowers > 0) ||
      (influencer.tiktokUsername && influencer.tiktokFollowers > 0)
    );
  }

  /**
   * Gets the total follower count across all platforms
   */
  static getTotalFollowers(influencer: Influencer): number {
    return (influencer.instagramFollowers || 0) + (influencer.tiktokFollowers || 0);
  }
}