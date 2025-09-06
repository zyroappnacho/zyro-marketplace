import { BaseRepository } from './BaseRepository';
import {
  UserEntity,
  InfluencerEntity,
  CompanyEntity,
  AdminEntity,
  SubscriptionEntity,
  AudienceStatEntity,
  MonthlyStatEntity,
  CreateUserData,
  UpdateUserData,
  UserWithProfile
} from '../entities';
import { DatabaseMappers } from '../mappers';
import { BaseUser, Influencer, Company, Admin, UserRole, UserStatus } from '../../types';
import { validateEmail, validatePassword } from '../../utils/validation';
import * as Crypto from 'expo-crypto';

export class UserRepository extends BaseRepository<UserEntity, CreateUserData, UpdateUserData> {
  constructor() {
    super('users');
  }

  /**
   * Create a new user with password hashing
   */
  async createUser(email: string, password: string, role: UserRole): Promise<string> {
    // Validate input
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }
    if (!validatePassword(password)) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Check if user already exists
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password + 'zyro_salt'
    );

    // Generate user ID
    const userId = await Crypto.randomUUID();

    const userData: CreateUserData = {
      id: userId,
      email,
      password_hash: passwordHash,
      role,
      status: 'pending'
    };

    await this.create(userData);
    return userId;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<UserEntity | null> {
    return await this.findFirst({ email });
  }

  /**
   * Verify user password
   */
  async verifyPassword(email: string, password: string): Promise<UserEntity | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;

    const passwordHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password + 'zyro_salt'
    );

    return passwordHash === user.password_hash ? user : null;
  }

  /**
   * Update user status
   */
  async updateStatus(userId: string, status: UserStatus): Promise<boolean> {
    return await this.update(userId, { status });
  }

  /**
   * Get user with profile data
   */
  async getUserWithProfile(userId: string): Promise<BaseUser | Influencer | Company | Admin | null> {
    const user = await this.findById(userId);
    if (!user) return null;

    switch (user.role) {
      case 'influencer':
        return await this.getInfluencerProfile(userId);
      case 'company':
        return await this.getCompanyProfile(userId);
      case 'admin':
        return await this.getAdminProfile(userId);
      default:
        return DatabaseMappers.mapUserEntityToBaseUser(user);
    }
  }

  /**
   * Get influencer with full profile
   */
  async getInfluencerProfile(userId: string): Promise<Influencer | null> {
    const user = await this.findById(userId);
    if (!user || user.role !== 'influencer') return null;

    const influencer = await this.db.getFirstAsync<InfluencerEntity>(
      'SELECT * FROM influencers WHERE user_id = ?',
      [userId]
    );
    if (!influencer) return null;

    const audienceStats = await this.db.getAllAsync<AudienceStatEntity>(
      'SELECT * FROM audience_stats WHERE influencer_id = ?',
      [influencer.id]
    );

    const monthlyStats = await this.db.getAllAsync<MonthlyStatEntity>(
      'SELECT * FROM monthly_stats WHERE influencer_id = ? ORDER BY year DESC, month DESC LIMIT 12',
      [influencer.id]
    );

    return DatabaseMappers.mapInfluencerEntityToInfluencer(
      user,
      influencer,
      audienceStats || [],
      monthlyStats || []
    );
  }

  /**
   * Get company with subscription
   */
  async getCompanyProfile(userId: string): Promise<Company | null> {
    const user = await this.findById(userId);
    if (!user || user.role !== 'company') return null;

    const company = await this.db.getFirstAsync<CompanyEntity>(
      'SELECT * FROM companies WHERE user_id = ?',
      [userId]
    );
    if (!company) return null;

    const subscription = await this.db.getFirstAsync<SubscriptionEntity>(
      'SELECT * FROM subscriptions WHERE company_id = ? ORDER BY created_at DESC LIMIT 1',
      [company.id]
    );

    return DatabaseMappers.mapCompanyEntityToCompany(user, company, subscription || undefined);
  }

  /**
   * Get admin profile
   */
  async getAdminProfile(userId: string): Promise<Admin | null> {
    const user = await this.findById(userId);
    if (!user || user.role !== 'admin') return null;

    const admin = await this.db.getFirstAsync<AdminEntity>(
      'SELECT * FROM admins WHERE user_id = ?',
      [userId]
    );
    if (!admin) return null;

    return DatabaseMappers.mapAdminEntityToAdmin(user, admin);
  }

  /**
   * Get users by role and status
   */
  async getUsersByRoleAndStatus(role: UserRole, status?: UserStatus): Promise<UserEntity[]> {
    const conditions: Record<string, any> = { role };
    if (status) {
      conditions.status = status;
    }
    return await this.findAll(conditions, 'created_at DESC');
  }

  /**
   * Get pending users for approval
   */
  async getPendingUsers(): Promise<UserEntity[]> {
    return await this.findAll({ status: 'pending' }, 'created_at ASC');
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{
    total: number;
    byRole: Record<UserRole, number>;
    byStatus: Record<UserStatus, number>;
  }> {
    const total = await this.count();
    
    const roleStats = await this.db.getAllAsync<{ role: UserRole; count: number }>(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role'
    );
    
    const statusStats = await this.db.getAllAsync<{ status: UserStatus; count: number }>(
      'SELECT status, COUNT(*) as count FROM users GROUP BY status'
    );

    const byRole: Record<UserRole, number> = {
      admin: 0,
      influencer: 0,
      company: 0
    };

    const byStatus: Record<UserStatus, number> = {
      pending: 0,
      approved: 0,
      rejected: 0,
      suspended: 0
    };

    roleStats?.forEach(stat => {
      byRole[stat.role] = stat.count;
    });

    statusStats?.forEach(stat => {
      byStatus[stat.status] = stat.count;
    });

    return { total, byRole, byStatus };
  }

  /**
   * Update user password
   */
  async updatePassword(userId: string, newPassword: string): Promise<boolean> {
    if (!validatePassword(newPassword)) {
      throw new Error('Password must be at least 8 characters long');
    }

    const passwordHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      newPassword + 'zyro_salt'
    );

    return await this.update(userId, { password_hash: passwordHash });
  }

  /**
   * Soft delete user (set status to suspended)
   */
  async softDelete(userId: string): Promise<boolean> {
    return await this.updateStatus(userId, 'suspended');
  }

  /**
   * Search users by email or name
   */
  async searchUsers(query: string, role?: UserRole, limit: number = 50): Promise<UserWithProfile[]> {
    let baseQuery = `
      SELECT u.*, 
             i.full_name as influencer_name,
             c.company_name as company_name,
             a.full_name as admin_name
      FROM users u
      LEFT JOIN influencers i ON u.id = i.user_id
      LEFT JOIN companies c ON u.id = c.user_id  
      LEFT JOIN admins a ON u.id = a.user_id
      WHERE (u.email LIKE ? OR 
             i.full_name LIKE ? OR 
             c.company_name LIKE ? OR
             a.full_name LIKE ?)
    `;

    const params = [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`];

    if (role) {
      baseQuery += ' AND u.role = ?';
      params.push(role);
    }

    baseQuery += ` ORDER BY u.created_at DESC LIMIT ${limit}`;

    return await this.executeQuery<UserWithProfile>(baseQuery, params);
  }
}