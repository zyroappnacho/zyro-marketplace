import { Platform } from 'react-native';

// Conditional import for SQLite
let SQLite: any;
try {
  SQLite = require('expo-sqlite');
} catch (error) {
  console.warn('expo-sqlite not available, using fallback');
  SQLite = null;
}

import { DATABASE_SCHEMAS, DATABASE_INDEXES, DATABASE_TRIGGERS } from './schemas';

export class DatabaseManager {
  private static instance: DatabaseManager;
  private db: SQLite.SQLiteDatabase | null = null;
  private readonly dbName = 'zyro_marketplace.db';

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Initialize the database connection and create tables
   */
  public async initialize(): Promise<void> {
    try {
      if (!SQLite) {
        console.warn('SQLite not available, skipping database initialization');
        return;
      }
      
      this.db = await SQLite.openDatabaseAsync(this.dbName);
      await this.createTables();
      await this.createIndexes();
      await this.createTriggers();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      // Don't throw error to prevent app crash
      console.warn('Continuing without database...');
    }
  }

  /**
   * Get the database instance
   */
  public getDatabase(): SQLite.SQLiteDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  /**
   * Create all database tables
   */
  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tableCreationOrder = [
      'users',
      'influencers',
      'audience_stats',
      'monthly_stats',
      'companies',
      'subscriptions',
      'admins',
      'campaigns',
      'collaboration_requests',
      'content_delivered',
      'notifications',
      'payment_transactions'
    ];

    for (const tableName of tableCreationOrder) {
      try {
        await this.db.execAsync(DATABASE_SCHEMAS[tableName as keyof typeof DATABASE_SCHEMAS]);
        console.log(`Created table: ${tableName}`);
      } catch (error) {
        console.error(`Failed to create table ${tableName}:`, error);
        throw error;
      }
    }
  }

  /**
   * Create database indexes for optimization
   */
  private async createIndexes(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    for (const [indexName, indexSQL] of Object.entries(DATABASE_INDEXES)) {
      try {
        await this.db.execAsync(indexSQL);
        console.log(`Created index: ${indexName}`);
      } catch (error) {
        console.error(`Failed to create index ${indexName}:`, error);
        throw error;
      }
    }
  }

  /**
   * Create database triggers
   */
  private async createTriggers(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    for (const [triggerName, triggerSQL] of Object.entries(DATABASE_TRIGGERS)) {
      try {
        await this.db.execAsync(triggerSQL);
        console.log(`Created trigger: ${triggerName}`);
      } catch (error) {
        console.error(`Failed to create trigger ${triggerName}:`, error);
        throw error;
      }
    }
  }

  /**
   * Execute a transaction with multiple operations
   */
  public async executeTransaction(operations: (db: SQLite.SQLiteDatabase) => Promise<void>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.withTransactionAsync(async () => {
        await operations(this.db!);
      });
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }

  /**
   * Close the database connection
   */
  public async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
      console.log('Database connection closed');
    }
  }

  /**
   * Drop all tables (for development/testing purposes)
   */
  public async dropAllTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tables = [
      'payment_transactions',
      'content_delivered',
      'collaboration_requests',
      'campaigns',
      'notifications',
      'admins',
      'subscriptions',
      'companies',
      'monthly_stats',
      'audience_stats',
      'influencers',
      'users'
    ];

    for (const table of tables) {
      try {
        await this.db.execAsync(`DROP TABLE IF EXISTS ${table};`);
        console.log(`Dropped table: ${table}`);
      } catch (error) {
        console.error(`Failed to drop table ${table}:`, error);
      }
    }
  }

  /**
   * Reset database (drop and recreate all tables)
   */
  public async resetDatabase(): Promise<void> {
    await this.dropAllTables();
    await this.createTables();
    await this.createIndexes();
    await this.createTriggers();
    console.log('Database reset completed');
  }

  /**
   * Get database statistics
   */
  public async getDatabaseStats(): Promise<Record<string, number>> {
    if (!this.db) throw new Error('Database not initialized');

    const stats: Record<string, number> = {};
    const tables = [
      'users', 'influencers', 'companies', 'admins', 'campaigns',
      'collaboration_requests', 'notifications', 'payment_transactions'
    ];

    for (const table of tables) {
      try {
        const result = await this.db.getFirstAsync<{ count: number }>(
          `SELECT COUNT(*) as count FROM ${table}`
        );
        stats[table] = result?.count || 0;
      } catch (error) {
        console.error(`Failed to get count for table ${table}:`, error);
        stats[table] = 0;
      }
    }

    return stats;
  }
}

// Export singleton instance
export const databaseManager = DatabaseManager.getInstance();