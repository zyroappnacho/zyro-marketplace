import { BaseRepository } from './BaseRepository';
import {
  InfluencerEntity,
  AudienceStatEntity,
  MonthlyStatEntity,
  CreateInfluencerData,
  UpdateInfluencerData
} from '../entities';
import { DatabaseMappers } from '../mappers';
import { Influencer } from '../../types';
import { UserRepository } from './UserRepository';
import * as Crypto from 'expo-crypto';

export class InfluencerRepository extends BaseRepository<InfluencerEntity, CreateInfluencerData, UpdateInfluencerData> {
  private userRepository: UserRepository;

  constructor() {
    super('influencers');
    this.userRepository = new UserRepository();
  }

  /**
   * Create a complete influencer profile
   */
  async createInfluencer(influencerData: Omit<Influencer, 'id' | 'createdAt' | 'updatedAt'>, password: string): Promise<string> {
    return await this.transaction(async (db) => {
      // Create user account
      const userId = await this.userRepository.createUser(
        influencerData.email,
        password,
        'influencer'
      );

      // Create influencer profile
      const influencerId = await Crypto.randomUUID();
      const influencerEntity: CreateInfluencerData = {
        id: influencerId,
        user_id: userId,
        full_name: influencerData.fullName,
        instagram_username: influencerData.instagramUsername,
        tiktok_username: influencerData.tiktokUsername,
        instagram_followers: influencerData.instagramFollowers,
        tiktok_followers: influencerData.tiktokFollowers,
        profile_image: influencerData.profileImage,
        phone: influencerData.phone,
        address: influencerData.address,
        city: influencerData.city
      };

      await db.runAsync(
        `INSERT INTO influencers (id, user_id, full_name, instagram_username, tiktok_username, 
         instagram_followers, tiktok_followers, profile_image, phone, address, city)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          influencerEntity.id,
          influencerEntity.user_id,
          influencerEntity.full_name,
          influencerEntity.instagram_username,
          influencerEntity.tiktok_username,
          influencerEntity.instagram_followers,
          influencerEntity.tiktok_followers,
          influencerEntity.profile_image,
          influencerEntity.phone,
          influencerEntity.address,
          influencerEntity.city
        ]
      );

      // Create audience stats
      await this.createAudienceStats(db, influencerId, influencerData.audienceStats);

      // Create monthly stats
      if (influencerData.audienceStats.monthlyStats) {
        await this.createMonthlyStats(db, influencerId, influencerData.audienceStats.monthlyStats);
      }

      return userId;
    });
  }

  /**
   * Update influencer profile
   */
  async updateInfluencer(userId: string, updateData: Partial<Influencer>): Promise<boolean> {
    return await this.transaction(async (db) => {
      const influencer = await db.getFirstAsync<InfluencerEntity>(
        'SELECT * FROM influencers WHERE user_id = ?',
        [userId]
      );

      if (!influencer) {
        throw new Error('Influencer not found');
      }

      // Update influencer basic data
      const influencerUpdateData: Partial<InfluencerEntity> = {};
      if (updateData.fullName) influencerUpdateData.full_name = updateData.fullName;
      if (updateData.instagramUsername) influencerUpdateData.instagram_username = updateData.instagramUsername;
      if (updateData.tiktokUsername) influencerUpdateData.tiktok_username = updateData.tiktokUsername;
      if (updateData.instagramFollowers !== undefined) influencerUpdateData.instagram_followers = updateData.instagramFollowers;
      if (updateData.tiktokFollowers !== undefined) influencerUpdateData.tiktok_followers = updateData.tiktokFollowers;
      if (updateData.profileImage) influencerUpdateData.profile_image = updateData.profileImage;
      if (updateData.phone) influencerUpdateData.phone = updateData.phone;
      if (updateData.address) influencerUpdateData.address = updateData.address;
      if (updateData.city) influencerUpdateData.city = updateData.city;

      if (Object.keys(influencerUpdateData).length > 0) {
        const fields = Object.keys(influencerUpdateData);
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = [...Object.values(influencerUpdateData), influencer.id];

        await db.runAsync(
          `UPDATE influencers SET ${setClause} WHERE id = ?`,
          values
        );
      }

      // Update audience stats if provided
      if (updateData.audienceStats) {
        await this.updateAudienceStats(db, influencer.id, updateData.audienceStats);
      }

      return true;
    });
  }

  /**
   * Get influencer by user ID
   */
  async getByUserId(userId: string): Promise<Influencer | null> {
    return await this.userRepository.getInfluencerProfile(userId);
  }

  /**
   * Get influencers by city
   */
  async getByCity(city: string, limit?: number): Promise<Influencer[]> {
    const influencers = await this.findAll({ city }, 'created_at DESC', limit);
    const results: Influencer[] = [];

    for (const influencer of influencers) {
      const profile = await this.userRepository.getInfluencerProfile(influencer.user_id);
      if (profile) {
        results.push(profile);
      }
    }

    return results;
  }

  /**
   * Get influencers by follower count range
   */
  async getByFollowerRange(
    platform: 'instagram' | 'tiktok',
    minFollowers: number,
    maxFollowers?: number
  ): Promise<Influencer[]> {
    const column = platform === 'instagram' ? 'instagram_followers' : 'tiktok_followers';
    let whereClause = `${column} >= ?`;
    const params = [minFollowers];

    if (maxFollowers) {
      whereClause += ` AND ${column} <= ?`;
      params.push(maxFollowers);
    }

    const influencers = await this.findWhere(whereClause, params, 'created_at DESC');
    const results: Influencer[] = [];

    for (const influencer of influencers) {
      const profile = await this.userRepository.getInfluencerProfile(influencer.user_id);
      if (profile) {
        results.push(profile);
      }
    }

    return results;
  }

  /**
   * Search influencers by name or username
   */
  async searchInfluencers(query: string, city?: string, limit: number = 50): Promise<Influencer[]> {
    let whereClause = `(full_name LIKE ? OR instagram_username LIKE ? OR tiktok_username LIKE ?)`;
    const params = [`%${query}%`, `%${query}%`, `%${query}%`];

    if (city) {
      whereClause += ` AND city = ?`;
      params.push(city);
    }

    const influencers = await this.findWhere(whereClause, params, 'created_at DESC', limit);
    const results: Influencer[] = [];

    for (const influencer of influencers) {
      const profile = await this.userRepository.getInfluencerProfile(influencer.user_id);
      if (profile) {
        results.push(profile);
      }
    }

    return results;
  }

  /**
   * Get influencer statistics
   */
  async getInfluencerStats(): Promise<{
    total: number;
    byCities: { city: string; count: number }[];
    byFollowerRanges: {
      instagram: { range: string; count: number }[];
      tiktok: { range: string; count: number }[];
    };
  }> {
    const total = await this.count();

    const citiesStats = await this.executeQuery<{ city: string; count: number }>(
      'SELECT city, COUNT(*) as count FROM influencers GROUP BY city ORDER BY count DESC'
    );

    const instagramRanges = await this.executeQuery<{ range: string; count: number }>(`
      SELECT 
        CASE 
          WHEN instagram_followers < 1000 THEN '< 1K'
          WHEN instagram_followers < 10000 THEN '1K - 10K'
          WHEN instagram_followers < 100000 THEN '10K - 100K'
          WHEN instagram_followers < 1000000 THEN '100K - 1M'
          ELSE '1M+'
        END as range,
        COUNT(*) as count
      FROM influencers 
      GROUP BY range
      ORDER BY MIN(instagram_followers)
    `);

    const tiktokRanges = await this.executeQuery<{ range: string; count: number }>(`
      SELECT 
        CASE 
          WHEN tiktok_followers < 1000 THEN '< 1K'
          WHEN tiktok_followers < 10000 THEN '1K - 10K'
          WHEN tiktok_followers < 100000 THEN '10K - 100K'
          WHEN tiktok_followers < 1000000 THEN '100K - 1M'
          ELSE '1M+'
        END as range,
        COUNT(*) as count
      FROM influencers 
      GROUP BY range
      ORDER BY MIN(tiktok_followers)
    `);

    return {
      total,
      byCities: citiesStats,
      byFollowerRanges: {
        instagram: instagramRanges,
        tiktok: tiktokRanges
      }
    };
  }

  /**
   * Update follower counts
   */
  async updateFollowerCounts(
    userId: string,
    instagramFollowers?: number,
    tiktokFollowers?: number
  ): Promise<boolean> {
    const updateData: Partial<InfluencerEntity> = {};
    if (instagramFollowers !== undefined) updateData.instagram_followers = instagramFollowers;
    if (tiktokFollowers !== undefined) updateData.tiktok_followers = tiktokFollowers;

    if (Object.keys(updateData).length === 0) return false;

    const influencer = await this.findFirst({ user_id: userId });
    if (!influencer) return false;

    return await this.update(influencer.id, updateData);
  }

  /**
   * Create audience statistics
   */
  private async createAudienceStats(
    db: any,
    influencerId: string,
    audienceStats: Influencer['audienceStats']
  ): Promise<void> {
    // Delete existing stats
    await db.runAsync('DELETE FROM audience_stats WHERE influencer_id = ?', [influencerId]);

    // Insert countries
    for (const country of audienceStats.countries) {
      const statId = await Crypto.randomUUID();
      await db.runAsync(
        'INSERT INTO audience_stats (id, influencer_id, type, value, percentage) VALUES (?, ?, ?, ?, ?)',
        [statId, influencerId, 'country', country.country, country.percentage]
      );
    }

    // Insert cities
    for (const city of audienceStats.cities) {
      const statId = await Crypto.randomUUID();
      await db.runAsync(
        'INSERT INTO audience_stats (id, influencer_id, type, value, percentage) VALUES (?, ?, ?, ?, ?)',
        [statId, influencerId, 'city', city.city, city.percentage]
      );
    }

    // Insert age ranges
    for (const ageRange of audienceStats.ageRanges) {
      const statId = await Crypto.randomUUID();
      await db.runAsync(
        'INSERT INTO audience_stats (id, influencer_id, type, value, percentage) VALUES (?, ?, ?, ?, ?)',
        [statId, influencerId, 'age_range', ageRange.range, ageRange.percentage]
      );
    }
  }

  /**
   * Update audience statistics
   */
  private async updateAudienceStats(
    db: any,
    influencerId: string,
    audienceStats: Influencer['audienceStats']
  ): Promise<void> {
    await this.createAudienceStats(db, influencerId, audienceStats);
  }

  /**
   * Create monthly statistics
   */
  private async createMonthlyStats(
    db: any,
    influencerId: string,
    monthlyStats: { views: number; engagement: number; reach: number }
  ): Promise<void> {
    const now = new Date();
    const statId = await Crypto.randomUUID();
    
    await db.runAsync(
      `INSERT INTO monthly_stats (id, influencer_id, month, year, views, engagement, reach) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        statId,
        influencerId,
        now.getMonth() + 1,
        now.getFullYear(),
        monthlyStats.views,
        monthlyStats.engagement,
        monthlyStats.reach
      ]
    );
  }
}