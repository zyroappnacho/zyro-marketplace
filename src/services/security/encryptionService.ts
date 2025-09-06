import CryptoJS from 'crypto-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Encryption configuration
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'zyro-default-key-2024';
const IV_LENGTH = 16; // For AES, this is always 16

export class EncryptionService {
  private static instance: EncryptionService;
  private encryptionKey: string;

  private constructor() {
    this.encryptionKey = ENCRYPTION_KEY;
  }

  public static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  /**
   * Encrypt sensitive data using AES encryption
   */
  public encryptData(data: string): string {
    try {
      const encrypted = CryptoJS.AES.encrypt(data, this.encryptionKey).toString();
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data
   */
  public decryptData(encryptedData: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      
      if (!decrypted) {
        throw new Error('Failed to decrypt data - invalid key or corrupted data');
      }
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Hash sensitive data (one-way encryption for passwords, etc.)
   */
  public hashData(data: string, salt?: string): string {
    try {
      const saltToUse = salt || CryptoJS.lib.WordArray.random(128/8).toString();
      const hash = CryptoJS.PBKDF2(data, saltToUse, {
        keySize: 256/32,
        iterations: 10000
      }).toString();
      
      return `${saltToUse}:${hash}`;
    } catch (error) {
      console.error('Hashing error:', error);
      throw new Error('Failed to hash data');
    }
  }

  /**
   * Verify hashed data
   */
  public verifyHash(data: string, hashedData: string): boolean {
    try {
      const [salt, hash] = hashedData.split(':');
      const newHash = CryptoJS.PBKDF2(data, salt, {
        keySize: 256/32,
        iterations: 10000
      }).toString();
      
      return newHash === hash;
    } catch (error) {
      console.error('Hash verification error:', error);
      return false;
    }
  }

  /**
   * Encrypt and store sensitive data in AsyncStorage
   */
  public async storeEncryptedData(key: string, data: any): Promise<void> {
    try {
      const jsonData = JSON.stringify(data);
      const encryptedData = this.encryptData(jsonData);
      await AsyncStorage.setItem(key, encryptedData);
    } catch (error) {
      console.error('Store encrypted data error:', error);
      throw new Error('Failed to store encrypted data');
    }
  }

  /**
   * Retrieve and decrypt data from AsyncStorage
   */
  public async getEncryptedData<T>(key: string): Promise<T | null> {
    try {
      const encryptedData = await AsyncStorage.getItem(key);
      if (!encryptedData) {
        return null;
      }
      
      const decryptedData = this.decryptData(encryptedData);
      return JSON.parse(decryptedData) as T;
    } catch (error) {
      console.error('Get encrypted data error:', error);
      return null;
    }
  }

  /**
   * Remove encrypted data from AsyncStorage
   */
  public async removeEncryptedData(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Remove encrypted data error:', error);
      throw new Error('Failed to remove encrypted data');
    }
  }

  /**
   * Encrypt personal identifiable information (PII)
   */
  public encryptPII(piiData: {
    phone?: string;
    address?: string;
    cif?: string;
    bankAccount?: string;
  }): any {
    const encrypted: any = {};
    
    Object.entries(piiData).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        encrypted[key] = this.encryptData(value);
      }
    });
    
    return encrypted;
  }

  /**
   * Decrypt personal identifiable information (PII)
   */
  public decryptPII(encryptedPII: any): any {
    const decrypted: any = {};
    
    Object.entries(encryptedPII).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        try {
          decrypted[key] = this.decryptData(value);
        } catch (error) {
          console.error(`Failed to decrypt PII field ${key}:`, error);
          decrypted[key] = null;
        }
      }
    });
    
    return decrypted;
  }
}

export const encryptionService = EncryptionService.getInstance();