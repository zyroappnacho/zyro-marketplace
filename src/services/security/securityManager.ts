import { encryptionService } from './encryptionService';
import { authSecurityService } from './authSecurityService';
import { suspiciousActivityService } from './suspiciousActivityService';

export interface SecurityConfig {
  enableEncryption: boolean;
  enableSuspiciousActivityDetection: boolean;
  enableSessionTimeout: boolean;
  enableDeviceTracking: boolean;
  maxLoginAttempts: number;
  sessionTimeoutMinutes: number;
  sensitiveActionTimeoutMinutes: number;
}

export interface SecurityAuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: number;
  success: boolean;
  ipAddress?: string;
  deviceId: string;
  metadata?: any;
}

export class SecurityManager {
  private static instance: SecurityManager;
  private config: SecurityConfig;

  private constructor() {
    this.config = {
      enableEncryption: true,
      enableSuspiciousActivityDetection: true,
      enableSessionTimeout: true,
      enableDeviceTracking: true,
      maxLoginAttempts: 5,
      sessionTimeoutMinutes: 30,
      sensitiveActionTimeoutMinutes: 5
    };
  }

  public static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  /**
   * Initialize security manager
   */
  public async initialize(): Promise<void> {
    try {
      // Load security configuration
      const storedConfig = await encryptionService.getEncryptedData<SecurityConfig>('security_config');
      if (storedConfig) {
        this.config = { ...this.config, ...storedConfig };
      }

      console.log('Security Manager initialized');
    } catch (error) {
      console.error('Error initializing Security Manager:', error);
    }
  }

  /**
   * Secure login process
   */
  public async secureLogin(
    email: string,
    password: string,
    deviceId: string,
    ipAddress?: string
  ): Promise<{ success: boolean; user?: any; error?: string; lockoutMinutes?: number }> {
    try {
      // Check if user is locked out
      const isLockedOut = await authSecurityService.isUserLockedOut(email);
      if (isLockedOut) {
        const lockoutMinutes = await authSecurityService.getLockoutTimeRemaining(email);
        await this.auditLog({
          userId: email,
          action: 'login_blocked',
          resource: 'authentication',
          success: false,
          deviceId,
          ipAddress,
          metadata: { reason: 'account_locked', lockoutMinutes }
        });
        
        return {
          success: false,
          error: 'Cuenta bloqueada por múltiples intentos fallidos',
          lockoutMinutes
        };
      }

      // Check for suspicious activity
      if (this.config.enableSuspiciousActivityDetection) {
        const isSuspicious = await authSecurityService.detectSuspiciousActivity(email, deviceId);
        if (isSuspicious) {
          await suspiciousActivityService.monitorLoginActivity(email, deviceId, ipAddress);
        }
      }

      // TODO: Perform actual authentication with backend
      // For now, simulate authentication
      const authResult = await this.performAuthentication(email, password);

      // Record login attempt
      await authSecurityService.recordLoginAttempt(email, authResult.success, deviceId, ipAddress);

      if (authResult.success) {
        // Clear previous failed attempts
        await authSecurityService.clearLoginAttempts(email);

        // Create secure session
        const session = await authSecurityService.createSession(
          authResult.user.id,
          authResult.user.role,
          deviceId,
          ipAddress
        );

        // Update user behavior pattern
        await suspiciousActivityService.updateUserPattern(
          authResult.user.id,
          Date.now(),
          deviceId,
          0 // Session duration will be updated on logout
        );

        await this.auditLog({
          userId: authResult.user.id,
          action: 'login_success',
          resource: 'authentication',
          success: true,
          deviceId,
          ipAddress
        });

        return { success: true, user: authResult.user };
      } else {
        await this.auditLog({
          userId: email,
          action: 'login_failed',
          resource: 'authentication',
          success: false,
          deviceId,
          ipAddress,
          metadata: { reason: 'invalid_credentials' }
        });

        return { success: false, error: 'Credenciales inválidas' };
      }

    } catch (error) {
      console.error('Error in secure login:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  /**
   * Secure logout process
   */
  public async secureLogout(userId: string, deviceId: string): Promise<void> {
    try {
      const session = authSecurityService.getCurrentSession();
      if (session) {
        const sessionDuration = Date.now() - (session.lastActivity || Date.now());
        
        // Update user pattern with session duration
        await suspiciousActivityService.updateUserPattern(
          userId,
          Date.now(),
          deviceId,
          sessionDuration
        );
      }

      // Destroy session
      await authSecurityService.destroySession();

      await this.auditLog({
        userId,
        action: 'logout',
        resource: 'authentication',
        success: true,
        deviceId
      });

    } catch (error) {
      console.error('Error in secure logout:', error);
    }
  }

  /**
   * Validate session and check security
   */
  public async validateSecureSession(): Promise<boolean> {
    try {
      const isValid = await authSecurityService.validateSession();
      
      if (!isValid) {
        const session = authSecurityService.getCurrentSession();
        if (session) {
          await this.auditLog({
            userId: session.userId,
            action: 'session_expired',
            resource: 'authentication',
            success: false,
            deviceId: session.deviceId,
            metadata: { reason: 'timeout' }
          });
        }
      }

      return isValid;
    } catch (error) {
      console.error('Error validating secure session:', error);
      return false;
    }
  }

  /**
   * Secure sensitive action
   */
  public async performSensitiveAction(
    action: string,
    resource: string,
    password?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const session = authSecurityService.getCurrentSession();
      if (!session) {
        return { success: false, error: 'Sesión no válida' };
      }

      // Check if user can perform sensitive actions
      const canPerform = await authSecurityService.canPerformSensitiveAction();
      
      if (!canPerform) {
        if (!password) {
          return { success: false, error: 'Se requiere autenticación adicional' };
        }

        // Re-authenticate for sensitive action
        const authResult = await authSecurityService.authenticateForSensitiveAction(password);
        if (!authResult) {
          await this.auditLog({
            userId: session.userId,
            action: 'sensitive_action_blocked',
            resource,
            success: false,
            deviceId: session.deviceId,
            metadata: { action, reason: 'invalid_password' }
          });
          
          return { success: false, error: 'Contraseña incorrecta' };
        }
      }

      // Monitor data access if it's a data-related action
      if (resource.includes('personal_data') || resource.includes('payment') || resource.includes('settings')) {
        await suspiciousActivityService.monitorDataAccess(
          session.userId,
          resource as any,
          session.deviceId
        );
      }

      await this.auditLog({
        userId: session.userId,
        action,
        resource,
        success: true,
        deviceId: session.deviceId,
        metadata: { sensitiveAction: true }
      });

      return { success: true };

    } catch (error) {
      console.error('Error performing sensitive action:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
  }

  /**
   * Encrypt sensitive user data
   */
  public encryptSensitiveData(data: any): any {
    if (!this.config.enableEncryption) {
      return data;
    }

    try {
      // Identify and encrypt sensitive fields
      const sensitiveFields = ['phone', 'address', 'cif', 'bankAccount', 'password'];
      const encrypted = { ...data };

      sensitiveFields.forEach(field => {
        if (encrypted[field] && typeof encrypted[field] === 'string') {
          encrypted[field] = encryptionService.encryptData(encrypted[field]);
        }
      });

      return encrypted;
    } catch (error) {
      console.error('Error encrypting sensitive data:', error);
      return data;
    }
  }

  /**
   * Decrypt sensitive user data
   */
  public decryptSensitiveData(encryptedData: any): any {
    if (!this.config.enableEncryption) {
      return encryptedData;
    }

    try {
      const sensitiveFields = ['phone', 'address', 'cif', 'bankAccount'];
      const decrypted = { ...encryptedData };

      sensitiveFields.forEach(field => {
        if (decrypted[field] && typeof decrypted[field] === 'string') {
          try {
            decrypted[field] = encryptionService.decryptData(decrypted[field]);
          } catch (error) {
            console.error(`Failed to decrypt field ${field}:`, error);
            decrypted[field] = null;
          }
        }
      });

      return decrypted;
    } catch (error) {
      console.error('Error decrypting sensitive data:', error);
      return encryptedData;
    }
  }

  /**
   * Monitor API request for security
   */
  public async monitorRequest(
    userId: string,
    endpoint: string,
    deviceId: string
  ): Promise<void> {
    if (!this.config.enableSuspiciousActivityDetection) {
      return;
    }

    try {
      await suspiciousActivityService.monitorRequestActivity(userId, endpoint, deviceId);
    } catch (error) {
      console.error('Error monitoring request:', error);
    }
  }

  /**
   * Get security audit logs
   */
  public async getAuditLogs(userId?: string, limit: number = 100): Promise<SecurityAuditLog[]> {
    try {
      const logs = await encryptionService.getEncryptedData<SecurityAuditLog[]>('security_audit_logs') || [];
      
      let filteredLogs = logs;
      if (userId) {
        filteredLogs = logs.filter(log => log.userId === userId);
      }

      return filteredLogs
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting audit logs:', error);
      return [];
    }
  }

  /**
   * Update security configuration
   */
  public async updateSecurityConfig(newConfig: Partial<SecurityConfig>): Promise<void> {
    try {
      this.config = { ...this.config, ...newConfig };
      await encryptionService.storeEncryptedData('security_config', this.config);
    } catch (error) {
      console.error('Error updating security config:', error);
    }
  }

  /**
   * Get current security configuration
   */
  public getSecurityConfig(): SecurityConfig {
    return { ...this.config };
  }

  /**
   * Perform authentication (placeholder for actual implementation)
   */
  private async performAuthentication(
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: any }> {
    // Mock users for preview
    const mockUsers = [
      {
        id: 'admin-001',
        email: 'admin@zyro.com',
        role: 'admin',
        status: 'approved',
        fullName: 'Administrador Zyro',
      },
      {
        id: 'influencer-001',
        email: 'pruebainflu@test.com',
        role: 'influencer',
        status: 'approved',
        fullName: 'Influencer Prueba',
        instagramUsername: 'pruebainflu',
        instagramFollowers: 15000,
        tiktokUsername: 'pruebainflu',
        tiktokFollowers: 8000,
        city: 'Madrid',
        profileImage: 'https://via.placeholder.com/150',
        phone: '+34 600 123 456',
        address: 'Calle Ejemplo 123, Madrid',
      },
      {
        id: 'company-001',
        email: 'empresa@test.com',
        role: 'company',
        status: 'approved',
        companyName: 'Empresa Prueba',
        cif: 'B12345678',
        address: 'Avenida Empresarial 456, Madrid',
        phone: '+34 900 123 456',
        contactPerson: 'Director Comercial',
        subscription: {
          plan: '6months',
          price: 399,
          startDate: new Date(),
          endDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
          status: 'active',
        },
      },
    ];

    // Admin credentials
    if (email === 'admin_zyrovip' && password === 'xarrec-2paqra-guftoN') {
      return {
        success: true,
        user: mockUsers[0]
      };
    }

    // Influencer test credentials
    if (email === 'pruebainflu' && password === '12345') {
      return {
        success: true,
        user: mockUsers[1]
      };
    }

    // Company auto-creation when clicking "SOY EMPRESA"
    if (email === 'empresa_auto' && password === 'empresa123') {
      return {
        success: true,
        user: mockUsers[2]
      };
    }

    // Find user by email for other cases
    const user = mockUsers.find(u => u.email === email);
    if (user && password.length >= 5) {
      return {
        success: true,
        user
      };
    }

    return { success: false };
  }

  /**
   * Create audit log entry
   */
  private async auditLog(logData: Omit<SecurityAuditLog, 'id' | 'timestamp'>): Promise<void> {
    try {
      const log: SecurityAuditLog = {
        id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        ...logData
      };

      const logs = await encryptionService.getEncryptedData<SecurityAuditLog[]>('security_audit_logs') || [];
      logs.push(log);

      // Keep only last 10000 logs to prevent storage bloat
      const recentLogs = logs
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10000);

      await encryptionService.storeEncryptedData('security_audit_logs', recentLogs);
    } catch (error) {
      console.error('Error creating audit log:', error);
    }
  }
}

export const securityManager = SecurityManager.getInstance();