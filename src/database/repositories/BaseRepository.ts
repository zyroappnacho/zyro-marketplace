import * as SQLite from 'expo-sqlite';
import { databaseManager } from '../database';

/**
 * Base repository class with common database operations
 */
export abstract class BaseRepository<TEntity, TCreateData, TUpdateData> {
  protected db: SQLite.SQLiteDatabase;
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
    this.db = databaseManager.getDatabase();
  }

  /**
   * Find a record by ID
   */
  async findById(id: string): Promise<TEntity | null> {
    try {
      const result = await this.db.getFirstAsync<TEntity>(
        `SELECT * FROM ${this.tableName} WHERE id = ?`,
        [id]
      );
      return result || null;
    } catch (error) {
      console.error(`Error finding ${this.tableName} by ID:`, error);
      throw error;
    }
  }

  /**
   * Find all records with optional conditions
   */
  async findAll(
    conditions?: Record<string, any>,
    orderBy?: string,
    limit?: number,
    offset?: number
  ): Promise<TEntity[]> {
    try {
      let query = `SELECT * FROM ${this.tableName}`;
      const params: any[] = [];

      if (conditions && Object.keys(conditions).length > 0) {
        const whereClause = Object.keys(conditions)
          .map(key => `${key} = ?`)
          .join(' AND ');
        query += ` WHERE ${whereClause}`;
        params.push(...Object.values(conditions));
      }

      if (orderBy) {
        query += ` ORDER BY ${orderBy}`;
      }

      if (limit) {
        query += ` LIMIT ${limit}`;
        if (offset) {
          query += ` OFFSET ${offset}`;
        }
      }

      const results = await this.db.getAllAsync<TEntity>(query, params);
      return results || [];
    } catch (error) {
      console.error(`Error finding all ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Find records with custom WHERE clause
   */
  async findWhere(
    whereClause: string,
    params: any[] = [],
    orderBy?: string,
    limit?: number
  ): Promise<TEntity[]> {
    try {
      let query = `SELECT * FROM ${this.tableName} WHERE ${whereClause}`;
      
      if (orderBy) {
        query += ` ORDER BY ${orderBy}`;
      }

      if (limit) {
        query += ` LIMIT ${limit}`;
      }

      const results = await this.db.getAllAsync<TEntity>(query, params);
      return results || [];
    } catch (error) {
      console.error(`Error finding ${this.tableName} with WHERE clause:`, error);
      throw error;
    }
  }

  /**
   * Find first record matching conditions
   */
  async findFirst(conditions: Record<string, any>): Promise<TEntity | null> {
    try {
      const whereClause = Object.keys(conditions)
        .map(key => `${key} = ?`)
        .join(' AND ');
      
      const result = await this.db.getFirstAsync<TEntity>(
        `SELECT * FROM ${this.tableName} WHERE ${whereClause}`,
        Object.values(conditions)
      );
      
      return result || null;
    } catch (error) {
      console.error(`Error finding first ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Count records with optional conditions
   */
  async count(conditions?: Record<string, any>): Promise<number> {
    try {
      let query = `SELECT COUNT(*) as count FROM ${this.tableName}`;
      const params: any[] = [];

      if (conditions && Object.keys(conditions).length > 0) {
        const whereClause = Object.keys(conditions)
          .map(key => `${key} = ?`)
          .join(' AND ');
        query += ` WHERE ${whereClause}`;
        params.push(...Object.values(conditions));
      }

      const result = await this.db.getFirstAsync<{ count: number }>(query, params);
      return result?.count || 0;
    } catch (error) {
      console.error(`Error counting ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Create a new record
   */
  async create(data: TCreateData): Promise<string> {
    try {
      const fields = Object.keys(data as any);
      const placeholders = fields.map(() => '?').join(', ');
      const values = Object.values(data as any);

      const query = `
        INSERT INTO ${this.tableName} (${fields.join(', ')})
        VALUES (${placeholders})
      `;

      const result = await this.db.runAsync(query, values);
      return result.lastInsertRowId?.toString() || '';
    } catch (error) {
      console.error(`Error creating ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Update a record by ID
   */
  async update(id: string, data: TUpdateData): Promise<boolean> {
    try {
      const fields = Object.keys(data as any);
      if (fields.length === 0) return false;

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = [...Object.values(data as any), id];

      const query = `
        UPDATE ${this.tableName}
        SET ${setClause}
        WHERE id = ?
      `;

      const result = await this.db.runAsync(query, values);
      return (result.changes || 0) > 0;
    } catch (error) {
      console.error(`Error updating ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Delete a record by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      const result = await this.db.runAsync(
        `DELETE FROM ${this.tableName} WHERE id = ?`,
        [id]
      );
      return (result.changes || 0) > 0;
    } catch (error) {
      console.error(`Error deleting ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Delete records with conditions
   */
  async deleteWhere(conditions: Record<string, any>): Promise<number> {
    try {
      const whereClause = Object.keys(conditions)
        .map(key => `${key} = ?`)
        .join(' AND ');

      const result = await this.db.runAsync(
        `DELETE FROM ${this.tableName} WHERE ${whereClause}`,
        Object.values(conditions)
      );

      return result.changes || 0;
    } catch (error) {
      console.error(`Error deleting ${this.tableName} with conditions:`, error);
      throw error;
    }
  }

  /**
   * Check if a record exists
   */
  async exists(id: string): Promise<boolean> {
    try {
      const result = await this.db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM ${this.tableName} WHERE id = ?`,
        [id]
      );
      return (result?.count || 0) > 0;
    } catch (error) {
      console.error(`Error checking if ${this.tableName} exists:`, error);
      throw error;
    }
  }

  /**
   * Execute a custom query
   */
  async executeQuery<T = any>(query: string, params: any[] = []): Promise<T[]> {
    try {
      const results = await this.db.getAllAsync<T>(query, params);
      return results || [];
    } catch (error) {
      console.error(`Error executing custom query on ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Execute a custom query and return first result
   */
  async executeQueryFirst<T = any>(query: string, params: any[] = []): Promise<T | null> {
    try {
      const result = await this.db.getFirstAsync<T>(query, params);
      return result || null;
    } catch (error) {
      console.error(`Error executing custom query first on ${this.tableName}:`, error);
      throw error;
    }
  }

  /**
   * Begin a transaction
   */
  async transaction<T>(callback: (db: SQLite.SQLiteDatabase) => Promise<T>): Promise<T> {
    return await databaseManager.executeTransaction(async (db) => {
      return await callback(db);
    });
  }
}