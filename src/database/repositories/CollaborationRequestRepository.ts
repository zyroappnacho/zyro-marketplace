import { BaseRepository } from './BaseRepository';
import {
  CollaborationRequestEntity,
  ContentDeliveredEntity,
  CreateCollaborationRequestData,
  UpdateCollaborationRequestData,
  CollaborationRequestWithDetails
} from '../entities';
import { DatabaseMappers } from '../mappers';
import { CollaborationRequest, CollaborationStatus } from '../../types';
import * as Crypto from 'expo-crypto';

export class CollaborationRequestRepository extends BaseRepository<CollaborationRequestEntity, CreateCollaborationRequestData, UpdateCollaborationRequestData> {
  constructor() {
    super('collaboration_requests');
  }

  /**
   * Create a new collaboration request
   */
  async createCollaborationRequest(
    requestData: Omit<CollaborationRequest, 'id'>
  ): Promise<string> {
    // Check if request already exists for this campaign and influencer
    const existingRequest = await this.findFirst({
      campaign_id: requestData.campaignId,
      influencer_id: requestData.influencerId
    });

    if (existingRequest) {
      throw new Error('Collaboration request already exists for this campaign and influencer');
    }

    const requestId = await Crypto.randomUUID();
    const entity = DatabaseMappers.mapCollaborationRequestToEntity({
      ...requestData,
      id: requestId
    });

    await this.db.runAsync(
      `INSERT INTO collaboration_requests (
        id, campaign_id, influencer_id, status, request_date, proposed_content,
        reservation_date, reservation_time, companions, special_requests,
        delivery_address, delivery_phone, preferred_delivery_time, admin_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entity.id,
        entity.campaign_id,
        entity.influencer_id,
        entity.status,
        entity.request_date,
        entity.proposed_content,
        entity.reservation_date,
        entity.reservation_time,
        entity.companions,
        entity.special_requests,
        entity.delivery_address,
        entity.delivery_phone,
        entity.preferred_delivery_time,
        entity.admin_notes
      ]
    );

    return requestId;
  }

  /**
   * Update collaboration request
   */
  async updateCollaborationRequest(
    requestId: string,
    updateData: Partial<CollaborationRequest>
  ): Promise<boolean> {
    const entity = DatabaseMappers.mapCollaborationRequestToEntity({
      id: requestId,
      ...updateData
    } as CollaborationRequest);

    const updateFields: Partial<CollaborationRequestEntity> = {};
    if (updateData.status) updateFields.status = entity.status;
    if (updateData.proposedContent) updateFields.proposed_content = entity.proposed_content;
    if (updateData.reservationDetails) {
      updateFields.reservation_date = entity.reservation_date;
      updateFields.reservation_time = entity.reservation_time;
      updateFields.companions = entity.companions;
      updateFields.special_requests = entity.special_requests;
    }
    if (updateData.deliveryDetails) {
      updateFields.delivery_address = entity.delivery_address;
      updateFields.delivery_phone = entity.delivery_phone;
      updateFields.preferred_delivery_time = entity.preferred_delivery_time;
    }
    if (updateData.adminNotes) updateFields.admin_notes = entity.admin_notes;

    return await this.update(requestId, updateFields);
  }

  /**
   * Get collaboration request by ID with full details
   */
  async getCollaborationRequestById(requestId: string): Promise<CollaborationRequest | null> {
    const entity = await this.findById(requestId);
    if (!entity) return null;

    const contentDelivered = await this.getContentDelivered(requestId);
    return DatabaseMappers.mapCollaborationRequestEntityToCollaborationRequest(entity, contentDelivered);
  }

  /**
   * Get collaboration requests by campaign
   */
  async getRequestsByCampaign(
    campaignId: string,
    status?: CollaborationStatus
  ): Promise<CollaborationRequest[]> {
    const conditions: Record<string, any> = { campaign_id: campaignId };
    if (status) conditions.status = status;

    const entities = await this.findAll(conditions, 'request_date DESC');
    const results: CollaborationRequest[] = [];

    for (const entity of entities) {
      const contentDelivered = await this.getContentDelivered(entity.id);
      results.push(
        DatabaseMappers.mapCollaborationRequestEntityToCollaborationRequest(entity, contentDelivered)
      );
    }

    return results;
  }

  /**
   * Get collaboration requests by influencer
   */
  async getRequestsByInfluencer(
    influencerId: string,
    status?: CollaborationStatus
  ): Promise<CollaborationRequest[]> {
    const conditions: Record<string, any> = { influencer_id: influencerId };
    if (status) conditions.status = status;

    const entities = await this.findAll(conditions, 'request_date DESC');
    const results: CollaborationRequest[] = [];

    for (const entity of entities) {
      const contentDelivered = await this.getContentDelivered(entity.id);
      results.push(
        DatabaseMappers.mapCollaborationRequestEntityToCollaborationRequest(entity, contentDelivered)
      );
    }

    return results;
  }

  /**
   * Get collaboration requests with full details (campaign and influencer info)
   */
  async getRequestsWithDetails(
    status?: CollaborationStatus,
    limit?: number
  ): Promise<CollaborationRequestWithDetails[]> {
    let query = `
      SELECT 
        cr.*,
        c.title as campaign_title,
        c.business_name as campaign_business_name,
        c.category as campaign_category,
        c.city as campaign_city,
        i.full_name as influencer_name,
        i.instagram_username as influencer_instagram,
        i.instagram_followers as influencer_followers
      FROM collaboration_requests cr
      LEFT JOIN campaigns c ON cr.campaign_id = c.id
      LEFT JOIN influencers i ON cr.influencer_id = i.id
    `;
    const params: any[] = [];

    if (status) {
      query += ' WHERE cr.status = ?';
      params.push(status);
    }

    query += ' ORDER BY cr.request_date DESC';

    if (limit) {
      query += ` LIMIT ${limit}`;
    }

    return await this.executeQuery<CollaborationRequestWithDetails>(query, params);
  }

  /**
   * Get pending requests for admin approval
   */
  async getPendingRequests(): Promise<CollaborationRequest[]> {
    return await this.getRequestsByStatus('pending');
  }

  /**
   * Get requests by status
   */
  async getRequestsByStatus(status: CollaborationStatus): Promise<CollaborationRequest[]> {
    const entities = await this.findAll({ status }, 'request_date DESC');
    const results: CollaborationRequest[] = [];

    for (const entity of entities) {
      const contentDelivered = await this.getContentDelivered(entity.id);
      results.push(
        DatabaseMappers.mapCollaborationRequestEntityToCollaborationRequest(entity, contentDelivered)
      );
    }

    return results;
  }

  /**
   * Update request status
   */
  async updateRequestStatus(
    requestId: string,
    status: CollaborationStatus,
    adminNotes?: string
  ): Promise<boolean> {
    const updateData: Partial<CollaborationRequestEntity> = { status };
    if (adminNotes) updateData.admin_notes = adminNotes;

    return await this.update(requestId, updateData);
  }

  /**
   * Get collaboration statistics
   */
  async getCollaborationStats(): Promise<{
    total: number;
    byStatus: Record<CollaborationStatus, number>;
    completionRate: number;
    averageResponseTime: number; // in hours
  }> {
    const total = await this.count();

    const statusStats = await this.executeQuery<{ status: CollaborationStatus; count: number }>(
      'SELECT status, COUNT(*) as count FROM collaboration_requests GROUP BY status'
    );

    const completionStats = await this.executeQueryFirst<{ completed: number; total: number }>(`
      SELECT 
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        COUNT(*) as total
      FROM collaboration_requests
      WHERE status IN ('completed', 'cancelled', 'rejected')
    `);

    // Calculate average response time (from request to approval/rejection)
    const responseTimeStats = await this.executeQueryFirst<{ avg_hours: number }>(`
      SELECT AVG(
        (julianday(updated_at) - julianday(request_date)) * 24
      ) as avg_hours
      FROM collaboration_requests
      WHERE status IN ('approved', 'rejected')
    `);

    const byStatus: Record<CollaborationStatus, number> = {
      pending: 0,
      approved: 0,
      rejected: 0,
      completed: 0,
      cancelled: 0
    };

    statusStats.forEach(stat => {
      byStatus[stat.status] = stat.count;
    });

    const completionRate = completionStats?.total 
      ? (completionStats.completed / completionStats.total) * 100 
      : 0;

    return {
      total,
      byStatus,
      completionRate,
      averageResponseTime: responseTimeStats?.avg_hours || 0
    };
  }

  /**
   * Get requests requiring content delivery
   */
  async getRequestsRequiringContent(): Promise<CollaborationRequest[]> {
    // Get approved requests that haven't delivered content yet
    const query = `
      SELECT cr.* FROM collaboration_requests cr
      LEFT JOIN content_delivered cd ON cr.id = cd.collaboration_request_id
      WHERE cr.status = 'approved' AND cd.id IS NULL
      ORDER BY cr.request_date ASC
    `;

    const entities = await this.executeQuery<CollaborationRequestEntity>(query);
    const results: CollaborationRequest[] = [];

    for (const entity of entities) {
      const contentDelivered = await this.getContentDelivered(entity.id);
      results.push(
        DatabaseMappers.mapCollaborationRequestEntityToCollaborationRequest(entity, contentDelivered)
      );
    }

    return results;
  }

  /**
   * Add content delivery
   */
  async addContentDelivery(
    requestId: string,
    type: 'instagram_story' | 'tiktok_video',
    url: string
  ): Promise<string> {
    const contentId = await Crypto.randomUUID();
    
    await this.db.runAsync(
      'INSERT INTO content_delivered (id, collaboration_request_id, type, url) VALUES (?, ?, ?, ?)',
      [contentId, requestId, type, url]
    );

    // Check if all required content is delivered and update status
    await this.checkAndUpdateContentCompletion(requestId);

    return contentId;
  }

  /**
   * Get content delivered for a request
   */
  private async getContentDelivered(requestId: string): Promise<ContentDeliveredEntity[]> {
    return await this.executeQuery<ContentDeliveredEntity>(
      'SELECT * FROM content_delivered WHERE collaboration_request_id = ? ORDER BY delivered_at ASC',
      [requestId]
    );
  }

  /**
   * Check if all required content is delivered and update status
   */
  private async checkAndUpdateContentCompletion(requestId: string): Promise<void> {
    const request = await this.findById(requestId);
    if (!request) return;

    // Get campaign requirements
    const campaign = await this.executeQueryFirst<{
      instagram_stories: number;
      tiktok_videos: number;
    }>(
      'SELECT instagram_stories, tiktok_videos FROM campaigns WHERE id = ?',
      [request.campaign_id]
    );

    if (!campaign) return;

    // Count delivered content
    const deliveredContent = await this.executeQuery<{
      type: string;
      count: number;
    }>(
      'SELECT type, COUNT(*) as count FROM content_delivered WHERE collaboration_request_id = ? GROUP BY type',
      [requestId]
    );

    const instagramCount = deliveredContent.find(c => c.type === 'instagram_story')?.count || 0;
    const tiktokCount = deliveredContent.find(c => c.type === 'tiktok_video')?.count || 0;

    // Check if requirements are met
    const instagramRequired = campaign.instagram_stories || 0;
    const tiktokRequired = campaign.tiktok_videos || 0;

    if (instagramCount >= instagramRequired && tiktokCount >= tiktokRequired) {
      await this.updateRequestStatus(requestId, 'completed');
    }
  }

  /**
   * Get requests by date range
   */
  async getRequestsByDateRange(
    startDate: Date,
    endDate: Date,
    status?: CollaborationStatus
  ): Promise<CollaborationRequest[]> {
    let whereClause = 'request_date BETWEEN ? AND ?';
    const params = [startDate.toISOString(), endDate.toISOString()];

    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    const entities = await this.findWhere(whereClause, params, 'request_date DESC');
    const results: CollaborationRequest[] = [];

    for (const entity of entities) {
      const contentDelivered = await this.getContentDelivered(entity.id);
      results.push(
        DatabaseMappers.mapCollaborationRequestEntityToCollaborationRequest(entity, contentDelivered)
      );
    }

    return results;
  }

  /**
   * Cancel request
   */
  async cancelRequest(requestId: string, reason?: string): Promise<boolean> {
    const updateData: Partial<CollaborationRequestEntity> = { 
      status: 'cancelled'
    };
    
    if (reason) {
      updateData.admin_notes = reason;
    }

    return await this.update(requestId, updateData);
  }

  // === METHODS FOR COLLABORATION SLICE ===

  /**
   * Create collaboration request (for Redux slice)
   */
  async createRequest(requestData: Omit<CollaborationRequest, 'id'>): Promise<CollaborationRequest> {
    const requestId = await this.createCollaborationRequest(requestData);
    const created = await this.getCollaborationRequestById(requestId);
    if (!created) {
      throw new Error('Failed to create collaboration request');
    }
    return created;
  }

  /**
   * Update status (for Redux slice)
   */
  async updateStatus(
    requestId: string,
    status: CollaborationStatus,
    adminNotes?: string
  ): Promise<CollaborationRequest> {
    const success = await this.updateRequestStatus(requestId, status, adminNotes);
    if (!success) {
      throw new Error('Failed to update collaboration status');
    }
    
    const updated = await this.getCollaborationRequestById(requestId);
    if (!updated) {
      throw new Error('Failed to retrieve updated collaboration request');
    }
    
    return updated;
  }

  /**
   * Update content delivery (for Redux slice)
   */
  async updateContentDelivery(
    requestId: string,
    contentDelivered: {
      instagramStories: string[];
      tiktokVideos: string[];
      deliveredAt: Date;
    }
  ): Promise<CollaborationRequest> {
    // Add Instagram stories
    for (const storyUrl of contentDelivered.instagramStories) {
      await this.addContentDelivery(requestId, 'instagram_story', storyUrl);
    }

    // Add TikTok videos
    for (const videoUrl of contentDelivered.tiktokVideos) {
      await this.addContentDelivery(requestId, 'tiktok_video', videoUrl);
    }

    const updated = await this.getCollaborationRequestById(requestId);
    if (!updated) {
      throw new Error('Failed to retrieve updated collaboration request');
    }
    
    return updated;
  }

  /**
   * Find by influencer (for Redux slice)
   */
  async findByInfluencer(influencerId: string): Promise<CollaborationRequest[]> {
    return await this.getRequestsByInfluencer(influencerId);
  }

  /**
   * Find by campaign (for Redux slice)
   */
  async findByCampaign(campaignId: string): Promise<CollaborationRequest[]> {
    return await this.getRequestsByCampaign(campaignId);
  }

  /**
   * Find by status (for Redux slice)
   */
  async findByStatus(status: CollaborationStatus): Promise<CollaborationRequest[]> {
    return await this.getRequestsByStatus(status);
  }
}