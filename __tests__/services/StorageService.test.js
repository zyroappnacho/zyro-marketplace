import StorageService from '../../services/StorageService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

describe('StorageService', () => {
  beforeEach(() => {
    AsyncStorage.clear();
    jest.clearAllMocks();
  });

  describe('User Management', () => {
    const mockUser = {
      id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'influencer'
    };

    it('should save user data', async () => {
      const result = await StorageService.saveUser(mockUser);
      
      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'currentUser',
        JSON.stringify(mockUser)
      );
    });

    it('should retrieve user data', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockUser));
      
      const result = await StorageService.getUser();
      
      expect(result).toEqual(mockUser);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('currentUser');
    });

    it('should return null when no user data exists', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(null);
      
      const result = await StorageService.getUser();
      
      expect(result).toBeNull();
    });

    it('should remove user data', async () => {
      const result = await StorageService.removeUser();
      
      expect(result).toBe(true);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('currentUser');
    });

    it('should handle errors when saving user', async () => {
      AsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage error'));
      
      const result = await StorageService.saveUser(mockUser);
      
      expect(result).toBe(false);
    });
  });

  describe('Settings Management', () => {
    const mockSettings = {
      notifications: true,
      emailNotifications: false,
      pushNotifications: true,
      city: 'Madrid',
      language: 'es'
    };

    it('should save settings', async () => {
      const result = await StorageService.saveSettings(mockSettings);
      
      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'userSettings',
        JSON.stringify(mockSettings)
      );
    });

    it('should retrieve settings', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockSettings));
      
      const result = await StorageService.getSettings();
      
      expect(result).toEqual(mockSettings);
    });

    it('should return default settings when none exist', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(null);
      
      const result = await StorageService.getSettings();
      
      expect(result).toEqual({
        notifications: true,
        emailNotifications: true,
        pushNotifications: true,
        city: 'Madrid',
        language: 'es'
      });
    });
  });

  describe('Cache Management', () => {
    const mockData = { test: 'data' };
    const cacheKey = 'testKey';

    it('should save cache with expiration', async () => {
      const result = await StorageService.saveCache(cacheKey, mockData, 60);
      
      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        `cache_${cacheKey}`,
        expect.stringContaining('"data":{"test":"data"}')
      );
    });

    it('should retrieve valid cache', async () => {
      const cacheData = {
        data: mockData,
        timestamp: Date.now(),
        expiration: Date.now() + 60000 // 1 minute from now
      };
      
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(cacheData));
      
      const result = await StorageService.getCache(cacheKey);
      
      expect(result).toEqual(mockData);
    });

    it('should return null for expired cache', async () => {
      const cacheData = {
        data: mockData,
        timestamp: Date.now() - 120000, // 2 minutes ago
        expiration: Date.now() - 60000 // 1 minute ago (expired)
      };
      
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(cacheData));
      
      const result = await StorageService.getCache(cacheKey);
      
      expect(result).toBeNull();
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(`cache_${cacheKey}`);
    });

    it('should clear all cache', async () => {
      const mockKeys = ['cache_key1', 'cache_key2', 'otherKey'];
      AsyncStorage.getAllKeys.mockResolvedValueOnce(mockKeys);
      
      const result = await StorageService.clearCache();
      
      expect(result).toBe(true);
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(['cache_key1', 'cache_key2']);
    });
  });

  describe('Collaboration History', () => {
    const mockHistory = {
      proximos: [{ id: 1, title: 'Test Collaboration' }],
      pasados: [],
      cancelados: []
    };

    it('should save collaboration history', async () => {
      const result = await StorageService.saveCollaborationHistory(mockHistory);
      
      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'collaborationHistory',
        JSON.stringify(mockHistory)
      );
    });

    it('should retrieve collaboration history', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockHistory));
      
      const result = await StorageService.getCollaborationHistory();
      
      expect(result).toEqual(mockHistory);
    });

    it('should return default history when none exists', async () => {
      AsyncStorage.getItem.mockResolvedValueOnce(null);
      
      const result = await StorageService.getCollaborationHistory();
      
      expect(result).toEqual({
        proximos: [],
        pasados: [],
        cancelados: []
      });
    });
  });

  describe('Storage Info', () => {
    it('should get storage information', async () => {
      const mockKeys = ['key1', 'key2'];
      const mockValues = [
        ['key1', 'value1'],
        ['key2', 'value2']
      ];
      
      AsyncStorage.getAllKeys.mockResolvedValueOnce(mockKeys);
      AsyncStorage.multiGet.mockResolvedValueOnce(mockValues);
      
      const result = await StorageService.getStorageInfo();
      
      expect(result).toHaveProperty('totalItems', 2);
      expect(result).toHaveProperty('totalSize');
      expect(result).toHaveProperty('items');
      expect(result.items).toHaveLength(2);
    });

    it('should handle errors when getting storage info', async () => {
      AsyncStorage.getAllKeys.mockRejectedValueOnce(new Error('Storage error'));
      
      const result = await StorageService.getStorageInfo();
      
      expect(result).toBeNull();
    });
  });

  describe('Clear All Data', () => {
    it('should clear all storage data', async () => {
      const result = await StorageService.clearAll();
      
      expect(result).toBe(true);
      expect(AsyncStorage.clear).toHaveBeenCalled();
    });

    it('should handle errors when clearing all data', async () => {
      AsyncStorage.clear.mockRejectedValueOnce(new Error('Storage error'));
      
      const result = await StorageService.clearAll();
      
      expect(result).toBe(false);
    });
  });
});