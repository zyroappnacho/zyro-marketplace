import {
  BaseUser,
  Influencer,
  Company,
  Admin,
  Campaign,
  CollaborationRequest,
  UserRole,
  UserStatus,
  CampaignCategory,
  CampaignStatus,
  CollaborationStatus,
  SubscriptionPlan,
  SubscriptionStatus
} from '../types';

import {
  UserEntity,
  InfluencerEntity,
  CompanyEntity,
  AdminEntity,
  CampaignEntity,
  CollaborationRequestEntity,
  SubscriptionEntity,
  AudienceStatEntity,
  MonthlyStatEntity,
  ContentDeliveredEntity
} from './entities';

/**
 * Database mappers to convert between database entities and application types
 */

export class DatabaseMappers {
  /**
   * Convert UserEntity to BaseUser
   */
  static mapUserEntityToBaseUser(entity: UserEntity): BaseUser {
    return {
      id: entity.id,
      email: entity.email,
      role: entity.role as UserRole,
      status: entity.status as UserStatus,
      createdAt: new Date(entity.created_at),
      updatedAt: new Date(entity.updated_at)
    };
  }

  /**
   * Convert InfluencerEntity with related data to Influencer
   */
  static mapInfluencerEntityToInfluencer(
    userEntity: UserEntity,
    influencerEntity: InfluencerEntity,
    audienceStats: AudienceStatEntity[] = [],
    monthlyStats: MonthlyStatEntity[] = []
  ): Influencer {
    // Group audience stats by type
    const countries = audienceStats
      .filter(stat => stat.type === 'country')
      .map(stat => ({ country: stat.value, percentage: stat.percentage }));

    const cities = audienceStats
      .filter(stat => stat.type === 'city')
      .map(stat => ({ city: stat.value, percentage: stat.percentage }));

    const ageRanges = audienceStats
      .filter(stat => stat.type === 'age_range')
      .map(stat => ({ range: stat.value, percentage: stat.percentage }));

    // Get latest monthly stats
    const latestMonthlyStats = monthlyStats.length > 0 
      ? monthlyStats.reduce((latest, current) => {
          const currentDate = new Date(current.year, current.month - 1);
          const latestDate = new Date(latest.year, latest.month - 1);
          return currentDate > latestDate ? current : latest;
        })
      : null;

    return {
      id: userEntity.id,
      email: userEntity.email,
      role: userEntity.role as UserRole,
      status: userEntity.status as UserStatus,
      createdAt: new Date(userEntity.created_at),
      updatedAt: new Date(userEntity.updated_at),
      fullName: influencerEntity.full_name,
      instagramUsername: influencerEntity.instagram_username,
      tiktokUsername: influencerEntity.tiktok_username,
      instagramFollowers: influencerEntity.instagram_followers,
      tiktokFollowers: influencerEntity.tiktok_followers,
      profileImage: influencerEntity.profile_image,
      phone: influencerEntity.phone,
      address: influencerEntity.address,
      city: influencerEntity.city,
      audienceStats: {
        countries,
        cities,
        ageRanges,
        monthlyStats: latestMonthlyStats ? {
          views: latestMonthlyStats.views,
          engagement: latestMonthlyStats.engagement,
          reach: latestMonthlyStats.reach
        } : {
          views: 0,
          engagement: 0,
          reach: 0
        }
      }
    };
  }

  /**
   * Convert CompanyEntity with subscription to Company
   */
  static mapCompanyEntityToCompany(
    userEntity: UserEntity,
    companyEntity: CompanyEntity,
    subscriptionEntity?: SubscriptionEntity
  ): Company {
    return {
      id: userEntity.id,
      email: userEntity.email,
      role: userEntity.role as UserRole,
      status: userEntity.status as UserStatus,
      createdAt: new Date(userEntity.created_at),
      updatedAt: new Date(userEntity.updated_at),
      companyName: companyEntity.company_name,
      cif: companyEntity.cif,
      address: companyEntity.address,
      phone: companyEntity.phone,
      contactPerson: companyEntity.contact_person,
      paymentMethod: companyEntity.payment_method || '',
      subscription: subscriptionEntity ? {
        plan: subscriptionEntity.plan as SubscriptionPlan,
        price: subscriptionEntity.price,
        startDate: new Date(subscriptionEntity.start_date),
        endDate: new Date(subscriptionEntity.end_date),
        status: subscriptionEntity.status as SubscriptionStatus
      } : {
        plan: '3months',
        price: 0,
        startDate: new Date(),
        endDate: new Date(),
        status: 'expired'
      }
    };
  }

  /**
   * Convert AdminEntity to Admin
   */
  static mapAdminEntityToAdmin(
    userEntity: UserEntity,
    adminEntity: AdminEntity
  ): Admin {
    return {
      id: userEntity.id,
      email: userEntity.email,
      role: userEntity.role as UserRole,
      status: userEntity.status as UserStatus,
      createdAt: new Date(userEntity.created_at),
      updatedAt: new Date(userEntity.updated_at),
      username: adminEntity.username,
      fullName: adminEntity.full_name,
      permissions: JSON.parse(adminEntity.permissions || '[]'),
      lastLoginAt: adminEntity.last_login_at ? new Date(adminEntity.last_login_at) : undefined
    };
  }

  /**
   * Convert CampaignEntity to Campaign
   */
  static mapCampaignEntityToCampaign(entity: CampaignEntity): Campaign {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      businessName: entity.business_name,
      category: entity.category as CampaignCategory,
      city: entity.city,
      address: entity.address,
      coordinates: {
        lat: entity.latitude || 0,
        lng: entity.longitude || 0
      },
      images: JSON.parse(entity.images || '[]'),
      requirements: {
        minInstagramFollowers: entity.min_instagram_followers,
        minTiktokFollowers: entity.min_tiktok_followers,
        maxCompanions: entity.max_companions
      },
      whatIncludes: JSON.parse(entity.what_includes || '[]'),
      contentRequirements: {
        instagramStories: entity.instagram_stories,
        tiktokVideos: entity.tiktok_videos,
        deadline: entity.content_deadline
      },
      companyId: entity.company_id,
      status: entity.status as CampaignStatus,
      createdBy: entity.created_by,
      createdAt: new Date(entity.created_at),
      updatedAt: new Date(entity.updated_at)
    };
  }

  /**
   * Convert CollaborationRequestEntity to CollaborationRequest
   */
  static mapCollaborationRequestEntityToCollaborationRequest(
    entity: CollaborationRequestEntity,
    contentDelivered: ContentDeliveredEntity[] = []
  ): CollaborationRequest {
    return {
      id: entity.id,
      campaignId: entity.campaign_id,
      influencerId: entity.influencer_id,
      status: entity.status as CollaborationStatus,
      requestDate: new Date(entity.request_date),
      proposedContent: entity.proposed_content,
      reservationDetails: entity.reservation_date ? {
        date: new Date(entity.reservation_date),
        time: entity.reservation_time || '',
        companions: entity.companions,
        specialRequests: entity.special_requests
      } : undefined,
      deliveryDetails: entity.delivery_address ? {
        address: entity.delivery_address,
        phone: entity.delivery_phone || '',
        preferredTime: entity.preferred_delivery_time || ''
      } : undefined,
      contentDelivered: contentDelivered.length > 0 ? {
        instagramStories: contentDelivered
          .filter(content => content.type === 'instagram_story')
          .map(content => content.url),
        tiktokVideos: contentDelivered
          .filter(content => content.type === 'tiktok_video')
          .map(content => content.url),
        deliveredAt: new Date(Math.max(...contentDelivered.map(c => new Date(c.delivered_at).getTime())))
      } : undefined,
      adminNotes: entity.admin_notes
    };
  }

  /**
   * Convert Influencer to database entities
   */
  static mapInfluencerToEntities(influencer: Influencer, passwordHash: string): {
    userEntity: Omit<UserEntity, 'created_at' | 'updated_at'>;
    influencerEntity: Omit<InfluencerEntity, 'created_at' | 'updated_at'>;
    audienceStats: Omit<AudienceStatEntity, 'created_at'>[];
  } {
    const userEntity: Omit<UserEntity, 'created_at' | 'updated_at'> = {
      id: influencer.id,
      email: influencer.email,
      password_hash: passwordHash,
      role: influencer.role,
      status: influencer.status
    };

    const influencerEntity: Omit<InfluencerEntity, 'created_at' | 'updated_at'> = {
      id: influencer.id,
      user_id: influencer.id,
      full_name: influencer.fullName,
      instagram_username: influencer.instagramUsername,
      tiktok_username: influencer.tiktokUsername,
      instagram_followers: influencer.instagramFollowers,
      tiktok_followers: influencer.tiktokFollowers,
      profile_image: influencer.profileImage,
      phone: influencer.phone,
      address: influencer.address,
      city: influencer.city
    };

    const audienceStats: Omit<AudienceStatEntity, 'created_at'>[] = [
      ...influencer.audienceStats.countries.map(country => ({
        id: `${influencer.id}_country_${country.country}`,
        influencer_id: influencer.id,
        type: 'country' as const,
        value: country.country,
        percentage: country.percentage
      })),
      ...influencer.audienceStats.cities.map(city => ({
        id: `${influencer.id}_city_${city.city}`,
        influencer_id: influencer.id,
        type: 'city' as const,
        value: city.city,
        percentage: city.percentage
      })),
      ...influencer.audienceStats.ageRanges.map(ageRange => ({
        id: `${influencer.id}_age_${ageRange.range}`,
        influencer_id: influencer.id,
        type: 'age_range' as const,
        value: ageRange.range,
        percentage: ageRange.percentage
      }))
    ];

    return { userEntity, influencerEntity, audienceStats };
  }

  /**
   * Convert Company to database entities
   */
  static mapCompanyToEntities(company: Company, passwordHash: string): {
    userEntity: Omit<UserEntity, 'created_at' | 'updated_at'>;
    companyEntity: Omit<CompanyEntity, 'created_at' | 'updated_at'>;
    subscriptionEntity: Omit<SubscriptionEntity, 'created_at' | 'updated_at'>;
  } {
    const userEntity: Omit<UserEntity, 'created_at' | 'updated_at'> = {
      id: company.id,
      email: company.email,
      password_hash: passwordHash,
      role: company.role,
      status: company.status
    };

    const companyEntity: Omit<CompanyEntity, 'created_at' | 'updated_at'> = {
      id: company.id,
      user_id: company.id,
      company_name: company.companyName,
      cif: company.cif,
      address: company.address,
      phone: company.phone,
      contact_person: company.contactPerson,
      payment_method: company.paymentMethod
    };

    const subscriptionEntity: Omit<SubscriptionEntity, 'created_at' | 'updated_at'> = {
      id: `${company.id}_subscription`,
      company_id: company.id,
      plan: company.subscription.plan,
      price: company.subscription.price,
      start_date: company.subscription.startDate.toISOString(),
      end_date: company.subscription.endDate.toISOString(),
      status: company.subscription.status
    };

    return { userEntity, companyEntity, subscriptionEntity };
  }

  /**
   * Convert Campaign to CampaignEntity
   */
  static mapCampaignToCampaignEntity(campaign: Campaign): Omit<CampaignEntity, 'created_at' | 'updated_at'> {
    return {
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      business_name: campaign.businessName,
      category: campaign.category,
      city: campaign.city,
      address: campaign.address,
      latitude: campaign.coordinates.lat,
      longitude: campaign.coordinates.lng,
      images: JSON.stringify(campaign.images),
      min_instagram_followers: campaign.requirements.minInstagramFollowers,
      min_tiktok_followers: campaign.requirements.minTiktokFollowers,
      max_companions: campaign.requirements.maxCompanions,
      what_includes: JSON.stringify(campaign.whatIncludes),
      instagram_stories: campaign.contentRequirements.instagramStories,
      tiktok_videos: campaign.contentRequirements.tiktokVideos,
      content_deadline: campaign.contentRequirements.deadline,
      company_id: campaign.companyId,
      status: campaign.status,
      created_by: campaign.createdBy
    };
  }

  /**
   * Convert CollaborationRequest to CollaborationRequestEntity
   */
  static mapCollaborationRequestToEntity(request: CollaborationRequest): Omit<CollaborationRequestEntity, 'created_at' | 'updated_at'> {
    return {
      id: request.id,
      campaign_id: request.campaignId,
      influencer_id: request.influencerId,
      status: request.status,
      request_date: request.requestDate.toISOString(),
      proposed_content: request.proposedContent,
      reservation_date: request.reservationDetails?.date.toISOString(),
      reservation_time: request.reservationDetails?.time,
      companions: request.reservationDetails?.companions || 0,
      special_requests: request.reservationDetails?.specialRequests,
      delivery_address: request.deliveryDetails?.address,
      delivery_phone: request.deliveryDetails?.phone,
      preferred_delivery_time: request.deliveryDetails?.preferredTime,
      admin_notes: request.adminNotes
    };
  }
}