// Web-compatible database using localStorage
import { Platform } from 'react-native';

export class DatabaseManager {
  private static instance: DatabaseManager;
  private isInitialized = false;
  private readonly storagePrefix = 'zyro_marketplace_';

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Initialize the database (web version using localStorage)
   */
  public async initialize(): Promise<void> {
    try {
      if (Platform.OS === 'web' && typeof Storage !== 'undefined') {
        // Initialize localStorage structure
        this.initializeLocalStorage();
        this.isInitialized = true;
        console.log('Web database initialized successfully using localStorage');
      } else {
        // Fallback to in-memory storage
        this.initializeMemoryStorage();
        this.isInitialized = true;
        console.log('Web database initialized successfully using memory storage');
      }
    } catch (error) {
      console.error('Failed to initialize web database:', error);
      // Don't throw error to prevent app crash
    }
  }

  /**
   * Initialize localStorage structure
   */
  private initializeLocalStorage(): void {
    const tables = [
      'users', 'influencers', 'companies', 'admins', 'campaigns',
      'collaboration_requests', 'notifications', 'payment_transactions'
    ];

    tables.forEach(table => {
      const key = `${this.storagePrefix}${table}`;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify([]));
      }
    });

    // Initialize default admin user if not exists
    this.initializeDefaultData();
  }

  /**
   * Initialize memory storage as fallback
   */
  private initializeMemoryStorage(): void {
    if (!(window as any).zyroMemoryDB) {
      (window as any).zyroMemoryDB = {
        users: [],
        influencers: [],
        companies: [],
        admins: [],
        campaigns: [],
        collaboration_requests: [],
        notifications: [],
        payment_transactions: []
      };
    }

    this.initializeDefaultData();
  }

  /**
   * Initialize default data (admin user, sample data)
   */
  private initializeDefaultData(): void {
    try {
      // Check if admin user exists
      const admins = this.getTableData('admins');
      if (admins.length === 0) {
        // Create default admin user
        const defaultAdmin = {
          id: 'admin-1',
          email: 'admin@zyromarketplace.com',
          role: 'admin',
          status: 'approved',
          username: 'admin_zyrovip',
          fullName: 'Administrador Zyro',
          permissions: ['all'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLoginAt: null
        };

        this.insertData('admins', defaultAdmin);
        console.log('Default admin user created');
      }

      // Create sample influencer for testing
      const influencers = this.getTableData('influencers');
      if (influencers.length === 0) {
        const sampleInfluencer = {
          id: 'influencer-1',
          email: 'pruebainflu@test.com',
          role: 'influencer',
          status: 'approved',
          fullName: 'Influencer de Prueba',
          instagramUsername: 'pruebainflu',
          tiktokUsername: 'pruebainflu',
          instagramFollowers: 15000,
          tiktokFollowers: 8000,
          city: 'MADRID',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          audienceStats: {
            countries: [{ country: 'España', percentage: 85 }],
            cities: [{ city: 'Madrid', percentage: 40 }],
            ageRanges: [{ range: '18-24', percentage: 35 }],
            monthlyStats: {
              views: 50000,
              engagement: 4.5,
              reach: 12000
            }
          }
        };

        this.insertData('influencers', sampleInfluencer);
        console.log('Sample influencer created');
      }

      // Create sample campaigns
      const campaigns = this.getTableData('campaigns');
      if (campaigns.length === 0) {
        const sampleCampaigns = [
          {
            id: 'campaign-1',
            title: 'Cena Premium en La Terraza',
            description: 'Experiencia gastronómica exclusiva en nuestro restaurante premium',
            businessName: 'La Terraza Premium',
            category: 'restaurantes',
            city: 'MADRID',
            address: 'Calle Serrano 45, Madrid',
            coordinates: { lat: 40.4168, lng: -3.7038 },
            images: [],
            requirements: {
              minInstagramFollowers: 5000,
              maxCompanions: 2
            },
            whatIncludes: [
              'Cena completa para 2 personas',
              'Bebidas incluidas',
              'Postre especial de la casa'
            ],
            contentRequirements: {
              instagramStories: 2,
              tiktokVideos: 0,
              deadline: 72
            },
            companyId: 'company-1',
            status: 'active',
            createdBy: 'admin-1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'campaign-2',
            title: 'Sesión Spa Completa',
            description: 'Relajación total en nuestro spa de lujo',
            businessName: 'Spa Wellness Premium',
            category: 'salud-belleza',
            city: 'MADRID',
            address: 'Gran Vía 28, Madrid',
            coordinates: { lat: 40.4200, lng: -3.7025 },
            images: [],
            requirements: {
              minInstagramFollowers: 10000,
              maxCompanions: 1
            },
            whatIncludes: [
              'Masaje relajante de 60 minutos',
              'Acceso a todas las instalaciones',
              'Tratamiento facial premium'
            ],
            contentRequirements: {
              instagramStories: 2,
              tiktokVideos: 1,
              deadline: 72
            },
            companyId: 'company-2',
            status: 'active',
            createdBy: 'admin-1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];

        sampleCampaigns.forEach(campaign => {
          this.insertData('campaigns', campaign);
        });
        console.log('Sample campaigns created');
      }

    } catch (error) {
      console.error('Error initializing default data:', error);
    }
  }

  /**
   * Get table data from storage
   */
  private getTableData(tableName: string): any[] {
    try {
      if (Platform.OS === 'web' && typeof Storage !== 'undefined') {
        const data = localStorage.getItem(`${this.storagePrefix}${tableName}`);
        return data ? JSON.parse(data) : [];
      } else {
        return (window as any).zyroMemoryDB?.[tableName] || [];
      }
    } catch (error) {
      console.error(`Error getting table data for ${tableName}:`, error);
      return [];
    }
  }

  /**
   * Set table data to storage
   */
  private setTableData(tableName: string, data: any[]): void {
    try {
      if (Platform.OS === 'web' && typeof Storage !== 'undefined') {
        localStorage.setItem(`${this.storagePrefix}${tableName}`, JSON.stringify(data));
      } else {
        if (!(window as any).zyroMemoryDB) {
          (window as any).zyroMemoryDB = {};
        }
        (window as any).zyroMemoryDB[tableName] = data;
      }
    } catch (error) {
      console.error(`Error setting table data for ${tableName}:`, error);
    }
  }

  /**
   * Insert data into table
   */
  public insertData(tableName: string, data: any): void {
    const tableData = this.getTableData(tableName);
    tableData.push(data);
    this.setTableData(tableName, tableData);
  }

  /**
   * Update data in table
   */
  public updateData(tableName: string, id: string, updates: any): void {
    const tableData = this.getTableData(tableName);
    const index = tableData.findIndex(item => item.id === id);
    if (index !== -1) {
      tableData[index] = { ...tableData[index], ...updates, updatedAt: new Date().toISOString() };
      this.setTableData(tableName, tableData);
    }
  }

  /**
   * Delete data from table
   */
  public deleteData(tableName: string, id: string): void {
    const tableData = this.getTableData(tableName);
    const filteredData = tableData.filter(item => item.id !== id);
    this.setTableData(tableName, filteredData);
  }

  /**
   * Find data by ID
   */
  public findById(tableName: string, id: string): any | null {
    const tableData = this.getTableData(tableName);
    return tableData.find(item => item.id === id) || null;
  }

  /**
   * Find data by criteria
   */
  public findBy(tableName: string, criteria: Record<string, any>): any[] {
    const tableData = this.getTableData(tableName);
    return tableData.filter(item => {
      return Object.entries(criteria).every(([key, value]) => item[key] === value);
    });
  }

  /**
   * Get all data from table
   */
  public getAll(tableName: string): any[] {
    return this.getTableData(tableName);
  }

  /**
   * Execute a mock transaction
   */
  public async executeTransaction(operations: () => Promise<void>): Promise<void> {
    try {
      await operations();
    } catch (error) {
      console.error('Mock transaction failed:', error);
      throw error;
    }
  }

  /**
   * Close the database connection (no-op for web)
   */
  public async close(): Promise<void> {
    console.log('Web database connection closed (no-op)');
  }

  /**
   * Get database statistics
   */
  public async getDatabaseStats(): Promise<Record<string, number>> {
    const stats: Record<string, number> = {};
    const tables = [
      'users', 'influencers', 'companies', 'admins', 'campaigns',
      'collaboration_requests', 'notifications', 'payment_transactions'
    ];

    tables.forEach(table => {
      stats[table] = this.getTableData(table).length;
    });

    return stats;
  }

  /**
   * Clear all data (for testing)
   */
  public clearAllData(): void {
    const tables = [
      'users', 'influencers', 'companies', 'admins', 'campaigns',
      'collaboration_requests', 'notifications', 'payment_transactions'
    ];

    tables.forEach(table => {
      this.setTableData(table, []);
    });

    console.log('All web database data cleared');
  }
}

// Export singleton instance
export const databaseManager = DatabaseManager.getInstance();

// Initialize database function
export const initializeDatabase = async () => {
  try {
    await databaseManager.initialize();
    console.log('Web database initialization completed');
  } catch (error) {
    console.error('Web database initialization failed:', error);
  }
};