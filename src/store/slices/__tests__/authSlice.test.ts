import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  loginUser,
  registerUser,
  checkUserStatus,
  logout,
  clearError,
  updateUserStatus,
  resetLoginAttempts,
  AuthState
} from '../authSlice';
import { BaseUser, UserRole, UserStatus } from '../../../types';

// Mock the security services
jest.mock('../../../services/security/securityManager', () => ({
  securityManager: {
    secureLogin: jest.fn(),
    secureLogout: jest.fn(),
  },
}));

jest.mock('../../../services/security/authSecurityService', () => ({
  authSecurityService: {
    getDeviceId: jest.fn().mockResolvedValue('mock-device-id'),
  },
}));

import { securityManager } from '../../../services/security/securityManager';
import { authSecurityService } from '../../../services/security/authSecurityService';

const mockSecurityManager = securityManager as jest.Mocked<typeof securityManager>;
const mockAuthSecurityService = authSecurityService as jest.Mocked<typeof authSecurityService>;

describe('authSlice', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().auth;
      
      expect(state).toEqual({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        loginAttempts: 0,
        lastLoginAttempt: null,
      });
    });
  });

  describe('synchronous actions', () => {
    describe('logout', () => {
      it('should reset auth state on logout', () => {
        // First set some state
        const mockUser: BaseUser = {
          id: '1',
          email: 'test@example.com',
          role: 'influencer',
          status: 'approved',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        store.dispatch(loginUser.fulfilled(mockUser, 'requestId', { email: 'test@example.com', password: 'password' }));
        
        // Verify user is logged in
        expect(store.getState().auth.isAuthenticated).toBe(true);
        expect(store.getState().auth.user).toEqual(mockUser);

        // Logout
        store.dispatch(logout());

        // Verify state is reset
        const state = store.getState().auth;
        expect(state.user).toBeNull();
        expect(state.isAuthenticated).toBe(false);
        expect(state.error).toBeNull();
        expect(state.loginAttempts).toBe(0);
        expect(state.lastLoginAttempt).toBeNull();
      });

      it('should call secure logout when user exists', async () => {
        const mockUser: BaseUser = {
          id: '1',
          email: 'test@example.com',
          role: 'influencer',
          status: 'approved',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        store.dispatch(loginUser.fulfilled(mockUser, 'requestId', { email: 'test@example.com', password: 'password' }));
        store.dispatch(logout());

        // Wait for async device ID call
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(mockAuthSecurityService.getDeviceId).toHaveBeenCalled();
      });
    });

    describe('clearError', () => {
      it('should clear error state', () => {
        // Set error state
        store.dispatch(loginUser.rejected(null, 'requestId', { email: 'test@example.com', password: 'password' }, 'Login failed'));
        
        expect(store.getState().auth.error).toBe('Login failed');

        // Clear error
        store.dispatch(clearError());

        expect(store.getState().auth.error).toBeNull();
      });
    });

    describe('updateUserStatus', () => {
      it('should update user status when user exists', () => {
        const mockUser: BaseUser = {
          id: '1',
          email: 'test@example.com',
          role: 'influencer',
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        store.dispatch(loginUser.fulfilled(mockUser, 'requestId', { email: 'test@example.com', password: 'password' }));
        
        // Update status
        store.dispatch(updateUserStatus('approved'));

        expect(store.getState().auth.user?.status).toBe('approved');
      });

      it('should not crash when user is null', () => {
        store.dispatch(updateUserStatus('approved'));

        expect(store.getState().auth.user).toBeNull();
      });
    });

    describe('resetLoginAttempts', () => {
      it('should reset login attempts and last attempt time', () => {
        // Simulate failed login attempts
        store.dispatch(loginUser.rejected(null, 'requestId', { email: 'test@example.com', password: 'password' }, 'Login failed'));
        store.dispatch(loginUser.rejected(null, 'requestId', { email: 'test@example.com', password: 'password' }, 'Login failed'));

        expect(store.getState().auth.loginAttempts).toBe(2);
        expect(store.getState().auth.lastLoginAttempt).not.toBeNull();

        // Reset attempts
        store.dispatch(resetLoginAttempts());

        expect(store.getState().auth.loginAttempts).toBe(0);
        expect(store.getState().auth.lastLoginAttempt).toBeNull();
      });
    });
  });

  describe('async thunks', () => {
    describe('loginUser', () => {
      it('should handle successful login', async () => {
        const mockUser: BaseUser = {
          id: '1',
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

        const credentials = { email: 'test@example.com', password: 'password123' };
        
        await store.dispatch(loginUser(credentials));

        const state = store.getState().auth;
        expect(state.isLoading).toBe(false);
        expect(state.isAuthenticated).toBe(true);
        expect(state.user).toEqual(mockUser);
        expect(state.error).toBeNull();
        expect(state.loginAttempts).toBe(0);
        expect(state.lastLoginAttempt).toBeNull();

        expect(mockAuthSecurityService.getDeviceId).toHaveBeenCalled();
        expect(mockSecurityManager.secureLogin).toHaveBeenCalledWith(
          credentials.email,
          credentials.password,
          'mock-device-id'
        );
      });

      it('should handle failed login', async () => {
        mockSecurityManager.secureLogin.mockResolvedValue({
          success: false,
          error: 'Invalid credentials',
        });

        const credentials = { email: 'test@example.com', password: 'wrongpassword' };
        
        await store.dispatch(loginUser(credentials));

        const state = store.getState().auth;
        expect(state.isLoading).toBe(false);
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeNull();
        expect(state.error).toBe('Invalid credentials');
        expect(state.loginAttempts).toBe(1);
        expect(state.lastLoginAttempt).not.toBeNull();
      });

      it('should handle login exception', async () => {
        mockSecurityManager.secureLogin.mockRejectedValue(new Error('Network error'));

        const credentials = { email: 'test@example.com', password: 'password123' };
        
        await store.dispatch(loginUser(credentials));

        const state = store.getState().auth;
        expect(state.isLoading).toBe(false);
        expect(state.isAuthenticated).toBe(false);
        expect(state.user).toBeNull();
        expect(state.error).toBe('Error de autenticación');
        expect(state.loginAttempts).toBe(1);
      });

      it('should set loading state during login', () => {
        mockSecurityManager.secureLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

        const credentials = { email: 'test@example.com', password: 'password123' };
        store.dispatch(loginUser(credentials));

        const state = store.getState().auth;
        expect(state.isLoading).toBe(true);
        expect(state.error).toBeNull();
      });

      it('should increment login attempts on each failure', async () => {
        mockSecurityManager.secureLogin.mockResolvedValue({
          success: false,
          error: 'Invalid credentials',
        });

        const credentials = { email: 'test@example.com', password: 'wrongpassword' };
        
        // First failed attempt
        await store.dispatch(loginUser(credentials));
        expect(store.getState().auth.loginAttempts).toBe(1);

        // Second failed attempt
        await store.dispatch(loginUser(credentials));
        expect(store.getState().auth.loginAttempts).toBe(2);

        // Third failed attempt
        await store.dispatch(loginUser(credentials));
        expect(store.getState().auth.loginAttempts).toBe(3);
      });
    });

    describe('registerUser', () => {
      it('should handle successful registration', async () => {
        const userData = {
          email: 'newuser@example.com',
          password: 'password123',
          role: 'influencer' as UserRole,
          fullName: 'New User',
        };

        await store.dispatch(registerUser(userData));

        const state = store.getState().auth;
        expect(state.isLoading).toBe(false);
        expect(state.isAuthenticated).toBe(true);
        expect(state.user).toBeDefined();
        expect(state.user?.email).toBe(userData.email);
        expect(state.user?.role).toBe(userData.role);
        expect(state.user?.status).toBe('pending');
        expect(state.error).toBeNull();
      });

      it('should set loading state during registration', () => {
        const userData = {
          email: 'newuser@example.com',
          password: 'password123',
          role: 'influencer' as UserRole,
        };

        store.dispatch(registerUser(userData));

        const state = store.getState().auth;
        expect(state.isLoading).toBe(true);
        expect(state.error).toBeNull();
      });

      it('should generate unique user ID', async () => {
        const userData1 = {
          email: 'user1@example.com',
          password: 'password123',
          role: 'influencer' as UserRole,
        };

        const userData2 = {
          email: 'user2@example.com',
          password: 'password123',
          role: 'company' as UserRole,
        };

        await store.dispatch(registerUser(userData1));
        const user1Id = store.getState().auth.user?.id;

        // Reset state
        store.dispatch(logout());

        await store.dispatch(registerUser(userData2));
        const user2Id = store.getState().auth.user?.id;

        expect(user1Id).toBeDefined();
        expect(user2Id).toBeDefined();
        expect(user1Id).not.toBe(user2Id);
      });
    });

    describe('checkUserStatus', () => {
      it('should update user status when user exists', async () => {
        const mockUser: BaseUser = {
          id: '1',
          email: 'test@example.com',
          role: 'influencer',
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Set initial user
        store.dispatch(loginUser.fulfilled(mockUser, 'requestId', { email: 'test@example.com', password: 'password' }));

        // Check status
        await store.dispatch(checkUserStatus('1'));

        const state = store.getState().auth;
        expect(state.isLoading).toBe(false);
        expect(state.user?.status).toBe('pending');
      });

      it('should set loading state during status check', () => {
        store.dispatch(checkUserStatus('1'));

        const state = store.getState().auth;
        expect(state.isLoading).toBe(true);
      });

      it('should handle status check error', async () => {
        // Mock the thunk to simulate an error
        const mockError = 'Error al verificar estado del usuario';
        
        // We need to mock the actual implementation since it's using setTimeout
        jest.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
          throw new Error('Network error');
        });

        await store.dispatch(checkUserStatus('1'));

        const state = store.getState().auth;
        expect(state.isLoading).toBe(false);
        expect(state.error).toBe(mockError);

        // Restore setTimeout
        jest.restoreAllMocks();
      });
    });
  });

  describe('edge cases', () => {
    it('should handle multiple rapid login attempts', async () => {
      mockSecurityManager.secureLogin.mockResolvedValue({
        success: false,
        error: 'Invalid credentials',
      });

      const credentials = { email: 'test@example.com', password: 'wrongpassword' };
      
      // Dispatch multiple login attempts rapidly
      const promises = [
        store.dispatch(loginUser(credentials)),
        store.dispatch(loginUser(credentials)),
        store.dispatch(loginUser(credentials)),
      ];

      await Promise.all(promises);

      const state = store.getState().auth;
      expect(state.loginAttempts).toBe(3);
      expect(state.lastLoginAttempt).not.toBeNull();
    });

    it('should handle successful login after failed attempts', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      
      // First, fail a login
      mockSecurityManager.secureLogin.mockResolvedValue({
        success: false,
        error: 'Invalid credentials',
      });

      await store.dispatch(loginUser(credentials));
      expect(store.getState().auth.loginAttempts).toBe(1);

      // Then, succeed
      const mockUser: BaseUser = {
        id: '1',
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

      await store.dispatch(loginUser(credentials));

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(true);
      expect(state.loginAttempts).toBe(0);
      expect(state.lastLoginAttempt).toBeNull();
    });
  });
});