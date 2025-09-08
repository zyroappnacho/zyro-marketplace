import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ApiService from '../../services/ApiService';

// Async thunks
export const fetchCollaborations = createAsyncThunk(
  'collaborations/fetchCollaborations',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await ApiService.getCollaborations(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCollaborationDetail = createAsyncThunk(
  'collaborations/fetchCollaborationDetail',
  async (collaborationId, { rejectWithValue }) => {
    try {
      const response = await ApiService.getCollaboration(collaborationId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const requestCollaboration = createAsyncThunk(
  'collaborations/requestCollaboration',
  async ({ collaborationId, requestData }, { rejectWithValue }) => {
    try {
      const response = await ApiService.requestCollaboration(collaborationId, requestData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMyRequests = createAsyncThunk(
  'collaborations/fetchMyRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ApiService.getMyRequests();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  collaborations: [],
  selectedCollaboration: null,
  myRequests: {
    proximos: [],
    pasados: [],
    cancelados: []
  },
  filters: {
    city: 'Madrid',
    category: 'all',
    minFollowers: 0
  },
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    hasMore: true
  }
};

const collaborationsSlice = createSlice({
  name: 'collaborations',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSelectedCollaboration: (state, action) => {
      state.selectedCollaboration = action.payload;
    },
    clearSelectedCollaboration: (state) => {
      state.selectedCollaboration = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetPagination: (state) => {
      state.pagination = {
        page: 1,
        limit: 10,
        total: 0,
        hasMore: true
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch collaborations
      .addCase(fetchCollaborations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCollaborations.fulfilled, (state, action) => {
        state.isLoading = false;
        const { collaborations, pagination } = action.payload;
        
        if (pagination.page === 1) {
          state.collaborations = collaborations;
        } else {
          state.collaborations = [...state.collaborations, ...collaborations];
        }
        
        state.pagination = pagination;
        state.error = null;
      })
      .addCase(fetchCollaborations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch collaboration detail
      .addCase(fetchCollaborationDetail.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCollaborationDetail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedCollaboration = action.payload;
      })
      .addCase(fetchCollaborationDetail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Request collaboration
      .addCase(requestCollaboration.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(requestCollaboration.fulfilled, (state, action) => {
        state.isLoading = false;
        // Add to pending requests
        state.myRequests.proximos.push(action.payload);
      })
      .addCase(requestCollaboration.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch my requests
      .addCase(fetchMyRequests.fulfilled, (state, action) => {
        state.myRequests = action.payload;
      });
  },
});

export const {
  setFilters,
  setSelectedCollaboration,
  clearSelectedCollaboration,
  clearError,
  resetPagination
} = collaborationsSlice.actions;

export default collaborationsSlice.reducer;