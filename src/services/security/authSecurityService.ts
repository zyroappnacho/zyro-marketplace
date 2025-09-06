import AsyncStorage from '@react-native-async-storage/async-storage';
import { encryptionService } from './encryptionService';

// Security configuration
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const SENSITIVE_ACTIONS_TIMEOUT = 5 * 60 * 1000; // 5 minutes for sensitive actions

export interface SecuritySession {
  userId: string;
  role: string;
  lastActivity: number;
  sensitiveActionTime?: number;
  deviceId: string;
  ipAddress?: string;
}

export interface LoginAttempt {
  email: string;
  timestamp: number;
  success: boolean;
  ipAddress?: string;
  deviceId: string;
}

export class AuthSecurityService {
  private static instance: AuthSecurityService;
  private currentSession: SecuritySession | null = null;

  private constructor() {}

  public static getInstance(): AuthSecurityService {
    if (!AuthSecurityService.instance) {
      AuthSecurityService.instance = new AuthSecurityService();
    }
    return AuthSecurityService.instance;
  }

  /**
   * Check if user is locked out due to too many failed attempts
   */
  public async isUserLockedOut(email: string): Promise<boolean> {
    try {
      const attempts = await this.getLoginAttempts(email);
      const recentFailedAttempts = attempts.filter(
        attempt => 
          !attempt.success && 
          (Date.now() - attempt.timestamp) < LOCKOUT_DURATION
      );

      return recentFailedAttempts.length >= MAX_LOGIN_ATTEMPTS;
    } catch (error) {
      console.error('Error checking lockout status:', error);
      return false;
    }
  }

  /**
   * Get remaining lockout time in minutes
   */
  public async getLockoutTimeRemaining(email: string): Promise<number> {
    try {
      const attempts = await this.getLoginAttempts(email);
      const recentFailedAttempts = attempts.filter(
        attempt => !attempt.success
      ).sort((a, b) => b.timestamp - a.timestamp);

      if (recentFailedAttempts.length >= MAX_LOGIN_ATTEMPTS) {
        const oldestRelevantAttempt = recentFailedAttempts[MAX_LOGIN_ATTEMPTS - 1];
        const timeElapsed = Date.now() - oldestRelevantAttempt.timestamp;
        const remainingTime = LOCKOUT_DURATION - timeElapsed;
        
        return Math.max(0, Math.ceil(remainingTime / (60 * 1000)));
      }

      return 0;
    } catch (error) {
      console.error('Error getting lockout time:', error);
      return 0;
    }
  }

  /**
   * Record login attempt
   */
  public async recordLoginAttempt(
    email: string, 
    success: boolean, 
    deviceId: string,
    ipAddress?: string
  ): Promise<void> {
    try {
      const attempts = await this.getLoginAttempts(email);
      const newAttempt: LoginAttempt = {
        email,
        timestamp: Date.now(),
        success,
        deviceId,
        ipAddress
      };

      attempts.push(newAttempt);

      // Keep only last 20 attempts to prevent storage bloat
      const recentAttempts = attempts
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 20);

      await encryptionService.storeEncryptedData(
        `login_attempts_${email}`, 
        recentAttempts
      );
    } catch (error) {
      console.error('Error recording login attempt:', error);
    }
  }

  /**
   * Get login attempts for a user
   */
  private async getLoginAttempts(email: string): Promise<LoginAttempt[]> {
    try {
      const attempts = await encryptionService.getEncryptedData<LoginAttempt[]>(
        `login_attempts_${email}`
      );
      return attempts || [];
    } catch (error) {
      console.error('Error getting login attempts:', error);
      return [];
    }
  }

  /**
   * Clear login attempts after successful login
   */
  public async clearLoginAttempts(email: string): Promise<void> {
    try {
      await encryptionService.removeEncryptedData(`login_attempts_${email}`);
    } catch (error) {
      console.error('Error clearing login attempts:', error);
    }
  }

  /**
   * Create secure session
   */
  public async createSession(
    userId: string, 
    role: string, 
    deviceId: string,
    ipAddress?: string
  ): Promise<SecuritySession> {
    const session: SecuritySession = {
      userId,
      role,
      lastActivity: Date.now(),
      deviceId,
      ipAddress
    };

    this.currentSession = session;
    await encryptionService.storeEncryptedData('current_session', session);
    
    return session;
  }

  /**
   * Validate current session
   */
  public async validateSession(): Promise<boolean> {
    try {
      if (!this.currentSession) {
        this.currentSession = await encryptionService.getEncryptedData<SecuritySession>('current_session');
      }

      if (!this.currentSession) {
        return false;
      }

      const timeSinceLastActivity = Date.now() - this.currentSession.lastActivity;
      
      if (timeSinceLastActivity > SESSION_TIMEOUT) {
        await this.destroySession();
        return false;
      }

      // Update last activity
      this.currentSession.lastActivity = Date.now();
      await encryptionService.storeEncryptedData('current_session', this.currentSession);
      
      return true;
    } catch (error) {
      console.error('Error validating session:', error);
      return false;
    }
  }

  /**
   * Check if user can perform sensitive actions
   */
  public async canPerformSensitiveAction(): Promise<boolean> {
    if (!this.currentSession) {
      return false;
    }

    if (!this.currentSession.sensitiveActionTime) {
      return false;
    }

    const timeSinceSensitiveAuth = Date.now() - this.currentSession.sensitiveActionTime;
    return timeSinceSensitiveAuth < SENSITIVE_ACTIONS_TIMEOUT;
  }

  /**
   * Authenticate for sensitive actions (re-authentication)
   */
  public async authenticateForSensitiveAction(password: string): Promise<boolean> {
    try {
      // TODO: Verify password with backend
      // For now, simulate password verification
      const isValid = password.length > 0; // Replace with actual verification
      
      if (isValid && this.currentSession) {
        this.currentSession.sensitiveActionTime = Date.now();
        await encryptionService.storeEncryptedData('current_session', this.currentSession);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error authenticating for sensitive action:', error);
      return false;
    }
  }

  /**
   * Get current session
   */
  public getCurrentSession(): SecuritySession | null {
    return this.currentSession;
  }

  /**
   * Destroy current session
   */
  public async destroySession(): Promise<void> {
    try {
      this.currentSession = null;
      await encryptionService.removeEncryptedData('current_session');
    } catch (error) {
      console.error('Error destroying session:', error);
    }
  }

  /**
   * Generate device fingerprint
   */
  public generateDeviceId(): string {
    // In a real app, this would use device-specific information
    // For now, generate a random ID and store it
    const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    AsyncStorage.setItem('device_id', deviceId);
    return deviceId;
  }

  /**
   * Get stored device ID
   */
  public async getDeviceId(): Promise<string> {
    try {
      let deviceId = await AsyncStorage.getItem('device_id');
      if (!deviceId) {
        deviceId = this.generateDeviceId();
      }
      return deviceId;
    } catch (error) {
      console.error('Error getting device ID:', error);
      return this.generateDeviceId();
    }
  }

  /**
   * Check for suspicious login patterns
   */
  public async detectSuspiciousActivity(email: string, deviceId: string): Promise<boolean> {
    try {
      const attempts = await this.getLoginAttempts(email);
      const recentAttempts = attempts.filter(
        attempt => (Date.now() - attempt.timestamp) < (24 * 60 * 60 * 1000) // Last 24 hours
      );

      // Check for multiple device IDs
      const uniqueDevices = new Set(recentAttempts.map(attempt => attempt.deviceId));
      if (uniqueDevices.size > 3) {
        return true;
      }

      // Check for rapid successive attempts
      const rapidAttempts = recentAttempts.filter(
        attempt => (Date.now() - attempt.timestamp) < (5 * 60 * 1000) // Last 5 minutes
      );
      if (rapidAttempts.length > 10) {
        return true;
      }

      // Check for unusual time patterns (e.g., attempts at 3 AM when user usually logs in during day)
      // This would require more sophisticated analysis in a real implementation

      return false;
    } catch (error) {
      console.error('Error detecting suspicious activity:', error);
      return false;
    }
  }
}

export const authSecurityService = AuthSecurityService.getInstance();