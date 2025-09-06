import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Dashboard statistics interfaces
export interface DashboardStats {
  users: {
    totalInfluencers: number;
    totalCompanies: number;
    activeInfluencers: number;
    activeCompanies: number;
    pendingApprovals: number;
    newUsersThisMonth: number;
  };
  revenue: {
    monthlyRevenue: number;
    yearlyProjection: number;
    averageRevenuePerCompany: number;
    totalRevenue: number;
  };
  campaigns: {
    totalCampaigns: number;
    activeCampaigns: number;
    completedCampaigns: number;
    pendingCampaigns: number;
  };
  collaborations: {
    totalCollaborations: number;
    activeCollaborations: number;
    completedCollaborations: number;
    successRate: number;
  };
}

export interface RecentActivity {
  id: string;
  type: 'user_registration' | 'campaign_created' | 'collaboration_completed' | 'payment_received';
  description: string;
  timestamp: Date;
  userId?: string;
  campaignId?: string;
}

export interface DashboardState {
  stats: DashboardStats | null;
  recentActivity: RecentActivity[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

const initialState: DashboardState = {
  stats: null,
  recentActivity: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
};

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Mock dashboard statistics
      const mockStats: DashboardStats = {
        users: {
          totalInfluencers: 245,
          totalCompanies: 18,
          activeInfluencers: 198,
          activeCompanies: 15,
          pendingApprovals: 12,
          newUsersThisMonth: 34,
        },
        revenue: {
          monthlyRevenue: 8450,
          yearlyProjection: 101400,
          averageRevenuePerCompany: 563,
          totalRevenue: 45230,
        },
        campaigns: {
          totalCampaigns: 67,
          activeCampaigns: 23,
          completedCampaigns: 41,
          pendingCampaigns: 3,
        },
        collaborations: {
          totalCollaborations: 156,
          activeCollaborations: 28,
          completedCollaborations: 124,
          successRate: 89.5,
        },
      };
      
      return mockStats;
    } catch (error) {
      return rejectWithValue('Error al cargar estadísticas del dashboard');
    }
  }
);

export const fetchRecentActivity = createAsyncThunk(
  'dashboard/fetchRecentActivity',
  async (_, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock recent activity
      const mockActivity: RecentActivity[] = [
        {
          id: 'act-001',
          type: 'user_registration',
          description: 'Nuevo influencer registrado: @maria_lifestyle',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          userId: 'inf-001',
        },
        {
          id: 'act-002',
          type: 'collaboration_completed',
          description: 'Colaboración completada: Restaurante La Terraza',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          campaignId: 'camp-001',
        },
        {
          id: 'act-003',
          type: 'payment_received',
          description: 'Pago recibido: Empresa Beauty Corp (€399)',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          userId: 'comp-001',
        },
        {
          id: 'act-004',
          type: 'campaign_created',
          description: 'Nueva campaña creada: Spa Premium Experience',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
          campaignId: 'camp-002',
        },
        {
          id: 'act-005',
          type: 'user_registration',
          description: 'Nueva empresa registrada: Fashion Store Madrid',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          userId: 'comp-002',
        },
      ];
      
      return mockActivity;
    } catch (error) {
      return rejectWithValue('Error al cargar actividad reciente');
    }
  }
);

export const refreshDashboard = createAsyncThunk(
  'dashboard/refresh',
  async (_, { dispatch }) => {
    // Fetch both stats and recent activity
    await Promise.all([
      dispatch(fetchDashboardStats()),
      dispatch(fetchRecentActivity()),
    ]);
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    addRecentActivity: (state, action: PayloadAction<RecentActivity>) => {
      state.recentActivity.unshift(action.payload);
      // Keep only the last 20 activities
      if (state.recentActivity.length > 20) {
        state.recentActivity = state.recentActivity.slice(0, 20);
      }
    },
    updateStats: (state, action: PayloadAction<Partial<DashboardStats>>) => {
      if (state.stats) {
        state.stats = { ...state.stats, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch dashboard stats
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
        state.lastUpdated = new Date();
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch recent activity
    builder
      .addCase(fetchRecentActivity.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchRecentActivity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recentActivity = action.payload;
      })
      .addCase(fetchRecentActivity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Refresh dashboard
    builder
      .addCase(refreshDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshDashboard.fulfilled, (state) => {
        state.isLoading = false;
        state.lastUpdated = new Date();
      })
      .addCase(refreshDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = 'Error al actualizar el dashboard';
      });
  },
});

export const { clearError, addRecentActivity, updateStats } = dashboardSlice.actions;

export default dashboardSlice.reducer;