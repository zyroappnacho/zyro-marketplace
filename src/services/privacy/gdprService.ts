import { encryptionService } from '../security/encryptionService';
import { securityManager } from '../security/securityManager';
import { BaseUser, Influencer, Company } from '../../types';

export interface DataExportRequest {
  id: string;
  userId: string;
  requestDate: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  completedDate?: Date;
  downloadUrl?: string;
  expiresAt?: Date;
}

export interface DataDeletionRequest {
  id: string;
  userId: string;
  requestDate: Date;
  scheduledDeletionDate: Date;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  reason?: string;
  completedDate?: Date;
  deletedBy?: string;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: 'data_processing' | 'marketing' | 'analytics' | 'cookies' | 'third_party_sharing';
  granted: boolean;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  version: string; // Version of privacy policy/terms
}

export interface UserDataInventory {
  personalData: {
    basicInfo: any;
    contactInfo: any;
    profileData: any;
  };
  activityData: {
    loginHistory: any[];
    collaborationHistory: any[];
    messageHistory: any[];
  };
  technicalData: {
    deviceInfo: any[];
    sessionData: any[];
    auditLogs: any[];
  };
  thirdPartyData: {
    socialMediaData: any;
    paymentData: any;
  };
}

export class GDPRService {
  private static instance: GDPRService;

  private constructor() {}

  public static getInstance(): GDPRService {
    if (!GDPRService.instance) {
      GDPRService.instance = new GDPRService();
    }
    return GDPRService.instance;
  }

  /**
   * Request data export (Right to Data Portability - Article 20)
   */
  public async requestDataExport(userId: string): Promise<DataExportRequest> {
    try {
      const request: DataExportRequest = {
        id: `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        requestDate: new Date(),
        status: 'pending'
      };

      // Store the request
      await this.storeDataExportRequest(request);

      // Start processing in background
      this.processDataExport(request.id);

      return request;
    } catch (error) {
      console.error('Error requesting data export:', error);
      throw new Error('Failed to request data export');
    }
  }

  /**
   * Process data export request
   */
  private async processDataExport(requestId: string): Promise<void> {
    try {
      const request = await this.getDataExportRequest(requestId);
      if (!request) {
        throw new Error('Export request not found');
      }

      // Update status to processing
      request.status = 'processing';
      await this.storeDataExportRequest(request);

      // Collect all user data
      const userData = await this.collectUserData(request.userId);

      // Generate export file (JSON format)
      const exportData = {
        exportDate: new Date().toISOString(),
        userId: request.userId,
        dataFormat: 'JSON',
        data: userData
      };

      // In a real implementation, this would be stored in a secure file system
      // For now, we'll store it encrypted in AsyncStorage with expiration
      const exportKey = `user_export_${requestId}`;
      await encryptionService.storeEncryptedData(exportKey, exportData);

      // Update request with completion info
      request.status = 'completed';
      request.completedDate = new Date();
      request.downloadUrl = exportKey; // In real app, this would be a secure download URL
      request.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await this.storeDataExportRequest(request);

      // TODO: Send notification to user about completed export

    } catch (error) {
      console.error('Error processing data export:', error);
      
      // Update request status to failed
      const request = await this.getDataExportRequest(requestId);
      if (request) {
        request.status = 'failed';
        await this.storeDataExportRequest(request);
      }
    }
  }

  /**
   * Get data export request
   */
  public async getDataExportRequest(requestId: string): Promise<DataExportRequest | null> {
    try {
      const requests = await encryptionService.getEncryptedData<DataExportRequest[]>('data_export_requests') || [];
      return requests.find(req => req.id === requestId) || null;
    } catch (error) {
      console.error('Error getting data export request:', error);
      return null;
    }
  }

  /**
   * Get user's data export requests
   */
  public async getUserDataExportRequests(userId: string): Promise<DataExportRequest[]> {
    try {
      const requests = await encryptionService.getEncryptedData<DataExportRequest[]>('data_export_requests') || [];
      return requests.filter(req => req.userId === userId);
    } catch (error) {
      console.error('Error getting user data export requests:', error);
      return [];
    }
  }

  /**
   * Download exported data
   */
  public async downloadExportedData(requestId: string): Promise<any> {
    try {
      const request = await this.getDataExportRequest(requestId);
      if (!request || request.status !== 'completed' || !request.downloadUrl) {
        throw new Error('Export not available');
      }

      if (request.expiresAt && new Date() > request.expiresAt) {
        throw new Error('Export has expired');
      }

      const exportData = await encryptionService.getEncryptedData(request.downloadUrl);
      return exportData;
    } catch (error) {
      console.error('Error downloading exported data:', error);
      throw new Error('Failed to download exported data');
    }
  }

  /**
   * Request account deletion (Right to Erasure - Article 17)
   */
  public async requestAccountDeletion(
    userId: string, 
    reason?: string
  ): Promise<DataDeletionRequest> {
    try {
      const request: DataDeletionRequest = {
        id: `deletion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        requestDate: new Date(),
        scheduledDeletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days grace period
        status: 'scheduled',
        reason
      };

      // Store the request
      await this.storeDeletionRequest(request);

      // TODO: Send confirmation email to user
      // TODO: Notify administrators

      return request;
    } catch (error) {
      console.error('Error requesting account deletion:', error);
      throw new Error('Failed to request account deletion');
    }
  }

  /**
   * Cancel account deletion request
   */
  public async cancelAccountDeletion(requestId: string, userId: string): Promise<boolean> {
    try {
      const request = await this.getDeletionRequest(requestId);
      if (!request || request.userId !== userId) {
        return false;
      }

      if (request.status === 'completed') {
        throw new Error('Account has already been deleted');
      }

      request.status = 'cancelled';
      await this.storeDeletionRequest(request);

      return true;
    } catch (error) {
      console.error('Error cancelling account deletion:', error);
      return false;
    }
  }

  /**
   * Execute account deletion (called by scheduled job)
   */
  public async executeAccountDeletion(requestId: string, deletedBy: string): Promise<boolean> {
    try {
      const request = await this.getDeletionRequest(requestId);
      if (!request || request.status !== 'scheduled') {
        return false;
      }

      if (new Date() < request.scheduledDeletionDate) {
        throw new Error('Deletion date not reached yet');
      }

      // Perform complete data deletion
      await this.deleteAllUserData(request.userId);

      // Update request status
      request.status = 'completed';
      request.completedDate = new Date();
      request.deletedBy = deletedBy;
      await this.storeDeletionRequest(request);

      return true;
    } catch (error) {
      console.error('Error executing account deletion:', error);
      return false;
    }
  }

  /**
   * Get user's deletion requests
   */
  public async getUserDeletionRequests(userId: string): Promise<DataDeletionRequest[]> {
    try {
      const requests = await encryptionService.getEncryptedData<DataDeletionRequest[]>('data_deletion_requests') || [];
      return requests.filter(req => req.userId === userId);
    } catch (error) {
      console.error('Error getting user deletion requests:', error);
      return [];
    }
  }

  /**
   * Record user consent
   */
  public async recordConsent(
    userId: string,
    consentType: ConsentRecord['consentType'],
    granted: boolean,
    version: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const consent: ConsentRecord = {
        id: `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        consentType,
        granted,
        timestamp: new Date(),
        ipAddress,
        userAgent,
        version
      };

      const consents = await encryptionService.getEncryptedData<ConsentRecord[]>('user_consents') || [];
      consents.push(consent);

      // Keep only last 1000 consent records
      const recentConsents = consents
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 1000);

      await encryptionService.storeEncryptedData('user_consents', recentConsents);
    } catch (error) {
      console.error('Error recording consent:', error);
    }
  }

  /**
   * Get user consent history
   */
  public async getUserConsents(userId: string): Promise<ConsentRecord[]> {
    try {
      const consents = await encryptionService.getEncryptedData<ConsentRecord[]>('user_consents') || [];
      return consents.filter(consent => consent.userId === userId);
    } catch (error) {
      console.error('Error getting user consents:', error);
      return [];
    }
  }

  /**
   * Check if user has given specific consent
   */
  public async hasUserConsent(
    userId: string, 
    consentType: ConsentRecord['consentType']
  ): Promise<boolean> {
    try {
      const consents = await this.getUserConsents(userId);
      const latestConsent = consents
        .filter(consent => consent.consentType === consentType)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

      return latestConsent ? latestConsent.granted : false;
    } catch (error) {
      console.error('Error checking user consent:', error);
      return false;
    }
  }

  /**
   * Collect all user data for export
   */
  private async collectUserData(userId: string): Promise<UserDataInventory> {
    try {
      // TODO: In a real implementation, this would collect data from various sources
      // For now, we'll create a mock data structure

      const inventory: UserDataInventory = {
        personalData: {
          basicInfo: await this.getUserBasicInfo(userId),
          contactInfo: await this.getUserContactInfo(userId),
          profileData: await this.getUserProfileData(userId)
        },
        activityData: {
          loginHistory: await this.getUserLoginHistory(userId),
          collaborationHistory: await this.getUserCollaborationHistory(userId),
          messageHistory: await this.getUserMessageHistory(userId)
        },
        technicalData: {
          deviceInfo: await this.getUserDeviceInfo(userId),
          sessionData: await this.getUserSessionData(userId),
          auditLogs: await securityManager.getAuditLogs(userId)
        },
        thirdPartyData: {
          socialMediaData: await this.getUserSocialMediaData(userId),
          paymentData: await this.getUserPaymentData(userId)
        }
      };

      return inventory;
    } catch (error) {
      console.error('Error collecting user data:', error);
      throw new Error('Failed to collect user data');
    }
  }

  /**
   * Delete all user data (Right to Erasure)
   */
  private async deleteAllUserData(userId: string): Promise<void> {
    try {
      // Delete from all data stores
      const keysToDelete = [
        `user_${userId}`,
        `user_profile_${userId}`,
        `user_activities_${userId}`,
        `user_pattern_${userId}`,
        `login_attempts_${userId}`,
        `user_sessions_${userId}`,
        `user_messages_${userId}`,
        `user_collaborations_${userId}`,
        `user_payments_${userId}`
      ];

      for (const key of keysToDelete) {
        await encryptionService.removeEncryptedData(key);
      }

      // Remove user from consent records
      const consents = await encryptionService.getEncryptedData<ConsentRecord[]>('user_consents') || [];
      const filteredConsents = consents.filter(consent => consent.userId !== userId);
      await encryptionService.storeEncryptedData('user_consents', filteredConsents);

      // Remove user from audit logs (keep for legal compliance but anonymize)
      const auditLogs = await securityManager.getAuditLogs();
      const anonymizedLogs = auditLogs.map(log => 
        log.userId === userId ? { ...log, userId: 'DELETED_USER' } : log
      );
      await encryptionService.storeEncryptedData('security_audit_logs', anonymizedLogs);

      console.log(`All data for user ${userId} has been deleted`);
    } catch (error) {
      console.error('Error deleting user data:', error);
      throw new Error('Failed to delete user data');
    }
  }

  // Helper methods for data collection (mock implementations)
  private async getUserBasicInfo(userId: string): Promise<any> {
    // TODO: Implement actual data retrieval
    return { userId, note: 'Basic user information would be collected here' };
  }

  private async getUserContactInfo(userId: string): Promise<any> {
    // TODO: Implement actual data retrieval
    return { userId, note: 'Contact information would be collected here' };
  }

  private async getUserProfileData(userId: string): Promise<any> {
    // TODO: Implement actual data retrieval
    return { userId, note: 'Profile data would be collected here' };
  }

  private async getUserLoginHistory(userId: string): Promise<any[]> {
    // TODO: Implement actual data retrieval
    return [{ userId, note: 'Login history would be collected here' }];
  }

  private async getUserCollaborationHistory(userId: string): Promise<any[]> {
    // TODO: Implement actual data retrieval
    return [{ userId, note: 'Collaboration history would be collected here' }];
  }

  private async getUserMessageHistory(userId: string): Promise<any[]> {
    // TODO: Implement actual data retrieval
    return [{ userId, note: 'Message history would be collected here' }];
  }

  private async getUserDeviceInfo(userId: string): Promise<any[]> {
    // TODO: Implement actual data retrieval
    return [{ userId, note: 'Device information would be collected here' }];
  }

  private async getUserSessionData(userId: string): Promise<any[]> {
    // TODO: Implement actual data retrieval
    return [{ userId, note: 'Session data would be collected here' }];
  }

  private async getUserSocialMediaData(userId: string): Promise<any> {
    // TODO: Implement actual data retrieval
    return { userId, note: 'Social media data would be collected here' };
  }

  private async getUserPaymentData(userId: string): Promise<any> {
    // TODO: Implement actual data retrieval (anonymized for privacy)
    return { userId, note: 'Payment data (anonymized) would be collected here' };
  }

  // Storage helper methods
  private async storeDataExportRequest(request: DataExportRequest): Promise<void> {
    const requests = await encryptionService.getEncryptedData<DataExportRequest[]>('data_export_requests') || [];
    const existingIndex = requests.findIndex(req => req.id === request.id);
    
    if (existingIndex >= 0) {
      requests[existingIndex] = request;
    } else {
      requests.push(request);
    }

    await encryptionService.storeEncryptedData('data_export_requests', requests);
  }

  private async storeDeletionRequest(request: DataDeletionRequest): Promise<void> {
    const requests = await encryptionService.getEncryptedData<DataDeletionRequest[]>('data_deletion_requests') || [];
    const existingIndex = requests.findIndex(req => req.id === request.id);
    
    if (existingIndex >= 0) {
      requests[existingIndex] = request;
    } else {
      requests.push(request);
    }

    await encryptionService.storeEncryptedData('data_deletion_requests', requests);
  }

  private async getDeletionRequest(requestId: string): Promise<DataDeletionRequest | null> {
    try {
      const requests = await encryptionService.getEncryptedData<DataDeletionRequest[]>('data_deletion_requests') || [];
      return requests.find(req => req.id === requestId) || null;
    } catch (error) {
      console.error('Error getting deletion request:', error);
      return null;
    }
  }
}

export const gdprService = GDPRService.getInstance();