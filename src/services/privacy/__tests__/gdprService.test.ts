import { gdprService } from '../gdprService';
import { encryptionService } from '../../security/encryptionService';

// Mock dependencies
jest.mock('../../security/encryptionService');
jest.mock('../../notificationService');

const mockEncryptionService = encryptionService as jest.Mocked<typeof encryptionService>;

describe('GDPRService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEncryptionService.getEncryptedData.mockResolvedValue([]);
    mockEncryptionService.storeEncryptedData.mockResolvedValue();
    mockEncryptionService.removeEncryptedData.mockResolvedValue();
  });

  describe('Data Export', () => {
    it('should create data export request', async () => {
      const userId = 'test-user-123';
      
      const request = await gdprService.requestDataExport(userId);
      
      expect(request).toBeDefined();
      expect(request.userId).toBe(userId);
      expect(request.status).toBe('pending');
      expect(request.requestDate).toBeInstanceOf(Date);
      expect(mockEncryptionService.storeEncryptedData).toHaveBeenCalled();
    });

    it('should get user export requests', async () => {
      const userId = 'test-user-123';
      const mockRequests = [
        {
          id: 'export-1',
          userId,
          requestDate: new Date(),
          status: 'completed' as const
        }
      ];
      
      mockEncryptionService.getEncryptedData.mockResolvedValue(mockRequests);
      
      const requests = await gdprService.getUserDataExportRequests(userId);
      
      expect(requests).toHaveLength(1);
      expect(requests[0].userId).toBe(userId);
    });

    it('should download exported data when available', async () => {
      const requestId = 'export-123';
      const mockRequest = {
        id: requestId,
        userId: 'test-user',
        requestDate: new Date(),
        status: 'completed' as const,
        downloadUrl: 'user_export_export-123',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      };
      
      const mockExportData = { exportDate: new Date().toISOString(), data: {} };
      
      mockEncryptionService.getEncryptedData
        .mockResolvedValueOnce([mockRequest]) // For getDataExportRequest
        .mockResolvedValueOnce(mockExportData); // For downloadExportedData
      
      const exportData = await gdprService.downloadExportedData(requestId);
      
      expect(exportData).toEqual(mockExportData);
    });

    it('should reject download for expired exports', async () => {
      const requestId = 'export-123';
      const mockRequest = {
        id: requestId,
        userId: 'test-user',
        requestDate: new Date(),
        status: 'completed' as const,
        downloadUrl: 'user_export_export-123',
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago (expired)
      };
      
      mockEncryptionService.getEncryptedData.mockResolvedValue([mockRequest]);
      
      await expect(gdprService.downloadExportedData(requestId))
        .rejects.toThrow('Export has expired');
    });
  });

  describe('Account Deletion', () => {
    it('should create account deletion request', async () => {
      const userId = 'test-user-123';
      const reason = 'No longer need the service';
      
      const request = await gdprService.requestAccountDeletion(userId, reason);
      
      expect(request).toBeDefined();
      expect(request.userId).toBe(userId);
      expect(request.reason).toBe(reason);
      expect(request.status).toBe('scheduled');
      expect(request.scheduledDeletionDate).toBeInstanceOf(Date);
      expect(mockEncryptionService.storeEncryptedData).toHaveBeenCalled();
    });

    it('should cancel account deletion request', async () => {
      const requestId = 'deletion-123';
      const userId = 'test-user-123';
      const mockRequest = {
        id: requestId,
        userId,
        requestDate: new Date(),
        scheduledDeletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'scheduled' as const
      };
      
      mockEncryptionService.getEncryptedData.mockResolvedValue([mockRequest]);
      
      const result = await gdprService.cancelAccountDeletion(requestId, userId);
      
      expect(result).toBe(true);
      expect(mockEncryptionService.storeEncryptedData).toHaveBeenCalled();
    });

    it('should not cancel deletion for wrong user', async () => {
      const requestId = 'deletion-123';
      const userId = 'test-user-123';
      const wrongUserId = 'wrong-user-456';
      const mockRequest = {
        id: requestId,
        userId,
        requestDate: new Date(),
        scheduledDeletionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'scheduled' as const
      };
      
      mockEncryptionService.getEncryptedData.mockResolvedValue([mockRequest]);
      
      const result = await gdprService.cancelAccountDeletion(requestId, wrongUserId);
      
      expect(result).toBe(false);
    });

    it('should execute account deletion when scheduled date is reached', async () => {
      const requestId = 'deletion-123';
      const userId = 'test-user-123';
      const deletedBy = 'admin-001';
      const mockRequest = {
        id: requestId,
        userId,
        requestDate: new Date(),
        scheduledDeletionDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        status: 'scheduled' as const
      };
      
      mockEncryptionService.getEncryptedData.mockResolvedValue([mockRequest]);
      
      const result = await gdprService.executeAccountDeletion(requestId, deletedBy);
      
      expect(result).toBe(true);
      expect(mockEncryptionService.storeEncryptedData).toHaveBeenCalled();
      expect(mockEncryptionService.removeEncryptedData).toHaveBeenCalled();
    });
  });

  describe('Consent Management', () => {
    it('should record user consent', async () => {
      const userId = 'test-user-123';
      const consentType = 'data_processing';
      const granted = true;
      const version = '1.0';
      
      await gdprService.recordConsent(userId, consentType, granted, version);
      
      expect(mockEncryptionService.storeEncryptedData).toHaveBeenCalledWith(
        'user_consents',
        expect.arrayContaining([
          expect.objectContaining({
            userId,
            consentType,
            granted,
            version
          })
        ])
      );
    });

    it('should get user consent history', async () => {
      const userId = 'test-user-123';
      const mockConsents = [
        {
          id: 'consent-1',
          userId,
          consentType: 'data_processing' as const,
          granted: true,
          timestamp: new Date(),
          version: '1.0'
        },
        {
          id: 'consent-2',
          userId: 'other-user',
          consentType: 'marketing' as const,
          granted: false,
          timestamp: new Date(),
          version: '1.0'
        }
      ];
      
      mockEncryptionService.getEncryptedData.mockResolvedValue(mockConsents);
      
      const userConsents = await gdprService.getUserConsents(userId);
      
      expect(userConsents).toHaveLength(1);
      expect(userConsents[0].userId).toBe(userId);
    });

    it('should check if user has given specific consent', async () => {
      const userId = 'test-user-123';
      const mockConsents = [
        {
          id: 'consent-1',
          userId,
          consentType: 'data_processing' as const,
          granted: true,
          timestamp: new Date(),
          version: '1.0'
        },
        {
          id: 'consent-2',
          userId,
          consentType: 'marketing' as const,
          granted: false,
          timestamp: new Date(),
          version: '1.0'
        }
      ];
      
      mockEncryptionService.getEncryptedData.mockResolvedValue(mockConsents);
      
      const hasDataProcessingConsent = await gdprService.hasUserConsent(userId, 'data_processing');
      const hasMarketingConsent = await gdprService.hasUserConsent(userId, 'marketing');
      const hasAnalyticsConsent = await gdprService.hasUserConsent(userId, 'analytics');
      
      expect(hasDataProcessingConsent).toBe(true);
      expect(hasMarketingConsent).toBe(false);
      expect(hasAnalyticsConsent).toBe(false); // No consent recorded
    });

    it('should return latest consent when multiple records exist', async () => {
      const userId = 'test-user-123';
      const oldDate = new Date('2023-01-01');
      const newDate = new Date('2023-12-01');
      
      const mockConsents = [
        {
          id: 'consent-1',
          userId,
          consentType: 'marketing' as const,
          granted: true,
          timestamp: oldDate,
          version: '1.0'
        },
        {
          id: 'consent-2',
          userId,
          consentType: 'marketing' as const,
          granted: false,
          timestamp: newDate,
          version: '2.0'
        }
      ];
      
      mockEncryptionService.getEncryptedData.mockResolvedValue(mockConsents);
      
      const hasConsent = await gdprService.hasUserConsent(userId, 'marketing');
      
      expect(hasConsent).toBe(false); // Should use the latest consent (false)
    });
  });
});