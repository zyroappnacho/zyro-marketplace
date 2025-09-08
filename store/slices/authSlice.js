import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../../services/ApiService';
import StorageService from '../../services/StorageService';

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password, role }, { rejectWithValue }) => {
    try {
      // Admin login
      if (email === 'admin_zyro' && password === 'ZyroAdmin2024!') {
        const adminUser = {
          id: 'admin_001',
          role: 'admin',
          name: 'Administrador ZYRO',
          email: 'admin@zyro.com',
          verified: true
        };
        await StorageService.saveUser(adminUser);
        return adminUser;
      }

      // Regular login simulation
      const mockUser = {
        id: role === 'influencer' ? 'inf_001' : 'comp_001',
        role,
        name: role === 'influencer' ? 'Ana García' : 'Restaurante Elegance',
        email,
        verified: true,
        ...(role === 'influencer' && { 
          followers: 15000, 
          instagram: '@ana_lifestyle' 
        }),
        ...(role === 'company' && { 
          plan: '6months',
          businessName: 'Restaurante Elegance'
        })
      };

      await StorageService.saveUser(mockUser);
      return mockUser;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await ApiService.register(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await StorageService.removeUser();
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  registrationStatus: 'idle', // idle, pending, success, failed
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.registrationStatus = 'pending';
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.registrationStatus = 'success';
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.registrationStatus = 'failed';
        state.error = action.payload;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError, updateUser, setUser } = authSlice.actions;
export default authSlice.reducer;