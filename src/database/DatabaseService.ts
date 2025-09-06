import { databaseManager } from './database';
import {
  UserRepository,
  InfluencerRepository,
  CompanyRepository,
  CampaignRepository,
  CollaborationRequestRepository
} from './repositories';

/**
 * Main database service that provides access to all repositories
 * and manages database initialization
 */
export class DatabaseService {
  private static instance: DatabaseService;
  
  public readonly users: UserRepository;
  public readonly influencers: InfluencerRepository;
  public readonly companies: CompanyRepository;
  public readonly campaigns: CampaignRepository;
  public readonly collaborationRequests: CollaborationRequestRepository;

  private constructor() {
    this.users = new UserRepository();
    this.influencers = new InfluencerRepository();
    this.companies = new CompanyRepository();
    this.campaigns = new CampaignRepository();
    this.collaborationRequests = new CollaborationRequestRepository();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Initialize the database and all repositories
   */
  public async initialize(): Promise<void> {
    await databaseManager.initialize();
    console.log('Database service initialized successfully');
  }

  /**
   * Get database statistics from all tables
   */
  public async getStats(): Promise<{
    database: Record<string, number>;
    users: Awaited<ReturnType<UserRepository['getUserStats']>>;
    influencers: Awaited<ReturnType<InfluencerRepository['getInfluencerStats']>>;
    companies: Awaited<ReturnType<CompanyRepository['getCompanyStats']>>;
    campaigns: Awaited<ReturnType<CampaignRepository['getCampaignStats']>>;
    collaborations: Awaited<ReturnType<CollaborationRequestRepository['getCollaborationStats']>>;
  }> {
    const [
      databaseStats,
      userStats,
      influencerStats,
      companyStats,
      campaignStats,
      collaborationStats
    ] = await Promise.all([
      databaseManager.getDatabaseStats(),
      this.users.getUserStats(),
      this.influencers.getInfluencerStats(),
      this.companies.getCompanyStats(),
      this.campaigns.getCampaignStats(),
      this.collaborationRequests.getCollaborationStats()
    ]);

    return {
      database: databaseStats,
      users: userStats,
      influencers: influencerStats,
      companies: companyStats,
      campaigns: campaignStats,
      collaborations: collaborationStats
    };
  }

  /**
   * Reset the entire database (for development/testing)
   */
  public async resetDatabase(): Promise<void> {
    await databaseManager.resetDatabase();
    console.log('Database reset completed');
  }

  /**
   * Close database connection
   */
  public async close(): Promise<void> {
    await databaseManager.close();
  }

  /**
   * Execute a transaction across multiple repositories
   */
  public async executeTransaction<T>(
    callback: (service: DatabaseService) => Promise<T>
  ): Promise<T> {
    return await databaseManager.executeTransaction(async () => {
      return await callback(this);
    });
  }

  /**
   * Seed database with initial data (for development/testing)
   */
  public async seedDatabase(): Promise<void> {
    await this.executeTransaction(async () => {
      // Create admin user
      const adminUserId = await this.users.createUser(
        'admin@zyro.com',
        'admin123',
        'admin'
      );

      // Update admin status to approved
      await this.users.updateStatus(adminUserId, 'approved');

      // Create admin profile
      await databaseManager.getDatabase().runAsync(
        `INSERT INTO admins (id, user_id, username, full_name, permissions)
         VALUES (?, ?, ?, ?, ?)`,
        [
          adminUserId,
          adminUserId,
          'admin_zyrovip',
          'Zyro Administrator',
          JSON.stringify(['all'])
        ]
      );

      console.log('Database seeded with initial admin user');
    });
  }

  /**
   * Health check for database
   */
  public async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy';
    message: string;
    stats?: Record<string, number>;
  }> {
    try {
      const stats = await databaseManager.getDatabaseStats();
      return {
        status: 'healthy',
        message: 'Database is operational',
        stats
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: `Database error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// Export singleton instance
export const databaseService = DatabaseService.getInstance();