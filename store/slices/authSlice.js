import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../../services/ApiService';
import StorageService from '../../services/StorageService';

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password, role }, { rejectWithValue }) => {
    try {
      // Admin login with persistent password
      // Admin login with enhanced persistent password
      if (email === 'admin_zyro') {
        console.log('🔐 [AUTH] Verificando credenciales de administrador...');
        console.log('🔐 [AUTH] Email introducido:', email);
        console.log('🔐 [AUTH] Contraseña introducida:', password);
        
        // Usar el sistema mejorado de StorageService
        console.log('🔐 [AUTH] Obteniendo contraseña almacenada...');
        const currentAdminPassword = await StorageService.getAdminPassword();
        console.log('🔐 [AUTH] Contraseña almacenada:', currentAdminPassword);
        
        // Verificación estricta
        const passwordsMatch = String(password) === String(currentAdminPassword);
        console.log('🔐 [AUTH] ¿Contraseñas coinciden?:', passwordsMatch);
        console.log('🔐 [AUTH] Longitud introducida:', password.length);
        console.log('🔐 [AUTH] Longitud almacenada:', currentAdminPassword.length);
        
        if (passwordsMatch) {
          console.log('✅ [AUTH] Credenciales de administrador válidas');
          
          const adminUser = {
            id: 'admin_001',
            role: 'admin',
            name: 'Administrador ZYRO',
            email: 'admin@zyro.com',
            verified: true,
            lastLogin: new Date().toISOString(),
            passwordLastChanged: await StorageService.getData('admin_last_update')
          };
          
          await StorageService.saveUser(adminUser);
          console.log('✅ [AUTH] Sesión de administrador iniciada correctamente');
          return adminUser;
        } else {
          console.log('❌ [AUTH] Contraseña de administrador incorrecta');
          console.log('❌ [AUTH] Comparación detallada:');
          const maxLength = Math.max(password.length, currentAdminPassword.length);
          for (let i = 0; i < maxLength; i++) {
            const charInput = password[i] || '(fin)';
            const charStored = currentAdminPassword[i] || '(fin)';
            const match = charInput === charStored;
            console.log(`❌ [AUTH] Pos ${i}: "${charInput}" vs "${charStored}" ${match ? '✅' : '❌'}`);
          }
          return rejectWithValue('Credenciales de administrador incorrectas');
        }
      }

      // Check for approved influencers/companies
      console.log(`🔐 Intentando login para: ${email}`);
      const approvedUser = await StorageService.getApprovedUserByEmail(email);
      
      if (approvedUser) {
        console.log(`✅ Usuario aprobado encontrado: ${approvedUser.name} (${approvedUser.role})`);
        
        if (approvedUser.password === password) {
          console.log(`✅ Contraseña correcta para: ${email}`);
          
          // Update last login
          await StorageService.updateUserLastLogin(approvedUser.id);
          
          // Prepare user data for session
          const userData = {
            id: approvedUser.id,
            role: approvedUser.role,
            name: approvedUser.name,
            email: approvedUser.email,
            verified: true,
          // Include role-specific data
          ...(approvedUser.role === 'influencer' && {
            fullName: approvedUser.fullName,
            phone: approvedUser.phone,
            city: approvedUser.city,
            instagramUsername: approvedUser.instagramUsername,
            instagramFollowers: approvedUser.instagramFollowers,
            tiktokUsername: approvedUser.tiktokUsername,
            tiktokFollowers: approvedUser.tiktokFollowers,
            profileImage: approvedUser.profileImage,
            followers: parseInt(approvedUser.instagramFollowers) || 0,
            instagram: approvedUser.instagramUsername?.startsWith('@') 
              ? approvedUser.instagramUsername 
              : `@${approvedUser.instagramUsername}`
          }),
          ...(approvedUser.role === 'company' && {
            businessName: approvedUser.businessName || approvedUser.name,
            plan: approvedUser.plan || '6months'
          })
        };
        
          await StorageService.saveUser(userData);
          console.log(`✅ Login exitoso: ${approvedUser.name} (${approvedUser.role})`);
          return userData;
        } else {
          console.log(`❌ Contraseña incorrecta para: ${email}`);
          return rejectWithValue('Credenciales incorrectas o usuario no aprobado');
        }
      } else {
        console.log(`❌ Usuario no aprobado o no encontrado: ${email}`);
        return rejectWithValue('Credenciales incorrectas o usuario no aprobado');
      }
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