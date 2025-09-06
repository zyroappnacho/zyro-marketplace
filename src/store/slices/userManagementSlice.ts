import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { BaseUser, UserStatus, Influencer, Company } from '../../types';

// User management state interface
export interface UserManagementState {
  pendingUsers: BaseUser[];
  approvedUsers: BaseUser[];
  rejectedUsers: BaseUser[];
  suspendedUsers: BaseUser[];
  isLoading: boolean;
  error: string | null;
  statusUpdateLoading: { [userId: string]: boolean };
  notifications: UserStatusNotification[];
}

// Notification interface
export interface UserStatusNotification {
  id: string;
  userId: string;
  type: 'approval' | 'rejection' | 'suspension' | 'reactivation';
  message: string;
  timestamp: Date;
  read: boolean;
}

// Status change payload
export interface StatusChangePayload {
  userId: string;
  newStatus: UserStatus;
  adminNotes?: string;
  notificationMessage?: string;
}

// Initial state
const initialState: UserManagementState = {
  pendingUsers: [],
  approvedUsers: [],
  rejectedUsers: [],
  suspendedUsers: [],
  isLoading: false,
  error: null,
  statusUpdateLoading: {},
  notifications: [],
};

// Async thunks for user management
export const fetchPendingUsers = createAsyncThunk(
  'userManagement/fetchPendingUsers',
  async (_, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock pending users
      const mockPendingUsers: BaseUser[] = [
        {
          id: 'inf-001',
          email: 'influencer1@example.com',
          role: 'influencer',
          status: 'pending',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
        {
          id: 'comp-001',
          email: 'company1@example.com',
          role: 'company',
          status: 'pending',
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
        },
      ];
      
      return mockPendingUsers;
    } catch (error) {
      return rejectWithValue('Error al cargar usuarios pendientes');
    }
  }
);

export const fetchUsersByStatus = createAsyncThunk(
  'userManagement/fetchUsersByStatus',
  async (status: UserStatus, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock users by status
      const mockUsers: BaseUser[] = [];
      return { status, users: mockUsers };
    } catch (error) {
      return rejectWithValue(`Error al cargar usuarios con estado ${status}`);
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  'userManagement/updateUserStatus',
  async (payload: StatusChangePayload, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create notification based on status change
      const notification: UserStatusNotification = {
        id: `notif-${Date.now()}`,
        userId: payload.userId,
        type: payload.newStatus === 'approved' ? 'approval' : 
              payload.newStatus === 'rejected' ? 'rejection' :
              payload.newStatus === 'suspended' ? 'suspension' : 'reactivation',
        message: payload.notificationMessage || getDefaultNotificationMessage(payload.newStatus),
        timestamp: new Date(),
        read: false,
      };
      
      return {
        userId: payload.userId,
        newStatus: payload.newStatus,
        notification,
      };
    } catch (error) {
      return rejectWithValue('Error al actualizar estado del usuario');
    }
  }
);

export const sendStatusNotification = createAsyncThunk(
  'userManagement/sendStatusNotification',
  async (notification: Omit<UserStatusNotification, 'id' | 'timestamp'>, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual push notification service
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const fullNotification: UserStatusNotification = {
        ...notification,
        id: `notif-${Date.now()}`,
        timestamp: new Date(),
      };
      
      return fullNotification;
    } catch (error) {
      return rejectWithValue('Error al enviar notificación');
    }
  }
);

// Helper function for default notification messages
const getDefaultNotificationMessage = (status: UserStatus): string => {
  switch (status) {
    case 'approved':
      return '¡Felicidades! Tu cuenta ha sido aprobada. Ya puedes acceder a todas las funcionalidades de Zyro.';
    case 'rejected':
      return 'Tu solicitud de registro ha sido rechazada. Por favor, contacta con soporte para más información.';
    case 'suspended':
      return 'Tu cuenta ha sido suspendida temporalmente. Contacta con soporte para más detalles.';
    default:
      return 'El estado de tu cuenta ha sido actualizado.';
  }
};

// Helper function to get waiting message for influencers
export const getInfluencerWaitingMessage = (): string => {
  return 'Tu solicitud está siendo revisada por nuestro equipo. Este proceso puede tomar entre 24-48 horas. Te notificaremos por email una vez que tu cuenta sea aprobada.';
};

// User management slice
const userManagementSlice = createSlice({
  name: 'userManagement',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification) {
        notification.read = true;
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    addLocalNotification: (state, action: PayloadAction<UserStatusNotification>) => {
      state.notifications.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    // Fetch pending users
    builder
      .addCase(fetchPendingUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPendingUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingUsers = action.payload;
      })
      .addCase(fetchPendingUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch users by status
    builder
      .addCase(fetchUsersByStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUsersByStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const { status, users } = action.payload;
        
        switch (status) {
          case 'approved':
            state.approvedUsers = users;
            break;
          case 'rejected':
            state.rejectedUsers = users;
            break;
          case 'suspended':
            state.suspendedUsers = users;
            break;
        }
      })
      .addCase(fetchUsersByStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update user status
    builder
      .addCase(updateUserStatus.pending, (state, action) => {
        const userId = action.meta.arg.userId;
        state.statusUpdateLoading[userId] = true;
        state.error = null;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const { userId, newStatus, notification } = action.payload;
        state.statusUpdateLoading[userId] = false;
        
        // Remove user from current status array
        state.pendingUsers = state.pendingUsers.filter(u => u.id !== userId);
        state.approvedUsers = state.approvedUsers.filter(u => u.id !== userId);
        state.rejectedUsers = state.rejectedUsers.filter(u => u.id !== userId);
        state.suspendedUsers = state.suspendedUsers.filter(u => u.id !== userId);
        
        // Find the user and update their status
        const allUsers = [
          ...state.pendingUsers,
          ...state.approvedUsers,
          ...state.rejectedUsers,
          ...state.suspendedUsers
        ];
        
        const user = allUsers.find(u => u.id === userId);
        if (user) {
          user.status = newStatus;
          user.updatedAt = new Date();
          
          // Add user to appropriate status array
          switch (newStatus) {
            case 'approved':
              state.approvedUsers.push(user);
              break;
            case 'rejected':
              state.rejectedUsers.push(user);
              break;
            case 'suspended':
              state.suspendedUsers.push(user);
              break;
            case 'pending':
              state.pendingUsers.push(user);
              break;
          }
        }
        
        // Add notification
        state.notifications.unshift(notification);
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        const userId = action.meta.arg.userId;
        state.statusUpdateLoading[userId] = false;
        state.error = action.payload as string;
      });

    // Send status notification
    builder
      .addCase(sendStatusNotification.fulfilled, (state, action) => {
        state.notifications.unshift(action.payload);
      });
  },
});

export const { 
  clearError, 
  markNotificationAsRead, 
  clearNotifications, 
  addLocalNotification 
} = userManagementSlice.actions;

export default userManagementSlice.reducer;