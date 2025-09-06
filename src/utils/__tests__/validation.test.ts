import {
  validateEmail,
  validateInstagramUsername,
  validateTikTokUsername,
  validateCIF,
  validateSpanishPhone,
  isInfluencer,
  isCompany,
  isAdmin,
  validateInfluencerData,
  validateCompanyData,
  validateAdminCredentials,
  influencerRegistrationSchema,
  companyRegistrationSchema,
  adminLoginSchema,
  loginSchema
} from '../validation';
import { BaseUser, Influencer, Company, Admin } from '../../types';

describe('Validation Utilities', () => {
  describe('Email Validation', () => {
    it('should validate correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('test+tag@example.org')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('test..test@domain.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('Instagram Username Validation', () => {
    it('should validate correct Instagram usernames', () => {
      expect(validateInstagramUsername('testuser')).toBe(true);
      expect(validateInstagramUsername('test_user')).toBe(true);
      expect(validateInstagramUsername('test.user')).toBe(true);
      expect(validateInstagramUsername('test123')).toBe(true);
    });

    it('should reject invalid Instagram usernames', () => {
      expect(validateInstagramUsername('test-user')).toBe(false); // hyphen not allowed
      expect(validateInstagramUsername('test user')).toBe(false); // space not allowed
      expect(validateInstagramUsername('test@user')).toBe(false); // @ not allowed
      expect(validateInstagramUsername('')).toBe(false); // empty
      expect(validateInstagramUsername('a'.repeat(31))).toBe(false); // too long
    });
  });

  describe('TikTok Username Validation', () => {
    it('should validate correct TikTok usernames', () => {
      expect(validateTikTokUsername('testuser')).toBe(true);
      expect(validateTikTokUsername('test_user')).toBe(true);
      expect(validateTikTokUsername('test.user')).toBe(true);
      expect(validateTikTokUsername('test123')).toBe(true);
    });

    it('should reject invalid TikTok usernames', () => {
      expect(validateTikTokUsername('test-user')).toBe(false); // hyphen not allowed
      expect(validateTikTokUsername('test user')).toBe(false); // space not allowed
      expect(validateTikTokUsername('')).toBe(false); // empty
      expect(validateTikTokUsername('a'.repeat(25))).toBe(false); // too long
    });
  });

  describe('CIF Validation', () => {
    it('should validate correct CIF formats', () => {
      expect(validateCIF('A12345678')).toBe(true);
      expect(validateCIF('B87654321')).toBe(true);
      expect(validateCIF('12345678A')).toBe(true);
    });

    it('should reject invalid CIF formats', () => {
      expect(validateCIF('12345678')).toBe(false); // missing letter
      expect(validateCIF('A1234567')).toBe(false); // too short
      expect(validateCIF('A123456789')).toBe(false); // too long
      expect(validateCIF('a12345678')).toBe(false); // lowercase letter
      expect(validateCIF('')).toBe(false); // empty
    });
  });

  describe('Spanish Phone Validation', () => {
    it('should validate correct Spanish phone numbers', () => {
      expect(validateSpanishPhone('+34612345678')).toBe(true);
      expect(validateSpanishPhone('612345678')).toBe(true);
      expect(validateSpanishPhone('712345678')).toBe(true);
      expect(validateSpanishPhone('812345678')).toBe(true);
      expect(validateSpanishPhone('912345678')).toBe(true);
      expect(validateSpanishPhone('+34 612 345 678')).toBe(true); // with spaces
      expect(validateSpanishPhone('612-345-678')).toBe(true); // with hyphens
    });

    it('should reject invalid Spanish phone numbers', () => {
      expect(validateSpanishPhone('512345678')).toBe(false); // doesn't start with 6,7,8,9
      expect(validateSpanishPhone('61234567')).toBe(false); // too short
      expect(validateSpanishPhone('6123456789')).toBe(false); // too long
      expect(validateSpanishPhone('')).toBe(false); // empty
    });
  });

  describe('Type Guards', () => {
    const baseUser: BaseUser = {
      id: '1',
      email: 'test@example.com',
      role: 'influencer',
      status: 'approved',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should correctly identify influencer', () => {
      const influencer = { ...baseUser, role: 'influencer' as const };
      expect(isInfluencer(influencer)).toBe(true);
      expect(isCompany(influencer)).toBe(false);
      expect(isAdmin(influencer)).toBe(false);
    });

    it('should correctly identify company', () => {
      const company = { ...baseUser, role: 'company' as const };
      expect(isCompany(company)).toBe(true);
      expect(isInfluencer(company)).toBe(false);
      expect(isAdmin(company)).toBe(false);
    });

    it('should correctly identify admin', () => {
      const admin = { ...baseUser, role: 'admin' as const };
      expect(isAdmin(admin)).toBe(true);
      expect(isInfluencer(admin)).toBe(false);
      expect(isCompany(admin)).toBe(false);
    });
  });

  describe('Schema Validations', () => {
    describe('Influencer Registration Schema', () => {
      const validInfluencerData = {
        fullName: 'Test Influencer',
        email: 'test@example.com',
        password: 'Password123',
        instagramUsername: 'testuser',
        instagramFollowers: 5000,
        tiktokFollowers: 0,
        city: 'Madrid',
        audienceStats: {
          countries: [{ country: 'Spain', percentage: 80 }],
          cities: [{ city: 'Madrid', percentage: 60 }],
          ageRanges: [{ range: '18-24', percentage: 40 }],
          monthlyStats: {
            views: 10000,
            engagement: 500,
            reach: 8000
          }
        }
      };

      it('should validate correct influencer data', async () => {
        await expect(influencerRegistrationSchema.validate(validInfluencerData))
          .resolves.toBeDefined();
      });

      it('should reject invalid email', async () => {
        const invalidData = { ...validInfluencerData, email: 'invalid-email' };
        await expect(influencerRegistrationSchema.validate(invalidData))
          .rejects.toThrow('Email debe tener un formato válido');
      });

      it('should reject weak password', async () => {
        const invalidData = { ...validInfluencerData, password: 'weak' };
        await expect(influencerRegistrationSchema.validate(invalidData))
          .rejects.toThrow();
      });

      it('should reject negative followers', async () => {
        const invalidData = { ...validInfluencerData, instagramFollowers: -100 };
        await expect(influencerRegistrationSchema.validate(invalidData))
          .rejects.toThrow();
      });
    });

    describe('Company Registration Schema', () => {
      const validCompanyData = {
        companyName: 'Test Company',
        email: 'company@example.com',
        password: 'Password123',
        cif: 'A12345678',
        address: 'Calle Mayor 123, Madrid',
        phone: '+34612345678',
        contactPerson: 'John Doe',
        subscription: {
          plan: '6months' as const
        }
      };

      it('should validate correct company data', async () => {
        await expect(companyRegistrationSchema.validate(validCompanyData))
          .resolves.toBeDefined();
      });

      it('should reject invalid CIF', async () => {
        const invalidData = { ...validCompanyData, cif: 'invalid-cif' };
        await expect(companyRegistrationSchema.validate(invalidData))
          .rejects.toThrow();
      });

      it('should reject invalid phone', async () => {
        const invalidData = { ...validCompanyData, phone: 'invalid-phone' };
        await expect(companyRegistrationSchema.validate(invalidData))
          .rejects.toThrow();
      });
    });

    describe('Admin Login Schema', () => {
      it('should validate correct admin credentials', async () => {
        const validCredentials = {
          username: 'admin_zyrovip',
          password: 'xarrec-2paqra-guftoN'
        };
        await expect(adminLoginSchema.validate(validCredentials))
          .resolves.toBeDefined();
      });

      it('should reject invalid username', async () => {
        const invalidCredentials = {
          username: 'wrong_admin',
          password: 'xarrec-2paqra-guftoN'
        };
        await expect(adminLoginSchema.validate(invalidCredentials))
          .rejects.toThrow();
      });

      it('should reject invalid password', async () => {
        const invalidCredentials = {
          username: 'admin_zyrovip',
          password: 'wrong-password'
        };
        await expect(adminLoginSchema.validate(invalidCredentials))
          .rejects.toThrow();
      });
    });

    describe('Login Schema', () => {
      it('should validate correct login data', async () => {
        const validLogin = {
          email: 'test@example.com',
          password: 'password123'
        };
        await expect(loginSchema.validate(validLogin))
          .resolves.toBeDefined();
      });

      it('should reject invalid email format', async () => {
        const invalidLogin = {
          email: 'invalid-email',
          password: 'password123'
        };
        await expect(loginSchema.validate(invalidLogin))
          .rejects.toThrow();
      });

      it('should reject empty password', async () => {
        const invalidLogin = {
          email: 'test@example.com',
          password: ''
        };
        await expect(loginSchema.validate(invalidLogin))
          .rejects.toThrow();
      });
    });
  });

  describe('Data Validation Functions', () => {
    it('should validate influencer data correctly', async () => {
      const validData = {
        fullName: 'Test Influencer',
        email: 'test@example.com',
        password: 'Password123',
        instagramFollowers: 5000,
        city: 'Madrid',
        audienceStats: {
          countries: [{ country: 'Spain', percentage: 80 }],
          cities: [{ city: 'Madrid', percentage: 60 }],
          ageRanges: [{ range: '18-24', percentage: 40 }],
          monthlyStats: {
            views: 10000,
            engagement: 500,
            reach: 8000
          }
        }
      };

      const result = await validateInfluencerData(validData);
      expect(result).toBe(true);
    });

    it('should reject invalid influencer data', async () => {
      const invalidData = {
        fullName: 'T', // too short
        email: 'invalid-email',
        password: 'weak'
      };

      const result = await validateInfluencerData(invalidData);
      expect(result).toBe(false);
    });

    it('should validate company data correctly', async () => {
      const validData = {
        companyName: 'Test Company',
        email: 'company@example.com',
        password: 'Password123',
        cif: 'A12345678',
        address: 'Calle Mayor 123, Madrid',
        phone: '+34612345678',
        contactPerson: 'John Doe',
        subscription: {
          plan: '6months' as const,
          price: 399,
          startDate: new Date(),
          endDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
          status: 'active' as const
        }
      };

      const result = await validateCompanyData(validData);
      expect(result).toBe(true);
    });

    it('should validate admin credentials correctly', async () => {
      const validCredentials = {
        username: 'admin_zyrovip',
        password: 'xarrec-2paqra-guftoN'
      };

      const result = await validateAdminCredentials(validCredentials);
      expect(result).toBe(true);
    });

    it('should reject invalid admin credentials', async () => {
      const invalidCredentials = {
        username: 'wrong_admin',
        password: 'wrong_password'
      };

      const result = await validateAdminCredentials(invalidCredentials);
      expect(result).toBe(false);
    });
  });
});