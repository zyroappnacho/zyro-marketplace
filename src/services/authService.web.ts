// Web-compatible authentication service
import { Platform } from 'react-native';
import { databaseManager } from '../database/database.web';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'influencer' | 'company';
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  username?: string;
  fullName?: string;
}

export class AuthService {
  private static instance: AuthService;
  private currentUser: AuthUser | null = null;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Login with username and password
   */
  public async login(credentials: LoginCredentials): Promise<AuthUser> {
    try {
      const { username, password } = credentials;

      // Check admin credentials first
      if (username === 'admin_zyrovip' && password === 'xarrec-2paqra-guftoN') {
        const adminUser = databaseManager.findById('admins', 'admin-1');
        if (adminUser) {
          this.currentUser = {
            id: adminUser.id,
            email: adminUser.email,
            role: 'admin',
            status: 'approved',
            username: adminUser.username,
            fullName: adminUser.fullName
          };
          
          // Update last login
          databaseManager.updateData('admins', adminUser.id, {
            lastLoginAt: new Date().toISOString()
          });

          console.log('Admin login successful');
          return this.currentUser;
        }
      }

      // Check influencer credentials
      if (username === 'pruebainflu' && password === '12345') {
        const influencerUser = databaseManager.findById('influencers', 'influencer-1');
        if (influencerUser) {
          this.currentUser = {
            id: influencerUser.id,
            email: influencerUser.email,
            role: 'influencer',
            status: influencerUser.status,
            fullName: influencerUser.fullName
          };

          console.log('Influencer login successful');
          return this.currentUser;
        }
      }

      // Check other users in database
      const allUsers = [
        ...databaseManager.getAll('admins'),
        ...databaseManager.getAll('influencers'),
        ...databaseManager.getAll('companies')
      ];

      const user = allUsers.find(u => 
        (u.username === username || u.email === username) && 
        this.verifyPassword(password, u.password || 'default')
      );

      if (!user) {
        throw new Error('Credenciales inválidas');
      }

      if (user.status !== 'approved') {
        throw new Error(`Cuenta ${user.status}. Contacta con soporte.`);
      }

      this.currentUser = {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        username: user.username,
        fullName: user.fullName
      };

      console.log('User login successful:', this.currentUser.role);
      return this.currentUser;

    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Register new user
   */
  public async register(userData: any): Promise<void> {
    try {
      const { role, email, ...otherData } = userData;
      
      // Check if user already exists
      const existingUsers = [
        ...databaseManager.getAll('admins'),
        ...databaseManager.getAll('influencers'),
        ...databaseManager.getAll('companies')
      ];

      const existingUser = existingUsers.find(u => u.email === email);
      if (existingUser) {
        throw new Error('El email ya está registrado');
      }

      // Create new user
      const newUser = {
        id: `${role}-${Date.now()}`,
        email,
        role,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...otherData
      };

      // Insert into appropriate table
      if (role === 'influencer') {
        databaseManager.insertData('influencers', newUser);
      } else if (role === 'company') {
        databaseManager.insertData('companies', newUser);
      } else {
        throw new Error('Tipo de usuario no válido');
      }

      console.log('User registered successfully:', role);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Logout current user
   */
  public async logout(): Promise<void> {
    this.currentUser = null;
    console.log('User logged out');
  }

  /**
   * Get current authenticated user
   */
  public getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Check if user has specific role
   */
  public hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  /**
   * Verify password (simple implementation for demo)
   */
  private verifyPassword(inputPassword: string, storedPassword: string): boolean {
    // In a real app, this would use proper password hashing
    return inputPassword === storedPassword;
  }

  /**
   * Update user profile
   */
  public async updateProfile(updates: Partial<AuthUser>): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No user authenticated');
    }

    try {
      const tableName = this.currentUser.role === 'admin' ? 'admins' : 
                       this.currentUser.role === 'influencer' ? 'influencers' : 'companies';
      
      databaseManager.updateData(tableName, this.currentUser.id, updates);
      
      // Update current user object
      this.currentUser = { ...this.currentUser, ...updates };
      
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }

  /**
   * Change password
   */
  public async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No user authenticated');
    }

    try {
      const tableName = this.currentUser.role === 'admin' ? 'admins' : 
                       this.currentUser.role === 'influencer' ? 'influencers' : 'companies';
      
      const user = databaseManager.findById(tableName, this.currentUser.id);
      
      if (!user || !this.verifyPassword(currentPassword, user.password || 'default')) {
        throw new Error('Contraseña actual incorrecta');
      }

      databaseManager.updateData(tableName, this.currentUser.id, {
        password: newPassword // In real app, this would be hashed
      });
      
      console.log('Password changed successfully');
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  }

  /**
   * Delete user account
   */
  public async deleteAccount(): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No user authenticated');
    }

    try {
      const tableName = this.currentUser.role === 'admin' ? 'admins' : 
                       this.currentUser.role === 'influencer' ? 'influencers' : 'companies';
      
      databaseManager.deleteData(tableName, this.currentUser.id);
      this.currentUser = null;
      
      console.log('Account deleted successfully');
    } catch (error) {
      console.error('Account deletion error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();