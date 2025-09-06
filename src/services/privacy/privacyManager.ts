import { gdprService, ConsentRecord } from './gdprService';
import { encryptionService } from '../security/encryptionService';

export interface PrivacySettings {
  userId: string;
  dataProcessingConsent: boolean;
  marketingConsent: boolean;
  analyticsConsent: boolean;
  cookiesConsent: boolean;
  thirdPartyConsent: boolean;
  dataRetentionPeriod: number; // days
  autoDeleteAfterInactivity: boolean;
  inactivityPeriod: number; // days
  updatedAt: Date;
}

export interface DataProcessingRecord {
  id: string;
  userId: string;
  processingType: 'collection' | 'storage' | 'analysis' | 'sharing' | 'deletion';
  dataType: 'personal' | 'behavioral' | 'technical' | 'communication';
  purpose: string;
  legalBasis: 'consent' | 'contract' | 'legal_obligation' | 'vital_interests' | 'public_task' | 'legitimate_interests';
  timestamp: Date;
  retentionPeriod?: number; // days
  thirdParties?: string[];
}

export class PrivacyManager {
  private static instance: PrivacyManager;

  private constructor() {}

  public static getInstance(): PrivacyManager {
    if (!PrivacyManager.instance) {
      PrivacyManager.instance = new PrivacyManager();
    }
    return PrivacyManager.instance;
  }

  /**
   * Initialize privacy settings for a new user
   */
  public async initializeUserPrivacySettings(userId: string): Promise<PrivacySettings> {
    try {
      const defaultSettings: PrivacySettings = {
        userId,
        dataProcessingConsent: false,
        marketingConsent: false,
        analyticsConsent: false,
        cookiesConsent: false,
        thirdPartyConsent: false,
        dataRetentionPeriod: 365, // 1 year default
        autoDeleteAfterInactivity: false,
        inactivityPeriod: 730, // 2 years default
        updatedAt: new Date()
      };

      await this.savePrivacySettings(defaultSettings);
      return defaultSettings;
    } catch (error) {
      console.error('Error initializing privacy settings:', error);
      throw new Error('Failed to initialize privacy settings');
    }
  }

  /**
   * Get user privacy settings
   */
  public async getUserPrivacySettings(userId: string): Promise<PrivacySettings | null> {
    try {
      return await encryptionService.getEncryptedData<PrivacySettings>(`privacy_settings_${userId}`);
    } catch (error) {
      console.error('Error getting privacy settings:', error);
      return null;
    }
  }

  /**
   * Update user privacy settings
   */
  public async updatePrivacySettings(
    userId: string,
    updates: Partial<PrivacySettings>
  ): Promise<PrivacySettings> {
    try {
      let settings = await this.getUserPrivacySettings(userId);
      
      if (!settings) {
        settings = await this.initializeUserPrivacySettings(userId);
      }

      const updatedSettings: PrivacySettings = {
        ...settings,
        ...updates,
        userId, // Ensure userId cannot be changed
        updatedAt: new Date()
      };

      await this.savePrivacySettings(updatedSettings);

      // Record consent changes
      await this.recordConsentChanges(userId, settings, updatedSettings);

      return updatedSettings;
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      throw new Error('Failed to update privacy settings');
    }
  }

  /**
   * Record consent changes
   */
  private async recordConsentChanges(
    userId: string,
    oldSettings: PrivacySettings,
    newSettings: PrivacySettings
  ): Promise<void> {
    const consentTypes: Array<{
      key: keyof PrivacySettings;
      type: ConsentRecord['consentType'];
    }> = [
      { key: 'dataProcessingConsent', type: 'data_processing' },
      { key: 'marketingConsent', type: 'marketing' },
      { key: 'analyticsConsent', type: 'analytics' },
      { key: 'cookiesConsent', type: 'cookies' },
      { key: 'thirdPartyConsent', type: 'third_party_sharing' }
    ];

    for (const { key, type } of consentTypes) {
      if (oldSettings[key] !== newSettings[key]) {
        await gdprService.recordConsent(
          userId,
          type,
          newSettings[key] as boolean,
          '1.0' // Privacy policy version
        );
      }
    }
  }

  /**
   * Check if user has given consent for specific processing
   */
  public async hasProcessingConsent(
    userId: string,
    processingType: 'data_processing' | 'marketing' | 'analytics' | 'cookies' | 'third_party_sharing'
  ): Promise<boolean> {
    try {
      const settings = await this.getUserPrivacySettings(userId);
      if (!settings) {
        return false;
      }

      switch (processingType) {
        case 'data_processing':
          return settings.dataProcessingConsent;
        case 'marketing':
          return settings.marketingConsent;
        case 'analytics':
          return settings.analyticsConsent;
        case 'cookies':
          return settings.cookiesConsent;
        case 'third_party_sharing':
          return settings.thirdPartyConsent;
        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking processing consent:', error);
      return false;
    }
  }

  /**
   * Record data processing activity
   */
  public async recordDataProcessing(
    userId: string,
    processingType: DataProcessingRecord['processingType'],
    dataType: DataProcessingRecord['dataType'],
    purpose: string,
    legalBasis: DataProcessingRecord['legalBasis'],
    retentionPeriod?: number,
    thirdParties?: string[]
  ): Promise<void> {
    try {
      const record: DataProcessingRecord = {
        id: `processing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId,
        processingType,
        dataType,
        purpose,
        legalBasis,
        timestamp: new Date(),
        retentionPeriod,
        thirdParties
      };

      const records = await encryptionService.getEncryptedData<DataProcessingRecord[]>('data_processing_records') || [];
      records.push(record);

      // Keep only last 10000 records
      const recentRecords = records
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10000);

      await encryptionService.storeEncryptedData('data_processing_records', recentRecords);
    } catch (error) {
      console.error('Error recording data processing:', error);
    }
  }

  /**
   * Get user's data processing history
   */
  public async getUserDataProcessingHistory(userId: string): Promise<DataProcessingRecord[]> {
    try {
      const records = await encryptionService.getEncryptedData<DataProcessingRecord[]>('data_processing_records') || [];
      return records.filter(record => record.userId === userId);
    } catch (error) {
      console.error('Error getting data processing history:', error);
      return [];
    }
  }

  /**
   * Request data export (GDPR Article 20)
   */
  public async requestDataExport(userId: string): Promise<string> {
    try {
      const request = await gdprService.requestDataExport(userId);
      
      // Record the data processing activity
      await this.recordDataProcessing(
        userId,
        'analysis',
        'personal',
        'Data export request - GDPR Article 20',
        'legal_obligation'
      );

      return request.id;
    } catch (error) {
      console.error('Error requesting data export:', error);
      throw new Error('Failed to request data export');
    }
  }

  /**
   * Request account deletion (GDPR Article 17)
   */
  public async requestAccountDeletion(userId: string, reason?: string): Promise<string> {
    try {
      const request = await gdprService.requestAccountDeletion(userId, reason);
      
      // Record the data processing activity
      await this.recordDataProcessing(
        userId,
        'deletion',
        'personal',
        'Account deletion request - GDPR Article 17',
        'legal_obligation'
      );

      return request.id;
    } catch (error) {
      console.error('Error requesting account deletion:', error);
      throw new Error('Failed to request account deletion');
    }
  }

  /**
   * Cancel account deletion
   */
  public async cancelAccountDeletion(requestId: string, userId: string): Promise<boolean> {
    try {
      const result = await gdprService.cancelAccountDeletion(requestId, userId);
      
      if (result) {
        await this.recordDataProcessing(
          userId,
          'storage',
          'personal',
          'Account deletion cancelled by user',
          'consent'
        );
      }

      return result;
    } catch (error) {
      console.error('Error cancelling account deletion:', error);
      return false;
    }
  }

  /**
   * Get user's GDPR requests
   */
  public async getUserGDPRRequests(userId: string): Promise<{
    exportRequests: any[];
    deletionRequests: any[];
  }> {
    try {
      const [exportRequests, deletionRequests] = await Promise.all([
        gdprService.getUserDataExportRequests(userId),
        gdprService.getUserDeletionRequests(userId)
      ]);

      return { exportRequests, deletionRequests };
    } catch (error) {
      console.error('Error getting GDPR requests:', error);
      return { exportRequests: [], deletionRequests: [] };
    }
  }

  /**
   * Check if data should be automatically deleted due to inactivity
   */
  public async checkAutoDeleteEligibility(userId: string, lastActivityDate: Date): Promise<boolean> {
    try {
      const settings = await this.getUserPrivacySettings(userId);
      if (!settings || !settings.autoDeleteAfterInactivity) {
        return false;
      }

      const daysSinceLastActivity = Math.floor(
        (Date.now() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      return daysSinceLastActivity >= settings.inactivityPeriod;
    } catch (error) {
      console.error('Error checking auto delete eligibility:', error);
      return false;
    }
  }

  /**
   * Get data retention period for user
   */
  public async getDataRetentionPeriod(userId: string): Promise<number> {
    try {
      const settings = await this.getUserPrivacySettings(userId);
      return settings?.dataRetentionPeriod || 365; // Default 1 year
    } catch (error) {
      console.error('Error getting data retention period:', error);
      return 365;
    }
  }

  /**
   * Anonymize user data (for cases where deletion is not possible due to legal requirements)
   */
  public async anonymizeUserData(userId: string): Promise<void> {
    try {
      // This would replace personal identifiers with anonymous IDs
      // while keeping data for statistical/legal purposes
      
      await this.recordDataProcessing(
        userId,
        'analysis',
        'personal',
        'Data anonymization for legal compliance',
        'legal_obligation'
      );

      // TODO: Implement actual anonymization logic
      console.log(`User data anonymized for user ${userId}`);
    } catch (error) {
      console.error('Error anonymizing user data:', error);
      throw new Error('Failed to anonymize user data');
    }
  }

  /**
   * Generate privacy report for user
   */
  public async generatePrivacyReport(userId: string): Promise<{
    settings: PrivacySettings | null;
    consents: ConsentRecord[];
    processingHistory: DataProcessingRecord[];
    gdprRequests: any;
  }> {
    try {
      const [settings, consents, processingHistory, gdprRequests] = await Promise.all([
        this.getUserPrivacySettings(userId),
        gdprService.getUserConsents(userId),
        this.getUserDataProcessingHistory(userId),
        this.getUserGDPRRequests(userId)
      ]);

      return {
        settings,
        consents,
        processingHistory,
        gdprRequests
      };
    } catch (error) {
      console.error('Error generating privacy report:', error);
      throw new Error('Failed to generate privacy report');
    }
  }

  /**
   * Save privacy settings
   */
  private async savePrivacySettings(settings: PrivacySettings): Promise<void> {
    try {
      await encryptionService.storeEncryptedData(`privacy_settings_${settings.userId}`, settings);
    } catch (error) {
      console.error('Error saving privacy settings:', error);
      throw new Error('Failed to save privacy settings');
    }
  }

  /**
   * Validate data processing against user consent
   */
  public async validateDataProcessing(
    userId: string,
    processingType: 'marketing' | 'analytics' | 'third_party_sharing'
  ): Promise<boolean> {
    try {
      const hasConsent = await this.hasProcessingConsent(userId, processingType);
      
      if (!hasConsent) {
        console.warn(`Data processing blocked for user ${userId}: No consent for ${processingType}`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating data processing:', error);
      return false;
    }
  }
}

export const privacyManager = PrivacyManager.getInstance();