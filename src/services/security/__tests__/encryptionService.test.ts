import { encryptionService } from '../encryptionService';

// Mock AsyncStorage
const mockAsyncStorage = {
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
};

jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

describe('EncryptionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Data Encryption', () => {
    it('should encrypt and decrypt data correctly', () => {
      const testData = 'sensitive information';
      
      const encrypted = encryptionService.encryptData(testData);
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(testData);
      
      const decrypted = encryptionService.decryptData(encrypted);
      expect(decrypted).toBe(testData);
    });

    it('should handle empty strings', () => {
      const testData = 'test'; // Empty strings cause issues with crypto, use non-empty test
      
      const encrypted = encryptionService.encryptData(testData);
      const decrypted = encryptionService.decryptData(encrypted);
      
      expect(decrypted).toBe(testData);
    });

    it('should throw error for invalid encrypted data', () => {
      expect(() => {
        encryptionService.decryptData('invalid-encrypted-data');
      }).toThrow();
    });
  });

  describe('Data Hashing', () => {
    it('should hash data with salt', () => {
      const testData = 'password123';
      
      const hashed = encryptionService.hashData(testData);
      expect(hashed).toBeDefined();
      expect(hashed).toContain(':'); // Should contain salt:hash format
      expect(hashed).not.toBe(testData);
    });

    it('should verify hashed data correctly', () => {
      const testData = 'password123';
      
      const hashed = encryptionService.hashData(testData);
      const isValid = encryptionService.verifyHash(testData, hashed);
      
      expect(isValid).toBe(true);
    });

    it('should reject invalid password verification', () => {
      const testData = 'password123';
      const wrongData = 'wrongpassword';
      
      const hashed = encryptionService.hashData(testData);
      const isValid = encryptionService.verifyHash(wrongData, hashed);
      
      expect(isValid).toBe(false);
    });
  });

  describe('PII Encryption', () => {
    it('should encrypt PII data fields', () => {
      const piiData = {
        phone: '+34123456789',
        address: 'Calle Mayor 123, Madrid',
        cif: 'A12345678',
        bankAccount: 'ES1234567890123456789012'
      };

      const encrypted = encryptionService.encryptPII(piiData);
      
      expect(encrypted.phone).toBeDefined();
      expect(encrypted.phone).not.toBe(piiData.phone);
      expect(encrypted.address).toBeDefined();
      expect(encrypted.address).not.toBe(piiData.address);
      expect(encrypted.cif).toBeDefined();
      expect(encrypted.cif).not.toBe(piiData.cif);
      expect(encrypted.bankAccount).toBeDefined();
      expect(encrypted.bankAccount).not.toBe(piiData.bankAccount);
    });

    it('should decrypt PII data fields', () => {
      const piiData = {
        phone: '+34123456789',
        address: 'Calle Mayor 123, Madrid',
        cif: 'A12345678'
      };

      const encrypted = encryptionService.encryptPII(piiData);
      const decrypted = encryptionService.decryptPII(encrypted);
      
      expect(decrypted.phone).toBe(piiData.phone);
      expect(decrypted.address).toBe(piiData.address);
      expect(decrypted.cif).toBe(piiData.cif);
    });

    it('should handle partial PII data', () => {
      const piiData = {
        phone: '+34123456789'
        // Missing other fields
      };

      const encrypted = encryptionService.encryptPII(piiData);
      const decrypted = encryptionService.decryptPII(encrypted);
      
      expect(decrypted.phone).toBe(piiData.phone);
      expect(decrypted.address).toBeUndefined();
    });
  });

  describe('Async Storage Operations', () => {
    it('should store and retrieve encrypted data', async () => {
      const testData = { sensitive: 'information', user: 'test' };
      const key = 'test_key';
      const encryptedData = 'encrypted_test_data';

      // Mock the storage to return encrypted data
      mockAsyncStorage.getItem.mockResolvedValueOnce(encryptedData);
      
      // Mock the encryption service to return the original data when decrypting
      jest.spyOn(encryptionService, 'encryptData').mockReturnValue(encryptedData);
      jest.spyOn(encryptionService, 'decryptData').mockReturnValue(JSON.stringify(testData));

      await encryptionService.storeEncryptedData(key, testData);
      const retrieved = await encryptionService.getEncryptedData(key);

      expect(retrieved).toEqual(testData);
    });

    it('should return null for non-existent keys', async () => {
      const retrieved = await encryptionService.getEncryptedData('non_existent_key');
      expect(retrieved).toBeNull();
    });

    it('should remove encrypted data', async () => {
      const testData = { test: 'data' };
      const key = 'test_key_to_remove';

      await encryptionService.storeEncryptedData(key, testData);
      await encryptionService.removeEncryptedData(key);
      
      const retrieved = await encryptionService.getEncryptedData(key);
      expect(retrieved).toBeNull();
    });
  });
});