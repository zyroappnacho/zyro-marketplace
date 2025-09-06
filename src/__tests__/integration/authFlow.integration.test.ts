import { configureStore } from '@reduxjs/toolkit';
import authReducer, { loginUser, registerUser } from '../../store/slices/authSlice';
import { ValidationService } from '../../services/validationService';
import { securityManager } from '../../services/security/securityManager';
import { authSecurityService } from '../../services/security/authSecurityService';
import { databaseService } from '../../database';

// Mock external dependencies
jest.mock('../../services/security/securityManager');
jest.mock('../../services/security/authSecurityService');
jest.mock('../../database');

const mockSecurityManager = securityManager as jest.Mocked<typeof securityManager>;
const mockAuthSecurityService = authSecurityService as jest.Mocked<typeof authSecurityService>;
const mockDatabaseService = databaseService as jest.Mocked<typeof databaseService>;

describe('Authentication Flow Integration Tests', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
    jest.clearAllMocks();
    
    // Setup default mocks
    mockAuthSecurityService.getDeviceId.mockResolvedValue('test-device-id');
    mockDatabaseService.users = {
      findByEmail: jest.fn(),
      verifyPassword: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    } as any;
  });

  describe('Complete Registration Flow', () => {
    it('should handle complete influencer registration flow', async () => {
      // Mock database responses
      mockDatabaseService.users.findByEmail.mockResolvedValue(null); // Email not exists
      mockDatabaseService.users.create.mockResolvedValue({
        id: 'user-123',
        email: 'influencer@test.com',
        role: 'influencer',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const registrationData = {
        email: 'influencer@test.com',
        password: 'SecurePassword123',
        role: 'influencer' as const,
        fullName: 'Test Influencer',
        instagramUsername: 'testinfluencer',
        instagramFollowers: 10000,
        tiktokFollowers: 5000,
        city: 'Madrid',
        audienceStats: {
          countries: [{ country: 'Spain', percentage: 80 }],
          cities: [{ city: 'Madrid', percentage: 60 }],
          ageRanges: [{ range: '18-24', percentage: 40 }],
          monthlyStats: {
            views: 50000,
            engagement: 2500,
            reach: 40000,
          },
        },
      };

      // Step 1: Validate registration data
      const schema = ValidationService.getUserRegistrationSchema();
      const validationResult = await ValidationService.validate(schema, registrationData);
      expect(validationResult.isValid).toBe(true);

      // Step 2: Register user
      const registerAction = await store.dispatch(registerUser(registrationData));
      expect(registerAction.type).toBe('auth/registerUser/fulfilled');

      // Step 3: Verify state after registration
      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toBeDefined();
      expect(state.user?.email).toBe(registrationData.email);
      expect(state.user?.role).toBe('influencer');
      expect(state.user?.status).toBe('pending');
      expect(state.error).toBeNull();
    });

    it('should handle complete company registration flow', async () => {
      // Mock database responses
      mockDatabaseService.users.findByEmail.mockResolvedValue(null);
      mockDatabaseService.companies = {
        findByCif: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
      } as any;

      const registrationData = {
        email: 'company@test.com',
        password: 'SecurePassword123',
        role: 'company' as const,
        companyName: 'Test Company SL',
        cif: 'A12345678',
        address: 'Calle Mayor 123, Madrid',
        phone: '+34612345678',
        contactPerson: 'John Doe',
        subscription: {
          plan: '6months' as const,
          price: 399,
          startDate: new Date(),
          endDate: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
          status: 'active' as const,
        },
      };

      // Step 1: Validate company data
      const companySchema = ValidationService.getCompanyProfileSchema();
      const validationResult = await ValidationService.validate(companySchema, registrationData);
      expect(validationResult.isValid).toBe(true);

      // Step 2: Register company
      const registerAction = await store.dispatch(registerUser(registrationData));
      expect(registerAction.type).toBe('auth/registerUser/fulfilled');

      // Step 3: Verify state
      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.role).toBe('company');
      expect(state.user?.status).toBe('pending');
    });

    it('should reject registration with duplicate email', async () => {
      // Mock existing user
      mockDatabaseService.users.findByEmail.mockResolvedValue({
        id: 'existing-user',
        email: 'existing@test.com',
      } as any);

      const registrationData = {
        email: 'existing@test.com',
        password: 'SecurePassword123',
        role: 'influencer' as const,
      };

      // Validation should fail due to duplicate email
      const schema = ValidationService.getUserRegistrationSchema();
      const validationResult = await ValidationService.validate(schema, registrationData);
      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors?.email).toContain('already exists');
    });
  });

  describe('Complete Login Flow', () => {
    it('should handle successful login flow for approved user', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'influencer',
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock successful authentication
      mockSecurityManager.secureLogin.mockResolvedValue({
        success: true,
        user: mockUser,
      });

      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Step 1: Validate credentials format
      const credentialsResult = await ValidationService.validateCredentials(
        credentials.email,
        credentials.password
      );
      // Note: This would normally check the database, but we're testing the flow

      // Step 2: Attempt login
      const loginAction = await store.dispatch(loginUser(credentials));
      expect(loginAction.type).toBe('auth/loginUser/fulfilled');

      // Step 3: Verify authentication state
      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
      expect(state.error).toBeNull();
      expect(state.loginAttempts).toBe(0);

      // Step 4: Verify security services were called
      expect(mockAuthSecurityService.getDeviceId).toHaveBeenCalled();
      expect(mockSecurityManager.secureLogin).toHaveBeenCalledWith(
        credentials.email,
        credentials.password,
        'test-device-id'
      );
    });

    it('should handle login failure and track attempts', async () => {
      // Mock failed authentication
      mockSecurityManager.secureLogin.mockResolvedValue({
        success: false,
        error: 'Invalid credentials',
      });

      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      // Step 1: First failed attempt
      const loginAction1 = await store.dispatch(loginUser(credentials));
      expect(loginAction1.type).toBe('auth/loginUser/rejected');

      let state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.error).toBe('Invalid credentials');
      expect(state.loginAttempts).toBe(1);
      expect(state.lastLoginAttempt).not.toBeNull();

      // Step 2: Second failed attempt
      const loginAction2 = await store.dispatch(loginUser(credentials));
      expect(loginAction2.type).toBe('auth/loginUser/rejected');

      state = store.getState().auth;
      expect(state.loginAttempts).toBe(2);

      // Step 3: Successful login should reset attempts
      mockSecurityManager.secureLogin.mockResolvedValue({
        success: true,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          role: 'influencer',
          status: 'approved',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      const correctCredentials = {
        email: 'test@example.com',
        password: 'correctpassword',
      };

      const loginAction3 = await store.dispatch(loginUser(correctCredentials));
      expect(loginAction3.type).toBe('auth/loginUser/fulfilled');

      state = store.getState().auth;
      expect(state.isAuthenticated).toBe(true);
      expect(state.loginAttempts).toBe(0);
      expect(state.lastLoginAttempt).toBeNull();
    });

    it('should reject login for pending user', async () => {
      const mockPendingUser = {
        id: 'user-123',
        email: 'pending@example.com',
        role: 'influencer',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock authentication that returns pending user
      mockDatabaseService.users.verifyPassword.mockResolvedValue(mockPendingUser as any);

      const credentials = {
        email: 'pending@example.com',
        password: 'password123',
      };

      // Direct validation should fail for pending user
      const validationResult = await ValidationService.validateCredentials(
        credentials.email,
        credentials.password
      );

      expect(validationResult.isValid).toBe(false);
      expect(validationResult.error).toBe('Account is not approved yet');
    });

    it('should handle admin login with special credentials', async () => {
      const adminCredentials = {
        username: 'admin_zyrovip',
        password: 'xarrec-2paqra-guftoN',
      };

      // Validate admin credentials
      const isValidAdmin = await ValidationService.validateAdminCredentials(adminCredentials);
      expect(isValidAdmin).toBe(true);

      // Mock admin user response
      const mockAdminUser = {
        id: 'admin-1',
        email: 'admin@zyro.com',
        role: 'admin',
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSecurityManager.secureLogin.mockResolvedValue({
        success: true,
        user: mockAdminUser,
      });

      // Login with admin credentials (converted to email format for the login flow)
      const loginAction = await store.dispatch(loginUser({
        email: 'admin@zyro.com',
        password: adminCredentials.password,
      }));

      expect(loginAction.type).toBe('auth/loginUser/fulfilled');

      const state = store.getState().auth;
      expect(state.user?.role).toBe('admin');
      expect(state.isAuthenticated).toBe(true);
    });
  });

  describe('Security Integration', () => {
    it('should integrate with security services during authentication', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        role: 'influencer',
        status: 'approved',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSecurityManager.secureLogin.mockResolvedValue({
        success: true,
        user: mockUser,
      });

      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      await store.dispatch(loginUser(credentials));

      // Verify security integration
      expect(mockAuthSecurityService.getDeviceId).toHaveBeenCalled();
      expect(mockSecurityManager.secureLogin).toHaveBeenCalledWith(
        credentials.email,
        credentials.password,
        'test-device-id'
      );
    });

    it('should handle security service failures gracefully', async () => {
      // Mock device ID failure
      mockAuthSecurityService.getDeviceId.mockRejectedValue(new Error('Device ID failed'));

      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const loginAction = await store.dispatch(loginUser(credentials));
      expect(loginAction.type).toBe('auth/loginUser/rejected');

      const state = store.getState().auth;
      expect(state.error).toBe('Error de autenticación');
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('State Persistence Integration', () => {
    it('should maintain consistent state across multiple operations', async () => {
      // Initial state
      let state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.loginAttempts).toBe(0);

      // Failed login
      mockSecurityManager.secureLogin.mockResolvedValue({
        success: false,
        error: 'Invalid credentials',
      });

      await store.dispatch(loginUser({
        email: 'test@example.com',
        password: 'wrong',
      }));

      state = store.getState().auth;
      expect(state.loginAttempts).toBe(1);
      expect(state.isAuthenticated).toBe(false);

      // Successful registration
      const registrationData = {
        email: 'newuser@example.com',
        password: 'SecurePassword123',
        role: 'influencer' as const,
      };

      await store.dispatch(registerUser(registrationData));

      state = store.getState().auth;
      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.email).toBe(registrationData.email);
      // Login attempts should still be tracked separately
      expect(state.loginAttempts).toBe(1);

      // Logout should reset everything
      store.dispatch({ type: 'auth/logout' });

      state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.loginAttempts).toBe(0);
    });
  });
});