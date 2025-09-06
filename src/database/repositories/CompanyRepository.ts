import { BaseRepository } from './BaseRepository';
import {
  CompanyEntity,
  SubscriptionEntity,
  CreateCompanyData,
  UpdateCompanyData
} from '../entities';
import { DatabaseMappers } from '../mappers';
import { Company, SubscriptionPlan, SubscriptionStatus } from '../../types';
import { UserRepository } from './UserRepository';
import * as Crypto from 'expo-crypto';

export class CompanyRepository extends BaseRepository<CompanyEntity, CreateCompanyData, UpdateCompanyData> {
  private userRepository: UserRepository;

  constructor() {
    super('companies');
    this.userRepository = new UserRepository();
  }

  /**
   * Create a complete company profile with subscription
   */
  async createCompany(companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>, password: string): Promise<string> {
    return await this.transaction(async (db) => {
      // Validate CIF uniqueness
      const existingCompany = await this.findByCif(companyData.cif);
      if (existingCompany) {
        throw new Error('Company with this CIF already exists');
      }

      // Create user account
      const userId = await this.userRepository.createUser(
        companyData.email,
        password,
        'company'
      );

      // Create company profile
      const companyId = await Crypto.randomUUID();
      const companyEntity: CreateCompanyData = {
        id: companyId,
        user_id: userId,
        company_name: companyData.companyName,
        cif: companyData.cif,
        address: companyData.address,
        phone: companyData.phone,
        contact_person: companyData.contactPerson,
        payment_method: companyData.paymentMethod
      };

      await db.runAsync(
        `INSERT INTO companies (id, user_id, company_name, cif, address, phone, contact_person, payment_method)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          companyEntity.id,
          companyEntity.user_id,
          companyEntity.company_name,
          companyEntity.cif,
          companyEntity.address,
          companyEntity.phone,
          companyEntity.contact_person,
          companyEntity.payment_method
        ]
      );

      // Create subscription
      await this.createSubscription(db, companyId, companyData.subscription);

      return userId;
    });
  }

  /**
   * Update company profile
   */
  async updateCompany(userId: string, updateData: Partial<Company>): Promise<boolean> {
    return await this.transaction(async (db) => {
      const company = await db.getFirstAsync<CompanyEntity>(
        'SELECT * FROM companies WHERE user_id = ?',
        [userId]
      );

      if (!company) {
        throw new Error('Company not found');
      }

      // Update company basic data
      const companyUpdateData: Partial<CompanyEntity> = {};
      if (updateData.companyName) companyUpdateData.company_name = updateData.companyName;
      if (updateData.address) companyUpdateData.address = updateData.address;
      if (updateData.phone) companyUpdateData.phone = updateData.phone;
      if (updateData.contactPerson) companyUpdateData.contact_person = updateData.contactPerson;
      if (updateData.paymentMethod) companyUpdateData.payment_method = updateData.paymentMethod;

      if (Object.keys(companyUpdateData).length > 0) {
        const fields = Object.keys(companyUpdateData);
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        const values = [...Object.values(companyUpdateData), company.id];

        await db.runAsync(
          `UPDATE companies SET ${setClause} WHERE id = ?`,
          values
        );
      }

      // Update subscription if provided
      if (updateData.subscription) {
        await this.updateSubscription(db, company.id, updateData.subscription);
      }

      return true;
    });
  }

  /**
   * Get company by user ID
   */
  async getByUserId(userId: string): Promise<Company | null> {
    return await this.userRepository.getCompanyProfile(userId);
  }

  /**
   * Find company by CIF
   */
  async findByCif(cif: string): Promise<CompanyEntity | null> {
    return await this.findFirst({ cif });
  }

  /**
   * Get companies by subscription status
   */
  async getBySubscriptionStatus(status: SubscriptionStatus): Promise<Company[]> {
    const query = `
      SELECT c.* FROM companies c
      INNER JOIN subscriptions s ON c.id = s.company_id
      WHERE s.status = ?
      ORDER BY c.created_at DESC
    `;

    const companyEntities = await this.executeQuery<CompanyEntity>(query, [status]);
    const results: Company[] = [];

    for (const company of companyEntities) {
      const profile = await this.userRepository.getCompanyProfile(company.user_id);
      if (profile) {
        results.push(profile);
      }
    }

    return results;
  }

  /**
   * Get companies with expiring subscriptions
   */
  async getCompaniesWithExpiringSubscriptions(daysFromNow: number = 7): Promise<Company[]> {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + daysFromNow);

    const query = `
      SELECT c.* FROM companies c
      INNER JOIN subscriptions s ON c.id = s.company_id
      WHERE s.status = 'active' AND s.end_date <= ?
      ORDER BY s.end_date ASC
    `;

    const companyEntities = await this.executeQuery<CompanyEntity>(
      query,
      [expirationDate.toISOString()]
    );
    const results: Company[] = [];

    for (const company of companyEntities) {
      const profile = await this.userRepository.getCompanyProfile(company.user_id);
      if (profile) {
        results.push(profile);
      }
    }

    return results;
  }

  /**
   * Get company statistics
   */
  async getCompanyStats(): Promise<{
    total: number;
    bySubscriptionPlan: Record<SubscriptionPlan, number>;
    bySubscriptionStatus: Record<SubscriptionStatus, number>;
    totalRevenue: number;
    monthlyRevenue: number;
  }> {
    const total = await this.count();

    const planStats = await this.executeQuery<{ plan: SubscriptionPlan; count: number }>(`
      SELECT s.plan, COUNT(*) as count 
      FROM companies c
      INNER JOIN subscriptions s ON c.id = s.company_id
      WHERE s.status = 'active'
      GROUP BY s.plan
    `);

    const statusStats = await this.executeQuery<{ status: SubscriptionStatus; count: number }>(`
      SELECT s.status, COUNT(*) as count 
      FROM companies c
      INNER JOIN subscriptions s ON c.id = s.company_id
      GROUP BY s.status
    `);

    const revenueStats = await this.executeQueryFirst<{ total: number; monthly: number }>(`
      SELECT 
        SUM(s.price) as total,
        SUM(CASE WHEN s.status = 'active' THEN s.price ELSE 0 END) as monthly
      FROM subscriptions s
    `);

    const bySubscriptionPlan: Record<SubscriptionPlan, number> = {
      '3months': 0,
      '6months': 0,
      '12months': 0
    };

    const bySubscriptionStatus: Record<SubscriptionStatus, number> = {
      active: 0,
      expired: 0,
      cancelled: 0
    };

    planStats.forEach(stat => {
      bySubscriptionPlan[stat.plan] = stat.count;
    });

    statusStats.forEach(stat => {
      bySubscriptionStatus[stat.status] = stat.count;
    });

    return {
      total,
      bySubscriptionPlan,
      bySubscriptionStatus,
      totalRevenue: revenueStats?.total || 0,
      monthlyRevenue: revenueStats?.monthly || 0
    };
  }

  /**
   * Search companies by name or CIF
   */
  async searchCompanies(query: string, limit: number = 50): Promise<Company[]> {
    const whereClause = `(company_name LIKE ? OR cif LIKE ?)`;
    const params = [`%${query}%`, `%${query}%`];

    const companies = await this.findWhere(whereClause, params, 'created_at DESC', limit);
    const results: Company[] = [];

    for (const company of companies) {
      const profile = await this.userRepository.getCompanyProfile(company.user_id);
      if (profile) {
        results.push(profile);
      }
    }

    return results;
  }

  /**
   * Create subscription for company
   */
  private async createSubscription(
    db: any,
    companyId: string,
    subscription: Company['subscription']
  ): Promise<void> {
    const subscriptionId = await Crypto.randomUUID();
    
    await db.runAsync(
      `INSERT INTO subscriptions (id, company_id, plan, price, start_date, end_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        subscriptionId,
        companyId,
        subscription.plan,
        subscription.price,
        subscription.startDate.toISOString(),
        subscription.endDate.toISOString(),
        subscription.status
      ]
    );
  }

  /**
   * Update subscription for company
   */
  private async updateSubscription(
    db: any,
    companyId: string,
    subscription: Company['subscription']
  ): Promise<void> {
    // Get current subscription
    const currentSubscription = await db.getFirstAsync<SubscriptionEntity>(
      'SELECT * FROM subscriptions WHERE company_id = ? ORDER BY created_at DESC LIMIT 1',
      [companyId]
    );

    if (currentSubscription) {
      // Update existing subscription
      await db.runAsync(
        `UPDATE subscriptions 
         SET plan = ?, price = ?, start_date = ?, end_date = ?, status = ?
         WHERE id = ?`,
        [
          subscription.plan,
          subscription.price,
          subscription.startDate.toISOString(),
          subscription.endDate.toISOString(),
          subscription.status,
          currentSubscription.id
        ]
      );
    } else {
      // Create new subscription
      await this.createSubscription(db, companyId, subscription);
    }
  }

  /**
   * Renew subscription
   */
  async renewSubscription(
    userId: string,
    plan: SubscriptionPlan,
    price: number
  ): Promise<boolean> {
    return await this.transaction(async (db) => {
      const company = await db.getFirstAsync<CompanyEntity>(
        'SELECT * FROM companies WHERE user_id = ?',
        [userId]
      );

      if (!company) {
        throw new Error('Company not found');
      }

      // Calculate new dates
      const startDate = new Date();
      const endDate = new Date();
      
      switch (plan) {
        case '3months':
          endDate.setMonth(endDate.getMonth() + 3);
          break;
        case '6months':
          endDate.setMonth(endDate.getMonth() + 6);
          break;
        case '12months':
          endDate.setFullYear(endDate.getFullYear() + 1);
          break;
      }

      // Create new subscription
      const subscriptionId = await Crypto.randomUUID();
      await db.runAsync(
        `INSERT INTO subscriptions (id, company_id, plan, price, start_date, end_date, status)
         VALUES (?, ?, ?, ?, ?, ?, 'active')`,
        [
          subscriptionId,
          company.id,
          plan,
          price,
          startDate.toISOString(),
          endDate.toISOString()
        ]
      );

      return true;
    });
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(userId: string): Promise<boolean> {
    return await this.transaction(async (db) => {
      const company = await db.getFirstAsync<CompanyEntity>(
        'SELECT * FROM companies WHERE user_id = ?',
        [userId]
      );

      if (!company) {
        throw new Error('Company not found');
      }

      // Update current active subscription to cancelled
      const result = await db.runAsync(
        `UPDATE subscriptions 
         SET status = 'cancelled' 
         WHERE company_id = ? AND status = 'active'`,
        [company.id]
      );

      return (result.changes || 0) > 0;
    });
  }
}