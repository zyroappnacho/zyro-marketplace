import { DatabaseService } from '../database/DatabaseService';
import { cacheService } from './cacheService';

export class OptimizedDatabaseService extends DatabaseService {
  private queryCache = new Map<string, { result: any; timestamp: number }>();
  private readonly QUERY_CACHE_TTL = 30000; // 30 seconds

  // Optimized campaign queries with indexing hints
  async getActiveCampaignsByCity(city: string, limit = 20, offset = 0) {
    const cacheKey = `campaigns_${city}_${limit}_${offset}`;
    
    // Check cache first
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const query = `
      SELECT c.*, co.companyName, co.subscription
      FROM campaigns c
      INNER JOIN companies co ON c.companyId = co.id
      WHERE c.city = ? 
        AND c.status = 'active'
        AND co.subscription->>'status' = 'active'
      ORDER BY c.createdAt DESC
      LIMIT ? OFFSET ?
    `;

    const result = await this.executeQuery(query, [city, limit, offset]);
    
    // Cache for 2 minutes
    await cacheService.set(cacheKey, result, { ttl: 120000 });
    
    return result;
  }

  // Optimized influencer lookup with follower validation
  async getEligibleInfluencersForCampaign(campaignId: string) {
    const cacheKey = `eligible_influencers_${campaignId}`;
    
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const query = `
      SELECT i.*, u.email, u.status
      FROM influencers i
      INNER JOIN users u ON i.id = u.id
      INNER JOIN campaigns c ON c.id = ?
      WHERE u.status = 'approved'
        AND (
          (c.requirements->>'minInstagramFollowers' IS NULL OR 
           i.instagramFollowers >= CAST(c.requirements->>'minInstagramFollowers' AS INTEGER))
          OR
          (c.requirements->>'minTiktokFollowers' IS NULL OR 
           i.tiktokFollowers >= CAST(c.requirements->>'minTiktokFollowers' AS INTEGER))
        )
      ORDER BY (i.instagramFollowers + i.tiktokFollowers) DESC
    `;

    const result = await this.executeQuery(query, [campaignId]);
    
    // Cache for 5 minutes
    await cacheService.set(cacheKey, result, { ttl: 300000 });
    
    return result;
  }

  // Batch operations for better performance
  async batchUpdateFollowerCounts(updates: Array<{ id: string; instagramFollowers?: number; tiktokFollowers?: number }>) {
    const transaction = await this.beginTransaction();
    
    try {
      for (const update of updates) {
        const setParts = [];
        const values = [];
        
        if (update.instagramFollowers !== undefined) {
          setParts.push('instagramFollowers = ?');
          values.push(update.instagramFollowers);
        }
        
        if (update.tiktokFollowers !== undefined) {
          setParts.push('tiktokFollowers = ?');
          values.push(update.tiktokFollowers);
        }
        
        if (setParts.length > 0) {
          values.push(update.id);
          await this.executeQuery(
            `UPDATE influencers SET ${setParts.join(', ')}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
            values
          );
        }
      }
      
      await this.commitTransaction(transaction);
      
      // Invalidate related caches
      await cacheService.invalidatePattern('eligible_influencers');
      await cacheService.invalidatePattern('campaigns');
      
    } catch (error) {
      await this.rollbackTransaction(transaction);
      throw error;
    }
  }

  // Optimized collaboration requests with pagination
  async getCollaborationRequestsWithPagination(
    filters: {
      status?: string;
      influencerId?: string;
      campaignId?: string;
      companyId?: string;
    },
    limit = 20,
    offset = 0
  ) {
    const cacheKey = `collaboration_requests_${JSON.stringify(filters)}_${limit}_${offset}`;
    
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    let whereClause = 'WHERE 1=1';
    const values = [];

    if (filters.status) {
      whereClause += ' AND cr.status = ?';
      values.push(filters.status);
    }
    
    if (filters.influencerId) {
      whereClause += ' AND cr.influencerId = ?';
      values.push(filters.influencerId);
    }
    
    if (filters.campaignId) {
      whereClause += ' AND cr.campaignId = ?';
      values.push(filters.campaignId);
    }
    
    if (filters.companyId) {
      whereClause += ' AND c.companyId = ?';
      values.push(filters.companyId);
    }

    const query = `
      SELECT 
        cr.*,
        c.title as campaignTitle,
        c.businessName,
        i.fullName as influencerName,
        i.instagramUsername,
        i.tiktokUsername,
        co.companyName
      FROM collaboration_requests cr
      INNER JOIN campaigns c ON cr.campaignId = c.id
      INNER JOIN influencers i ON cr.influencerId = i.id
      INNER JOIN companies co ON c.companyId = co.id
      ${whereClause}
      ORDER BY cr.requestDate DESC
      LIMIT ? OFFSET ?
    `;

    values.push(limit, offset);
    const result = await this.executeQuery(query, values);
    
    // Cache for 1 minute
    await cacheService.set(cacheKey, result, { ttl: 60000 });
    
    return result;
  }

  // Analytics queries with aggregation
  async getDashboardStats(adminId: string) {
    const cacheKey = `dashboard_stats_${adminId}`;
    
    const cached = await cacheService.get(cacheKey);
    if (cached) return cached;

    const queries = [
      // Active users count
      `SELECT COUNT(*) as activeInfluencers FROM users WHERE role = 'influencer' AND status = 'approved'`,
      
      // Active companies count
      `SELECT COUNT(*) as activeCompanies FROM companies WHERE subscription->>'status' = 'active'`,
      
      // Monthly revenue
      `SELECT SUM(CAST(subscription->>'price' AS DECIMAL)) as monthlyRevenue 
       FROM companies WHERE subscription->>'status' = 'active'`,
      
      // Pending approvals
      `SELECT COUNT(*) as pendingApprovals FROM users WHERE status = 'pending'`,
      
      // Active campaigns
      `SELECT COUNT(*) as activeCampaigns FROM campaigns WHERE status = 'active'`,
      
      // Recent collaboration requests
      `SELECT COUNT(*) as recentRequests 
       FROM collaboration_requests 
       WHERE requestDate >= datetime('now', '-7 days')`
    ];

    const results = await Promise.all(
      queries.map(query => this.executeQuery(query))
    );

    const stats = {
      activeInfluencers: results[0][0]?.activeInfluencers || 0,
      activeCompanies: results[1][0]?.activeCompanies || 0,
      monthlyRevenue: results[2][0]?.monthlyRevenue || 0,
      pendingApprovals: results[3][0]?.pendingApprovals || 0,
      activeCampaigns: results[4][0]?.activeCampaigns || 0,
      recentRequests: results[5][0]?.recentRequests || 0,
    };
    
    // Cache for 5 minutes
    await cacheService.set(cacheKey, stats, { ttl: 300000 });
    
    return stats;
  }

  // Cleanup expired cache entries
  async cleanupExpiredCache() {
    const expiredKeys = [];
    
    for (const [key, value] of this.queryCache.entries()) {
      if (Date.now() - value.timestamp > this.QUERY_CACHE_TTL) {
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => this.queryCache.delete(key));
  }

  // Database maintenance operations
  async optimizeDatabase() {
    const maintenanceQueries = [
      'VACUUM',
      'REINDEX',
      'ANALYZE',
    ];

    for (const query of maintenanceQueries) {
      try {
        await this.executeQuery(query);
      } catch (error) {
        console.warn(`Database maintenance query failed: ${query}`, error);
      }
    }
  }
}

export const optimizedDatabaseService = new OptimizedDatabaseService();