import { BaseRepository } from './BaseRepository';
import {
  CampaignEntity,
  CreateCampaignData,
  UpdateCampaignData,
  CampaignWithCompany
} from '../entities';
import { DatabaseMappers } from '../mappers';
import { Campaign, CampaignCategory, CampaignStatus } from '../../types';
import * as Crypto from 'expo-crypto';

export class CampaignRepository extends BaseRepository<CampaignEntity, CreateCampaignData, UpdateCampaignData> {
  constructor() {
    super('campaigns');
  }

  /**
   * Create a new campaign
   */
  async createCampaign(campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const campaignId = await Crypto.randomUUID();
    const entity = DatabaseMappers.mapCampaignToCampaignEntity({
      ...campaignData,
      id: campaignId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await this.db.runAsync(
      `INSERT INTO campaigns (
        id, title, description, business_name, category, city, address, 
        latitude, longitude, images, min_instagram_followers, min_tiktok_followers,
        max_companions, what_includes, instagram_stories, tiktok_videos,
        content_deadline, company_id, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entity.id,
        entity.title,
        entity.description,
        entity.business_name,
        entity.category,
        entity.city,
        entity.address,
        entity.latitude,
        entity.longitude,
        entity.images,
        entity.min_instagram_followers,
        entity.min_tiktok_followers,
        entity.max_companions,
        entity.what_includes,
        entity.instagram_stories,
        entity.tiktok_videos,
        entity.content_deadline,
        entity.company_id,
        entity.status,
        entity.created_by
      ]
    );

    return campaignId;
  }

  /**
   * Update campaign
   */
  async updateCampaign(campaignId: string, updateData: Partial<Campaign>): Promise<boolean> {
    const entity = DatabaseMappers.mapCampaignToCampaignEntity({
      id: campaignId,
      ...updateData
    } as Campaign);

    const updateFields: Partial<CampaignEntity> = {};
    if (updateData.title) updateFields.title = entity.title;
    if (updateData.description) updateFields.description = entity.description;
    if (updateData.businessName) updateFields.business_name = entity.business_name;
    if (updateData.category) updateFields.category = entity.category;
    if (updateData.city) updateFields.city = entity.city;
    if (updateData.address) updateFields.address = entity.address;
    if (updateData.coordinates) {
      updateFields.latitude = entity.latitude;
      updateFields.longitude = entity.longitude;
    }
    if (updateData.images) updateFields.images = entity.images;
    if (updateData.requirements) {
      updateFields.min_instagram_followers = entity.min_instagram_followers;
      updateFields.min_tiktok_followers = entity.min_tiktok_followers;
      updateFields.max_companions = entity.max_companions;
    }
    if (updateData.whatIncludes) updateFields.what_includes = entity.what_includes;
    if (updateData.contentRequirements) {
      updateFields.instagram_stories = entity.instagram_stories;
      updateFields.tiktok_videos = entity.tiktok_videos;
      updateFields.content_deadline = entity.content_deadline;
    }
    if (updateData.status) updateFields.status = entity.status;

    return await this.update(campaignId, updateFields);
  }

  /**
   * Get campaign by ID with full data
   */
  async getCampaignById(campaignId: string): Promise<Campaign | null> {
    const entity = await this.findById(campaignId);
    if (!entity) return null;

    return DatabaseMappers.mapCampaignEntityToCampaign(entity);
  }

  /**
   * Get campaigns by city and category
   */
  async getCampaignsByCityAndCategory(
    city?: string,
    category?: CampaignCategory,
    status: CampaignStatus = 'active',
    limit?: number
  ): Promise<Campaign[]> {
    const conditions: Record<string, any> = { status };
    if (city) conditions.city = city;
    if (category) conditions.category = category;

    const entities = await this.findAll(conditions, 'created_at DESC', limit);
    return entities.map(entity => DatabaseMappers.mapCampaignEntityToCampaign(entity));
  }

  /**
   * Get campaigns for influencer based on follower requirements
   */
  async getCampaignsForInfluencer(
    instagramFollowers: number,
    tiktokFollowers: number,
    city?: string,
    category?: CampaignCategory
  ): Promise<Campaign[]> {
    let whereClause = `
      status = 'active' AND 
      (min_instagram_followers IS NULL OR min_instagram_followers <= ?) AND
      (min_tiktok_followers IS NULL OR min_tiktok_followers <= ?)
    `;
    const params = [instagramFollowers, tiktokFollowers];

    if (city) {
      whereClause += ' AND city = ?';
      params.push(city);
    }

    if (category) {
      whereClause += ' AND category = ?';
      params.push(category);
    }

    const entities = await this.findWhere(whereClause, params, 'created_at DESC');
    return entities.map(entity => DatabaseMappers.mapCampaignEntityToCampaign(entity));
  }

  /**
   * Get campaigns by company
   */
  async getCampaignsByCompany(companyId: string, status?: CampaignStatus): Promise<Campaign[]> {
    const conditions: Record<string, any> = { company_id: companyId };
    if (status) conditions.status = status;

    const entities = await this.findAll(conditions, 'created_at DESC');
    return entities.map(entity => DatabaseMappers.mapCampaignEntityToCampaign(entity));
  }

  /**
   * Get campaigns created by admin
   */
  async getCampaignsByAdmin(adminId: string, status?: CampaignStatus): Promise<Campaign[]> {
    const conditions: Record<string, any> = { created_by: adminId };
    if (status) conditions.status = status;

    const entities = await this.findAll(conditions, 'created_at DESC');
    return entities.map(entity => DatabaseMappers.mapCampaignEntityToCampaign(entity));
  }

  /**
   * Search campaigns by title or business name
   */
  async searchCampaigns(
    query: string,
    city?: string,
    category?: CampaignCategory,
    status: CampaignStatus = 'active',
    limit: number = 50
  ): Promise<Campaign[]> {
    let whereClause = `(title LIKE ? OR business_name LIKE ?) AND status = ?`;
    const params = [`%${query}%`, `%${query}%`, status];

    if (city) {
      whereClause += ' AND city = ?';
      params.push(city);
    }

    if (category) {
      whereClause += ' AND category = ?';
      params.push(category);
    }

    const entities = await this.findWhere(whereClause, params, 'created_at DESC', limit);
    return entities.map(entity => DatabaseMappers.mapCampaignEntityToCampaign(entity));
  }

  /**
   * Get campaigns with company information
   */
  async getCampaignsWithCompanyInfo(
    status?: CampaignStatus,
    limit?: number
  ): Promise<CampaignWithCompany[]> {
    let query = `
      SELECT c.*, comp.company_name as company_name_full
      FROM campaigns c
      LEFT JOIN companies comp ON c.company_id = comp.id
    `;
    const params: any[] = [];

    if (status) {
      query += ' WHERE c.status = ?';
      params.push(status);
    }

    query += ' ORDER BY c.created_at DESC';

    if (limit) {
      query += ` LIMIT ${limit}`;
    }

    return await this.executeQuery<CampaignWithCompany>(query, params);
  }

  /**
   * Get campaign statistics
   */
  async getCampaignStats(): Promise<{
    total: number;
    byStatus: Record<CampaignStatus, number>;
    byCategory: { category: CampaignCategory; count: number }[];
    byCities: { city: string; count: number }[];
  }> {
    const total = await this.count();

    const statusStats = await this.executeQuery<{ status: CampaignStatus; count: number }>(
      'SELECT status, COUNT(*) as count FROM campaigns GROUP BY status'
    );

    const categoryStats = await this.executeQuery<{ category: CampaignCategory; count: number }>(
      'SELECT category, COUNT(*) as count FROM campaigns GROUP BY category ORDER BY count DESC'
    );

    const cityStats = await this.executeQuery<{ city: string; count: number }>(
      'SELECT city, COUNT(*) as count FROM campaigns GROUP BY city ORDER BY count DESC'
    );

    const byStatus: Record<CampaignStatus, number> = {
      draft: 0,
      active: 0,
      paused: 0,
      completed: 0
    };

    statusStats.forEach(stat => {
      byStatus[stat.status] = stat.count;
    });

    return {
      total,
      byStatus,
      byCategory: categoryStats,
      byCities: cityStats
    };
  }

  /**
   * Get campaigns by location (for map view)
   */
  async getCampaignsByLocation(
    bounds?: {
      northEast: { lat: number; lng: number };
      southWest: { lat: number; lng: number };
    },
    status: CampaignStatus = 'active'
  ): Promise<Campaign[]> {
    let whereClause = 'status = ? AND latitude IS NOT NULL AND longitude IS NOT NULL';
    const params = [status];

    if (bounds) {
      whereClause += ` AND latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?`;
      params.push(
        bounds.southWest.lat,
        bounds.northEast.lat,
        bounds.southWest.lng,
        bounds.northEast.lng
      );
    }

    const entities = await this.findWhere(whereClause, params, 'created_at DESC');
    return entities.map(entity => DatabaseMappers.mapCampaignEntityToCampaign(entity));
  }

  /**
   * Update campaign status
   */
  async updateCampaignStatus(campaignId: string, status: CampaignStatus): Promise<boolean> {
    return await this.update(campaignId, { status });
  }

  /**
   * Get active campaigns count by company
   */
  async getActiveCampaignsCountByCompany(companyId: string): Promise<number> {
    return await this.count({ company_id: companyId, status: 'active' });
  }

  /**
   * Get campaigns expiring soon (for content deadline)
   */
  async getCampaignsExpiringSoon(hoursFromNow: number = 24): Promise<Campaign[]> {
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + hoursFromNow);

    // This would need to be implemented based on collaboration requests
    // For now, return empty array as this requires collaboration data
    return [];
  }

  /**
   * Get popular campaigns (most collaboration requests)
   */
  async getPopularCampaigns(limit: number = 10): Promise<Campaign[]> {
    const query = `
      SELECT c.*, COUNT(cr.id) as request_count
      FROM campaigns c
      LEFT JOIN collaboration_requests cr ON c.id = cr.campaign_id
      WHERE c.status = 'active'
      GROUP BY c.id
      ORDER BY request_count DESC, c.created_at DESC
      LIMIT ${limit}
    `;

    const entities = await this.executeQuery<CampaignEntity>(query);
    return entities.map(entity => DatabaseMappers.mapCampaignEntityToCampaign(entity));
  }
}