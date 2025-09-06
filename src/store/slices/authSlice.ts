import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { BaseUser, UserRole, UserStatus } from '../../types';
import { securityManager } from '../../services/security/securityManager';
import { authSecurityService } from '../../services/security/authSecurityService';

// Auth state interface
export interface AuthState {
  user: BaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  loginAttempts: number;
  lastLoginAttempt: number | null;
}

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  loginAttempts: 0,
  lastLoginAttempt: null,
};

// Async thunks for authentication
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      // Get device ID for security tracking
      const deviceId = await authSecurityService.getDeviceId();
      
      // Use security manager for secure login
      const result = await securityManager.secureLogin(
        credentials.email,
        credentials.password,
        deviceId
      );

      if (result.success && result.user) {
        return result.user;
      } else {
        return rejectWithValue(result.error || 'Error de autenticación');
      }
    } catch (error) {
      return rejectWithValue('Error de autenticación');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData: { email: string; password: string; role: UserRole; [key: string]: any }, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newUser: BaseUser = {
        id: `user-${Date.now()}`,
        email: userData.email,
        role: userData.role,
        status: 'pending', // All new users start as pending
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      return newUser;
    } catch (error) {
      return rejectWithValue('Error en el registro');
    }
  }
);

export const checkUserStatus = createAsyncThunk(
  'auth/checkUserStatus',
  async (userId: string, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate status check
      const status: UserStatus = 'pending'; // This would come from API
      return status;
    } catch (error) {
      return rejectWithValue('Error al verificar estado del usuario');
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      // Perform secure logout
      if (state.user) {
        authSecurityService.getDeviceId().then(deviceId => {
          securityManager.secureLogout(state.user!.id, deviceId);
        });
      }
      
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loginAttempts = 0;
      state.lastLoginAttempt = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUserStatus: (state, action: PayloadAction<UserStatus>) => {
      if (state.user) {
        state.user.status = action.payload;
      }
    },
    resetLoginAttempts: (state) => {
      state.loginAttempts = 0;
      state.lastLoginAttempt = null;
    },
  },
  extraReducers: (builder) => {
    // Login user
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
        state.loginAttempts = 0;
        state.lastLoginAttempt = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.loginAttempts += 1;
        state.lastLoginAttempt = Date.now();
      });

    // Register user
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Check user status
    builder
      .addCase(checkUserStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkUserStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.user) {
          state.user.status = action.payload;
        }
      })
      .addCase(checkUserStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, updateUserStatus, resetLoginAttempts } = authSlice.actions;
export default authSlice.reducer;